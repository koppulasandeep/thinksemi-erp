"""Sales Order models — orders, line items, and payment milestones."""

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


class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(
        String(30), comment="e.g. SO-001"
    )
    customer_name: Mapped[str] = mapped_column(String(200))
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("crm_contacts.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    board_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    total_value: Mapped[float] = mapped_column(Numeric(12, 2))
    due_date: Mapped[date] = mapped_column(Date)
    priority: Mapped[str] = mapped_column(
        String(20),
        server_default="medium",
        comment="high|medium|low",
    )
    status: Mapped[str] = mapped_column(
        String(30),
        server_default="draft",
        comment="draft|confirmed|material_pending|production|on_hold"
        "|ready_to_ship|shipped|delivered|invoiced|closed|cancelled",
    )
    payment_status: Mapped[str] = mapped_column(
        String(20),
        server_default="pending",
        comment="pending|partial|paid",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # relationships
    line_items: Mapped[list["SOLineItem"]] = relationship(
        back_populates="sales_order", cascade="all, delete-orphan"
    )
    payment_milestones: Mapped[list["SOPaymentMilestone"]] = relationship(
        back_populates="sales_order", cascade="all, delete-orphan"
    )
    delivery_schedules: Mapped[list["DeliverySchedule"]] = relationship(
        back_populates="sales_order", cascade="all, delete-orphan"
    )


class SOLineItem(Base):
    __tablename__ = "so_line_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    sales_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sales_orders.id", ondelete="CASCADE")
    )
    description: Mapped[str] = mapped_column(String(500))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    total: Mapped[float] = mapped_column(Numeric(12, 2))

    # relationship
    sales_order: Mapped["SalesOrder"] = relationship(back_populates="line_items")


class SOPaymentMilestone(Base):
    __tablename__ = "so_payment_milestones"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    sales_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sales_orders.id", ondelete="CASCADE")
    )
    label: Mapped[str] = mapped_column(
        String(100), comment='e.g. "50% Advance"'
    )
    percentage: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="pending",
        comment="pending|paid|overdue",
    )
    paid_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, server_default=text("0"))

    # relationship
    sales_order: Mapped["SalesOrder"] = relationship(
        back_populates="payment_milestones"
    )


class DeliverySchedule(Base):
    __tablename__ = "delivery_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    sales_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sales_orders.id", ondelete="CASCADE")
    )
    batch_label: Mapped[str] = mapped_column(String(50))
    quantity: Mapped[int] = mapped_column(Integer)
    scheduled_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="scheduled",
        comment="scheduled|shipped|delivered",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # relationship
    sales_order: Mapped["SalesOrder"] = relationship(
        back_populates="delivery_schedules"
    )
