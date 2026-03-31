"""Supplier model — vendor management and scoring."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
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


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(
        String(30),
        comment="components|pcb|packaging",
    )
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    payment_terms: Mapped[str] = mapped_column(
        String(20),
        server_default="net_30",
        comment="net_30|net_60|advance",
    )
    rating: Mapped[float | None] = mapped_column(
        Numeric(2, 1), nullable=True
    )
    certifications: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="JSON array as text"
    )
    on_time_delivery: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    quality_score: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    price_competitiveness: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    responsiveness: Mapped[float | None] = mapped_column(
        Numeric(5, 2), nullable=True
    )
    total_business: Mapped[float] = mapped_column(
        Numeric(12, 2), server_default=text("0")
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, server_default=text("true")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
