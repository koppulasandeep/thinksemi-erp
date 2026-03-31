"""Equipment and Maintenance Schedule models."""

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(200))
    equipment_type: Mapped[str] = mapped_column(
        String(30),
        comment="reflow|pick_place|aoi|spi|ict|fct|wave_solder|printer",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="ok",
        comment="ok|due|overdue|maintenance",
    )
    location: Mapped[str | None] = mapped_column(String(200), nullable=True)
    next_pm_date: Mapped[date] = mapped_column(Date)
    last_pm_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    usage_hours: Mapped[float] = mapped_column(
        Numeric(10, 1), server_default=text("0")
    )
    pm_interval_hours: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    pm_interval_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )
    is_blocked: Mapped[bool] = mapped_column(
        Boolean, server_default=text("false")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # relationships
    maintenance_schedules: Mapped[list["MaintenanceSchedule"]] = relationship(
        back_populates="equipment", cascade="all, delete-orphan"
    )


class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE")
    )
    equipment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("equipment.id", ondelete="CASCADE")
    )
    scheduled_date: Mapped[date] = mapped_column(Date)
    pm_type: Mapped[str] = mapped_column(
        String(20), comment="preventive|corrective|calibration"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        server_default="scheduled",
        comment="scheduled|in_progress|overdue|completed",
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    technician: Mapped[str | None] = mapped_column(String(200), nullable=True)
    parts_used: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # relationship
    equipment: Mapped["Equipment"] = relationship(
        back_populates="maintenance_schedules"
    )
