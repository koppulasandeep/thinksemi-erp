"""Inventory API — stock items and MSL reel tracking."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError, NotFoundError
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.inventory import InventoryItem, MSLReel

router = APIRouter(tags=["inventory"])

# ─── Inventory Items ──────────────────────────────────────────────────────

@router.get("/items")
def list_items(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    search: str | None = Query(None),
    low_stock: bool = Query(False),
):
    tq = TenantQuery(db, InventoryItem, tenant_id)
    if search:
        tq = tq.filter(InventoryItem.part_number.ilike(f"%{search}%"))
    if low_stock:
        tq = tq.filter(InventoryItem.stock_quantity <= InventoryItem.reorder_point)
    items = tq.all(order_by=InventoryItem.part_number)
    return {
        "items": [
            {
                "id": str(i.id), "part_number": i.part_number,
                "description": i.description, "stock_quantity": i.stock_quantity,
                "reel_count": i.reel_count, "location": i.location,
                "msl_level": i.msl_level, "reorder_point": i.reorder_point,
                "low_stock": i.stock_quantity <= i.reorder_point,
                "last_received": str(i.last_received) if i.last_received else None,
            }
            for i in items
        ]
    }


@router.get("/items/{part_number}")
def get_item(
    part_number: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.tenant_id == tenant_id, InventoryItem.part_number == part_number)
        .first()
    )
    if not item:
        raise NotFoundError("InventoryItem", part_number)
    return {
        "id": str(item.id), "part_number": item.part_number,
        "description": item.description, "stock_quantity": item.stock_quantity,
        "reel_count": item.reel_count, "location": item.location,
        "msl_level": item.msl_level, "reorder_point": item.reorder_point,
        "reorder_quantity": item.reorder_quantity,
        "last_received": str(item.last_received) if item.last_received else None,
    }


@router.patch("/items/{part_number}/stock")
def update_stock(
    part_number: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Adjust stock: payload { adjustment: int, reason: str }"""
    item = (
        db.query(InventoryItem)
        .filter(InventoryItem.tenant_id == tenant_id, InventoryItem.part_number == part_number)
        .first()
    )
    if not item:
        raise NotFoundError("InventoryItem", part_number)

    adjustment = payload["adjustment"]
    new_qty = item.stock_quantity + adjustment
    if new_qty < 0:
        raise BadRequestError(f"Stock cannot go below 0. Current: {item.stock_quantity}, adjustment: {adjustment}")
    item.stock_quantity = new_qty

    log_activity(
        db, tenant_id, current_user.id,
        f"Stock adjusted for {part_number}: {adjustment:+d} (now {new_qty}). Reason: {payload.get('reason', 'N/A')}",
        "inventory", "inventory_item", item.id,
    )
    db.commit()
    db.refresh(item)
    return {"part_number": item.part_number, "stock_quantity": item.stock_quantity}


# ─── MSL Reels ────────────────────────────────────────────────────────────

@router.get("/msl")
def list_msl_reels(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, MSLReel, tenant_id)
    if status:
        tq = tq.filter(MSLReel.status == status)
    reels = tq.all(order_by=MSLReel.remaining_hours)
    return {
        "reels": [
            {
                "id": str(r.id), "reel_id": r.reel_id, "part_number": r.part_number,
                "msl_level": r.msl_level, "floor_life_hours": float(r.floor_life_hours),
                "remaining_hours": float(r.remaining_hours), "status": r.status,
                "location": r.location,
                "opened_at": r.opened_at.isoformat() if r.opened_at else None,
            }
            for r in reels
        ]
    }


@router.get("/msl/{reel_id}")
def get_msl_reel(
    reel_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    reel = (
        db.query(MSLReel)
        .filter(MSLReel.tenant_id == tenant_id, MSLReel.reel_id == reel_id)
        .first()
    )
    if not reel:
        raise NotFoundError("MSLReel", reel_id)
    return {
        "id": str(reel.id), "reel_id": reel.reel_id, "part_number": reel.part_number,
        "msl_level": reel.msl_level, "floor_life_hours": float(reel.floor_life_hours),
        "remaining_hours": float(reel.remaining_hours), "status": reel.status,
        "location": reel.location,
        "opened_at": reel.opened_at.isoformat() if reel.opened_at else None,
        "bake_start": reel.bake_start.isoformat() if reel.bake_start else None,
        "bake_hours": float(reel.bake_hours) if reel.bake_hours else None,
    }


@router.patch("/msl/{reel_id}/status")
def update_msl_status(
    reel_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    reel = (
        db.query(MSLReel)
        .filter(MSLReel.tenant_id == tenant_id, MSLReel.reel_id == reel_id)
        .first()
    )
    if not reel:
        raise NotFoundError("MSLReel", reel_id)
    valid = ["ok", "warning", "critical", "expired"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid MSL status. Must be one of: {valid}")
    old = reel.status
    reel.status = payload["status"]
    log_activity(db, tenant_id, current_user.id, f"MSL reel {reel_id} status: {old} -> {reel.status}", "inventory", "msl_reel", reel.id)
    db.commit()
    return {"reel_id": reel.reel_id, "status": reel.status}


@router.post("/msl/{reel_id}/bake", status_code=201)
def start_bake(
    reel_id: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Start a bake cycle for an MSL reel. payload: { bake_hours: float }"""
    reel = (
        db.query(MSLReel)
        .filter(MSLReel.tenant_id == tenant_id, MSLReel.reel_id == reel_id)
        .first()
    )
    if not reel:
        raise NotFoundError("MSLReel", reel_id)
    if reel.status not in ("warning", "critical", "expired"):
        raise BadRequestError("Bake only needed for reels with warning/critical/expired status")

    reel.bake_start = datetime.utcnow()
    reel.bake_hours = payload["bake_hours"]
    reel.remaining_hours = reel.floor_life_hours  # reset after bake
    reel.status = "ok"

    log_activity(
        db, tenant_id, current_user.id,
        f"Started bake for reel {reel_id}: {payload['bake_hours']}h",
        "inventory", "msl_reel", reel.id,
    )
    db.commit()
    return {"reel_id": reel.reel_id, "status": reel.status, "remaining_hours": float(reel.remaining_hours)}
