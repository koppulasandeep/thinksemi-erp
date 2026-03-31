"""Manufacturing models — production lines, work orders, and route steps."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ProductionLine(Base):
    __tablename__ = "production_lines"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100))
    line_type: Mapped[str] = mapped_column(
        String(20),
        comment="smt|tht|mixed",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="idle",
        comment="running|idle|changeover|maintenance|down",
    )
    current_wo_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("work_orders.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )
    oee: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("0")
    )
    oee_target: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("85")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(
        String(30), comment="e.g. WO-001"
    )
    sales_order_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("sales_orders.id", ondelete="SET NULL"),
        nullable=True,
    )
    board_name: Mapped[str] = mapped_column(String(200))
    customer_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[int] = mapped_column(Integer)
    line_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("production_lines.id", ondelete="SET NULL"),
        nullable=True,
    )
    progress: Mapped[int] = mapped_column(
        Integer, server_default=text("0"), comment="0-100"
    )
    oee: Mapped[float] = mapped_column(
        Numeric(5, 2), server_default=text("0")
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="scheduled",
        comment="scheduled|active|on_hold|completed|cancelled",
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # relationships
    route_steps: Mapped[list["RouteStep"]] = relationship(
        back_populates="work_order", cascade="all, delete-orphan"
    )


class RouteStep(Base):
    __tablename__ = "route_steps"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    work_order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("work_orders.id", ondelete="CASCADE")
    )
    step_name: Mapped[str] = mapped_column(String(100))
    sequence_order: Mapped[int] = mapped_column(Integer)
    completed_units: Mapped[int] = mapped_column(
        Integer, server_default=text("0")
    )
    total_units: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="pending",
        comment="pending|active|done",
    )
    machine_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    operator_name: Mapped[str | None] = mapped_column(
        String(200), nullable=True
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # relationship
    work_order: Mapped["WorkOrder"] = relationship(
        back_populates="route_steps"
    )
