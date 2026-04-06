# Database Schema — 42 Tables

## Core
| Table | Description | Key FKs |
|-------|-------------|---------|
| `tenants` | Root entity for multi-tenancy | — |
| `users` | Auth users (11 roles) | tenant_id |
| `activities` | Audit log | tenant_id, user_id |
| `system_settings` | Key-value config per tenant | tenant_id |

## HR & Payroll (6 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `employees` | Employee records | tenant_id, user_id |
| `attendance` | Daily attendance (P/A/L/WO/H/CO/OT) | tenant_id, employee_id |
| `leave_balances` | Annual leave entitlements | tenant_id, employee_id |
| `leave_requests` | Leave applications + approval | tenant_id, employee_id, approved_by |
| `payroll_batches` | Monthly payroll runs | tenant_id |
| `payroll_employees` | Individual payslips | tenant_id, batch_id, employee_id |
| `payroll_config` | Payroll configuration | tenant_id |

## CRM (4 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `crm_leads` | Sales pipeline leads | tenant_id, assigned_to |
| `crm_contacts` | Customer contacts | tenant_id |
| `crm_activities` | Calls, emails, meetings | tenant_id, contact_id, lead_id |
| `quotations` | Cost breakdowns with GST | tenant_id, lead_id |

## Supply Chain (7 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `sales_orders` | Customer orders | tenant_id, customer_id |
| `so_line_items` | SO line items | tenant_id, sales_order_id |
| `so_payment_milestones` | Payment schedule | tenant_id, sales_order_id |
| `delivery_schedules` | Delivery batches per SO | tenant_id, sales_order_id |
| `purchase_orders` | Vendor POs | tenant_id, supplier_id |
| `po_line_items` | PO line items | tenant_id, purchase_order_id |
| `suppliers` | Vendor directory + scorecards | tenant_id |

## BOM (3 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `bom_items` | Component BOM per board/revision | tenant_id |
| `bom_revisions` | Revision history | tenant_id |
| `bom_alternates` | Alternate parts | tenant_id |

## Inventory (2 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `inventory_items` | Stock items with unit_price | tenant_id |
| `msl_reels` | MSL reel tracking (auto-decrement) | tenant_id |

## Manufacturing (3 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `production_lines` | SMT/THT lines | tenant_id, current_wo_id |
| `work_orders` | Manufacturing work orders | tenant_id, line_id |
| `route_steps` | Process routing steps | tenant_id, work_order_id |

## Quality (2 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `ncrs` | Non-Conformance Reports | tenant_id, work_order_id, reported_by |
| `capas` | Corrective/Preventive Actions | tenant_id, ncr_id, assigned_to |

## Engineering (2 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `ecos` | Engineering Change Orders | tenant_id, requested_by, approved_by |
| `npi_projects` | New Product Introduction | tenant_id |

## Operations (4 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `equipment` | Equipment registry | tenant_id |
| `maintenance_schedules` | PM schedules | tenant_id, equipment_id |
| `shipments` | Delivery shipments | tenant_id, sales_order_id |
| `rmas` | Return Material Authorizations | tenant_id, sales_order_id |

## Finance (2 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `invoices` | Customer invoices | tenant_id, sales_order_id |
| `vendor_bills` | Vendor bills | tenant_id, purchase_order_id |

## Traceability (2 tables)
| Table | Description | Key FKs |
|-------|-------------|---------|
| `board_traces` | Board serial tracking | tenant_id, work_order_id |
| `component_traces` | Component placement tracking | tenant_id, board_trace_id |

## Migration History
| Revision | Description |
|----------|-------------|
| `e46130b7b277` | Initial schema (42 tables) |
| `dc94215d8839` | Make supplier contact fields nullable |
| `f2ff847f585c` | Add delivery_schedules + unit_price on inventory |
| `5ea826ee46dc` | Make CRM assigned_to nullable |
| `412844f45006` | Make ECO requested_by nullable |
| `5f3ae4b8d144` | Make NCR reported_by nullable |
| *(pending)* | Add FK indices + fix ondelete CASCADE on nullable FKs |
