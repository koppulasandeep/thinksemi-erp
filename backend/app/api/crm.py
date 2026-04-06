"""CRM API — leads, contacts, activities, and quotations."""

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
from app.models.crm import CRMLead, CRMContact, CRMActivity, Quotation

router = APIRouter(tags=["crm"])

# ─── Leads ────────────────────────────────────────────────────────────────

@router.get("/leads")
def list_leads(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    stage: str | None = Query(None),
    search: str | None = Query(None),
):
    tq = TenantQuery(db, CRMLead, tenant_id)
    if stage:
        tq = tq.filter(CRMLead.stage == stage)
    if search:
        tq = tq.filter(CRMLead.company.ilike(f"%{search}%"))
    leads = tq.all(order_by=CRMLead.created_at.desc())
    return {"leads": [_lead_dict(l) for l in leads]}


@router.post("/leads", status_code=201)
def create_lead(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "LD", "crm_leads")
    lead = CRMLead(
        tenant_id=tenant_id,
        ref_number=ref,
        company=payload["company"],
        contact_person=payload["contact_person"],
        email=payload.get("email"),
        phone=payload.get("phone"),
        product=payload.get("product"),
        value=payload.get("value"),
        probability=payload.get("probability"),
        stage=payload.get("stage", "new_lead"),
        assigned_to=payload.get("assigned_to", current_user.id),
        source=payload.get("source"),
        notes=payload.get("notes"),
    )
    db.add(lead)
    log_activity(db, tenant_id, current_user.id, f"Created lead {ref}: {lead.company}", "crm", "lead", lead.id)
    db.commit()
    db.refresh(lead)
    return _lead_dict(lead)


