"""Manufacturing API — production lines, work orders, and route steps."""

import uuid
from datetime import datetime
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
from app.models.manufacturing import ProductionLine, WorkOrder, RouteStep

router = APIRouter(tags=["manufacturing"])

# ─── Production Lines ─────────────────────────────────────────────────────

@router.get("/lines")
def list_lines(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    lines = TenantQuery(db, ProductionLine, tenant_id).all(order_by=ProductionLine.name)
    return {
        "lines": [
            {
                "id": str(l.id), "name": l.name, "line_type": l.line_type,
                "status": l.status, "oee": float(l.oee), "oee_target": float(l.oee_target),
                "current_wo_id": str(l.current_wo_id) if l.current_wo_id else None,
            }
            for l in lines
        ]
    }


@router.patch("/lines/{line_id}/status")
def update_line_status(
    line_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    line = TenantQuery(db, ProductionLine, tenant_id).get_or_404(line_id, "ProductionLine")
    valid = ["running", "idle", "changeover", "maintenance", "down"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid line status. Must be one of: {valid}")
    old = line.status
    line.status = payload["status"]
    if "oee" in payload:
        line.oee = payload["oee"]
    log_activity(db, tenant_id, current_user.id, f"Line {line.name} status: {old} -> {line.status}", "manufacturing", "production_line", line_id)
    db.commit()
    db.refresh(line)
    return {"id": str(line.id), "name": line.name, "status": line.status, "oee": float(line.oee)}


# ─── Work Orders ──────────────────────────────────────────────────────────

@router.get("/work-orders")
def list_work_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
    line_id: uuid.UUID | None = Query(None),
):
    tq = TenantQuery(db, WorkOrder, tenant_id)
    if status:
        tq = tq.filter(WorkOrder.status == status)
    if line_id:
        tq = tq.filter(WorkOrder.line_id == line_id)
    wos = tq.all(order_by=WorkOrder.created_at.desc())
    return {"work_orders": [_wo_dict(wo) for wo in wos]}


@router.post("/work-orders", status_code=201)
def create_work_order(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "WO", "work_orders")
    wo = WorkOrder(
        tenant_id=tenant_id,
        ref_number=ref,
        sales_order_id=payload.get("sales_order_id"),
        board_name=payload["board_name"],
        customer_name=payload["customer_name"],
        quantity=payload["quantity"],
        line_id=payload.get("line_id"),
        status="scheduled",
    )
    db.add(wo)
    db.flush()

    # Create default route steps for PCB assembly
    default_steps = [
        "Solder Paste Printing",
        "SPI Inspection",
        "SMT Placement",
        "Reflow Soldering",
        "AOI Inspection",
        "THT Insertion",
        "Wave Soldering",
        "Manual Inspection",
        "ICT Testing",
        "Functional Testing",
        "Conformal Coating",
        "Final QC",
        "Packaging",
    ]
    steps = payload.get("route_steps", default_steps)
    for idx, step_name in enumerate(steps):
        rs = RouteStep(
            tenant_id=tenant_id,
            work_order_id=wo.id,
            step_name=step_name if isinstance(step_name, str) else step_name.get("name", f"Step {idx+1}"),
            sequence_order=idx + 1,
            total_units=wo.quantity,
            status="pending",
        )
        db.add(rs)

    log_activity(db, tenant_id, current_user.id, f"Created work order {ref}: {wo.board_name} x{wo.quantity}", "manufacturing", "work_order", wo.id)
    db.commit()
    db.refresh(wo)
    return _wo_dict(wo)


@router.get("/work-orders/{wo_id}")
def get_work_order(
    wo_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    wo = TenantQuery(db, WorkOrder, tenant_id).get_or_404(wo_id, "WorkOrder")
    result = _wo_dict(wo)
    steps = TenantQuery(db, RouteStep, tenant_id).filter(
        RouteStep.work_order_id == wo_id
    ).all(order_by=RouteStep.sequence_order)
    result["route_steps"] = [_step_dict(s) for s in steps]
    return result


@router.patch("/work-orders/{wo_id}/status")
def update_wo_status(
    wo_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    wo = TenantQuery(db, WorkOrder, tenant_id).get_or_404(wo_id, "WorkOrder")
    valid = ["scheduled", "active", "on_hold", "completed", "cancelled"]
    new_status = payload["status"]
    if new_status not in valid:
        raise BadRequestError(f"Invalid WO status. Must be one of: {valid}")
    old = wo.status
    wo.status = new_status

    if new_status == "active" and not wo.started_at:
        wo.started_at = datetime.utcnow()
        # Assign line if provided
        if wo.line_id:
            line = TenantQuery(db, ProductionLine, tenant_id).get(wo.line_id)
            if line:
                line.current_wo_id = wo.id
                line.status = "running"

    if new_status == "completed":
        wo.completed_at = datetime.utcnow()
        wo.progress = 100
        if wo.line_id:
            line = TenantQuery(db, ProductionLine, tenant_id).get(wo.line_id)
            if line and line.current_wo_id == wo.id:
                line.current_wo_id = None
                line.status = "idle"

    log_activity(db, tenant_id, current_user.id, f"WO {wo.ref_number} status: {old} -> {new_status}", "manufacturing", "work_order", wo_id)
    db.commit()
    db.refresh(wo)
    return _wo_dict(wo)


# ─── Route Steps ──────────────────────────────────────────────────────────

@router.get("/work-orders/{wo_id}/route-steps")
def list_route_steps(
    wo_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    TenantQuery(db, WorkOrder, tenant_id).get_or_404(wo_id, "WorkOrder")
    steps = TenantQuery(db, RouteStep, tenant_id).filter(
        RouteStep.work_order_id == wo_id
    ).all(order_by=RouteStep.sequence_order)
    return {"route_steps": [_step_dict(s) for s in steps]}


@router.patch("/work-orders/{wo_id}/route-steps/{step_id}")
def update_route_step(
    wo_id: uuid.UUID,
    step_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    wo = TenantQuery(db, WorkOrder, tenant_id).get_or_404(wo_id, "WorkOrder")
    step = TenantQuery(db, RouteStep, tenant_id).get_or_404(step_id, "RouteStep")

    if "completed_units" in payload:
        step.completed_units = payload["completed_units"]
    if "status" in payload:
        valid = ["pending", "active", "done"]
        if payload["status"] not in valid:
            raise BadRequestError(f"Invalid step status. Must be one of: {valid}")
        step.status = payload["status"]
        if payload["status"] == "active" and not step.started_at:
            step.started_at = datetime.utcnow()
        if payload["status"] == "done":
            step.completed_at = datetime.utcnow()
            step.completed_units = step.total_units
    if "machine_id" in payload:
        step.machine_id = payload["machine_id"]
    if "operator_name" in payload:
        step.operator_name = payload["operator_name"]

    # Recalculate WO progress
    all_steps = TenantQuery(db, RouteStep, tenant_id).filter(
        RouteStep.work_order_id == wo_id
    ).all()
    if all_steps:
        total_units_all = sum(s.total_units for s in all_steps)
        completed_units_all = sum(s.completed_units for s in all_steps)
        wo.progress = round((completed_units_all / total_units_all) * 100) if total_units_all else 0

    log_activity(db, tenant_id, current_user.id, f"Updated route step {step.step_name} on WO {wo.ref_number}", "manufacturing", "route_step", step_id)
    db.commit()
    db.refresh(step)
    return _step_dict(step)


def _wo_dict(wo: WorkOrder) -> dict:
    return {
        "id": str(wo.id),
        "ref_number": wo.ref_number,
        "board_name": wo.board_name,
        "customer_name": wo.customer_name,
        "quantity": wo.quantity,
        "line_id": str(wo.line_id) if wo.line_id else None,
        "progress": wo.progress,
        "oee": float(wo.oee),
        "status": wo.status,
        "started_at": wo.started_at.isoformat() if wo.started_at else None,
        "completed_at": wo.completed_at.isoformat() if wo.completed_at else None,
        "created_at": wo.created_at.isoformat() if wo.created_at else None,
    }


def _step_dict(s: RouteStep) -> dict:
    return {
        "id": str(s.id),
        "step_name": s.step_name,
        "sequence_order": s.sequence_order,
        "completed_units": s.completed_units,
        "total_units": s.total_units,
        "status": s.status,
        "machine_id": s.machine_id,
        "operator_name": s.operator_name,
        "started_at": s.started_at.isoformat() if s.started_at else None,
        "completed_at": s.completed_at.isoformat() if s.completed_at else None,
    }
