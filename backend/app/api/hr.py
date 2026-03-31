"""HR API — employees, attendance, leave management, and payroll."""

import uuid
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.employee import Employee, Attendance, LeaveBalance, LeaveRequest
from app.models.payroll import PayrollBatch, PayrollEmployee
from app.models.settings_model import PayrollConfig

router = APIRouter(tags=["hr"])

# ─── Employees ────────────────────────────────────────────────────────────

@router.get("/employees")
def list_employees(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    search: str | None = Query(None),
    department: str | None = Query(None),
    status: str | None = Query(None, pattern="^(active|inactive)$"),
):
    tq = TenantQuery(db, Employee, tenant_id)
    if search:
        tq = tq.filter(Employee.name.ilike(f"%{search}%"))
    if department:
        tq = tq.filter(Employee.department == department)
    if status:
        tq = tq.filter(Employee.status == status)
    employees = tq.all(order_by=Employee.name)
    return {"employees": [_emp_dict(e) for e in employees]}


@router.post("/employees", status_code=201)
def create_employee(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    emp_code = next_ref(db, tenant_id, "EMP", "employees")
    emp = Employee(
        tenant_id=tenant_id,
        emp_code=emp_code,
        name=payload["name"],
        email=payload.get("email"),
        phone=payload.get("phone"),
        department=payload.get("department"),
        designation=payload.get("designation"),
        shift=payload.get("shift"),
        date_of_joining=payload.get("date_of_joining"),
        date_of_birth=payload.get("date_of_birth"),
        pan=payload.get("pan"),
        uan=payload.get("uan"),
        bank_account=payload.get("bank_account"),
        bank_ifsc=payload.get("bank_ifsc"),
        bank_name=payload.get("bank_name"),
        aadhar=payload.get("aadhar"),
        user_id=payload.get("user_id"),
    )
    db.add(emp)
    log_activity(db, tenant_id, current_user.id, f"Created employee {emp_code}: {emp.name}", "hr", "employee", emp.id)
    db.commit()
    db.refresh(emp)
    return _emp_dict(emp)


def _emp_dict(e: Employee) -> dict:
    return {
        "id": str(e.id),
        "emp_code": e.emp_code,
        "name": e.name,
        "email": e.email,
        "phone": e.phone,
        "department": e.department,
        "designation": e.designation,
        "shift": e.shift,
        "date_of_joining": str(e.date_of_joining) if e.date_of_joining else None,
        "status": e.status,
    }


# ─── Attendance ───────────────────────────────────────────────────────────

@router.get("/attendance")
def get_attendance(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020),
    employee_id: uuid.UUID | None = Query(None),
):
    tq = TenantQuery(db, Attendance, tenant_id).filter(
        extract("month", Attendance.date) == month,
        extract("year", Attendance.date) == year,
    )
    if employee_id:
        tq = tq.filter(Attendance.employee_id == employee_id)
    records = tq.all(order_by=Attendance.date)
    return {
        "attendance": [
            {
                "id": str(a.id),
                "employee_id": str(a.employee_id),
                "date": str(a.date),
                "status": a.status,
                "shift_hours": float(a.shift_hours) if a.shift_hours else None,
                "overtime_hours": float(a.overtime_hours) if a.overtime_hours else None,
            }
            for a in records
        ]
    }


