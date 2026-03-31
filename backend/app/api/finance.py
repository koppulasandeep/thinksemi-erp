"""Finance API — invoices, vendor bills, payroll approval, and financial reports."""

import uuid
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.exceptions import BadRequestError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.finance import Invoice, VendorBill
from app.models.payroll import PayrollBatch
from app.models.sales_order import SalesOrder

router = APIRouter(tags=["finance"])

# ─── Invoices ─────────────────────────────────────────────────────────────

@router.get("/invoices")
def list_invoices(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, Invoice, tenant_id)
    if status:
        tq = tq.filter(Invoice.status == status)
    invoices = tq.all(order_by=Invoice.created_at.desc())
    return {"invoices": [_inv_dict(i) for i in invoices]}


@router.post("/invoices", status_code=201)
def create_invoice(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "INV", "invoices")

    # Pull from SO if linked
    customer_name = payload.get("customer_name", "")
    if payload.get("sales_order_id"):
        so = TenantQuery(db, SalesOrder, tenant_id).get_or_404(
            uuid.UUID(payload["sales_order_id"]), "SalesOrder"
        )
        customer_name = customer_name or so.customer_name

    subtotal = payload["subtotal"]
    gst_rate = payload.get("gst_rate", 18.0)
    gst_amount = round(subtotal * gst_rate / 100, 2)
    total = round(subtotal + gst_amount, 2)

    inv = Invoice(
        tenant_id=tenant_id,
        ref_number=ref,
        sales_order_id=payload.get("sales_order_id"),
        customer_name=customer_name,
        subtotal=subtotal,
        gst_amount=gst_amount,
        total=total,
        amount_paid=0,
        balance_due=total,
        issue_date=payload.get("issue_date", date.today().isoformat()),
        due_date=payload["due_date"],
        status="draft",
        notes=payload.get("notes"),
    )
    db.add(inv)
    log_activity(db, tenant_id, current_user.id, f"Created invoice {ref} for {customer_name}: {total}", "finance", "invoice", inv.id)
    db.commit()
    db.refresh(inv)
    return _inv_dict(inv)


