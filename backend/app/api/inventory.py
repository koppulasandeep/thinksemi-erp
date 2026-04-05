"""Inventory API — stock items, MSL reel tracking, and valuation."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.inventory import InventoryItem, MSLReel
from app.models.bom import BOMItem
from app.services.msl import compute_msl_status

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
                "unit_price": float(i.unit_price) if i.unit_price else 0,
                "total_value": round(i.stock_quantity * (float(i.unit_price) if i.unit_price else 0), 2),
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


@router.post("/items", status_code=201)
def create_item(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Create a new inventory item."""
    existing = (
        db.query(InventoryItem)
        .filter(InventoryItem.tenant_id == tenant_id, InventoryItem.part_number == payload["part_number"])
        .first()
    )
    if existing:
        raise ConflictError(f"Inventory item with part_number '{payload['part_number']}' already exists")

    item = InventoryItem(
        tenant_id=tenant_id,
        part_number=payload["part_number"],
        description=payload.get("description", ""),
        stock_quantity=payload.get("stock_quantity", 0),
        reel_count=payload.get("reel_count", 0),
        location=payload.get("location", ""),
        msl_level=payload.get("msl_level", 1),
        reorder_point=payload.get("reorder_point", 0),
        reorder_quantity=payload.get("reorder_quantity", 0),
        unit_price=payload.get("unit_price", 0),
    )
    db.add(item)
    log_activity(db, tenant_id, current_user.id, f"Created inventory item {item.part_number}", "inventory", "inventory_item", item.id)
    db.commit()
    db.refresh(item)
    return {
        "id": str(item.id), "part_number": item.part_number,
        "description": item.description, "stock_quantity": item.stock_quantity,
        "reel_count": item.reel_count, "location": item.location,
        "msl_level": item.msl_level, "reorder_point": item.reorder_point,
        "reorder_quantity": item.reorder_quantity,
        "unit_price": float(item.unit_price) if item.unit_price else 0,
    }


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

    dirty = False
    results = []
    for r in reels:
        computed = compute_msl_status(r)
        # Lazy write-back if status changed
        if r.status != computed["status"]:
            r.status = computed["status"]
            r.remaining_hours = computed["remaining_hours"]
            dirty = True
        results.append({
            "id": str(r.id), "reel_id": r.reel_id, "part_number": r.part_number,
            "msl_level": r.msl_level, "floor_life_hours": float(r.floor_life_hours),
            "remaining_hours": computed["remaining_hours"],
            "status": computed["status"],
            "location": r.location,
            "opened_at": r.opened_at.isoformat() if r.opened_at else None,
        })
    if dirty:
        db.commit()

    return {"reels": results}


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

    computed = compute_msl_status(reel)
    # Lazy write-back if status changed
    if reel.status != computed["status"]:
        reel.status = computed["status"]
        reel.remaining_hours = computed["remaining_hours"]
        db.commit()

    return {
        "id": str(reel.id), "reel_id": reel.reel_id, "part_number": reel.part_number,
        "msl_level": reel.msl_level, "floor_life_hours": float(reel.floor_life_hours),
        "remaining_hours": computed["remaining_hours"],
        "status": computed["status"],
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


@router.post("/msl", status_code=201)
def create_msl_reel(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Create a new MSL reel record."""
    opened_at = None
    remaining_hours = float(payload["floor_life_hours"])

    if payload.get("opened_at"):
        opened_at = datetime.fromisoformat(payload["opened_at"])
        elapsed = (datetime.utcnow() - opened_at).total_seconds() / 3600
        remaining_hours = max(float(payload["floor_life_hours"]) - elapsed, 0)

    reel = MSLReel(
        tenant_id=tenant_id,
        reel_id=payload["reel_id"],
        part_number=payload["part_number"],
        msl_level=payload["msl_level"],
        floor_life_hours=payload["floor_life_hours"],
        remaining_hours=remaining_hours,
        location=payload.get("location", ""),
        opened_at=opened_at,
    )
    # Set status via compute
    computed = compute_msl_status(reel)
    reel.status = computed["status"]
    reel.remaining_hours = computed["remaining_hours"]

    db.add(reel)
    log_activity(db, tenant_id, current_user.id, f"Created MSL reel {reel.reel_id} ({reel.part_number})", "inventory", "msl_reel", reel.id)
    db.commit()
    db.refresh(reel)
    return {
        "id": str(reel.id), "reel_id": reel.reel_id, "part_number": reel.part_number,
        "msl_level": reel.msl_level, "floor_life_hours": float(reel.floor_life_hours),
        "remaining_hours": float(reel.remaining_hours), "status": reel.status,
        "location": reel.location,
        "opened_at": reel.opened_at.isoformat() if reel.opened_at else None,
    }


# ─── Inventory Valuation ─────────────────────────────────────────────────

@router.get("/valuation")
def inventory_valuation(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Aggregate inventory value, with breakdown by BOM category."""
    items = TenantQuery(db, InventoryItem, tenant_id).all(order_by=InventoryItem.part_number)

    total_value = 0.0
    item_values = []
    for i in items:
        price = float(i.unit_price) if i.unit_price else 0
        val = round(i.stock_quantity * price, 2)
        total_value += val
        item_values.append({
            "part_number": i.part_number,
            "stock_quantity": i.stock_quantity,
            "unit_price": price,
            "total_value": val,
        })

    # Category breakdown: join inventory part_numbers with BOM categories
    category_rows = (
        db.query(
            BOMItem.category,
            func.sum(InventoryItem.stock_quantity * InventoryItem.unit_price).label("value"),
        )
        .join(InventoryItem, (InventoryItem.part_number == BOMItem.part_number) & (InventoryItem.tenant_id == BOMItem.tenant_id))
        .filter(InventoryItem.tenant_id == tenant_id)
        .group_by(BOMItem.category)
        .all()
    )
    by_category = {r.category: round(float(r.value or 0), 2) for r in category_rows}

    return {
        "total_value": round(total_value, 2),
        "item_count": len(items),
        "by_category": by_category,
        "items": item_values,
    }
