"""Maintenance API — equipment and maintenance schedules."""

import uuid
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.equipment import Equipment, MaintenanceSchedule

router = APIRouter(tags=["maintenance"])


@router.get("/equipment")
def list_equipment(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    equipment_type: str | None = Query(None),
):
    tq = TenantQuery(db, Equipment, tenant_id)
    if status:
        tq = tq.filter(Equipment.status == status)
    if equipment_type:
        tq = tq.filter(Equipment.equipment_type == equipment_type)
    items = tq.all(order_by=Equipment.name)
    return {
        "equipment": [
            {
                "id": str(e.id), "name": e.name,
                "equipment_type": e.equipment_type, "status": e.status,
                "location": e.location,
                "next_pm_date": str(e.next_pm_date) if e.next_pm_date else None,
                "last_pm_date": str(e.last_pm_date) if e.last_pm_date else None,
                "usage_hours": float(e.usage_hours),
                "is_blocked": e.is_blocked,
            }
            for e in items
        ]
    }


@router.patch("/equipment/{equipment_id}")
def update_equipment(
    equipment_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    equip = TenantQuery(db, Equipment, tenant_id).get_or_404(equipment_id, "Equipment")
    updatable = ["name", "equipment_type", "status", "location", "next_pm_date",
                 "last_pm_date", "usage_hours", "pm_interval_hours", "pm_interval_days", "is_blocked"]
    for key in updatable:
        if key in payload:
            setattr(equip, key, payload[key])
    log_activity(db, tenant_id, current_user.id, f"Updated equipment: {equip.name}", "maintenance", "equipment", equipment_id)
    db.commit()
    db.refresh(equip)
    return {
        "id": str(equip.id), "name": equip.name,
        "status": equip.status, "next_pm_date": str(equip.next_pm_date) if equip.next_pm_date else None,
    }


@router.post("/schedules", status_code=201)
def create_schedule(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    equip = TenantQuery(db, Equipment, tenant_id).get_or_404(
        uuid.UUID(payload["equipment_id"]), "Equipment"
    )
    ms = MaintenanceSchedule(
        tenant_id=tenant_id,
        equipment_id=equip.id,
        scheduled_date=payload["scheduled_date"],
        pm_type=payload["pm_type"],
        description=payload.get("description"),
        technician=payload.get("technician"),
        status="scheduled",
    )
    db.add(ms)
    log_activity(db, tenant_id, current_user.id, f"Scheduled {payload['pm_type']} maintenance for {equip.name}", "maintenance", "maintenance_schedule", ms.id)
    db.commit()
    db.refresh(ms)
    return {
        "id": str(ms.id), "equipment_id": str(equip.id),
        "scheduled_date": str(ms.scheduled_date), "pm_type": ms.pm_type, "status": ms.status,
    }


@router.patch("/schedules/{schedule_id}/status")
def update_schedule_status(
    schedule_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ms = TenantQuery(db, MaintenanceSchedule, tenant_id).get_or_404(schedule_id, "MaintenanceSchedule")
    valid = ["scheduled", "in_progress", "overdue", "completed"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid status. Must be one of: {valid}")
    old = ms.status
    ms.status = payload["status"]

    if payload["status"] == "completed":
        ms.completed_at = datetime.utcnow()
        if "parts_used" in payload:
            ms.parts_used = payload["parts_used"]
        # Update equipment's last/next PM dates
        equip = TenantQuery(db, Equipment, tenant_id).get(ms.equipment_id)
        if equip:
            equip.last_pm_date = date.today()
            equip.status = "ok"
            if equip.pm_interval_days:
                from datetime import timedelta
                equip.next_pm_date = date.today() + timedelta(days=equip.pm_interval_days)

    log_activity(db, tenant_id, current_user.id, f"Maintenance schedule {schedule_id} status: {old} -> {ms.status}", "maintenance", "maintenance_schedule", schedule_id)
    db.commit()
    db.refresh(ms)
    return {"id": str(ms.id), "status": ms.status}
