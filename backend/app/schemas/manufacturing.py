"""Manufacturing schemas — work orders, route steps, production lines."""

from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


# ── Work Order ───────────────────────────────────────────────────────

class WorkOrderCreate(BaseModel):
    sales_order_id: UUID | None = None
    board_name: str
    quantity: int
    priority: str = "medium"
    planned_start: date | None = None
    planned_end: date | None = None
    notes: str | None = None


class WorkOrderResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    sales_order_id: UUID | None = None
    board_name: str
    quantity: int
    completed_quantity: int
    rejected_quantity: int
    priority: str
    status: str
    planned_start: date | None = None
    planned_end: date | None = None
    actual_start: datetime | None = None
    actual_end: datetime | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


# ── Route Step ───────────────────────────────────────────────────────

class RouteStepResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    work_order_id: UUID
    step_number: int
    name: str
    description: str | None = None
    station: str | None = None
    status: str
    started_at: datetime | None = None
    completed_at: datetime | None = None


# ── Production Line ──────────────────────────────────────────────────

class ProductionLineResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    name: str
    line_type: str
    status: str
    current_work_order_id: UUID | None = None
    efficiency: float | None = None
    notes: str | None = None
