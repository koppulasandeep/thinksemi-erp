# Changelog

## 2026-04-05 — Code Audit & Quality Fixes

### Critical Fixes
- **Fix ondelete="CASCADE" on nullable FKs** — Changed to "SET NULL" on: `crm_leads.assigned_to`, `crm_activities.assigned_to`, `ecos.requested_by`, `ncrs.reported_by`. Previously, deleting a user would cascade-delete all their CRM leads, ECOs, and NCRs.
- **Fix None serialization bugs** — API responses for nullable FK fields (`requested_by`, `reported_by`, `assigned_to`) now return JSON `null` instead of the string `"None"`.

### Performance
- **Add FK indices** — Added `index=True` to 68 ForeignKey columns across 16 model files. All `tenant_id` columns (used in every query) are now indexed. Previously, no FK column had an index.

### Bug Fixes
- **Fix seed script `today` variable** — Moved `today = date.today()` to top of `seed()` function. Previously defined after first use, causing `NameError` on fresh databases.

### Testing
- **Backend**: 69 unit tests (pytest + SQLite in-memory) covering auth, inventory, HR, CRM, supply chain, quality, MSL service
- **Frontend**: 42 unit tests (vitest + jsdom) covering utils, API layer, auth, permissions

### Documentation
- Created `/docs` folder: ARCHITECTURE.md, API_ENDPOINTS.md, DATABASE_SCHEMA.md, TESTING.md, DEPLOYMENT.md, PENDING.md

---

## 2026-04-05 — Frontend-Backend Integration

### Features
- Wired 25 frontend pages to real backend API with mock data fallback
- Added 16 new backend endpoints (127 total): BOM CRUD, delivery schedule, inventory creation, valuation
- Implemented MSL auto-decrement (remaining hours computed dynamically from `opened_at`)
- Comprehensive seed data: 50+ demo records across all modules
- Added Employee, Attendance, Leave, and Payroll seed data for HR module

### Infrastructure
- Deployed backend to Render (Docker, auto-deploy on push)
- Deployed frontend to Netlify
- Created shared PostgreSQL database on Render

---

## 2026-03-31 — Initial Release

- Full frontend: 60+ screens, 16 modules, 11 role-based logins
- Full backend: 111 API endpoints, 41 tables, JWT auth
- Indian payroll compliance (PF/ESI/TDS/PT)
- Drag-and-drop kanban boards, CSV/PDF export
