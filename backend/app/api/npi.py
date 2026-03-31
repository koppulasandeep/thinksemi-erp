"""NPI API — New Product Introduction projects."""

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
from app.models.npi import NPIProject

router = APIRouter(tags=["npi"])


@router.get("/projects")
def list_projects(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    stage: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, NPIProject, tenant_id)
    if stage:
        tq = tq.filter(NPIProject.stage == stage)
    if search:
        tq = tq.filter(NPIProject.name.ilike(f"%{search}%"))
    projects = tq.all(order_by=NPIProject.created_at.desc())
    return {"projects": [_proj_dict(p) for p in projects]}


@router.post("/projects", status_code=201)
def create_project(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "NPI", "npi_projects")
    project = NPIProject(
        tenant_id=tenant_id,
        ref_number=ref,
        name=payload["name"],
        customer_name=payload["customer_name"],
        board_name=payload["board_name"],
        description=payload.get("description"),
        stage=payload.get("stage", "feasibility"),
        estimated_volume=payload.get("estimated_volume"),
        target_date=payload.get("target_date"),
        assigned_to=payload.get("assigned_to"),
        estimated_cost=payload.get("estimated_cost"),
        notes=payload.get("notes"),
    )
    db.add(project)
    log_activity(db, tenant_id, current_user.id, f"Created NPI project {ref}: {project.name}", "npi", "npi_project", project.id)
    db.commit()
    db.refresh(project)
    return _proj_dict(project)


@router.get("/projects/{project_id}")
def get_project(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    project = TenantQuery(db, NPIProject, tenant_id).get_or_404(project_id, "NPIProject")
    return _proj_dict(project)


@router.patch("/projects/{project_id}")
def update_project(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    project = TenantQuery(db, NPIProject, tenant_id).get_or_404(project_id, "NPIProject")
    updatable = ["name", "customer_name", "board_name", "description", "estimated_volume", "target_date", "assigned_to", "estimated_cost", "notes"]
    for key in updatable:
        if key in payload:
            setattr(project, key, payload[key])
    log_activity(db, tenant_id, current_user.id, f"Updated NPI project {project.ref_number}", "npi", "npi_project", project_id)
    db.commit()
    db.refresh(project)
    return _proj_dict(project)


@router.patch("/projects/{project_id}/stage")
def update_project_stage(
    project_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    project = TenantQuery(db, NPIProject, tenant_id).get_or_404(project_id, "NPIProject")
    valid_stages = ["feasibility", "design_review", "prototype", "pilot", "production_ready", "completed", "cancelled"]
    new_stage = payload["stage"]
    if new_stage not in valid_stages:
        raise BadRequestError(f"Invalid stage '{new_stage}'. Must be one of: {valid_stages}")
    old_stage = project.stage
    project.stage = new_stage
    log_activity(db, tenant_id, current_user.id, f"NPI {project.ref_number} stage: {old_stage} -> {new_stage}", "npi", "npi_project", project_id)
    db.commit()
    db.refresh(project)
    return _proj_dict(project)


def _proj_dict(p: NPIProject) -> dict:
    return {
        "id": str(p.id),
        "ref_number": p.ref_number,
        "name": p.name,
        "customer_name": p.customer_name,
        "board_name": p.board_name,
        "description": p.description,
        "stage": p.stage,
        "estimated_volume": p.estimated_volume,
        "target_date": str(p.target_date) if p.target_date else None,
        "assigned_to": str(p.assigned_to) if p.assigned_to else None,
        "estimated_cost": float(p.estimated_cost) if p.estimated_cost else None,
        "notes": p.notes,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }
