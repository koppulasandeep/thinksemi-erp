"""System Settings and Payroll Configuration models."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    ForeignKey,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SystemSetting(Base):
    __tablename__ = "system_settings"
    __table_args__ = (
        UniqueConstraint("tenant_id", "key", name="uq_system_settings_tenant_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    key: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class PayrollConfig(Base):
    __tablename__ = "payroll_config"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )

    # PF
    pf_rate: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("12")
    )
    pf_ceiling: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("15000")
    )

    # ESI
    esi_employee_rate: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("0.75")
    )
    esi_employer_rate: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("3.25")
    )
    esi_ceiling: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("21000")
    )

    # Tax
    pt_state: Mapped[str] = mapped_column(
        String(50), server_default="tamil_nadu"
    )
    tax_regime: Mapped[str] = mapped_column(
        String(10), server_default="new", comment="old|new"
    )

    # Salary structure
    basic_percent: Mapped[int] = mapped_column(
        Integer, server_default=text("40")
    )
    hra_percent: Mapped[int] = mapped_column(
        Integer, server_default=text("50")
    )
    conveyance_fixed: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("1600")
    )
    medical_fixed: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("1250")
    )

    # Bank details
    bank_name: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    bank_account: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    bank_ifsc: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    pay_day: Mapped[int] = mapped_column(
        Integer, server_default=text("28")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
