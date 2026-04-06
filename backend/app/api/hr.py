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
from app.models.salary import SalaryStructure, TaxDeclaration
from app.models.holiday import Holiday, LeaveType, LeavePolicy
from app.services.tds import compute_tds_new_regime, compute_tds_old_regime, compute_overtime, compare_regimes

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

        # Look up salary structure for employee
        salary = (
            db.query(SalaryStructure)
            .filter(SalaryStructure.tenant_id == tenant_id, SalaryStructure.employee_id == emp.id, SalaryStructure.status == "active")
            .first()
        )
        if salary:
            ctc_monthly = float(salary.annual_ctc) / 12
            basic = float(salary.basic) / 12
            hra = float(salary.hra) / 12
            special = float(salary.special_allowance) / 12
            conv = float(salary.conveyance) / 12
            med = float(salary.medical) / 12
        else:
            ctc_monthly = 25000
            basic = round(ctc_monthly * basic_pct, 2)
            hra = round(basic * hra_pct, 2)
            conv = conveyance
            med = medical
            special = round(ctc_monthly - basic - hra - conv - med, 2)

        gross = round(basic + hra + special + conv + med, 2)

        # Deductions
        pf_emp = round(min(basic, pf_ceiling) * pf_rate, 2)
        pf_er = round(min(basic, pf_ceiling) * pf_rate, 2)
        esi_emp = round(gross * esi_emp_rate, 2) if gross <= esi_ceiling else 0
        esi_er = round(gross * esi_er_rate, 2) if gross <= esi_ceiling else 0
        professional_tax = 200 if gross > 15000 else 0

        # TDS computation from salary + declarations
        annual_gross = gross * 12
        tax_decl = (
            db.query(TaxDeclaration)
            .filter(TaxDeclaration.tenant_id == tenant_id, TaxDeclaration.employee_id == emp.id)
            .order_by(TaxDeclaration.created_at.desc())
            .first()
        )
        if tax_decl and tax_decl.regime == "old":
            tds_result = compute_tds_old_regime(
                annual_gross, float(tax_decl.section_80c), float(tax_decl.section_80d),
                float(tax_decl.hra_exemption), float(tax_decl.home_loan_interest), float(tax_decl.other_deductions),
            )
        else:
            tds_result = compute_tds_new_regime(annual_gross)
        monthly_tds = tds_result["monthly_tds"]

        total_ded = round(pf_emp + esi_emp + professional_tax + monthly_tds, 2)
        ot_pay = compute_overtime(basic, ot_hours) if ot_hours else 0
        net = round(gross - total_ded + ot_pay, 2)

        pe = PayrollEmployee(
            tenant_id=tenant_id,
            batch_id=batch.id,
            employee_id=emp.id,
            basic=basic,
            hra=hra,
            special_allowance=max(special, 0),
            conveyance=conv,
            medical=med,
            gross=gross,
            pf_employee=pf_emp,
            pf_employer=pf_er,
            esi_employee=esi_emp,
            esi_employer=esi_er,
            professional_tax=professional_tax,
            tds=monthly_tds,
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


# ─── Payslip Detail ──────────────────────────────────────────────────────

@router.get("/payslip/{batch_id}/{employee_id}")
def get_payslip(
    batch_id: uuid.UUID,
    employee_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    pe = (
        db.query(PayrollEmployee)
        .filter(PayrollEmployee.tenant_id == tenant_id, PayrollEmployee.batch_id == batch_id, PayrollEmployee.employee_id == employee_id)
        .first()
    )
    if not pe:
        raise NotFoundError("Payslip", f"{batch_id}/{employee_id}")
    emp = TenantQuery(db, Employee, tenant_id).get_or_404(employee_id, "Employee")
    batch = TenantQuery(db, PayrollBatch, tenant_id).get_or_404(batch_id, "PayrollBatch")
    return {
        "employee": {"id": str(emp.id), "name": emp.name, "emp_code": emp.emp_code, "department": emp.department, "designation": emp.designation, "pan": emp.pan, "bank_account": emp.bank_account, "bank_name": emp.bank_name},
        "batch": {"ref_number": batch.ref_number, "month": batch.month, "year": batch.year},
        "earnings": {"basic": float(pe.basic), "hra": float(pe.hra), "special_allowance": float(pe.special_allowance), "conveyance": float(pe.conveyance), "medical": float(pe.medical), "ot_pay": float(pe.ot_pay), "gross": float(pe.gross)},
        "deductions": {"pf_employee": float(pe.pf_employee), "esi_employee": float(pe.esi_employee), "professional_tax": float(pe.professional_tax), "tds": float(pe.tds), "total_deductions": float(pe.total_deductions)},
        "employer_contributions": {"pf_employer": float(pe.pf_employer), "esi_employer": float(pe.esi_employer)},
        "summary": {"days_worked": float(pe.days_worked), "days_absent": float(pe.days_absent), "ot_hours": float(pe.ot_hours), "net_pay": float(pe.net_pay)},
    }


# ─── Salary Structure ────────────────────────────────────────────────────

@router.get("/salary/{employee_id}")
def get_salary_structure(
    employee_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    TenantQuery(db, Employee, tenant_id).get_or_404(employee_id, "Employee")
    structures = (
        db.query(SalaryStructure)
        .filter(SalaryStructure.tenant_id == tenant_id, SalaryStructure.employee_id == employee_id)
        .order_by(SalaryStructure.effective_from.desc())
        .all()
    )
    return {
        "salary_structures": [
            {
                "id": str(s.id), "annual_ctc": float(s.annual_ctc),
                "basic": float(s.basic), "hra": float(s.hra),
                "special_allowance": float(s.special_allowance),
                "conveyance": float(s.conveyance), "medical": float(s.medical),
                "other_allowances": float(s.other_allowances),
                "effective_from": str(s.effective_from),
                "effective_to": str(s.effective_to) if s.effective_to else None,
                "status": s.status,
            }
            for s in structures
        ]
    }


@router.post("/salary", status_code=201)
def create_salary_structure(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    emp_id = uuid.UUID(payload["employee_id"])
    TenantQuery(db, Employee, tenant_id).get_or_404(emp_id, "Employee")

    prev = (
        db.query(SalaryStructure)
        .filter(SalaryStructure.tenant_id == tenant_id, SalaryStructure.employee_id == emp_id, SalaryStructure.status == "active")
        .first()
    )
    if prev:
        prev.status = "revised"
        prev.effective_to = date.fromisoformat(payload.get("effective_from", str(date.today())))

    annual_ctc = float(payload["annual_ctc"])
    basic = float(payload.get("basic", annual_ctc * 0.40))
    hra = float(payload.get("hra", basic * 0.50))

    ss = SalaryStructure(
        tenant_id=tenant_id, employee_id=emp_id, annual_ctc=annual_ctc,
        basic=basic, hra=hra,
        special_allowance=float(payload.get("special_allowance", annual_ctc - basic - hra - 19200 - 15000)),
        conveyance=float(payload.get("conveyance", 19200)),
        medical=float(payload.get("medical", 15000)),
        other_allowances=float(payload.get("other_allowances", 0)),
        effective_from=date.fromisoformat(payload.get("effective_from", str(date.today()))),
    )
    db.add(ss)
    log_activity(db, tenant_id, current_user.id, f"Set salary for employee {emp_id}: CTC {annual_ctc}", "hr", "salary_structure", ss.id)
    db.commit()
    db.refresh(ss)
    return {"id": str(ss.id), "annual_ctc": float(ss.annual_ctc), "status": ss.status}


# ─── Tax Declarations ────────────────────────────────────────────────────

@router.get("/tax-declarations/{employee_id}")
def get_tax_declarations(
    employee_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    financial_year: str | None = Query(None),
):
    TenantQuery(db, Employee, tenant_id).get_or_404(employee_id, "Employee")
    q = db.query(TaxDeclaration).filter(TaxDeclaration.tenant_id == tenant_id, TaxDeclaration.employee_id == employee_id)
    if financial_year:
        q = q.filter(TaxDeclaration.financial_year == financial_year)
    decls = q.order_by(TaxDeclaration.created_at.desc()).all()
    return {
        "declarations": [
            {
                "id": str(d.id), "financial_year": d.financial_year, "regime": d.regime,
                "section_80c": float(d.section_80c), "section_80d": float(d.section_80d),
                "hra_exemption": float(d.hra_exemption), "home_loan_interest": float(d.home_loan_interest),
                "other_deductions": float(d.other_deductions), "status": d.status,
            }
            for d in decls
        ]
    }


@router.post("/tax-declarations", status_code=201)
def create_tax_declaration(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    emp_id = uuid.UUID(payload["employee_id"])
    TenantQuery(db, Employee, tenant_id).get_or_404(emp_id, "Employee")
    td = TaxDeclaration(
        tenant_id=tenant_id, employee_id=emp_id,
        financial_year=payload.get("financial_year", "2025-26"),
        regime=payload.get("regime", "new"),
        section_80c=float(payload.get("section_80c", 0)),
        section_80d=float(payload.get("section_80d", 0)),
        hra_exemption=float(payload.get("hra_exemption", 0)),
        home_loan_interest=float(payload.get("home_loan_interest", 0)),
        other_deductions=float(payload.get("other_deductions", 0)),
    )
    db.add(td)
    db.commit()
    db.refresh(td)
    return {"id": str(td.id), "regime": td.regime, "financial_year": td.financial_year}


@router.get("/tax-declarations/{employee_id}/compare")
def compare_tax_regimes(
    employee_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    TenantQuery(db, Employee, tenant_id).get_or_404(employee_id, "Employee")
    salary = (
        db.query(SalaryStructure)
        .filter(SalaryStructure.tenant_id == tenant_id, SalaryStructure.employee_id == employee_id, SalaryStructure.status == "active")
        .first()
    )
    if not salary:
        raise BadRequestError("No active salary structure found for this employee")

    annual_gross = float(salary.annual_ctc)
    decl = (
        db.query(TaxDeclaration)
        .filter(TaxDeclaration.tenant_id == tenant_id, TaxDeclaration.employee_id == employee_id)
        .order_by(TaxDeclaration.created_at.desc())
        .first()
    )
    s80c = float(decl.section_80c) if decl else 0
    s80d = float(decl.section_80d) if decl else 0
    hra = float(decl.hra_exemption) if decl else 0
    hl = float(decl.home_loan_interest) if decl else 0
    other = float(decl.other_deductions) if decl else 0

    return compare_regimes(annual_gross, s80c, s80d, hra, hl, other)


# ─── Holidays ─────────────────────────────────────────────────────────────

@router.get("/holidays")
def list_holidays(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    year: int | None = Query(None),
):
    tq = TenantQuery(db, Holiday, tenant_id)
    if year:
        tq = tq.filter(Holiday.year == year)
    holidays = tq.all(order_by=Holiday.date)
    return {
        "holidays": [
            {"id": str(h.id), "date": str(h.date), "name": h.name, "type": h.type, "year": h.year}
            for h in holidays
        ]
    }


@router.post("/holidays", status_code=201)
def create_holiday(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    h = Holiday(
        tenant_id=tenant_id,
        date=date.fromisoformat(payload["date"]),
        name=payload["name"],
        type=payload.get("type", "company"),
        year=int(payload.get("year", date.fromisoformat(payload["date"]).year)),
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    return {"id": str(h.id), "date": str(h.date), "name": h.name, "type": h.type}


@router.delete("/holidays/{holiday_id}")
def delete_holiday(
    holiday_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    h = TenantQuery(db, Holiday, tenant_id).get_or_404(holiday_id, "Holiday")
    db.delete(h)
    db.commit()
    return {"deleted": True}


# ─── Leave Types ──────────────────────────────────────────────────────────

@router.get("/leave-types")
def list_leave_types(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    types = TenantQuery(db, LeaveType, tenant_id).all(order_by=LeaveType.code)
    return {
        "leave_types": [
            {"id": str(t.id), "code": t.code, "name": t.name, "description": t.description, "is_active": t.is_active}
            for t in types
        ]
    }


@router.post("/leave-types", status_code=201)
def create_leave_type(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    lt = LeaveType(
        tenant_id=tenant_id, code=payload["code"], name=payload["name"],
        description=payload.get("description"),
    )
    db.add(lt)
    db.commit()
    db.refresh(lt)
    return {"id": str(lt.id), "code": lt.code, "name": lt.name}


# ─── Leave Policies ───────────────────────────────────────────────────────

@router.get("/leave-policies")
def list_leave_policies(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    policies = TenantQuery(db, LeavePolicy, tenant_id).all()
    type_map = {t.id: t for t in TenantQuery(db, LeaveType, tenant_id).all()}
    return {
        "policies": [
            {
                "id": str(p.id), "leave_type_id": str(p.leave_type_id),
                "leave_type_code": type_map[p.leave_type_id].code if p.leave_type_id in type_map else None,
                "leave_type_name": type_map[p.leave_type_id].name if p.leave_type_id in type_map else None,
                "entitled_days": float(p.entitled_days),
                "carry_forward_enabled": p.carry_forward_enabled,
                "carry_forward_max": float(p.carry_forward_max),
                "max_consecutive_days": p.max_consecutive_days,
                "min_notice_days": p.min_notice_days,
                "applicable_gender": p.applicable_gender,
                "probation_months": p.probation_months,
                "is_active": p.is_active,
            }
            for p in policies
        ]
    }


@router.post("/leave-policies", status_code=201)
def create_leave_policy(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    lp = LeavePolicy(
        tenant_id=tenant_id, leave_type_id=uuid.UUID(payload["leave_type_id"]),
        entitled_days=float(payload["entitled_days"]),
        carry_forward_enabled=payload.get("carry_forward_enabled", False),
        carry_forward_max=float(payload.get("carry_forward_max", 0)),
        max_consecutive_days=payload.get("max_consecutive_days"),
        min_notice_days=payload.get("min_notice_days", 0),
        applicable_gender=payload.get("applicable_gender", "all"),
        probation_months=payload.get("probation_months", 0),
    )
    db.add(lp)
    db.commit()
    db.refresh(lp)
    return {"id": str(lp.id), "entitled_days": float(lp.entitled_days)}


@router.post("/leave-allocate", status_code=201)
def allocate_leave_balances(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Auto-generate LeaveBalance for all active employees from leave policies."""
    year = payload.get("year", date.today().year)
    employees = TenantQuery(db, Employee, tenant_id).filter(Employee.status == "active").all()
    policies = TenantQuery(db, LeavePolicy, tenant_id).filter(LeavePolicy.is_active == True).all()
    type_map = {t.id: t for t in TenantQuery(db, LeaveType, tenant_id).all()}

    created = 0
    for emp in employees:
        for pol in policies:
            lt = type_map.get(pol.leave_type_id)
            if not lt:
                continue
            existing = (
                db.query(LeaveBalance)
                .filter(LeaveBalance.tenant_id == tenant_id, LeaveBalance.employee_id == emp.id,
                        LeaveBalance.leave_type == lt.code, LeaveBalance.year == year)
                .first()
            )
            if existing:
                continue
            db.add(LeaveBalance(
                tenant_id=tenant_id, employee_id=emp.id, leave_type=lt.code,
                entitled=pol.entitled_days, used=0, balance=pol.entitled_days,
                carry_forward_max=pol.carry_forward_max, year=year,
            ))
            created += 1

    db.commit()
    return {"allocated": created, "year": year, "employees": len(employees), "policies": len(policies)}
