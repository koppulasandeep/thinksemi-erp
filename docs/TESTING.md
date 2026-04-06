# Testing

## Backend (pytest)

**69 tests** using pytest + httpx TestClient + SQLite in-memory DB.

### Running
```bash
cd backend
python3 -m pytest tests/ -v
```

### Test Files
| File | Tests | Coverage |
|------|-------|----------|
| `test_health.py` | 2 | Health endpoint |
| `test_msl_service.py` | 8 | MSL status computation (pure unit) |
| `test_auth.py` | 10 | Login, /me, token validation |
| `test_inventory.py` | 12 | CRUD, stock adjustments, valuation |
| `test_hr.py` | 10 | Employees, leave lifecycle, attendance |
| `test_crm.py` | 9 | Leads, contacts, quotations |
| `test_supply_chain.py` | 8 | Sales orders, suppliers, BOM |
| `test_quality.py` | 10 | NCR, CAPA, quality metrics |

### SQLite Compatibility
The test suite uses SQLite in-memory for speed. Key compatibility shims in `conftest.py`:
- `gen_random_uuid()` registered as a custom SQLite function
- `server_default` for UUID PKs stripped and replaced with Python-side `ColumnDefault(uuid.uuid4)`
- Date/DateTime columns wrapped with coercing TypeDecorators to handle string inputs
- `next_ref()` mocked (uses `FOR UPDATE` which SQLite doesn't support)
- `StaticPool` ensures all connections share the same in-memory DB

## Frontend (vitest)

**42 tests** using vitest + React Testing Library + jsdom.

### Running
```bash
npm run test          # single run
npm run test:watch    # watch mode
```

### Test Files
| File | Tests | Coverage |
|------|-------|----------|
| `utils.test.ts` | 10 | formatCurrency, formatNumber, getInitials, getStatusColor, cn |
| `api.test.ts` | 8 | Token management, apiFetch (auth, errors, 204) |
| `auth.test.ts` | 7 | getCurrentUser, isAuthenticated, login fallback |
| `useApi.test.ts` | 6 | snakeToCamel, transformList |
| `permissions.test.ts` | 8 | Role-based access control, getDefaultRoute |

## Automation Test Suite (Planned)
E2E and integration tests are planned for next sprint. Will use:
- Backend: pytest with real PostgreSQL (Docker)
- Frontend: Playwright for browser automation
