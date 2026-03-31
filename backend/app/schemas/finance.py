"""Finance schemas — customer invoices, vendor bills, payroll approvals."""

from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


# ── Customer Invoice ─────────────────────────────────────────────────

class CustomerInvoiceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    sales_order_id: UUID | None = None
    customer_name: str
    invoice_date: date
    due_date: date
    subtotal: float
    gst_amount: float
    total: float
    amount_paid: float
    balance_due: float
    status: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class RecordPayment(BaseModel):
    amount: float
    date: date
    mode: str = Field(..., description="bank_transfer|cheque|cash|upi")
    reference: str | None = None


# ── Vendor Bill ──────────────────────────────────────────────────────

class VendorBillResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    purchase_order_id: UUID | None = None
    supplier_name: str
    bill_date: date
    due_date: date
    subtotal: float
    gst_amount: float
    total: float
    amount_paid: float
    balance_due: float
    status: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class ApprovePayment(BaseModel):
    amount: float
    date: date
    mode: str = Field(..., description="bank_transfer|cheque|cash|upi")
    reference: str | None = None


# ── Payroll Approval ─────────────────────────────────────────────────

class PayrollApprovalResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    batch_id: UUID
    ref_number: str
    month: int
    year: int
    total_employees: int
    total_net: float
    status: str
    submitted_by: UUID | None = None
    approved_by: UUID | None = None
    approved_at: datetime | None = None
    created_at: datetime
