"""CRM schemas — leads, contacts, activities, quotations."""

from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


# ── Lead ─────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    company: str
    contact_person: str
    email: str | None = None
    phone: str | None = None
    product: str | None = None
    value: float | None = None
    probability: int | None = Field(None, ge=0, le=100)
    stage: str = "new_lead"
    source: str | None = None
    notes: str | None = None


class LeadResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    company: str
    contact_person: str
    email: str | None = None
    phone: str | None = None
    product: str | None = None
    value: float | None = None
    probability: int | None = None
    stage: str
    assigned_to: UUID
    source: str | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class LeadStageUpdate(BaseModel):
    stage: str


# ── Contact ──────────────────────────────────────────────────────────

class ContactCreate(BaseModel):
    name: str
    company: str | None = None
    designation: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    notes: str | None = None


class ContactResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    name: str
    company: str | None = None
    designation: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    notes: str | None = None
    last_contacted: datetime | None = None
    created_at: datetime
    updated_at: datetime


# ── CRM Activity ─────────────────────────────────────────────────────

class ActivityCreate(BaseModel):
    contact_id: UUID | None = None
    lead_id: UUID | None = None
    activity_type: str = Field(..., description="call|email|meeting|note|task")
    subject: str
    description: str | None = None
    scheduled_at: datetime | None = None


class ActivityResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    contact_id: UUID | None = None
    lead_id: UUID | None = None
    activity_type: str
    subject: str
    description: str | None = None
    scheduled_at: datetime | None = None
    completed_at: datetime | None = None
    assigned_to: UUID
    created_at: datetime


# ── Quotation ────────────────────────────────────────────────────────

class QuotationCreate(BaseModel):
    lead_id: UUID | None = None
    customer_name: str
    board_name: str
    quantity: int
    bare_pcb_cost: float = 0
    component_cost: float = 0
    smt_cost: float = 0
    tht_cost: float = 0
    testing_cost: float = 0
    stencil_cost: float = 0
    gst_rate: float = 18.0
    validity_days: int = 30
    terms: str | None = None


class QuotationResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    lead_id: UUID | None = None
    customer_name: str
    board_name: str
    quantity: int
    bare_pcb_cost: float
    component_cost: float
    smt_cost: float
    tht_cost: float
    testing_cost: float
    stencil_cost: float
    subtotal: float
    gst_rate: float
    gst_amount: float
    total: float
    validity_days: int
    status: str
    revision: str
    version: int
    terms: str | None = None
    created_at: datetime
    updated_at: datetime
