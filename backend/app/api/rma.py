"""RMA API — Return Merchandise Authorization."""

import uuid
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
from app.models.rma import RMA

router = APIRouter(tags=["rma"])


@router.get("/")
def list_rmas(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, RMA, tenant_id)
    if status:
        tq = tq.filter(RMA.status == status)
    if search:
        tq = tq.filter(RMA.customer_name.ilike(f"%{search}%"))
    rmas = tq.all(order_by=RMA.created_at.desc())
    return {"rmas": [_rma_dict(r) for r in rmas]}


@router.post("/", status_code=201)
def create_rma(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "RMA", "rmas")
    rma = RMA(
        tenant_id=tenant_id,
        ref_number=ref,
        sales_order_id=payload.get("sales_order_id"),
        customer_name=payload["customer_name"],
        customer_email=payload.get("customer_email"),
        board_name=payload["board_name"],
        quantity=payload["quantity"],
        reason=payload["reason"],
        description=payload.get("description"),
        status="requested",
    )
    db.add(rma)
    log_activity(db, tenant_id, current_user.id, f"Created RMA {ref} for {rma.customer_name}", "rma", "rma", rma.id)
    db.commit()
    db.refresh(rma)
    return _rma_dict(rma)


@router.get("/{rma_id}")
def get_rma(
    rma_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    rma = TenantQuery(db, RMA, tenant_id).get_or_404(rma_id, "RMA")
    return _rma_dict(rma)


@router.patch("/{rma_id}/status")
def update_rma_status(
    rma_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    rma = TenantQuery(db, RMA, tenant_id).get_or_404(rma_id, "RMA")
    valid = ["requested", "approved", "received", "inspecting", "resolved", "closed", "rejected"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid RMA status. Must be one of: {valid}")
    old = rma.status
    rma.status = payload["status"]
    if "resolution" in payload:
        rma.resolution = payload["resolution"]
    if "description" in payload:
        rma.description = payload["description"]
    log_activity(db, tenant_id, current_user.id, f"RMA {rma.ref_number} status: {old} -> {rma.status}", "rma", "rma", rma_id)
    db.commit()
    db.refresh(rma)
    return _rma_dict(rma)


def _rma_dict(r: RMA) -> dict:
    return {
        "id": str(r.id),
        "ref_number": r.ref_number,
        "customer_name": r.customer_name,
        "customer_email": r.customer_email,
        "board_name": r.board_name,
        "quantity": r.quantity,
        "reason": r.reason,
        "description": r.description,
        "resolution": r.resolution,
        "status": r.status,
        "sales_order_id": str(r.sales_order_id) if r.sales_order_id else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }
