"""Race-condition-safe sequential reference number generator."""

import uuid
from sqlalchemy import text
from sqlalchemy.orm import Session


def next_ref(db: Session, tenant_id: uuid.UUID, prefix: str, table: str) -> str:
    result = db.execute(
        text(
            f"SELECT ref_number FROM {table} "
            "WHERE tenant_id = :tid AND ref_number LIKE :pattern "
            "ORDER BY ref_number DESC LIMIT 1 FOR UPDATE"
        ),
        {"tid": str(tenant_id), "pattern": f"{prefix}-%"},
    ).scalar()

    if result is None:
        return f"{prefix}-001"

    try:
        num = int(result.split("-", 1)[1])
    except (IndexError, ValueError):
        num = 0

    return f"{prefix}-{num + 1:03d}"