@router.get("/leads/{lead_id}")
def get_lead(
    lead_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    lead = TenantQuery(db, CRMLead, tenant_id).get_or_404(lead_id, "Lead")
    return _lead_dict(lead)


@router.patch("/leads/{lead_id}")
def update_lead(
    lead_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    lead = TenantQuery(db, CRMLead, tenant_id).get_or_404(lead_id, "Lead")
    updatable = ["company", "contact_person", "email", "phone", "product", "value", "probability", "source", "notes", "assigned_to"]
    for key in updatable:
        if key in payload:
            setattr(lead, key, payload[key])
    log_activity(db, tenant_id, current_user.id, f"Updated lead {lead.ref_number}", "crm", "lead", lead_id)
    db.commit()
    db.refresh(lead)
    return _lead_dict(lead)


@router.patch("/leads/{lead_id}/stage")
def update_lead_stage(
    lead_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    lead = TenantQuery(db, CRMLead, tenant_id).get_or_404(lead_id, "Lead")
    valid_stages = ["new_lead", "qualified", "quoted", "negotiation", "won", "lost"]
    new_stage = payload["stage"]
    if new_stage not in valid_stages:
        raise BadRequestError(f"Invalid stage '{new_stage}'. Must be one of: {valid_stages}")
    old_stage = lead.stage
    lead.stage = new_stage
    log_activity(db, tenant_id, current_user.id, f"Lead {lead.ref_number} stage: {old_stage} -> {new_stage}", "crm", "lead", lead_id)
    db.commit()
    db.refresh(lead)
    return _lead_dict(lead)


def _lead_dict(l: CRMLead) -> dict:
    return {
        "id": str(l.id),
        "ref_number": l.ref_number,
        "company": l.company,
        "contact_person": l.contact_person,
        "email": l.email,
        "phone": l.phone,
        "product": l.product,
        "value": float(l.value) if l.value else None,
        "probability": l.probability,
        "stage": l.stage,
        "assigned_to": str(l.assigned_to) if l.assigned_to else None,
        "source": l.source,
        "notes": l.notes,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }


# ─── Contacts ─────────────────────────────────────────────────────────────

@router.get("/contacts")
def list_contacts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    search: str | None = Query(None),
):
    tq = TenantQuery(db, CRMContact, tenant_id)
    if search:
        tq = tq.filter(CRMContact.name.ilike(f"%{search}%"))
    contacts = tq.all(order_by=CRMContact.name)
    return {
        "contacts": [
            {
                "id": str(c.id), "name": c.name, "company": c.company,
                "designation": c.designation, "email": c.email, "phone": c.phone,
            }
            for c in contacts
        ]
    }


@router.post("/contacts", status_code=201)
def create_contact(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    contact = CRMContact(
        tenant_id=tenant_id,
        name=payload["name"],
        company=payload.get("company"),
        designation=payload.get("designation"),
        email=payload.get("email"),
        phone=payload.get("phone"),
        address=payload.get("address"),
        notes=payload.get("notes"),
    )
    db.add(contact)
    log_activity(db, tenant_id, current_user.id, f"Created contact: {contact.name}", "crm", "contact", contact.id)
    db.commit()
    db.refresh(contact)
    return {"id": str(contact.id), "name": contact.name}


@router.get("/contacts/{contact_id}")
def get_contact(
    contact_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    c = TenantQuery(db, CRMContact, tenant_id).get_or_404(contact_id, "Contact")
    return {
        "id": str(c.id), "name": c.name, "company": c.company,
        "designation": c.designation, "email": c.email, "phone": c.phone,
        "address": c.address, "notes": c.notes,
        "last_contacted": c.last_contacted.isoformat() if c.last_contacted else None,
    }


# ─── Activities ───────────────────────────────────────────────────────────

@router.get("/activities")
def list_crm_activities(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    lead_id: uuid.UUID | None = Query(None),
    contact_id: uuid.UUID | None = Query(None),
):
    tq = TenantQuery(db, CRMActivity, tenant_id)
    if lead_id:
        tq = tq.filter(CRMActivity.lead_id == lead_id)
    if contact_id:
        tq = tq.filter(CRMActivity.contact_id == contact_id)
    acts = tq.all(order_by=CRMActivity.created_at.desc())
    return {
        "activities": [
            {
                "id": str(a.id),
                "activity_type": a.activity_type,
                "subject": a.subject,
                "description": a.description,
                "lead_id": str(a.lead_id) if a.lead_id else None,
                "contact_id": str(a.contact_id) if a.contact_id else None,
                "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
                "completed_at": a.completed_at.isoformat() if a.completed_at else None,
            }
            for a in acts
        ]
    }


@router.post("/activities", status_code=201)
def create_crm_activity(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    act = CRMActivity(
        tenant_id=tenant_id,
        contact_id=payload.get("contact_id"),
        lead_id=payload.get("lead_id"),
        activity_type=payload["activity_type"],
        subject=payload["subject"],
        description=payload.get("description"),
        scheduled_at=payload.get("scheduled_at"),
        assigned_to=payload.get("assigned_to", current_user.id),
    )
    db.add(act)
    log_activity(db, tenant_id, current_user.id, f"CRM activity: {act.subject}", "crm", "crm_activity", act.id)
    db.commit()
    db.refresh(act)
    return {"id": str(act.id), "subject": act.subject}


# ─── Quotations ───────────────────────────────────────────────────────────

@router.get("/quotations")
def list_quotations(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    status: str | None = Query(None),
):
    tq = TenantQuery(db, Quotation, tenant_id)
    if status:
        tq = tq.filter(Quotation.status == status)
    quotes = tq.all(order_by=Quotation.created_at.desc())
    return {"quotations": [_quote_dict(q) for q in quotes]}


@router.post("/quotations", status_code=201)
def create_quotation(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    ref = next_ref(db, tenant_id, "QT", "quotations")
    subtotal = sum([
        payload.get("bare_pcb_cost", 0),
        payload.get("component_cost", 0),
        payload.get("smt_cost", 0),
        payload.get("tht_cost", 0),
        payload.get("testing_cost", 0),
        payload.get("stencil_cost", 0),
    ])
    gst_rate = payload.get("gst_rate", 18.0)
    gst_amount = round(subtotal * gst_rate / 100, 2)
    total = round(subtotal + gst_amount, 2)

    q = Quotation(
        tenant_id=tenant_id,
        ref_number=ref,
        lead_id=payload.get("lead_id"),
        customer_name=payload["customer_name"],
        board_name=payload["board_name"],
        quantity=payload["quantity"],
        bare_pcb_cost=payload.get("bare_pcb_cost", 0),
        component_cost=payload.get("component_cost", 0),
        smt_cost=payload.get("smt_cost", 0),
        tht_cost=payload.get("tht_cost", 0),
        testing_cost=payload.get("testing_cost", 0),
        stencil_cost=payload.get("stencil_cost", 0),
        subtotal=subtotal,
        gst_rate=gst_rate,
        gst_amount=gst_amount,
        total=total,
        validity_days=payload.get("validity_days", 30),
        terms=payload.get("terms"),
    )
    db.add(q)
    log_activity(db, tenant_id, current_user.id, f"Created quotation {ref} for {q.customer_name}", "crm", "quotation", q.id)
    db.commit()
    db.refresh(q)
    return _quote_dict(q)


@router.get("/quotations/{quotation_id}")
def get_quotation(
    quotation_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    q = TenantQuery(db, Quotation, tenant_id).get_or_404(quotation_id, "Quotation")
    return _quote_dict(q)


@router.patch("/quotations/{quotation_id}/status")
def update_quotation_status(
    quotation_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    q = TenantQuery(db, Quotation, tenant_id).get_or_404(quotation_id, "Quotation")
    valid = ["draft", "sent", "accepted", "expired", "rejected"]
    if payload["status"] not in valid:
        raise BadRequestError(f"Invalid status. Must be one of: {valid}")
    old = q.status
    q.status = payload["status"]
    log_activity(db, tenant_id, current_user.id, f"Quotation {q.ref_number} status: {old} -> {q.status}", "crm", "quotation", quotation_id)
    db.commit()
    db.refresh(q)
    return _quote_dict(q)


def _quote_dict(q: Quotation) -> dict:
    return {
        "id": str(q.id),
        "ref_number": q.ref_number,
        "customer_name": q.customer_name,
        "board_name": q.board_name,
        "quantity": q.quantity,
        "subtotal": float(q.subtotal),
        "gst_amount": float(q.gst_amount),
        "total": float(q.total),
        "status": q.status,
        "revision": q.revision,
        "version": q.version,
        "created_at": q.created_at.isoformat() if q.created_at else None,
    }
