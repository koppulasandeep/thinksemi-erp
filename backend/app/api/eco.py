"""ECO API — Engineering Change Orders."""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.exceptions import BadRequestError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.eco import ECO

router = APIRouter(tags=["eco"])


@router.get("/")
def list_ecos(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, ECO, tenant_id)
    if status:
        tq = tq.filter(ECO.status == status)
    if search:
        tq = tq.filter(ECO.title.ilike(f"%{search}%"))
    ecos = tq.all(order_by=ECO.created_at.desc())
    return {"ecos": [_eco_dict(e) for e in ecos]}


@router.post("/", status_code=201)
def create_eco(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "ECO", "ecos")
    eco = ECO(
        tenant_id=tenant_id,
        ref_number=ref,
        title=payload["title"],
        board_name=payload["board_name"],
        description=payload["description"],
        reason=payload["reason"],
        impact=payload.get("impact", "medium"),
        status="draft",
        requested_by=current_user.id,
    )
    db.add(eco)
    log_activity(db, tenant_id, current_user.id, f"Created ECO {ref}: {eco.title}", "eco", "eco", eco.id)
    db.commit()
    db.refresh(eco)
    return _eco_dict(eco)


@router.get("/{eco_id}")
def get_eco(
    eco_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    eco = TenantQuery(db, ECO, tenant_id).get_or_404(eco_id, "ECO")
    return _eco_dict(eco)


@router.patch("/{eco_id}")
def update_eco(
    eco_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    eco = TenantQuery(db, ECO, tenant_id).get_or_404(eco_id, "ECO")
    if eco.status not in ("draft", "pending_review"):
        raise BadRequestError("Can only edit ECOs in draft or pending_review status")
    updatable = ["title", "board_name", "description", "reason", "impact"]
    for key in updatable:
        if key in payload:
            setattr(eco, key, payload[key])
    log_activity(db, tenant_id, current_user.id, f"Updated ECO {eco.ref_number}", "eco", "eco", eco_id)
    db.commit()
    db.refresh(eco)
    return _eco_dict(eco)


@router.patch("/{eco_id}/approve")
def approve_eco(
    eco_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "engineering_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    eco = TenantQuery(db, ECO, tenant_id).get_or_404(eco_id, "ECO")
    if eco.status != "pending_review":
        raise BadRequestError(f"ECO must be in pending_review status, currently '{eco.status}'")
    eco.status = "approved"
    eco.approved_by = current_user.id
    eco.approved_at = datetime.utcnow()
    log_activity(db, tenant_id, current_user.id, f"Approved ECO {eco.ref_number}", "eco", "eco", eco_id)
    db.commit()
    db.refresh(eco)
    return _eco_dict(eco)


@router.patch("/{eco_id}/reject")
def reject_eco(
    eco_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "engineering_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    eco = TenantQuery(db, ECO, tenant_id).get_or_404(eco_id, "ECO")
    if eco.status != "pending_review":
        raise BadRequestError(f"ECO must be in pending_review status, currently '{eco.status}'")
    eco.status = "rejected"
    eco.approved_by = current_user.id
    eco.approved_at = datetime.utcnow()
    log_activity(db, tenant_id, current_user.id, f"Rejected ECO {eco.ref_number}", "eco", "eco", eco_id)
    db.commit()
    db.refresh(eco)
    return _eco_dict(eco)


def _eco_dict(e: ECO) -> dict:
    return {
        "id": str(e.id),
        "ref_number": e.ref_number,
        "title": e.title,
        "board_name": e.board_name,
        "description": e.description,
        "reason": e.reason,
        "impact": e.impact,
        "status": e.status,
        "requested_by": str(e.requested_by) if e.requested_by else None,
        "approved_by": str(e.approved_by) if e.approved_by else None,
        "approved_at": e.approved_at.isoformat() if e.approved_at else None,
        "implemented_at": e.implemented_at.isoformat() if e.implemented_at else None,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    }