@router.post("/attendance/mark", status_code=201)
def mark_attendance(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    # Check employee exists
    TenantQuery(db, Employee, tenant_id).get_or_404(uuid.UUID(payload["employee_id"]), "Employee")

    att = Attendance(
        tenant_id=tenant_id,
        employee_id=uuid.UUID(payload["employee_id"]),
        date=payload["date"],
        status=payload["status"],
        shift_hours=payload.get("shift_hours"),
        overtime_hours=payload.get("overtime_hours"),
    )
    db.add(att)
    log_activity(db, tenant_id, current_user.id, f"Marked attendance for {payload['employee_id']} on {payload['date']}", "hr", "attendance")
    db.commit()
    db.refresh(att)
    return {"id": str(att.id), "status": att.status, "date": str(att.date)}


# ─── Leave ────────────────────────────────────────────────────────────────

@router.get("/leave-balances/{employee_id}")
def get_leave_balances(
    employee_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    year: int = Query(default=None),
):
    TenantQuery(db, Employee, tenant_id).get_or_404(employee_id, "Employee")
    tq = TenantQuery(db, LeaveBalance, tenant_id).filter(
        LeaveBalance.employee_id == employee_id,
    )
    if year:
        tq = tq.filter(LeaveBalance.year == year)
    else:
        tq = tq.filter(LeaveBalance.year == date.today().year)
    balances = tq.all()
    return {
        "balances": [
            {
                "id": str(lb.id),
                "leave_type": lb.leave_type,
                "entitled": float(lb.entitled),
                "used": float(lb.used),
                "balance": float(lb.balance),
                "year": lb.year,
            }
            for lb in balances
        ]
    }


@router.post("/leave-requests", status_code=201)
def create_leave_request(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    emp = TenantQuery(db, Employee, tenant_id).get_or_404(
        uuid.UUID(payload["employee_id"]), "Employee"
    )
    from_date = date.fromisoformat(payload["from_date"])
    to_date = date.fromisoformat(payload["to_date"])
    days = (to_date - from_date).days + 1
    if days <= 0:
        raise BadRequestError("to_date must be after from_date")

    lr = LeaveRequest(
        tenant_id=tenant_id,
        employee_id=emp.id,
        leave_type=payload["leave_type"],
        from_date=from_date,
        to_date=to_date,
        days=days,
        reason=payload.get("reason"),
        status="pending",
    )
    db.add(lr)
    log_activity(db, tenant_id, current_user.id, f"Leave request created for {emp.name}: {days} days", "hr", "leave_request", lr.id)
    db.commit()
    db.refresh(lr)
    return _lr_dict(lr)


@router.get("/leave-requests")
def list_leave_requests(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    employee_id: uuid.UUID | None = Query(None),
):
    tq = TenantQuery(db, LeaveRequest, tenant_id)
    if status:
        tq = tq.filter(LeaveRequest.status == status)
    if employee_id:
        tq = tq.filter(LeaveRequest.employee_id == employee_id)
    requests = tq.all(order_by=LeaveRequest.created_at.desc())
    return {"leave_requests": [_lr_dict(lr) for lr in requests]}


@router.patch("/leave-requests/{request_id}/approve")
def approve_leave(
    request_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    lr = TenantQuery(db, LeaveRequest, tenant_id).get_or_404(request_id, "LeaveRequest")
    if lr.status != "pending":
        raise BadRequestError(f"Cannot approve request in '{lr.status}' status")
    lr.status = "approved"
    lr.approved_by = current_user.id
    lr.approved_at = datetime.utcnow()

    # Deduct from balance
    bal = (
        db.query(LeaveBalance)
        .filter(
            LeaveBalance.tenant_id == tenant_id,
            LeaveBalance.employee_id == lr.employee_id,
            LeaveBalance.leave_type == lr.leave_type,
            LeaveBalance.year == lr.from_date.year,
        )
        .first()
    )
    if bal:
        bal.used = float(bal.used) + float(lr.days)
        bal.balance = float(bal.entitled) - float(bal.used)

    log_activity(db, tenant_id, current_user.id, f"Approved leave request {request_id}", "hr", "leave_request", request_id)
    db.commit()
    db.refresh(lr)
    return _lr_dict(lr)


@router.patch("/leave-requests/{request_id}/reject")
def reject_leave(
    request_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    lr = TenantQuery(db, LeaveRequest, tenant_id).get_or_404(request_id, "LeaveRequest")
    if lr.status != "pending":
        raise BadRequestError(f"Cannot reject request in '{lr.status}' status")
    lr.status = "rejected"
    lr.approved_by = current_user.id
    lr.approved_at = datetime.utcnow()
    log_activity(db, tenant_id, current_user.id, f"Rejected leave request {request_id}", "hr", "leave_request", request_id)
    db.commit()
    db.refresh(lr)
    return _lr_dict(lr)


def _lr_dict(lr: LeaveRequest) -> dict:
    return {
        "id": str(lr.id),
        "employee_id": str(lr.employee_id),
        "leave_type": lr.leave_type,
        "from_date": str(lr.from_date),
        "to_date": str(lr.to_date),
        "days": float(lr.days),
        "reason": lr.reason,
        "status": lr.status,
        "approved_by": str(lr.approved_by) if lr.approved_by else None,
    }


# ─── Payroll ──────────────────────────────────────────────────────────────

@router.get("/payroll/batches")
def list_payroll_batches(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    year: int | None = Query(None),
):
    tq = TenantQuery(db, PayrollBatch, tenant_id)
    if year:
        tq = tq.filter(PayrollBatch.year == year)
    batches = tq.all(order_by=PayrollBatch.created_at.desc())
    return {
        "batches": [
            {
                "id": str(b.id),
                "ref_number": b.ref_number,
                "month": b.month,
                "year": b.year,
                "total_employees": b.total_employees,
                "total_gross": float(b.total_gross),
                "total_deductions": float(b.total_deductions),
                "total_net": float(b.total_net),
                "status": b.status,
            }
            for b in batches
        ]
    }


@router.post("/payroll/batches", status_code=201)
def create_payroll_batch(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    month = payload["month"]
    year = payload["year"]

    # Load payroll config
    config = db.query(PayrollConfig).filter(PayrollConfig.tenant_id == tenant_id).first()
    basic_pct = float(config.basic_percent) / 100 if config else 0.40
    hra_pct = float(config.hra_percent) / 100 if config else 0.50
    conveyance = float(config.conveyance_fixed) if config else 1600
    medical = float(config.medical_fixed) if config else 1250
    pf_rate = float(config.pf_rate) / 100 if config else 0.12
    pf_ceiling = float(config.pf_ceiling) if config else 15000
    esi_emp_rate = float(config.esi_employee_rate) / 100 if config else 0.0075
    esi_er_rate = float(config.esi_employer_rate) / 100 if config else 0.0325
    esi_ceiling = float(config.esi_ceiling) if config else 21000
    pt = float(config.pt_state == "tamil_nadu") * 200 if config else 200

    employees = TenantQuery(db, Employee, tenant_id).filter(Employee.status == "active").all()
    ref = next_ref(db, tenant_id, "PAY", "payroll_batches")

    batch = PayrollBatch(
        tenant_id=tenant_id,
        ref_number=ref,
        month=month,
        year=year,
        total_employees=len(employees),
        status="draft",
    )
    db.add(batch)
    db.flush()

    total_gross = total_deductions = total_net = total_epf = total_esi = 0

    for emp in employees:
        # Count working days from attendance
        att_records = (
            db.query(Attendance)
            .filter(
                Attendance.tenant_id == tenant_id,
                Attendance.employee_id == emp.id,
                extract("month", Attendance.date) == month,
                extract("year", Attendance.date) == year,
            )
            .all()
        )
        days_worked = sum(1 for a in att_records if a.status in ("P", "OT", "WO", "H"))
        days_absent = sum(1 for a in att_records if a.status == "A")
        ot_hours = sum(float(a.overtime_hours or 0) for a in att_records)

        # Simple salary calculation (assuming monthly CTC stored somewhere; use basic as proxy)
        ctc_monthly = 25000  # default; in production this comes from employee salary table
        basic = round(ctc_monthly * basic_pct, 2)
        hra = round(basic * hra_pct, 2)
        special = round(ctc_monthly - basic - hra - conveyance - medical, 2)
        gross = basic + hra + special + conveyance + medical

        # Deductions
        pf_emp = round(min(basic, pf_ceiling) * pf_rate, 2)
        pf_er = round(min(basic, pf_ceiling) * pf_rate, 2)
        esi_emp = round(gross * esi_emp_rate, 2) if gross <= esi_ceiling else 0
        esi_er = round(gross * esi_er_rate, 2) if gross <= esi_ceiling else 0
        professional_tax = 200 if gross > 15000 else 0
        total_ded = pf_emp + esi_emp + professional_tax
        net = round(gross - total_ded, 2)
        ot_pay = round(ot_hours * (basic / 26 / 8) * 1.5, 2) if ot_hours else 0
        net += ot_pay

        pe = PayrollEmployee(
            tenant_id=tenant_id,
            batch_id=batch.id,
            employee_id=emp.id,
            basic=basic,
            hra=hra,
            special_allowance=max(special, 0),
            conveyance=conveyance,
            medical=medical,
            gross=gross,
            pf_employee=pf_emp,
            pf_employer=pf_er,
            esi_employee=esi_emp,
            esi_employer=esi_er,
            professional_tax=professional_tax,
            tds=0,
            total_deductions=total_ded,
            net_pay=net,
            days_worked=days_worked,
            days_absent=days_absent,
            ot_hours=ot_hours,
            ot_pay=ot_pay,
        )
        db.add(pe)
        total_gross += gross
        total_deductions += total_ded
        total_net += net
        total_epf += pf_er
        total_esi += esi_er

    batch.total_gross = total_gross
    batch.total_deductions = total_deductions
    batch.total_net = total_net
    batch.total_employer_pf = total_epf
    batch.total_employer_esi = total_esi

    log_activity(db, tenant_id, current_user.id, f"Created payroll batch {ref} for {month}/{year}", "hr", "payroll_batch", batch.id)
    db.commit()
    db.refresh(batch)
    return {
        "id": str(batch.id),
        "ref_number": batch.ref_number,
        "month": batch.month,
        "year": batch.year,
        "total_employees": batch.total_employees,
        "total_gross": float(batch.total_gross),
        "total_net": float(batch.total_net),
        "status": batch.status,
    }


@router.patch("/payroll/batches/{batch_id}/submit")
def submit_payroll_batch(
    batch_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    batch = TenantQuery(db, PayrollBatch, tenant_id).get_or_404(batch_id, "PayrollBatch")
    if batch.status != "draft":
        raise BadRequestError(f"Batch must be in draft status, currently '{batch.status}'")
    batch.status = "submitted"
    batch.submitted_by = current_user.id
    log_activity(db, tenant_id, current_user.id, f"Submitted payroll batch {batch.ref_number}", "hr", "payroll_batch", batch_id)
    db.commit()
    db.refresh(batch)
    return {"id": str(batch.id), "status": batch.status}


@router.patch("/payroll/batches/{batch_id}/approve")
def approve_payroll_batch(
    batch_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("finance_manager", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    batch = TenantQuery(db, PayrollBatch, tenant_id).get_or_404(batch_id, "PayrollBatch")
    if batch.status != "submitted":
        raise BadRequestError(f"Batch must be submitted first, currently '{batch.status}'")
    batch.status = "approved"
    batch.approved_by = current_user.id
    log_activity(db, tenant_id, current_user.id, f"Approved payroll batch {batch.ref_number}", "hr", "payroll_batch", batch_id)
    db.commit()
    db.refresh(batch)
    return {"id": str(batch.id), "status": batch.status}
