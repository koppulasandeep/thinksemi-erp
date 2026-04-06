"""Salary structure and tax declaration models."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SalaryStructure(Base):
    __tablename__ = "salary_structures"

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
    annual_ctc: Mapped[float] = mapped_column(Numeric(12, 2))
    basic: Mapped[float] = mapped_column(Numeric(12, 2))
    hra: Mapped[float] = mapped_column(Numeric(12, 2))
    special_allowance: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    conveyance: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    medical: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    other_allowances: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    effective_from: Mapped[date] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), server_default="active", comment="active|revised"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class TaxDeclaration(Base):
    __tablename__ = "tax_declarations"

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
    financial_year: Mapped[str] = mapped_column(String(10), comment="e.g. 2025-26")
    regime: Mapped[str] = mapped_column(
        String(10), server_default="new", comment="old|new"
    )
    section_80c: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    section_80d: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    hra_exemption: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    home_loan_interest: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    other_deductions: Mapped[float] = mapped_column(Numeric(12, 2), server_default=text("0"))
    status: Mapped[str] = mapped_column(
        String(20), server_default="draft", comment="draft|submitted|verified"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
