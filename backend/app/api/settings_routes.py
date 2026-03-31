"""Settings API — payroll config and user management."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.core.activity import log_activity
from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id, require_role
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.settings_model import PayrollConfig

router = APIRouter(tags=["settings"])


@router.get("/payroll-config")
def get_payroll_config(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    config = db.query(PayrollConfig).filter(PayrollConfig.tenant_id == tenant_id).first()
    if not config:
        # Return defaults
        return {
            "pf_rate": 12, "pf_ceiling": 15000,
            "esi_employee_rate": 0.75, "esi_employer_rate": 3.25, "esi_ceiling": 21000,
            "pt_state": "tamil_nadu", "tax_regime": "new",
            "basic_percent": 40, "hra_percent": 50,
            "conveyance_fixed": 1600, "medical_fixed": 1250,
            "pay_day": 28,
        }
    return {
        "id": str(config.id),
        "pf_rate": float(config.pf_rate),
        "pf_ceiling": float(config.pf_ceiling),
        "esi_employee_rate": float(config.esi_employee_rate),
        "esi_employer_rate": float(config.esi_employer_rate),
        "esi_ceiling": float(config.esi_ceiling),
        "pt_state": config.pt_state,
        "tax_regime": config.tax_regime,
        "basic_percent": config.basic_percent,
        "hra_percent": config.hra_percent,
        "conveyance_fixed": float(config.conveyance_fixed),
        "medical_fixed": float(config.medical_fixed),
        "bank_name": config.bank_name,
        "bank_account": config.bank_account,
        "bank_ifsc": config.bank_ifsc,
        "pay_day": config.pay_day,
    }


@router.patch("/payroll-config")
def update_payroll_config(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "hr_manager"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    payload: dict = Body(...),
):
    config = db.query(PayrollConfig).filter(PayrollConfig.tenant_id == tenant_id).first()
    if not config:
        config = PayrollConfig(tenant_id=tenant_id)
        db.add(config)
        db.flush()

    updatable = [
        "pf_rate", "pf_ceiling", "esi_employee_rate", "esi_employer_rate",
        "esi_ceiling", "pt_state", "tax_regime", "basic_percent", "hra_percent",
        "conveyance_fixed", "medical_fixed", "bank_name", "bank_account",
        "bank_ifsc", "pay_day",
    ]
    for key in updatable:
        if key in payload:
            setattr(config, key, payload[key])

    log_activity(db, tenant_id, current_user.id, "Updated payroll configuration", "settings", "payroll_config", config.id)
    db.commit()
    db.refresh(config)
    return {"message": "Payroll config updated", "id": str(config.id)}


@router.get("/users")
def list_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role("admin", "super_admin"))],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    users = TenantQuery(db, User, tenant_id).all(order_by=User.full_name)
    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "designation": u.designation,
                "is_active": u.is_active,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }
