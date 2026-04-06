# Thinksemi ERP — Architecture

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + TypeScript + Vite + Tailwind CSS + shadcn/ui | React 19, Vite 8, TS 5.9 |
| Backend | FastAPI + SQLAlchemy 2.0 + Alembic | FastAPI 0.115, SA 2.0.35 |
| Database | PostgreSQL | 16 (Render managed) |
| Auth | JWT (HS256) + bcrypt | python-jose, passlib |
| Hosting | Render (backend) + Netlify (frontend) | |

## Project Structure

```
pcb-erp/
  src/                      # React frontend
    components/             # Shared UI components (shadcn/ui)
    lib/                    # API client, auth, utils, mock data, permissions
    pages/                  # 60+ page components (16 modules)
    test/                   # Test setup
  backend/
    app/
      api/                  # 17 FastAPI routers (127 endpoints)
      core/                 # Database, auth deps, tenant isolation, exceptions
      models/               # 22 model files, 42 tables
      schemas/              # Pydantic request/response schemas
      services/             # Business logic (MSL status computation)
    alembic/                # Database migrations (6 revisions)
    scripts/                # Seed script with comprehensive demo data
    tests/                  # pytest suite (69 tests)
  docs/                     # This documentation
```

## Multi-Tenancy

Every table has a `tenant_id` FK to `tenants.id`. All queries go through `TenantQuery` which automatically filters by the tenant extracted from the JWT token. This ensures complete data isolation between tenants.

## Authentication Flow

1. Frontend sends `POST /api/v1/auth/login/json` with `{email, password}`
2. Backend verifies bcrypt hash, returns JWT with `{sub: user_id, tenant_id, role, exp}`
3. Frontend stores token in `localStorage` (key: `pcb_erp_token`)
4. All subsequent requests include `Authorization: Bearer <token>`
5. Backend `get_current_user` dependency decodes JWT and loads User from DB
6. `get_tenant_id` extracts tenant UUID from token for query isolation
7. `require_role(...)` enforces role-based access on specific endpoints

## API Layer (Frontend)

- `src/lib/api.ts` — Raw fetch wrapper with token injection, 401 redirect
- `src/lib/useApi.ts` — React hooks: `useApiData` (GET with mock fallback), `useApiMutation` (POST/PATCH)
- `src/lib/mock-data.ts` — Comprehensive mock data used as fallback when API is down

## Key Design Decisions

- **Mock data fallback**: Frontend pages load mock data immediately, then replace with API data. If the backend is unreachable, the app still renders with demo data.
- **Snake-to-camel conversion**: Backend uses snake_case, frontend uses camelCase. `snakeToCamel()` and `transformList()` handle conversion.
- **No ORM relationships**: API responses are built as dicts, not ORM-navigated objects. This simplifies serialization and avoids N+1 queries.
- **Sequence generation**: `next_ref()` generates sequential reference numbers (SO-001, EMP-002, etc.) with `FOR UPDATE` row locking to prevent race conditions.
