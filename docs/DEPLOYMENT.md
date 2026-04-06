# Deployment

## Live URLs
| Service | URL |
|---------|-----|
| Frontend | https://thinksemi-erp.netlify.app |
| Backend API | https://thinksemi-erp-api.onrender.com |
| Swagger Docs | https://thinksemi-erp-api.onrender.com/docs |
| GitHub | https://github.com/koppulasandeep/thinksemi-erp |

## Infrastructure

### Backend (Render)
- **Service**: Web Service (Docker, free tier)
- **Database**: PostgreSQL (shared instance, database: `pcb_erp`)
- **Auto-deploy**: Triggered on `git push` to main
- **Startup**: `alembic upgrade head && python -m scripts.seed; gunicorn ...`
- **Workers**: 2 Uvicorn workers via gunicorn

### Frontend (Netlify)
- **Build**: `npm run build` (Vite)
- **Deploy**: Auto-deploy on `git push` to main
- **Site**: thinksemi-erp

## Demo Credentials
All internal users: password `ThinkSemi@ERP2026!`

| Email | Role |
|-------|------|
| superadmin@thinksemi.com | Super Admin (CEO) |
| admin@thinksemi.com | Admin (Factory Manager) |
| hr@thinksemi.com | HR Manager |
| finance@thinksemi.com | Finance Manager |
| engineering@thinksemi.com | Engineering Manager |
| production@thinksemi.com | Production Manager |
| scm@thinksemi.com | Supply Chain Manager |
| sales@thinksemi.com | Sales / CRM |
| quality@thinksemi.com | Quality Engineer |
| operator@thinksemi.com | Floor Operator |
| customer@bosch.com | Customer Portal (password: `Bosch@Portal2026!`) |

## Seed Data
The seed script (`backend/scripts/seed.py`) creates:
- 11 users, 10 employees, 6 suppliers, 3 production lines, 5 equipment
- 7 CRM leads, 5 sales orders (with line items + milestones), 3 POs
- 9 BOM items (2 boards), 8 inventory items, 6 MSL reels
- 3 work orders, 3 NPI projects, 2 ECOs, 3 NCRs
- 3 invoices, 2 vendor bills, 2 shipments, 1 RMA
- Attendance records, leave balances, leave requests, 1 payroll batch

## Environment Variables (Backend)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) |
