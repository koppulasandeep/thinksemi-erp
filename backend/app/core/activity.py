"""Centralized activity logging."""

import uuid
from sqlalchemy.orm import Session


def log_activity(
    db: Session,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID | None,
    message: str,
    module: str,
    entity_type: str | None = None,
    entity_id: uuid.UUID | None = None,
) -> None:
    from app.models.activity import Activity
    db.add(Activity(
        tenant_id=tenant_id,
        user_id=user_id,
        message=message,
        module=module,
        entity_type=entity_type,
        entity_id=entity_id,
    ))
