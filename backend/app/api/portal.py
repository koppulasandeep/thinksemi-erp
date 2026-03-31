"""Customer Portal API — self-service views for customers."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.sales_order import SalesOrder
from app.models.npi import NPIProject
from app.models.rma import RMA

router = APIRouter(tags=["portal"])


@router.get("/my-orders")
def my_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("customer"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return sales orders belonging to the authenticated customer."""
    # Match by customer name or customer_id linked to the user
    orders = TenantQuery(db, SalesOrder, tenant_id).filter(
        SalesOrder.customer_name.ilike(f"%{current_user.full_name}%")
    ).all(order_by=SalesOrder.created_at.desc())

    return {
        "orders": [
            {
                "id": str(o.id), "ref_number": o.ref_number,
                "board_name": o.board_name, "quantity": o.quantity,
                "total_value": float(o.total_value),
                "due_date": str(o.due_date), "status": o.status,
                "payment_status": o.payment_status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
            }
            for o in orders
        ]
    }


@router.get("/my-npi")
def my_npi_projects(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("customer"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return NPI projects belonging to the authenticated customer."""
    projects = TenantQuery(db, NPIProject, tenant_id).filter(
        NPIProject.customer_name.ilike(f"%{current_user.full_name}%")
    ).all(order_by=NPIProject.created_at.desc())

    return {
        "projects": [
            {
                "id": str(p.id), "ref_number": p.ref_number,
                "name": p.name, "board_name": p.board_name,
                "stage": p.stage,
                "target_date": str(p.target_date) if p.target_date else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in projects
        ]
    }


@router.get("/my-rma")
def my_rmas(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("customer"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return RMAs belonging to the authenticated customer."""
    rmas = TenantQuery(db, RMA, tenant_id).filter(
        RMA.customer_name.ilike(f"%{current_user.full_name}%")
    ).all(order_by=RMA.created_at.desc())

    return {
        "rmas": [
            {
                "id": str(r.id), "ref_number": r.ref_number,
                "board_name": r.board_name, "quantity": r.quantity,
                "reason": r.reason, "status": r.status,
                "resolution": r.resolution,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rmas
        ]
    }
