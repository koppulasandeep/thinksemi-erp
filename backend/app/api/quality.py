"""Quality API — NCR, CAPA, and aggregated quality metrics."""

import uuid
from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError
from app.core.sequence import next_ref
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.quality import NCR, CAPA
from app.models.manufacturing import WorkOrder

router = APIRouter(tags=["quality"])


@router.get("/metrics")
def get_quality_metrics(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Aggregated quality KPIs."""
    month_start = date.today().replace(day=1)

    open_ncrs = TenantQuery(db, NCR, tenant_id).filter(
        NCR.status.in_(["open", "investigating"])
    ).count()

    total_ncrs_month = TenantQuery(db, NCR, tenant_id).filter(
        NCR.created_at >= datetime.combine(month_start, datetime.min.time())
    ).count()

    critical_ncrs = TenantQuery(db, NCR, tenant_id).filter(
        NCR.severity == "critical", NCR.status.in_(["open", "investigating"])
    ).count()

    total_affected = (
        db.query(func.coalesce(func.sum(NCR.quantity_affected), 0))
        .filter(
            NCR.tenant_id == tenant_id,
            NCR.created_at >= datetime.combine(month_start, datetime.min.time()),
        )
        .scalar()
    )

    # Completed work orders this month for FPY
    completed_wo = TenantQuery(db, WorkOrder, tenant_id).filter(
        WorkOrder.status == "completed",
        WorkOrder.completed_at >= datetime.combine(month_start, datetime.min.time()),
    ).all()
    total_produced = sum(wo.quantity for wo in completed_wo) if completed_wo else 0
    fpy = round(((total_produced - int(total_affected)) / max(total_produced, 1)) * 100, 1)
    dpmo = round((int(total_affected) / max(total_produced, 1)) * 1_000_000, 0)

    # Defect breakdown by type
    defect_breakdown = (
        db.query(NCR.defect_type, func.count(NCR.id))
        .filter(
            NCR.tenant_id == tenant_id,
            NCR.created_at >= datetime.combine(month_start, datetime.min.time()),
        )
        .group_by(NCR.defect_type)
        .all()
    )

    open_capas = TenantQuery(db, CAPA, tenant_id).filter(
        CAPA.status.in_(["open", "in_progress"])
    ).count()

    return {
        "open_ncrs": open_ncrs,
        "total_ncrs_this_month": total_ncrs_month,
        "critical_ncrs": critical_ncrs,
        "total_units_affected": int(total_affected),
        "total_produced": total_produced,
        "fpy": fpy,
        "dpmo": int(dpmo),
        "defect_breakdown": {dt: count for dt, count in defect_breakdown},
        "open_capas": open_capas,
    }


# ─── NCR ──────────────────────────────────────────────────────────────────

@router.get("/ncr")
def list_ncrs(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    severity: str | None = Query(None),
):
    tq = TenantQuery(db, NCR, tenant_id)
    if status:
        tq = tq.filter(NCR.status == status)
    if severity:
        tq = tq.filter(NCR.severity == severity)
    ncrs = tq.all(order_by=NCR.created_at.desc())
    return {"ncrs": [_ncr_dict(n) for n in ncrs]}


@router.post("/ncr", status_code=201)
def create_ncr(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "NCR", "ncrs")
    ncr = NCR(
        tenant_id=tenant_id,
        ref_number=ref,
        title=payload["title"],
        description=payload["description"],
        board_name=payload.get("board_name"),
        work_order_id=payload.get("work_order_id"),
        defect_type=payload["defect_type"],
        severity=payload.get("severity", "minor"),
        quantity_affected=payload.get("quantity_affected", 1),
        root_cause=payload.get("root_cause"),
        containment_action=payload.get("containment_action"),
        reported_by=current_user.id,
        assigned_to=payload.get("assigned_to"),
    )
    db.add(ncr)
    log_activity(db, tenant_id, current_user.id, f"Created NCR {ref}: {ncr.title}", "quality", "ncr", ncr.id)
    db.commit()
    db.refresh(ncr)
    return _ncr_dict(ncr)


@router.get("/ncr/{ncr_id}")
def get_ncr(
    ncr_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    ncr = TenantQuery(db, NCR, tenant_id).get_or_404(ncr_id, "NCR")
    return _ncr_dict(ncr)


@router.patch("/ncr/{ncr_id}/status")
def update_ncr_status(
    ncr_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ncr = TenantQuery(db, NCR, tenant_id).get_or_404(ncr_id, "NCR")
    valid = ["open", "investigating", "contained", "closed"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid NCR status. Must be one of: {valid}")
    old = ncr.status
    ncr.status = payload["status"]
    if "root_cause" in payload:
        ncr.root_cause = payload["root_cause"]
    if "containment_action" in payload:
        ncr.containment_action = payload["containment_action"]
    log_activity(db, tenant_id, current_user.id, f"NCR {ncr.ref_number} status: {old} -> {ncr.status}", "quality", "ncr", ncr_id)
    db.commit()
    db.refresh(ncr)
    return _ncr_dict(ncr)


def _ncr_dict(n: NCR) -> dict:
    return {
        "id": str(n.id), "ref_number": n.ref_number, "title": n.title,
        "description": n.description, "board_name": n.board_name,
        "work_order_id": str(n.work_order_id) if n.work_order_id else None,
        "defect_type": n.defect_type, "severity": n.severity,
        "quantity_affected": n.quantity_affected, "root_cause": n.root_cause,
        "containment_action": n.containment_action, "status": n.status,
        "reported_by": str(n.reported_by) if n.reported_by else None,
        "assigned_to": str(n.assigned_to) if n.assigned_to else None,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


# ─── CAPA ─────────────────────────────────────────────────────────────────

@router.get("/capa")
def list_capas(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, CAPA, tenant_id)
    if status:
        tq = tq.filter(CAPA.status == status)
    capas = tq.all(order_by=CAPA.created_at.desc())
    return {
        "capas": [
            {
                "id": str(c.id), "ref_number": c.ref_number, "title": c.title,
                "capa_type": c.capa_type, "status": c.status,
                "ncr_id": str(c.ncr_id) if c.ncr_id else None,
                "assigned_to": str(c.assigned_to) if c.assigned_to else None,
                "due_date": c.due_date.isoformat() if c.due_date else None,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in capas
        ]
    }


@router.post("/capa", status_code=201)
def create_capa(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "CAPA", "capas")
    capa = CAPA(
        tenant_id=tenant_id,
        ref_number=ref,
        ncr_id=payload.get("ncr_id"),
        title=payload["title"],
        capa_type=payload["capa_type"],
        description=payload["description"],
        root_cause_analysis=payload.get("root_cause_analysis"),
        action_plan=payload.get("action_plan"),
        verification_method=payload.get("verification_method"),
        assigned_to=payload.get("assigned_to"),
        due_date=payload.get("due_date"),
    )
    db.add(capa)
    log_activity(db, tenant_id, current_user.id, f"Created CAPA {ref}: {capa.title}", "quality", "capa", capa.id)
    db.commit()
    db.refresh(capa)
    return {"id": str(capa.id), "ref_number": capa.ref_number, "title": capa.title, "status": capa.status}


@router.patch("/capa/{capa_id}/status")
def update_capa_status(
    capa_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    capa = TenantQuery(db, CAPA, tenant_id).get_or_404(capa_id, "CAPA")
    valid = ["open", "in_progress", "verification", "closed", "cancelled"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid CAPA status. Must be one of: {valid}")
    old = capa.status
    capa.status = payload["status"]
    if "action_plan" in payload:
        capa.action_plan = payload["action_plan"]
    if "root_cause_analysis" in payload:
        capa.root_cause_analysis = payload["root_cause_analysis"]
    log_activity(db, tenant_id, current_user.id, f"CAPA {capa.ref_number} status: {old} -> {capa.status}", "quality", "capa", capa_id)
    db.commit()
    db.refresh(capa)
    return {"id": str(capa.id), "ref_number": capa.ref_number, "status": capa.status}
