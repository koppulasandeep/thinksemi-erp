"""Purchase Order models — orders and line items."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(
        String(30), comment="e.g. PO-001"
    )
    supplier_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("suppliers.id", ondelete="RESTRICT")
    )
    supplier_name: Mapped[str] = mapped_column(String(200))
    total_items: Mapped[int] = mapped_column(Integer)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    order_date: Mapped[date] = mapped_column(Date)
    eta_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        String(30),
        server_default="draft",
        comment="draft|sent|confirmed|partially_received|received|delayed|closed|cancelled",
    )
    lead_time_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # relationships
    line_items: Mapped[list["POLineItem"]] = relationship(
        back_populates="purchase_order", cascade="all, delete-orphan"
    )


class POLineItem(Base):
    __tablename__ = "po_line_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    purchase_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE")
    )
    part_number: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(500))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    received_quantity: Mapped[int] = mapped_column(
        Integer, server_default=text("0")
    )
    qc_status: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
        comment="passed|failed|pending",
    )
    location_assigned: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    received_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # relationship
    purchase_order: Mapped["PurchaseOrder"] = relationship(
        back_populates="line_items"
    )
