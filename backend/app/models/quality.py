"""Quality models — NCR (Non-Conformance Report) and CAPA."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class NCR(Base):
    __tablename__ = "ncrs"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    board_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    work_order_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("work_orders.id", ondelete="SET NULL"), nullable=True
    )
    defect_type: Mapped[str] = mapped_column(
        String(30),
        comment="solder|component|pcb|mechanical|functional|cosmetic",
    )
    severity: Mapped[str] = mapped_column(
        String(20),
        server_default="minor",
        comment="minor|major|critical",
    )
    quantity_affected: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    root_cause: Mapped[str | None] = mapped_column(Text, nullable=True)
    containment_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="open",
        comment="open|investigating|contained|closed",
    )
    reported_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class CAPA(Base):
    __tablename__ = "capas"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    ncr_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("ncrs.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(300))
    capa_type: Mapped[str] = mapped_column(
        String(20),
        comment="corrective|preventive",
    )
    description: Mapped[str] = mapped_column(Text)
    root_cause_analysis: Mapped[str | None] = mapped_column(Text, nullable=True)
    action_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_method: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="open",
        comment="open|in_progress|verification|closed|cancelled",
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    due_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
