"""Quality schemas — NCRs, CAPAs, defect records."""

from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


# ── NCR (Non-Conformance Report) ─────────────────────────────────────

class NCRCreate(BaseModel):
    work_order_id: UUID | None = None
    board_name: str | None = None
    defect_type: str
    severity: str = Field(..., description="critical|major|minor")
    quantity_affected: int = 1
    description: str
    detected_at_stage: str | None = None
    root_cause: str | None = None
    corrective_action: str | None = None


class NCRResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    work_order_id: UUID | None = None
    board_name: str | None = None
    defect_type: str
    severity: str
    quantity_affected: int
    description: str
    detected_at_stage: str | None = None
    root_cause: str | None = None
    corrective_action: str | None = None
    status: str
    reported_by: UUID | None = None
    closed_by: UUID | None = None
    closed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


# ── CAPA (Corrective and Preventive Action) ──────────────────────────

class CAPACreate(BaseModel):
    ncr_id: UUID | None = None
    capa_type: str = Field(..., description="corrective|preventive")
    title: str
    description: str
    root_cause: str | None = None
    action_plan: str | None = None
    due_date: date | None = None
    assigned_to: UUID | None = None


class CAPAResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    ncr_id: UUID | None = None
    capa_type: str
    title: str
    description: str
    root_cause: str | None = None
    action_plan: str | None = None
    due_date: date | None = None
    assigned_to: UUID | None = None
    status: str
    verified_by: UUID | None = None
    verified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


# ── Defect Record ────────────────────────────────────────────────────

class DefectRecordCreate(BaseModel):
    work_order_id: UUID | None = None
    board_name: str | None = None
    ref_designator: str | None = None
    defect_type: str
    stage: str | None = None
    description: str | None = None
    quantity: int = 1
