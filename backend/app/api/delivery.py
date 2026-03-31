"""Delivery API — shipments and tracking."""

import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.shipment import Shipment
from app.models.sales_order import SalesOrder

router = APIRouter(tags=["delivery"])


@router.get("/shipments")
def list_shipments(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, Shipment, tenant_id)
    if status:
        tq = tq.filter(Shipment.status == status)
    shipments = tq.all(order_by=Shipment.created_at.desc())
    return {"shipments": [_ship_dict(s) for s in shipments]}


@router.post("/shipments", status_code=201)
def create_shipment(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "SH", "shipments")

    # If linked to SO, pull customer info
    customer_name = payload.get("customer_name", "")
    if payload.get("sales_order_id"):
        so = TenantQuery(db, SalesOrder, tenant_id).get_or_404(
            uuid.UUID(payload["sales_order_id"]), "SalesOrder"
        )
        customer_name = customer_name or so.customer_name

    ship = Shipment(
        tenant_id=tenant_id,
        ref_number=ref,
        sales_order_id=payload.get("sales_order_id"),
        customer_name=customer_name,
        board_count=payload["board_count"],
        carrier=payload.get("carrier"),
        tracking_number=payload.get("tracking_number"),
        status="packing",
        eta_date=payload.get("eta_date"),
        notes=payload.get("notes"),
    )
    db.add(ship)
    log_activity(db, tenant_id, current_user.id, f"Created shipment {ref} for {customer_name}", "delivery", "shipment", ship.id)
    db.commit()
    db.refresh(ship)
    return _ship_dict(ship)


@router.patch("/shipments/{shipment_id}/status")
def update_shipment_status(
    shipment_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ship = TenantQuery(db, Shipment, tenant_id).get_or_404(shipment_id, "Shipment")
    valid = ["packing", "ready", "in_transit", "delivered", "returned"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid shipment status. Must be one of: {valid}")
    old = ship.status
    ship.status = payload["status"]

    if payload["status"] == "in_transit":
        ship.shipped_date = date.today()
    elif payload["status"] == "delivered":
        ship.delivered_date = date.today()
        # Update linked SO status
        if ship.sales_order_id:
            so = TenantQuery(db, SalesOrder, tenant_id).get(ship.sales_order_id)
            if so and so.status in ("ready_to_ship", "shipped"):
                so.status = "delivered"

    log_activity(db, tenant_id, current_user.id, f"Shipment {ship.ref_number} status: {old} -> {ship.status}", "delivery", "shipment", shipment_id)
    db.commit()
    db.refresh(ship)
    return _ship_dict(ship)


@router.patch("/shipments/{shipment_id}/tracking")
def update_tracking(
    shipment_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ship = TenantQuery(db, Shipment, tenant_id).get_or_404(shipment_id, "Shipment")
    if "tracking_number" in payload:
        ship.tracking_number = payload["tracking_number"]
    if "carrier" in payload:
        ship.carrier = payload["carrier"]
    if "eta_date" in payload:
        ship.eta_date = payload["eta_date"]
    log_activity(db, tenant_id, current_user.id, f"Updated tracking for {ship.ref_number}", "delivery", "shipment", shipment_id)
    db.commit()
    db.refresh(ship)
    return _ship_dict(ship)


def _ship_dict(s: Shipment) -> dict:
    return {
        "id": str(s.id),
        "ref_number": s.ref_number,
        "customer_name": s.customer_name,
        "board_count": s.board_count,
        "carrier": s.carrier,
        "tracking_number": s.tracking_number,
        "status": s.status,
        "eta_date": str(s.eta_date) if s.eta_date else None,
        "shipped_date": str(s.shipped_date) if s.shipped_date else None,
        "delivered_date": str(s.delivered_date) if s.delivered_date else None,
        "sales_order_id": str(s.sales_order_id) if s.sales_order_id else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }
