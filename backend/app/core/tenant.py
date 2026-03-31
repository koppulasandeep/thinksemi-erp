"""Tenant-scoped query builder. Create a new instance per request."""

import uuid
from typing import Generic, TypeVar, Type

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError

T = TypeVar("T")


class TenantQuery(Generic[T]):
    def __init__(self, db: Session, model: Type[T], tenant_id: uuid.UUID) -> None:
        self.db = db
        self.model = model
        self.tenant_id = tenant_id
        self._filters: list = [model.tenant_id == tenant_id]  # type: ignore[attr-defined]

    def filter(self, *criteria) -> "TenantQuery[T]":
        self._filters.extend(criteria)
        return self

    def _build(self):
        return select(self.model).where(*self._filters)

    def all(self, *, order_by=None, limit: int | None = None, offset: int | None = None) -> list[T]:
        stmt = self._build()
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        return list(self.db.execute(stmt).scalars().all())

    def get(self, id: uuid.UUID) -> T | None:
        return self.db.execute(
            select(self.model).where(
                self.model.id == id,  # type: ignore[attr-defined]
                self.model.tenant_id == self.tenant_id,  # type: ignore[attr-defined]
            )
        ).scalar_one_or_none()

    def get_or_404(self, id: uuid.UUID, label: str | None = None) -> T:
        obj = self.get(id)
        if obj is None:
            entity_name = label or getattr(self.model, "__tablename__", self.model.__name__)
            raise NotFoundError(entity_name, str(id))
        return obj

    def count(self) -> int:
        stmt = select(func.count()).select_from(self.model).where(*self._filters)
        return self.db.execute(stmt).scalar() or 0

    def exists(self, id: uuid.UUID) -> bool:
        return self.get(id) is not None
