"""Item Master API — item groups, item catalog, supplier groups."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.exceptions import NotFoundError
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.item_master import ItemGroup, ItemMaster, SupplierGroup
from app.models.supplier import Supplier

router = APIRouter(tags=["item-master"])


# ─── Item Groups ──────────────────────────────────────────────────────────

@router.get("/groups")
def list_item_groups(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    groups = TenantQuery(db, ItemGroup, tenant_id).all(order_by=ItemGroup.name)
    return {
        "groups": [
            {
                "id": str(g.id), "name": g.name, "description": g.description,
                "parent_id": str(g.parent_id) if g.parent_id else None,
                "status": g.status,
            }
            for g in groups
        ]
    }


@router.post("/groups", status_code=201)
def create_item_group(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    group = ItemGroup(
        tenant_id=tenant_id,
        name=payload["name"],
        description=payload.get("description"),
        parent_id=uuid.UUID(payload["parent_id"]) if payload.get("parent_id") else None,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return {"id": str(group.id), "name": group.name, "parent_id": str(group.parent_id) if group.parent_id else None}


@router.patch("/groups/{group_id}")
def update_item_group(
    group_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    group = TenantQuery(db, ItemGroup, tenant_id).get_or_404(group_id, "ItemGroup")
    for field in ("name", "description", "status"):
        if field in payload:
            setattr(group, field, payload[field])
    db.commit()
    db.refresh(group)
    return {"id": str(group.id), "name": group.name, "status": group.status}


# ─── Item Master ──────────────────────────────────────────────────────────

@router.get("/items")
def list_items(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    search: str | None = Query(None),
    group_id: uuid.UUID | None = Query(None),
    status: str | None = Query(None),
):
    tq = TenantQuery(db, ItemMaster, tenant_id)
    if search:
        tq = tq.filter(
            ItemMaster.part_number.ilike(f"%{search}%")
            | ItemMaster.description.ilike(f"%{search}%")
            | ItemMaster.manufacturer.ilike(f"%{search}%")
        )
    if group_id:
        tq = tq.filter(ItemMaster.item_group_id == group_id)
    if status:
        tq = tq.filter(ItemMaster.status == status)
    items = tq.all(order_by=ItemMaster.part_number)
    return {
        "items": [
            {
                "id": str(i.id), "part_number": i.part_number, "description": i.description,
                "item_group_id": str(i.item_group_id) if i.item_group_id else None,
                "manufacturer": i.manufacturer, "package": i.package,
                "uom": i.uom, "hsn_code": i.hsn_code, "status": i.status,
            }
            for i in items
        ]
    }


@router.post("/items", status_code=201)
def create_item(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    item = ItemMaster(
        tenant_id=tenant_id,
        part_number=payload["part_number"],
        description=payload.get("description", ""),
        item_group_id=uuid.UUID(payload["item_group_id"]) if payload.get("item_group_id") else None,
        manufacturer=payload.get("manufacturer"),
        package=payload.get("package"),
        uom=payload.get("uom", "pcs"),
        hsn_code=payload.get("hsn_code"),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": str(item.id), "part_number": item.part_number, "description": item.description}


@router.patch("/items/{item_id}")
def update_item(
    item_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    item = TenantQuery(db, ItemMaster, tenant_id).get_or_404(item_id, "ItemMaster")
    for field in ("description", "manufacturer", "package", "uom", "hsn_code", "status"):
        if field in payload:
            setattr(item, field, payload[field])
    if "item_group_id" in payload:
        item.item_group_id = uuid.UUID(payload["item_group_id"]) if payload["item_group_id"] else None
    db.commit()
    db.refresh(item)
    return {"id": str(item.id), "part_number": item.part_number, "status": item.status}


# ─── Supplier Groups ─────────────────────────────────────────────────────

@router.get("/supplier-groups")
def list_supplier_groups(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    groups = TenantQuery(db, SupplierGroup, tenant_id).all(order_by=SupplierGroup.priority)
    return {
        "groups": [
            {"id": str(g.id), "name": g.name, "description": g.description, "priority": g.priority}
            for g in groups
        ]
    }


@router.post("/supplier-groups", status_code=201)
def create_supplier_group(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("super_admin", "admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    group = SupplierGroup(
        tenant_id=tenant_id,
        name=payload["name"],
        description=payload.get("description"),
        priority=payload.get("priority", 3),
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return {"id": str(group.id), "name": group.name, "priority": group.priority}
