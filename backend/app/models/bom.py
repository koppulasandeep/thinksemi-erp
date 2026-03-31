"""BOM models — items, revisions, and alternates."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Date,
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


class BOMItem(Base):
    __tablename__ = "bom_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    board_name: Mapped[str] = mapped_column(String(200))
    revision: Mapped[str] = mapped_column(
        String(10), comment="A/B/C etc."
    )
    ref_designator: Mapped[str] = mapped_column(
        String(50), comment="R1, C1, U1"
    )
    part_number: Mapped[str] = mapped_column(String(100))
    value: Mapped[str] = mapped_column(String(100))
    package: Mapped[str] = mapped_column(String(50))
    manufacturer: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(
        String(30),
        comment="passives|ics|connectors|mechanicals",
    )
    qty_per_board: Mapped[int] = mapped_column(
        Integer, server_default=text("1")
    )
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2))
    msl_level: Mapped[int] = mapped_column(
        Integer, comment="1-6"
    )
    alternate_count: Mapped[int] = mapped_column(
        Integer, server_default=text("0")
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class BOMRevision(Base):
    __tablename__ = "bom_revisions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    board_name: Mapped[str] = mapped_column(String(200))
    revision: Mapped[str] = mapped_column(String(10))
    date: Mapped[date] = mapped_column(Date)
    author: Mapped[str] = mapped_column(String(200))
    changes_description: Mapped[str] = mapped_column(Text)
    total_cost: Mapped[float] = mapped_column(Numeric(12, 2))
    part_count: Mapped[int] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class BOMAlternate(Base):
    __tablename__ = "bom_alternates"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    primary_part_number: Mapped[str] = mapped_column(String(100))
    alternate_part_number: Mapped[str] = mapped_column(String(100))
    supplier_name: Mapped[str] = mapped_column(String(200))
    price: Mapped[float] = mapped_column(Numeric(12, 2))
    lead_time_days: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="approved",
        comment="approved|qualified|obsolete",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
