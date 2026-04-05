"""Inventory models — stock items and MSL reel tracking."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "part_number", name="uq_inventory_tenant_part"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    part_number: Mapped[str] = mapped_column(String(100))
    description: Mapped[str] = mapped_column(String(500))
    stock_quantity: Mapped[int] = mapped_column(Integer)
    reel_count: Mapped[int] = mapped_column(Integer)
    location: Mapped[str] = mapped_column(String(100))
    msl_level: Mapped[int] = mapped_column(Integer)
    reorder_point: Mapped[int] = mapped_column(Integer)
    reorder_quantity: Mapped[int] = mapped_column(
        Integer, server_default=text("0")
    )
    unit_price: Mapped[float | None] = mapped_column(
        Numeric(10, 4), nullable=True, server_default=text("0")
    )
    last_received: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class MSLReel(Base):
    __tablename__ = "msl_reels"
    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "reel_id", name="uq_msl_reels_tenant_reel"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    reel_id: Mapped[str] = mapped_column(String(100))
    part_number: Mapped[str] = mapped_column(String(100))
    msl_level: Mapped[int] = mapped_column(Integer)
    floor_life_hours: Mapped[float] = mapped_column(Numeric(12, 2))
    remaining_hours: Mapped[float] = mapped_column(Numeric(12, 2))
    opened_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="ok",
        comment="ok|warning|critical|expired",
    )
    bake_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    bake_hours: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    location: Mapped[str] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
