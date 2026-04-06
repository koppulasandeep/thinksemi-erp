"""Employee, Attendance, LeaveBalance, LeaveRequest models — HR module."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    ForeignKey,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    emp_code: Mapped[str] = mapped_column(String(30))
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    department: Mapped[str | None] = mapped_column(String(100), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    shift: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date_of_joining: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    pan: Mapped[str | None] = mapped_column(String(20), nullable=True)
    uan: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bank_account: Mapped[str | None] = mapped_column(String(30), nullable=True)
    bank_ifsc: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    aadhar: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="active",
        comment="active|inactive",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "employee_id", "date", name="uq_attendance_tenant_emp_date"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE")
    )
    date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        String(5), comment="P|A|L|WO|H|CO|OT"
    )
    shift_hours: Mapped[float | None] = mapped_column(
        Numeric(4, 2), nullable=True
    )
    overtime_hours: Mapped[float | None] = mapped_column(
        Numeric(4, 2), nullable=True
    )
    biometric_in: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    biometric_out: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    leave_type: Mapped[str] = mapped_column(
        String(5), comment="EL|CL|SL|ML|PL|CO|LOP"
    )
    entitled: Mapped[float] = mapped_column(Numeric(5, 1), server_default=text("0"))
    used: Mapped[float] = mapped_column(Numeric(5, 1), server_default=text("0"))
    balance: Mapped[float] = mapped_column(Numeric(5, 1), server_default=text("0"))
    carry_forward_max: Mapped[float] = mapped_column(
        Numeric(5, 1), server_default=text("0")
    )
    year: Mapped[int] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    leave_type: Mapped[str] = mapped_column(String(5))
    from_date: Mapped[date] = mapped_column(Date)
    to_date: Mapped[date] = mapped_column(Date)
    days: Mapped[float] = mapped_column(Numeric(4, 1))
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
        comment="draft|pending|approved|rejected|cancelled",
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
