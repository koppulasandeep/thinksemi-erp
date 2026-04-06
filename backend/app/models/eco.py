"""ECO (Engineering Change Order) models."""

import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ECO(Base):
    __tablename__ = "ecos"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), index=True
    )
    ref_number: Mapped[str] = mapped_column(String(30))
    title: Mapped[str] = mapped_column(String(300))
    board_name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    reason: Mapped[str] = mapped_column(
        String(30),
        comment="quality|cost_reduction|customer_request|design_improvement|obsolescence",
    )
    impact: Mapped[str] = mapped_column(
        String(20),
        server_default="medium",
        comment="low|medium|high|critical",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="draft",
        comment="draft|pending_review|approved|rejected|implemented|closed",
    )
    requested_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    approved_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    implemented_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
