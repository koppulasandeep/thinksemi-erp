"""HR schemas — employees, attendance, leave, payroll."""

from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


# ── Employee ─────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    shift: str | None = None
    date_of_joining: date | None = None
    date_of_birth: date | None = None
    pan: str | None = None
    uan: str | None = None
    bank_account: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    aadhar: str | None = None


class EmployeeResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    user_id: UUID | None = None
    emp_code: str
    name: str
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    designation: str | None = None
    shift: str | None = None
    date_of_joining: date | None = None
    date_of_birth: date | None = None
    pan: str | None = None
    uan: str | None = None
    bank_account: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    aadhar: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


# ── Attendance ───────────────────────────────────────────────────────

class AttendanceMark(BaseModel):
    employee_id: UUID
    date: date
    status: str = Field(..., description="P|A|L|WO|H|CO|OT")
    shift_hours: float | None = None
    overtime_hours: float | None = None
    biometric_in: datetime | None = None
    biometric_out: datetime | None = None


class AttendanceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    employee_id: UUID
    date: date
    status: str
    shift_hours: float | None = None
    overtime_hours: float | None = None
    biometric_in: datetime | None = None
    biometric_out: datetime | None = None
    created_at: datetime


# ── Leave Balance ────────────────────────────────────────────────────

class LeaveBalanceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    employee_id: UUID
    leave_type: str
    entitled: float
    used: float
    balance: float
    carry_forward_max: float
    year: int
    created_at: datetime
    updated_at: datetime


# ── Leave Request ────────────────────────────────────────────────────

class LeaveRequestCreate(BaseModel):
    leave_type: str = Field(..., description="EL|CL|SL|ML|PL|CO|LOP")
    from_date: date
    to_date: date
    reason: str | None = None


class LeaveRequestResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    employee_id: UUID
    leave_type: str
    from_date: date
    to_date: date
    days: float
    reason: str | None = None
    status: str
    approved_by: UUID | None = None
    approved_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


# ── Payroll ──────────────────────────────────────────────────────────

class PayrollBatchResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    month: int
    year: int
    total_employees: int
    total_gross: float
    total_deductions: float
    total_net: float
    total_employer_pf: float
    total_employer_esi: float
    status: str
    submitted_by: UUID | None = None
    approved_by: UUID | None = None
    created_at: datetime
    updated_at: datetime


class PayrollEmployeeResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    batch_id: UUID
    employee_id: UUID

    # Earnings
    basic: float
    hra: float
    special_allowance: float
    conveyance: float
    medical: float
    gross: float

    # Deductions
    pf_employee: float
    pf_employer: float
    esi_employee: float
    esi_employer: float
    professional_tax: float
    tds: float
    total_deductions: float
    net_pay: float

    # Attendance summary
    days_worked: float
    days_absent: float
    ot_hours: float
    ot_pay: float
