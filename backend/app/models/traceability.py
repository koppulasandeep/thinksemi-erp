"""Traceability models — board serial tracking and component placement logs."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BoardTrace(Base):
    __tablename__ = "board_traces"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    board_serial: Mapped[str] = mapped_column(String(100))
    work_order_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("work_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    wo_ref_number: Mapped[str | None] = mapped_column(String(30), nullable=True)
    step_name: Mapped[str] = mapped_column(String(100))
    machine_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    operator_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    result: Mapped[str] = mapped_column(
        String(20),
        server_default="pass",
        comment="pass|fail|rework",
    )
    sequence_order: Mapped[int] = mapped_column(Integer, server_default=text("0"))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ComponentTrace(Base):
    __tablename__ = "component_traces"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    board_serial: Mapped[str] = mapped_column(String(100))
    reel_id: Mapped[str] = mapped_column(String(100))
    part_number: Mapped[str] = mapped_column(String(100))
    ref_designator: Mapped[str] = mapped_column(String(50))
    work_order_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("work_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    placed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
