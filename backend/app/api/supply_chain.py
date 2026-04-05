"""Supply Chain API — sales orders, BOM, purchase orders, and suppliers."""

import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.exceptions import BadRequestError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.sales_order import SalesOrder, SOLineItem, SOPaymentMilestone
from app.models.bom import BOMItem, BOMRevision, BOMAlternate
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.sales_order import DeliverySchedule
from app.models.supplier import Supplier
from app.models.inventory import InventoryItem

router = APIRouter(tags=["supply-chain"])

# ─── Sales Orders ─────────────────────────────────────────────────────────

@router.get("/sales-orders")
def list_sales_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, SalesOrder, tenant_id)
    if status:
        tq = tq.filter(SalesOrder.status == status)
    if search:
        tq = tq.filter(SalesOrder.customer_name.ilike(f"%{search}%"))
    orders = tq.all(order_by=SalesOrder.created_at.desc())
    return {"sales_orders": [_so_dict(o) for o in orders]}


@router.post("/sales-orders", status_code=201)
def create_sales_order(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "SO", "sales_orders")
    total_value = payload["quantity"] * payload["unit_price"]
    so = SalesOrder(
        tenant_id=tenant_id,
        ref_number=ref,
        customer_name=payload["customer_name"],
        customer_id=payload.get("customer_id"),
        board_name=payload["board_name"],
        quantity=payload["quantity"],
        unit_price=payload["unit_price"],
        total_value=total_value,
        due_date=payload["due_date"],
        priority=payload.get("priority", "medium"),
        status="draft",
        notes=payload.get("notes"),
    )
    db.add(so)
    db.flush()

    # Create line items if provided
    for item in payload.get("line_items", []):
        li = SOLineItem(
            tenant_id=tenant_id,
            sales_order_id=so.id,
            description=item["description"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            total=item["quantity"] * item["unit_price"],
        )
        db.add(li)

    # Create payment milestones if provided
    for idx, ms in enumerate(payload.get("payment_milestones", [])):
        pm = SOPaymentMilestone(
            tenant_id=tenant_id,
            sales_order_id=so.id,
            label=ms["label"],
            percentage=ms["percentage"],
            amount=round(total_value * ms["percentage"] / 100, 2),
            due_date=ms.get("due_date"),
            sort_order=idx,
        )
        db.add(pm)

    log_activity(db, tenant_id, current_user.id, f"Created sales order {ref} for {so.customer_name}", "supply_chain", "sales_order", so.id)
    db.commit()
    db.refresh(so)
    return _so_dict(so)


@router.get("/sales-orders/{order_id}")
def get_sales_order(
    order_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    so = TenantQuery(db, SalesOrder, tenant_id).get_or_404(order_id, "SalesOrder")
    result = _so_dict(so)
    # Include line items and milestones
    line_items = TenantQuery(db, SOLineItem, tenant_id).filter(
        SOLineItem.sales_order_id == order_id
    ).all()
    milestones = TenantQuery(db, SOPaymentMilestone, tenant_id).filter(
        SOPaymentMilestone.sales_order_id == order_id
    ).all(order_by=SOPaymentMilestone.sort_order)
    result["line_items"] = [
        {"id": str(li.id), "description": li.description, "quantity": li.quantity,
         "unit_price": float(li.unit_price), "total": float(li.total)}
        for li in line_items
    ]
    result["payment_milestones"] = [
        {"id": str(pm.id), "label": pm.label, "percentage": pm.percentage,
         "amount": float(pm.amount), "status": pm.status,
         "due_date": str(pm.due_date) if pm.due_date else None}
        for pm in milestones
    ]
    return result


@router.patch("/sales-orders/{order_id}/status")
def update_so_status(
    order_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    so = TenantQuery(db, SalesOrder, tenant_id).get_or_404(order_id, "SalesOrder")
    old = so.status
    so.status = payload["status"]
    log_activity(db, tenant_id, current_user.id, f"SO {so.ref_number} status: {old} -> {so.status}", "supply_chain", "sales_order", order_id)
    db.commit()
    db.refresh(so)
    return _so_dict(so)


def _so_dict(so: SalesOrder) -> dict:
    return {
        "id": str(so.id),
        "ref_number": so.ref_number,
        "customer_name": so.customer_name,
        "board_name": so.board_name,
        "quantity": so.quantity,
        "unit_price": float(so.unit_price),
        "total_value": float(so.total_value),
        "due_date": str(so.due_date),
        "priority": so.priority,
        "status": so.status,
        "payment_status": so.payment_status,
        "created_at": so.created_at.isoformat() if so.created_at else None,
    }


# ─── BOM ──────────────────────────────────────────────────────────────────

@router.get("/bom")
def list_bom_boards(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """List distinct board names with latest revision and item count."""
    rows = (
        db.query(
            BOMItem.board_name,
            func.max(BOMItem.revision).label("latest_revision"),
            func.count(BOMItem.id).label("item_count"),
        )
        .filter(BOMItem.tenant_id == tenant_id)
        .group_by(BOMItem.board_name)
        .all()
    )
    return {
        "boards": [
            {"board_name": r.board_name, "latest_revision": r.latest_revision, "item_count": r.item_count}
            for r in rows
        ]
    }


@router.get("/bom/{board_name}")
def get_bom(
    board_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    revision: str | None = Query(None),
):
    tq = TenantQuery(db, BOMItem, tenant_id).filter(BOMItem.board_name == board_name)
    if revision:
        tq = tq.filter(BOMItem.revision == revision)
    items = tq.all(order_by=BOMItem.ref_designator)
    revisions = TenantQuery(db, BOMRevision, tenant_id).filter(
        BOMRevision.board_name == board_name
    ).all(order_by=BOMRevision.date.desc())
    return {
        "board_name": board_name,
        "items": [
            {
                "id": str(i.id), "ref_designator": i.ref_designator,
                "part_number": i.part_number, "value": i.value,
                "package": i.package, "manufacturer": i.manufacturer,
                "category": i.category, "qty_per_board": i.qty_per_board,
                "unit_price": float(i.unit_price), "msl_level": i.msl_level,
                "revision": i.revision,
            }
            for i in items
        ],
        "revisions": [
            {"revision": r.revision, "date": str(r.date), "author": r.author,
             "total_cost": float(r.total_cost), "part_count": r.part_count}
            for r in revisions
        ],
    }


@router.post("/bom", status_code=201)
def import_bom(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Batch import BOM items for a board revision."""
    board_name = payload["board_name"]
    revision = payload["revision"]
    author = payload["author"]
    items_data = payload["items"]

    # Create revision record
    total_cost = sum(i["qty_per_board"] * i["unit_price"] for i in items_data)
    rev = BOMRevision(
        tenant_id=tenant_id,
        board_name=board_name,
        revision=revision,
        date=date.today(),
        author=author,
        changes_description=f"Initial import of revision {revision}",
        total_cost=total_cost,
        part_count=len(items_data),
    )
    db.add(rev)

    # Create BOM items
    created = []
    for item in items_data:
        bi = BOMItem(
            tenant_id=tenant_id,
            board_name=board_name,
            revision=revision,
            ref_designator=item["ref_designator"],
            part_number=item["part_number"],
            value=item["value"],
            package=item["package"],
            manufacturer=item["manufacturer"],
            category=item["category"],
            qty_per_board=item["qty_per_board"],
            unit_price=item["unit_price"],
            msl_level=item["msl_level"],
        )
        db.add(bi)
        created.append(bi)

    log_activity(db, tenant_id, current_user.id, f"Imported BOM for {board_name} rev {revision} ({len(items_data)} items)", "supply_chain", "bom", rev.id)
    db.commit()
    db.refresh(rev)
    return {
        "board_name": board_name,
        "revision": revision,
        "items_created": len(created),
        "total_cost": float(rev.total_cost),
    }


@router.patch("/bom/{board_name}/items/{item_id}")
def update_bom_item(
    board_name: str,
    item_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Update a single BOM item."""
    item = TenantQuery(db, BOMItem, tenant_id).get_or_404(item_id, "BOMItem")
    if item.board_name != board_name:
        raise BadRequestError(f"BOM item does not belong to board '{board_name}'")

    updatable = [
        "ref_designator", "part_number", "value", "package", "manufacturer",
        "category", "qty_per_board", "unit_price", "msl_level", "notes",
    ]
    for key in updatable:
        if key in payload:
            setattr(item, key, payload[key])

    log_activity(db, tenant_id, current_user.id, f"Updated BOM item {item.ref_designator} on {board_name}", "supply_chain", "bom_item", item_id)
    db.commit()
    db.refresh(item)
    return {
        "id": str(item.id), "ref_designator": item.ref_designator,
        "part_number": item.part_number, "value": item.value,
        "package": item.package, "manufacturer": item.manufacturer,
        "category": item.category, "qty_per_board": item.qty_per_board,
        "unit_price": float(item.unit_price), "msl_level": item.msl_level,
        "revision": item.revision,
    }


@router.post("/bom/{board_name}/revisions", status_code=201)
def create_bom_revision(
    board_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Create a new BOM revision with cost/count calculated from existing items."""
    revision = payload["revision"]
    author = payload["author"]
    changes_description = payload["changes_description"]

    # Calculate total_cost and part_count from existing BOM items for this board
    items = TenantQuery(db, BOMItem, tenant_id).filter(
        BOMItem.board_name == board_name
    ).all()
    total_cost = sum(float(i.unit_price) * i.qty_per_board for i in items)
    part_count = len(items)

    rev = BOMRevision(
        tenant_id=tenant_id,
        board_name=board_name,
        revision=revision,
        date=date.today(),
        author=author,
        changes_description=changes_description,
        total_cost=total_cost,
        part_count=part_count,
    )
    db.add(rev)
    log_activity(db, tenant_id, current_user.id, f"Created BOM revision {revision} for {board_name}", "supply_chain", "bom_revision", rev.id)
    db.commit()
    db.refresh(rev)
    return {
        "revision": rev.revision, "date": str(rev.date), "author": rev.author,
        "total_cost": float(rev.total_cost), "part_count": rev.part_count,
        "changes_description": rev.changes_description,
    }


@router.get("/bom/{board_name}/alternates")
def get_bom_alternates(
    board_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Get alternates for all parts used in a board's BOM."""
    part_numbers = [
        r.part_number for r in
        TenantQuery(db, BOMItem, tenant_id).filter(BOMItem.board_name == board_name).all()
    ]
    alternates = TenantQuery(db, BOMAlternate, tenant_id).filter(
        BOMAlternate.primary_part_number.in_(part_numbers)
    ).all()
    return {
        "alternates": [
            {
                "id": str(a.id), "primary_part_number": a.primary_part_number,
                "alternate_part_number": a.alternate_part_number,
                "supplier_name": a.supplier_name, "price": float(a.price),
                "lead_time_days": a.lead_time_days, "status": a.status,
            }
            for a in alternates
        ]
    }


@router.post("/bom/{board_name}/alternates", status_code=201)
def create_bom_alternate(
    board_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Create an alternate part for a BOM item."""
    alt = BOMAlternate(
        tenant_id=tenant_id,
        primary_part_number=payload["primary_part_number"],
        alternate_part_number=payload["alternate_part_number"],
        supplier_name=payload["supplier_name"],
        price=payload["price"],
        lead_time_days=payload["lead_time_days"],
        status=payload.get("status", "approved"),
    )
    db.add(alt)
    log_activity(db, tenant_id, current_user.id, f"Created alternate {alt.alternate_part_number} for {alt.primary_part_number} on {board_name}", "supply_chain", "bom_alternate", alt.id)
    db.commit()
    db.refresh(alt)
    return {
        "id": str(alt.id), "primary_part_number": alt.primary_part_number,
        "alternate_part_number": alt.alternate_part_number,
        "supplier_name": alt.supplier_name, "price": float(alt.price),
        "lead_time_days": alt.lead_time_days, "status": alt.status,
    }


@router.get("/bom/{board_name}/where-used")
def where_used(
    board_name: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Where-used query: find all boards that share parts with this board."""
    # Get part numbers used in this board
    part_numbers = [
        r.part_number for r in
        TenantQuery(db, BOMItem, tenant_id).filter(BOMItem.board_name == board_name).all()
    ]
    # For each part, find other boards that use it
    result = []
    for pn in set(part_numbers):
        boards = (
            db.query(BOMItem.board_name)
            .filter(BOMItem.tenant_id == tenant_id, BOMItem.part_number == pn)
            .distinct()
            .all()
        )
        board_list = [b.board_name for b in boards]
        if len(board_list) > 1 or (len(board_list) == 1 and board_list[0] != board_name):
            result.append({"part_number": pn, "boards": board_list})
    return {"where_used": result}


# ─── Delivery Schedules ─────────────────────────────────────────────────

@router.get("/sales-orders/{order_id}/delivery-schedule")
def get_delivery_schedule(
    order_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    TenantQuery(db, SalesOrder, tenant_id).get_or_404(order_id, "SalesOrder")
    schedules = TenantQuery(db, DeliverySchedule, tenant_id).filter(
        DeliverySchedule.sales_order_id == order_id
    ).all(order_by=DeliverySchedule.scheduled_date)
    return {
        "delivery_schedules": [
            {
                "id": str(s.id), "batch_label": s.batch_label,
                "quantity": s.quantity,
                "scheduled_date": str(s.scheduled_date),
                "status": s.status,
            }
            for s in schedules
        ]
    }


@router.post("/sales-orders/{order_id}/delivery-schedule", status_code=201)
def create_delivery_schedule(
    order_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    so = TenantQuery(db, SalesOrder, tenant_id).get_or_404(order_id, "SalesOrder")
    ds = DeliverySchedule(
        tenant_id=tenant_id,
        sales_order_id=order_id,
        batch_label=payload["batch_label"],
        quantity=payload["quantity"],
        scheduled_date=payload["scheduled_date"],
        status=payload.get("status", "scheduled"),
    )
    db.add(ds)
    log_activity(db, tenant_id, current_user.id, f"Added delivery batch '{ds.batch_label}' to SO {so.ref_number}", "supply_chain", "delivery_schedule", ds.id)
    db.commit()
    db.refresh(ds)
    return {
        "id": str(ds.id), "batch_label": ds.batch_label,
        "quantity": ds.quantity,
        "scheduled_date": str(ds.scheduled_date),
        "status": ds.status,
    }


@router.patch("/sales-orders/{order_id}/delivery-schedule/{batch_id}")
def update_delivery_schedule(
    order_id: uuid.UUID,
    batch_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    TenantQuery(db, SalesOrder, tenant_id).get_or_404(order_id, "SalesOrder")
    ds = TenantQuery(db, DeliverySchedule, tenant_id).get_or_404(batch_id, "DeliverySchedule")
    if ds.sales_order_id != order_id:
        raise BadRequestError("Delivery schedule does not belong to this sales order")

    updatable = ["batch_label", "quantity", "scheduled_date", "status"]
    for key in updatable:
        if key in payload:
            setattr(ds, key, payload[key])

    log_activity(db, tenant_id, current_user.id, f"Updated delivery batch '{ds.batch_label}'", "supply_chain", "delivery_schedule", batch_id)
    db.commit()
    db.refresh(ds)
    return {
        "id": str(ds.id), "batch_label": ds.batch_label,
        "quantity": ds.quantity,
        "scheduled_date": str(ds.scheduled_date),
        "status": ds.status,
    }


# ─── Purchase Orders ─────────────────────────────────────────────────────

@router.get("/purchase-orders")
def list_purchase_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, PurchaseOrder, tenant_id)
    if status:
        tq = tq.filter(PurchaseOrder.status == status)
    pos = tq.all(order_by=PurchaseOrder.created_at.desc())
    return {"purchase_orders": [_po_dict(po) for po in pos]}


@router.post("/purchase-orders", status_code=201)
def create_purchase_order(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "PO", "purchase_orders")
    supplier = TenantQuery(db, Supplier, tenant_id).get_or_404(
        uuid.UUID(payload["supplier_id"]), "Supplier"
    )
    line_items_data = payload.get("line_items", [])
    total_amount = sum(li["quantity"] * li["unit_price"] for li in line_items_data)

    po = PurchaseOrder(
        tenant_id=tenant_id,
        ref_number=ref,
        supplier_id=supplier.id,
        supplier_name=supplier.name,
        total_items=len(line_items_data),
        total_amount=total_amount,
        order_date=payload.get("order_date", date.today().isoformat()),
        eta_date=payload["eta_date"],
        status="draft",
        lead_time_days=payload.get("lead_time_days"),
        notes=payload.get("notes"),
    )
    db.add(po)
    db.flush()

    for li in line_items_data:
        item = POLineItem(
            tenant_id=tenant_id,
            purchase_order_id=po.id,
            part_number=li["part_number"],
            description=li.get("description", ""),
            quantity=li["quantity"],
            unit_price=li["unit_price"],
        )
        db.add(item)

    log_activity(db, tenant_id, current_user.id, f"Created PO {ref} for {supplier.name}", "supply_chain", "purchase_order", po.id)
    db.commit()
    db.refresh(po)
    return _po_dict(po)


@router.patch("/purchase-orders/{po_id}/status")
def update_po_status(
    po_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    po = TenantQuery(db, PurchaseOrder, tenant_id).get_or_404(po_id, "PurchaseOrder")
    old = po.status
    po.status = payload["status"]
    log_activity(db, tenant_id, current_user.id, f"PO {po.ref_number} status: {old} -> {po.status}", "supply_chain", "purchase_order", po_id)
    db.commit()
    db.refresh(po)
    return _po_dict(po)


@router.patch("/purchase-orders/{po_id}/receive")
def receive_po(
    po_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    """Receive line items for a PO. payload: { items: [{line_item_id, received_quantity, qc_status, location}] }"""
    po = TenantQuery(db, PurchaseOrder, tenant_id).get_or_404(po_id, "PurchaseOrder")
    all_received = True

    for item_data in payload.get("items", []):
        li = TenantQuery(db, POLineItem, tenant_id).get_or_404(
            uuid.UUID(item_data["line_item_id"]), "POLineItem"
        )
        li.received_quantity = (li.received_quantity or 0) + item_data["received_quantity"]
        li.qc_status = item_data.get("qc_status", "passed")
        li.location_assigned = item_data.get("location")
        li.received_date = date.today()

        if li.received_quantity < li.quantity:
            all_received = False

        # Update inventory stock
        inv = (
            db.query(InventoryItem)
            .filter(InventoryItem.tenant_id == tenant_id, InventoryItem.part_number == li.part_number)
            .first()
        )
        if inv:
            inv.stock_quantity += item_data["received_quantity"]
            inv.last_received = date.today()

    po.status = "received" if all_received else "partially_received"
    log_activity(db, tenant_id, current_user.id, f"Received goods for PO {po.ref_number}", "supply_chain", "purchase_order", po_id)
    db.commit()
    db.refresh(po)
    return _po_dict(po)


def _po_dict(po: PurchaseOrder) -> dict:
    return {
        "id": str(po.id),
        "ref_number": po.ref_number,
        "supplier_name": po.supplier_name,
        "total_items": po.total_items,
        "total_amount": float(po.total_amount),
        "order_date": str(po.order_date),
        "eta_date": str(po.eta_date),
        "status": po.status,
        "created_at": po.created_at.isoformat() if po.created_at else None,
    }


# ─── Suppliers ────────────────────────────────────────────────────────────

@router.get("/suppliers")
def list_suppliers(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    category: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, Supplier, tenant_id)
    if category:
        tq = tq.filter(Supplier.category == category)
    if search:
        tq = tq.filter(Supplier.name.ilike(f"%{search}%"))
    suppliers = tq.all(order_by=Supplier.name)
    return {"suppliers": [_supplier_dict(s) for s in suppliers]}


@router.post("/suppliers", status_code=201)
def create_supplier(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    supplier = Supplier(
        tenant_id=tenant_id,
        name=payload["name"],
        location=payload["location"],
        category=payload["category"],
        contact_person=payload["contact_person"],
        email=payload["email"],
        phone=payload["phone"],
        payment_terms=payload.get("payment_terms", "net_30"),
    )
    db.add(supplier)
    log_activity(db, tenant_id, current_user.id, f"Created supplier: {supplier.name}", "supply_chain", "supplier", supplier.id)
    db.commit()
    db.refresh(supplier)
    return _supplier_dict(supplier)


@router.get("/suppliers/{supplier_id}")
def get_supplier(
    supplier_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    s = TenantQuery(db, Supplier, tenant_id).get_or_404(supplier_id, "Supplier")
    return _supplier_dict(s)


@router.patch("/suppliers/{supplier_id}")
def update_supplier(
    supplier_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    s = TenantQuery(db, Supplier, tenant_id).get_or_404(supplier_id, "Supplier")
    updatable = ["name", "location", "category", "contact_person", "email", "phone",
                 "payment_terms", "rating", "on_time_delivery", "quality_score",
                 "price_competitiveness", "responsiveness", "is_active"]
    for key in updatable:
        if key in payload:
            setattr(s, key, payload[key])
    log_activity(db, tenant_id, current_user.id, f"Updated supplier {s.name}", "supply_chain", "supplier", supplier_id)
    db.commit()
    db.refresh(s)
    return _supplier_dict(s)


def _supplier_dict(s: Supplier) -> dict:
    return {
        "id": str(s.id),
        "name": s.name,
        "location": s.location,
        "category": s.category,
        "contact_person": s.contact_person,
        "email": s.email,
        "phone": s.phone,
        "payment_terms": s.payment_terms,
        "rating": float(s.rating) if s.rating else None,
        "on_time_delivery": float(s.on_time_delivery) if s.on_time_delivery else None,
        "quality_score": float(s.quality_score) if s.quality_score else None,
        "is_active": s.is_active,
        "total_business": float(s.total_business),
    }
