# Pending Items & Roadmap

## High Priority (This Week)

### Database Migration for Audit Fixes
- Generate Alembic migration for: FK index additions (68 columns), ondelete CASCADE->SET NULL fixes (4 FKs)
- Apply migration to live DB on Render
- Status: Model code updated, migration not yet generated/applied

### Automation Test Suite
- E2E tests with Playwright (frontend)
- Integration tests with real PostgreSQL (backend)
- CI/CD pipeline (GitHub Actions)

## Medium Priority (Next Sprint)

### Schema Improvements
- Add unique constraint on `bom_items(tenant_id, board_name, revision, ref_designator)` to prevent BOM duplicates
- Add unique constraint on `payroll_batches(tenant_id, month, year)` to prevent duplicate payroll runs
- Add `created_at`/`updated_at` to `payroll_employees`, `so_line_items`, `po_line_items`, `so_payment_milestones`
- Increase `supplier.rating` precision from `Numeric(2,1)` to `Numeric(3,1)`
- Make `equipment.next_pm_date` nullable (currently NOT NULL without default)
- Add standalone index on `users.email` for login query performance

### API Improvements
- Add missing dashboard aggregation endpoints: `revenueChartData`, `ordersByStatus`, `topCustomers`, `defectPareto`
- Add BOM where-used cross-board query
- Add inventory aging report endpoint
- Add Supplier scorecard aggregation endpoint

### Frontend
- Replace remaining mock data fallbacks with real endpoints where backend supports them
- Add form validation (Zod schemas) for create/edit forms
- Add optimistic updates for status transitions (CRM pipeline drag, leave approval)
- Add error toast notifications for failed API calls

## Low Priority (Backlog)

### Code Quality
- Replace `Mapped[float]` with `Mapped[Decimal]` for financial columns (currently float can lose precision)
- Add `__repr__` methods to all models for better debugging
- Remove `use_alter=True` from `sales_orders.customer_id` FK (not needed, no circular dependency)
- Add ORM `relationship()` definitions where useful (e.g., Employee->Attendance)
- Standardize NCR `defect_type` values to match schema comment (solder|component|pcb|mechanical|functional|cosmetic)
- Standardize RMA `reason` values to match schema comment

### Features Deferred
- React Native mobile app (deferred until web is stable)
- Real-time notifications (WebSocket/SSE)
- File uploads (Gerber files, inspection photos)
- Email integration (SMTP for notifications)
- Barcode/QR scanning for inventory
- Multi-language support (i18n)
