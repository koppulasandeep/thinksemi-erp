"""Shared test fixtures — SQLite in-memory DB, test client, auth helpers."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from starlette.testclient import TestClient

from app.config import settings
from app.core.database import Base, get_db
from app.main import app as fastapi_app

# Import all models so Base.metadata knows about every table
import app.models  # noqa: F401

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ---------------------------------------------------------------------------
# SQLite in-memory engine with PostgreSQL compatibility shims
# ---------------------------------------------------------------------------

from sqlalchemy.pool import StaticPool
from sqlalchemy import TypeDecorator, Date, DateTime


# SQLite type adapters — auto-coerce ISO date strings to Python date/datetime
class _CoercingDate(TypeDecorator):
    impl = Date
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, str):
            from datetime import date as _date
            return _date.fromisoformat(value)
        return value


class _CoercingDateTime(TypeDecorator):
    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, str):
            from datetime import datetime as _dt
            return _dt.fromisoformat(value)
        return value


_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(_engine, "connect")
def _register_sqlite_functions(dbapi_conn, _rec):
    dbapi_conn.create_function("gen_random_uuid", 0, lambda: str(uuid.uuid4()))


# Strip PostgreSQL-only server_defaults (gen_random_uuid) at import time.
# This mutates the metadata once so SQLite DDL doesn't fail.
for _table in Base.metadata.sorted_tables:
    for _col in _table.columns:
        if _col.server_default is not None:
            _default_text = ""
            try:
                _default_text = str(_col.server_default.arg)
            except Exception:
                pass
            if "gen_random_uuid" in _default_text:
                _col.server_default = None

_TestSession = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)

# Add Python-side UUID default for all PK columns that lost their server_default
# Also coerce Date/DateTime columns for SQLite string compatibility
for _table in Base.metadata.sorted_tables:
    for _col in _table.columns:
        if _col.primary_key and type(_col.type).__name__ == "Uuid" and _col.default is None:
            _col.default = __import__("sqlalchemy").ColumnDefault(uuid.uuid4)
        if isinstance(_col.type, Date) and not isinstance(_col.type, DateTime):
            _col.type = _CoercingDate()
        elif isinstance(_col.type, DateTime):
            _col.type = _CoercingDateTime()

# Create all tables once (in-memory DB persists for the session)
Base.metadata.create_all(bind=_engine)


# ---------------------------------------------------------------------------
# DB fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _truncate_tables():
    """Truncate all tables after each test for isolation."""
    yield
    from sqlalchemy import text as sa_text
    try:
        with _engine.connect() as conn:
            conn.execute(sa_text("PRAGMA foreign_keys = OFF"))
            for table in reversed(Base.metadata.sorted_tables):
                try:
                    conn.execute(table.delete())
                except Exception:
                    pass
            conn.execute(sa_text("PRAGMA foreign_keys = ON"))
            conn.commit()
    except Exception:
        pass


@pytest.fixture()
def db_session():
    """Yield a fresh DB session for each test."""
    session = _TestSession()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


# ---------------------------------------------------------------------------
# FastAPI TestClient
# ---------------------------------------------------------------------------

@pytest.fixture()
def client(db_session: Session):
    """TestClient with DB dependency overridden to use the test session."""

    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Tenant + User fixtures
# ---------------------------------------------------------------------------

TENANT_ID = uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
ADMIN_USER_ID = uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
OPERATOR_USER_ID = uuid.UUID("cccccccc-cccc-cccc-cccc-cccccccccccc")
INACTIVE_USER_ID = uuid.UUID("dddddddd-dddd-dddd-dddd-dddddddddddd")


@pytest.fixture()
def test_tenant(db_session: Session):
    from app.models.tenant import Tenant

    tenant = Tenant(id=TENANT_ID, name="Test Tenant", slug="test-tenant")
    db_session.add(tenant)
    db_session.flush()
    return tenant


@pytest.fixture()
def test_user(db_session: Session, test_tenant):
    from app.models.user import User

    user = User(
        id=ADMIN_USER_ID,
        tenant_id=TENANT_ID,
        email="admin@test.com",
        password_hash=pwd_context.hash("testpass123"),
        full_name="Admin User",
        role="admin",
        designation="Test Admin",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture()
def operator_user(db_session: Session, test_tenant):
    from app.models.user import User

    user = User(
        id=OPERATOR_USER_ID,
        tenant_id=TENANT_ID,
        email="operator@test.com",
        password_hash=pwd_context.hash("testpass123"),
        full_name="Operator User",
        role="operator",
        designation="SMT Operator",
        is_active=True,
    )
    db_session.add(user)
    db_session.flush()
    return user


@pytest.fixture()
def inactive_user(db_session: Session, test_tenant):
    from app.models.user import User

    user = User(
        id=INACTIVE_USER_ID,
        tenant_id=TENANT_ID,
        email="inactive@test.com",
        password_hash=pwd_context.hash("testpass123"),
        full_name="Inactive User",
        role="admin",
        is_active=False,
    )
    db_session.add(user)
    db_session.flush()
    return user


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def _make_token(user_id: uuid.UUID, tenant_id: uuid.UUID, role: str, expired: bool = False) -> str:
    exp = datetime.now(timezone.utc) + (timedelta(minutes=-5) if expired else timedelta(hours=24))
    payload = {
        "sub": str(user_id),
        "tenant_id": str(tenant_id),
        "role": role,
        "exp": exp,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


@pytest.fixture()
def auth_headers(test_user) -> dict:
    token = _make_token(ADMIN_USER_ID, TENANT_ID, "admin")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def operator_headers(operator_user) -> dict:
    token = _make_token(OPERATOR_USER_ID, TENANT_ID, "operator")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def expired_headers(test_user) -> dict:
    token = _make_token(ADMIN_USER_ID, TENANT_ID, "admin", expired=True)
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Mock next_ref (uses FOR UPDATE — incompatible with SQLite)
# ---------------------------------------------------------------------------

_ref_counters: dict[str, int] = {}


def _mock_next_ref(db, tenant_id, prefix, table):
    key = f"{tenant_id}:{prefix}"
    _ref_counters[key] = _ref_counters.get(key, 0) + 1
    return f"{prefix}-{_ref_counters[key]:03d}"


_NEXT_REF_LOCATIONS = [
    "app.core.sequence.next_ref",
    "app.api.hr.next_ref",
    "app.api.crm.next_ref",
    "app.api.supply_chain.next_ref",
    "app.api.quality.next_ref",
    "app.api.finance.next_ref",
    "app.api.manufacturing.next_ref",
    "app.api.eco.next_ref",
    "app.api.npi.next_ref",
    "app.api.delivery.next_ref",
    "app.api.rma.next_ref",
]


@pytest.fixture(autouse=True)
def _mock_sequence():
    _ref_counters.clear()
    patches = [patch(loc, side_effect=_mock_next_ref) for loc in _NEXT_REF_LOCATIONS]
    for p in patches:
        p.start()
    yield
    for p in patches:
        p.stop()