@router.patch("/invoices/{invoice_id}/receive-payment")
def receive_payment(
    invoice_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Record a payment. payload: { amount: float }"""
    inv = TenantQuery(db, Invoice, tenant_id).get_or_404(invoice_id, "Invoice")
    amount = payload["amount"]
    if amount <= 0:
        raise BadRequestError("Payment amount must be positive")

    inv.amount_paid = float(inv.amount_paid) + amount
    inv.balance_due = float(inv.total) - float(inv.amount_paid)

    if inv.balance_due <= 0:
        inv.balance_due = 0
        inv.status = "paid"
        inv.paid_date = date.today()
    else:
        inv.status = "partial"

    log_activity(db, tenant_id, current_user.id, f"Payment of {amount} received for invoice {inv.ref_number}", "finance", "invoice", invoice_id)
    db.commit()
    db.refresh(inv)
    return _inv_dict(inv)


def _inv_dict(i: Invoice) -> dict:
    return {
        "id": str(i.id), "ref_number": i.ref_number,
        "customer_name": i.customer_name,
        "subtotal": float(i.subtotal), "gst_amount": float(i.gst_amount),
        "total": float(i.total), "amount_paid": float(i.amount_paid),
        "balance_due": float(i.balance_due),
        "issue_date": str(i.issue_date), "due_date": str(i.due_date),
        "paid_date": str(i.paid_date) if i.paid_date else None,
        "status": i.status,
        "sales_order_id": str(i.sales_order_id) if i.sales_order_id else None,
        "created_at": i.created_at.isoformat() if i.created_at else None,
    }


# ─── Vendor Bills ─────────────────────────────────────────────────────────

@router.get("/vendor-bills")
def list_vendor_bills(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, VendorBill, tenant_id)
    if status:
        tq = tq.filter(VendorBill.status == status)
    bills = tq.all(order_by=VendorBill.created_at.desc())
    return {
        "vendor_bills": [
            {
                "id": str(b.id), "ref_number": b.ref_number,
                "supplier_name": b.supplier_name,
                "total": float(b.total), "balance_due": float(b.balance_due),
                "status": b.status, "due_date": str(b.due_date),
            }
            for b in bills
        ]
    }


@router.patch("/vendor-bills/{bill_id}/approve")
def approve_vendor_bill(
    bill_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("finance_manager", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    bill = TenantQuery(db, VendorBill, tenant_id).get_or_404(bill_id, "VendorBill")
    if bill.status != "pending":
        raise BadRequestError(f"Bill must be pending, currently '{bill.status}'")
    bill.status = "approved"
    bill.approved_by = current_user.id
    log_activity(db, tenant_id, current_user.id, f"Approved vendor bill {bill.ref_number}", "finance", "vendor_bill", bill_id)
    db.commit()
    db.refresh(bill)
    return {"id": str(bill.id), "status": bill.status}


@router.patch("/vendor-bills/{bill_id}/pay")
def pay_vendor_bill(
    bill_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("finance_manager", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    bill = TenantQuery(db, VendorBill, tenant_id).get_or_404(bill_id, "VendorBill")
    if bill.status not in ("approved", "partial"):
        raise BadRequestError(f"Bill must be approved before payment, currently '{bill.status}'")

    amount = payload.get("amount", float(bill.balance_due))
    bill.amount_paid = float(bill.amount_paid) + amount
    bill.balance_due = float(bill.total) - float(bill.amount_paid)

    if bill.balance_due <= 0:
        bill.balance_due = 0
        bill.status = "paid"
        bill.paid_date = date.today()
    else:
        bill.status = "partial"

    log_activity(db, tenant_id, current_user.id, f"Paid {amount} on vendor bill {bill.ref_number}", "finance", "vendor_bill", bill_id)
    db.commit()
    db.refresh(bill)
    return {"id": str(bill.id), "status": bill.status, "balance_due": float(bill.balance_due)}


# ─── Payroll Approval (Finance Review) ───────────────────────────────────

@router.get("/payroll-approval")
def pending_payroll_for_finance(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """List payroll batches pending finance approval (status = submitted)."""
    batches = TenantQuery(db, PayrollBatch, tenant_id).filter(
        PayrollBatch.status == "submitted"
    ).all(order_by=PayrollBatch.created_at.desc())
    return {
        "pending_batches": [
            {
                "id": str(b.id), "ref_number": b.ref_number,
                "month": b.month, "year": b.year,
                "total_employees": b.total_employees,
                "total_gross": float(b.total_gross),
                "total_net": float(b.total_net),
                "status": b.status,
            }
            for b in batches
        ]
    }


# ─── Financial Reports ───────────────────────────────────────────────────

@router.get("/cash-flow")
def cash_flow(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    months: int = Query(6, ge=1, le=24),
):
    """Cash flow summary for the last N months."""
    today = date.today()
    month_data = []
    for i in range(months):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1

        inflow = (
            db.query(func.coalesce(func.sum(Invoice.amount_paid), 0))
            .filter(
                Invoice.tenant_id == tenant_id,
                func.extract("month", Invoice.paid_date) == m,
                func.extract("year", Invoice.paid_date) == y,
            )
            .scalar()
        )
        outflow = (
            db.query(func.coalesce(func.sum(VendorBill.amount_paid), 0))
            .filter(
                VendorBill.tenant_id == tenant_id,
                func.extract("month", VendorBill.paid_date) == m,
                func.extract("year", VendorBill.paid_date) == y,
            )
            .scalar()
        )
        month_data.append({
            "month": m, "year": y,
            "inflow": float(inflow), "outflow": float(outflow),
            "net": float(inflow) - float(outflow),
        })

    month_data.reverse()
    return {"cash_flow": month_data}


@router.get("/receivables-aging")
def receivables_aging(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Accounts receivable aging buckets."""
    today = date.today()
    open_invoices = TenantQuery(db, Invoice, tenant_id).filter(
        Invoice.status.in_(["sent", "partial", "overdue"]),
        Invoice.balance_due > 0,
    ).all()

    buckets = {"current": 0, "1_30": 0, "31_60": 0, "61_90": 0, "over_90": 0}
    details = []

    for inv in open_invoices:
        days_overdue = (today - inv.due_date).days
        balance = float(inv.balance_due)
        bucket = "current"
        if days_overdue > 90:
            bucket = "over_90"
        elif days_overdue > 60:
            bucket = "61_90"
        elif days_overdue > 30:
            bucket = "31_60"
        elif days_overdue > 0:
            bucket = "1_30"
        buckets[bucket] += balance
        details.append({
            "ref_number": inv.ref_number, "customer_name": inv.customer_name,
            "balance_due": balance, "due_date": str(inv.due_date),
            "days_overdue": max(days_overdue, 0), "bucket": bucket,
        })

    return {"buckets": buckets, "details": details, "total": sum(buckets.values())}


@router.get("/payables-aging")
def payables_aging(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Accounts payable aging buckets."""
    today = date.today()
    open_bills = TenantQuery(db, VendorBill, tenant_id).filter(
        VendorBill.status.in_(["pending", "approved", "partial", "overdue"]),
        VendorBill.balance_due > 0,
    ).all()

    buckets = {"current": 0, "1_30": 0, "31_60": 0, "61_90": 0, "over_90": 0}
    details = []

    for bill in open_bills:
        days_overdue = (today - bill.due_date).days
        balance = float(bill.balance_due)
        bucket = "current"
        if days_overdue > 90:
            bucket = "over_90"
        elif days_overdue > 60:
            bucket = "61_90"
        elif days_overdue > 30:
            bucket = "31_60"
        elif days_overdue > 0:
            bucket = "1_30"
        buckets[bucket] += balance
        details.append({
            "ref_number": bill.ref_number, "supplier_name": bill.supplier_name,
            "balance_due": balance, "due_date": str(bill.due_date),
            "days_overdue": max(days_overdue, 0), "bucket": bucket,
        })

    return {"buckets": buckets, "details": details, "total": sum(buckets.values())}
