"""Supply-chain schemas — sales orders, BOM, purchase orders, suppliers."""

from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import UUID


# ── Sales Order ──────────────────────────────────────────────────────

class SOLineItemCreate(BaseModel):
    description: str
    quantity: int
    unit_price: float


class SOLineItemResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    sales_order_id: UUID
    description: str
    quantity: int
    unit_price: float
    total: float


class SOPaymentMilestoneCreate(BaseModel):
    label: str
    percentage: int
    amount: float
    due_date: date | None = None


class SOPaymentMilestoneResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    sales_order_id: UUID
    label: str
    percentage: int
    amount: float
    due_date: date | None = None
    status: str
    paid_date: date | None = None
    sort_order: int


class SalesOrderCreate(BaseModel):
    customer_name: str
    customer_id: UUID | None = None
    board_name: str
    quantity: int
    unit_price: float
    due_date: date
    priority: str = "medium"
    notes: str | None = None
    line_items: list[SOLineItemCreate] = []
    payment_milestones: list[SOPaymentMilestoneCreate] = []


class SalesOrderResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    customer_name: str
    customer_id: UUID | None = None
    board_name: str
    quantity: int
    unit_price: float
    total_value: float
    due_date: date
    priority: str
    status: str
    payment_status: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    line_items: list[SOLineItemResponse] = []
    payment_milestones: list[SOPaymentMilestoneResponse] = []


# ── BOM ──────────────────────────────────────────────────────────────

class BOMItemResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    board_name: str
    revision: str
    ref_designator: str
    part_number: str
    value: str
    package: str
    manufacturer: str
    category: str
    qty_per_board: int
    unit_price: float
    msl_level: int
    alternate_count: int
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


# ── Purchase Order ───────────────────────────────────────────────────

class POLineItemCreate(BaseModel):
    part_number: str
    description: str
    quantity: int
    unit_price: float


class POLineItemResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    purchase_order_id: UUID
    part_number: str
    description: str
    quantity: int
    unit_price: float
    received_quantity: int
    qc_status: str | None = None
    location_assigned: str | None = None
    received_date: date | None = None


class PurchaseOrderCreate(BaseModel):
    supplier_id: UUID
    supplier_name: str
    order_date: date
    eta_date: date
    lead_time_days: int | None = None
    notes: str | None = None
    line_items: list[POLineItemCreate] = []


class PurchaseOrderResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    ref_number: str
    supplier_id: UUID
    supplier_name: str
    total_items: int
    total_amount: float
    order_date: date
    eta_date: date
    status: str
    lead_time_days: int | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime
    line_items: list[POLineItemResponse] = []


# ── Supplier ─────────────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    name: str
    location: str
    category: str = Field(..., description="components|pcb|packaging")
    contact_person: str
    email: str
    phone: str
    payment_terms: str = "net_30"
    certifications: str | None = None


class SupplierResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    tenant_id: UUID
    name: str
    location: str
    category: str
    contact_person: str
    email: str
    phone: str
    payment_terms: str
    rating: float | None = None
    certifications: str | None = None
    on_time_delivery: float | None = None
    quality_score: float | None = None
    price_competitiveness: float | None = None
    responsiveness: float | None = None
    total_business: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
