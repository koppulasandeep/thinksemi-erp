# API Endpoints — 127 Total

Base URL: `https://thinksemi-erp-api.onrender.com/api/v1`

## Auth (`/auth`) — 3 endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/login` | No | OAuth2 form login |
| POST | `/login/json` | No | JSON login (frontend) |
| GET | `/me` | Yes | Current user info |

## Dashboard (`/dashboard`) — 5 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/kpis` | Revenue, active orders, OTD, OEE, FPY |
| GET | `/alerts` | System-wide alerts |
| GET | `/production-lines` | Line status with current work orders |
| GET | `/recent-activities` | Activity log |
| GET | `/cash-flow` | Cash flow summary |

## HR (`/hr`) — 14 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/employees` | List (search, department, status filters) |
| POST | `/employees` | Create (admin/hr_manager only) |
| GET | `/employees/{id}` | Get by ID |
| PATCH | `/employees/{id}` | Update |
| GET | `/attendance` | Get attendance (month, year required) |
| POST | `/attendance/mark` | Mark attendance |
| GET | `/leave-balances/{employee_id}` | Leave balances by year |
| POST | `/leave-requests` | Create leave request |
| GET | `/leave-requests` | List (status, employee_id filters) |
| PATCH | `/leave-requests/{id}/approve` | Approve (admin/hr_manager) |
| PATCH | `/leave-requests/{id}/reject` | Reject (admin/hr_manager) |
| GET | `/payroll/batches` | List payroll batches |
| POST | `/payroll/batches` | Create payroll batch |
| PATCH | `/payroll/batches/{id}/status` | Update batch status |

## CRM (`/crm`) — 12 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/leads` | List (stage, search, source filters) |
| POST | `/leads` | Create lead |
| GET | `/leads/{id}` | Get lead |
| PATCH | `/leads/{id}` | Update lead |
| PATCH | `/leads/{id}/stage` | Update lead stage |
| GET | `/contacts` | List contacts |
| POST | `/contacts` | Create contact |
| GET | `/contacts/{id}` | Get contact |
| GET | `/quotations` | List quotations |
| POST | `/quotations` | Create quotation |
| GET | `/quotations/{id}` | Get quotation |
| PATCH | `/quotations/{id}/status` | Update quotation status |

## Supply Chain (`/supply-chain`) — 18 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/sales-orders` | List (status, search, priority filters) |
| POST | `/sales-orders` | Create with line items + milestones |
| GET | `/sales-orders/{id}` | Get with line items + milestones |
| PATCH | `/sales-orders/{id}/status` | Update SO status |
| GET | `/sales-orders/{id}/delivery-schedule` | List delivery batches |
| POST | `/sales-orders/{id}/delivery-schedule` | Create delivery batch |
| PATCH | `/sales-orders/{id}/delivery-schedule/{batch_id}` | Update batch |
| GET | `/bom/{board}` | List BOM items for a board |
| POST | `/bom` | Batch import BOM items |
| PATCH | `/bom/{board}/items/{id}` | Update BOM item |
| POST | `/bom/{board}/revisions` | Create BOM revision |
| GET | `/bom/{board}/alternates` | List alternates |
| POST | `/bom/{board}/alternates` | Create alternate |
| GET | `/bom/{board}/where-used` | Where-used query |
| GET | `/purchase-orders` | List POs |
| GET | `/purchase-orders/{id}` | Get PO with line items |
| GET | `/suppliers` | List suppliers |
| POST | `/suppliers` | Create supplier |

## Inventory (`/inventory`) — 11 endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/items` | List (search, low_stock filters) |
| POST | `/items` | Create inventory item |
| GET | `/items/{part_number}` | Get by part number |
| PATCH | `/items/{part_number}/stock` | Adjust stock |
| GET | `/msl` | List MSL reels (auto-decrement remaining hours) |
| POST | `/msl` | Register new MSL reel |
| GET | `/msl/{reel_id}` | Get MSL reel |
| PATCH | `/msl/{reel_id}/status` | Update reel status |
| POST | `/msl/{reel_id}/bake` | Start bake cycle |
| GET | `/valuation` | Inventory valuation by category |

## Manufacturing (`/manufacturing`) — 8 endpoints
## Quality (`/quality`) — 10 endpoints
## Finance (`/finance`) — 8 endpoints
## NPI (`/npi`) — 5 endpoints
## ECO (`/eco`) — 5 endpoints
## Delivery (`/delivery`) — 5 endpoints
## RMA (`/rma`) — 5 endpoints
## Maintenance (`/maintenance`) — 6 endpoints
## Traceability (`/traceability`) — 3 endpoints
## Portal (`/portal`) — 4 endpoints
## Settings (`/settings`) — 4 endpoints

Full Swagger docs: https://thinksemi-erp-api.onrender.com/docs
