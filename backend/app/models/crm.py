"""CRM models — Leads, Contacts, Activities, Quotations."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    ForeignKey,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CRMLead(Base):
    __tablename__ = "crm_leads"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    company: Mapped[str] = mapped_column(String(200))
    contact_person: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    product: Mapped[str | None] = mapped_column(String(200), nullable=True)
    value: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    probability: Mapped[int | None] = mapped_column(
        Integer, nullable=True, comment="0-100"
    )
    stage: Mapped[str] = mapped_column(
        String(20),
        server_default="new_lead",
        comment="new_lead|qualified|quoted|negotiation|won|lost",
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    source: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        comment="website|referral|trade_show|cold_call",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class CRMContact(Base):
    __tablename__ = "crm_contacts"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(200))
    company: Mapped[str | None] = mapped_column(String(200), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_contacted: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class CRMActivity(Base):
    __tablename__ = "crm_activities"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("crm_contacts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("crm_leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    activity_type: Mapped[str] = mapped_column(
        String(20), comment="call|email|meeting|note|task"
    )
    subject: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("crm_leads.id", ondelete="SET NULL"), nullable=True, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(200))
    board_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)

    # Cost breakdown
    bare_pcb_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    component_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    smt_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    tht_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    testing_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    stencil_cost: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    subtotal: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    gst_rate: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("18.0")
    )
    gst_amount: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    total: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )

    validity_days: Mapped[int] = mapped_column(Integer, server_default=text("30"))
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
        comment="draft|sent|accepted|expired|rejected",
    )
    revision: Mapped[str] = mapped_column(String(5), server_default="A")
    version: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    terms: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
