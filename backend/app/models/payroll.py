"""PayrollBatch and PayrollEmployee models — Payroll module."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    String,
    ForeignKey,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PayrollBatch(Base):
    __tablename__ = "payroll_batches"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    month: Mapped[int] = mapped_column(Integer, comment="1-12")
    year: Mapped[int] = mapped_column(Integer)
    total_employees: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    total_gross: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    total_deductions: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    total_net: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    total_employer_pf: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    total_employer_esi: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    status: Mapped[str] = mapped_column(
        String(30),
        server_default="draft",
        comment="draft|submitted|under_review|approved|payment_initiated|paid|rejected",
    )
    submitted_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PayrollEmployee(Base):
    __tablename__ = "payroll_employees"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    batch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("payroll_batches.id", ondelete="CASCADE")
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE")
    )

    # Earnings
    basic: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    hra: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    special_allowance: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    conveyance: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    medical: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    gross: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))

    # Deductions
    pf_employee: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    pf_employer: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    esi_employee: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    esi_employer: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    professional_tax: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    tds: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    total_deductions: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    net_pay: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))

    # Attendance summary
    days_worked: Mapped[float] = mapped_column(
        Numeric(4, 1), server_default=text("0")
    )
    days_absent: Mapped[float] = mapped_column(
        Numeric(4, 1), server_default=text("0")
    )
    ot_hours: Mapped[float] = mapped_column(Numeric(5, 1), server_default=text("0"))
    ot_pay: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
