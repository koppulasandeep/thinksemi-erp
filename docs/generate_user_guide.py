"""Generate Thinksemi ERP User Guide PDF with screenshots."""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether,
)

WIDTH, HEIGHT = A4
CYAN = HexColor("#0891b2")
DARK = HexColor("#1e293b")
GRAY = HexColor("#64748b")
LIGHT_BG = HexColor("#f8fafc")
SDIR = "/Users/sandeepkoppula/Desktop/ERP/pcb-erp/docs/screenshots"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontSize=28, textColor=DARK, spaceAfter=6, alignment=TA_CENTER))
styles.add(ParagraphStyle("CoverSub", parent=styles["CoverTitle"], fontSize=14, textColor=GRAY, spaceAfter=4))
styles.add(ParagraphStyle("Sec", parent=styles["Heading1"], fontSize=18, textColor=CYAN, spaceBefore=16, spaceAfter=8))
styles.add(ParagraphStyle("Sub", parent=styles["Heading2"], fontSize=13, textColor=DARK, spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14, spaceAfter=5, alignment=TA_JUSTIFY))
styles.add(ParagraphStyle("BulletItem", parent=styles["Normal"], fontSize=10, leading=14, leftIndent=20, bulletIndent=8, spaceAfter=3))
styles.add(ParagraphStyle("Caption", parent=styles["Normal"], fontSize=8, textColor=GRAY, alignment=TA_CENTER, spaceAfter=8, spaceBefore=2))


def tbl(headers, rows, cw=None):
    data = [headers] + rows
    s = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CYAN), ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ])
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(s)
    return t

def b(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", styles["BulletItem"])

def img(name, w=None):
    path = os.path.join(SDIR, name)
    if not os.path.exists(path):
        return Paragraph(f"<i>[Screenshot: {name}]</i>", styles["Caption"])
    if w is None:
        w = WIDTH - 40*mm
    return Image(path, width=w, height=w * 0.625, kind="proportional")

def caption(text):
    return Paragraph(f"<i>{text}</i>", styles["Caption"])


def build():
    doc = SimpleDocTemplate(
        "/Users/sandeepkoppula/Desktop/ERP/pcb-erp/docs/Thinksemi_ERP_User_Guide.pdf",
        pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=18*mm,
    )
    story = []
    U = WIDTH - 40*mm  # usable width

    # ══════════════════════════════════════════════════════════════════
    # COVER
    # ══════════════════════════════════════════════════════════════════
    story.append(Spacer(1, 60))
    story.append(Paragraph("Thinksemi ERP", styles["CoverTitle"]))
    story.append(Paragraph("PCB Assembly Management System", styles["CoverSub"]))
    story.append(Spacer(1, 16))
    story.append(Paragraph("User Guide v1.0", ParagraphStyle("v", parent=styles["CoverSub"], fontSize=16, textColor=CYAN)))
    story.append(Spacer(1, 30))
    story.append(img("02_dashboard.png"))
    story.append(caption("Dashboard - Real-time factory overview"))
    story.append(Spacer(1, 20))
    story.append(Paragraph("16 Integrated Modules | 60+ Screens | 150+ API Endpoints", styles["CoverSub"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Thinksemi Infotech Ltd, Chennai", ParagraphStyle("co", parent=styles["CoverSub"], fontSize=11, textColor=DARK)))
    story.append(Paragraph("April 2026", styles["CoverSub"]))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # TOC
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("Table of Contents", styles["Sec"]))
    toc = [
        "1. Getting Started", "2. Dashboard", "3. HR & Payroll",
        "4. Salary Structure & Tax", "5. Holiday & Leave System",
        "6. Sales CRM", "7. Finance", "8. Supply Chain",
        "9. Inventory & Item Master", "10. MSL Control",
        "11. Manufacturing", "12. Quality (QMS)",
        "13. NPI & ECO", "14. Operations",
        "15. Settings & Admin Guide", "16. Technical Reference",
    ]
    for t in toc:
        story.append(Paragraph(t, ParagraphStyle("toc", parent=styles["Normal"], fontSize=11, leading=20, leftIndent=10)))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 1. GETTING STARTED
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("1. Getting Started", styles["Sec"]))
    story.append(img("01_login.png"))
    story.append(caption("Login screen with 16-module feature list"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Accessing the System", styles["Sub"]))
    story.append(Paragraph("Open <b>https://thinksemi-pcb-erp.netlify.app</b> in any modern browser. Enter your email and password to log in.", styles["Body"]))

    story.append(Paragraph("Login Credentials", styles["Sub"]))
    creds = [
        ["superadmin@thinksemi.com", "ThinkSemi@ERP2026!", "Super Admin", "Full access"],
        ["admin@thinksemi.com", "ThinkSemi@ERP2026!", "Admin", "Factory management"],
        ["hr@thinksemi.com", "ThinkSemi@ERP2026!", "HR Manager", "HR, payroll, leave"],
        ["finance@thinksemi.com", "ThinkSemi@ERP2026!", "Finance Mgr", "Finance, invoicing"],
        ["engineering@thinksemi.com", "ThinkSemi@ERP2026!", "Engineering Mgr", "NPI, ECO, BOM"],
        ["production@thinksemi.com", "ThinkSemi@ERP2026!", "Production Mgr", "Manufacturing"],
        ["scm@thinksemi.com", "ThinkSemi@ERP2026!", "SCM Manager", "Supply chain"],
        ["sales@thinksemi.com", "ThinkSemi@ERP2026!", "Sales / CRM", "CRM, sales"],
        ["quality@thinksemi.com", "ThinkSemi@ERP2026!", "Quality Engr", "Quality, trace"],
        ["operator@thinksemi.com", "ThinkSemi@ERP2026!", "Operator", "Manufacturing"],
        ["customer@bosch.com", "Bosch@Portal2026!", "Customer", "Portal only"],
    ]
    story.append(tbl(["Email", "Password", "Role", "Access"], creds, [U*0.30, U*0.22, U*0.17, U*0.31]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Navigation", styles["Sub"]))
    story.append(b("<b>Sidebar</b>: Module groups (People, Sales, Finance, Engineering, Supply Chain, Production, Quality, Operations)"))
    story.append(b("<b>Header</b>: Global search (Cmd+K), dark mode toggle, notification bell, user menu"))
    story.append(b("<b>Mobile</b>: Hamburger menu opens sidebar overlay on small screens"))
    story.append(b("<b>Tabs</b>: Filled pill-style tabs for sub-sections within each module"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 2. DASHBOARD
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("2. Dashboard", styles["Sec"]))
    story.append(img("02_dashboard.png"))
    story.append(caption("Main dashboard with KPIs, production lines, and alerts"))
    story.append(Spacer(1, 6))
    story.append(Paragraph("The dashboard provides a real-time overview of factory operations:", styles["Body"]))
    story.append(b("<b>Revenue</b>: Current month revenue in INR with trend vs previous month"))
    story.append(b("<b>Active Orders</b>: Count of sales orders in production/confirmed status"))
    story.append(b("<b>On-Time Delivery</b>: Percentage of orders delivered by due date"))
    story.append(b("<b>OEE</b>: Overall Equipment Effectiveness across all production lines"))
    story.append(b("<b>First Pass Yield</b>: Boards passing quality inspection on first attempt"))
    story.append(b("<b>Production Lines</b>: Live status of SMT Line 1, SMT Line 2, THT Line 1"))
    story.append(b("<b>Alerts</b>: Equipment maintenance due, low stock warnings, pending approvals"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 3. HR & PAYROLL
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("3. HR & Payroll Module", styles["Sec"]))
    story.append(img("03_hr_overview.png"))
    story.append(caption("HR Overview - Employee KPIs, directory, and department breakdown"))
    story.append(Spacer(1, 6))
    story.append(Paragraph("The HR module is accessed via <b>HR & Payroll</b> in the sidebar. It contains tabbed sections:", styles["Body"]))

    story.append(Paragraph("3.1 Overview Tab", styles["Sub"]))
    story.append(b("Total employee count, present today, on leave, pending leave requests"))
    story.append(b("Department breakdown chart"))
    story.append(b("Employee directory with name, role, department badge"))
    story.append(b("Recent HR activity feed"))

    story.append(Paragraph("3.2 Attendance Tab", styles["Sub"]))
    story.append(b("Monthly calendar view with status codes: <b>P</b> (Present), <b>A</b> (Absent), <b>L</b> (Leave), <b>WO</b> (Week Off), <b>H</b> (Holiday), <b>CO</b> (Comp-Off), <b>OT</b> (Overtime)"))
    story.append(b("KPIs: Present today, absent, on leave counts"))
    story.append(b("Overtime hours tracked per employee per day"))
    story.append(b("Export to CSV/PDF"))

    story.append(Paragraph("3.3 Leave Management Tab", styles["Sub"]))
    leave_types = [
        ["EL", "Earned Leave", "15 days/year", "Yes (max 30 days)", "3 days notice"],
        ["CL", "Casual Leave", "8 days/year", "No", "None"],
        ["SL", "Sick Leave", "10 days/year", "Yes (max 20 days)", "None"],
        ["ML", "Maternity Leave", "182 days", "No", "30 days notice"],
        ["PL", "Paternity Leave", "15 days", "No", "7 days notice"],
        ["CO", "Compensatory Off", "5 days", "No", "None"],
        ["LOP", "Loss of Pay", "Unlimited", "N/A", "N/A"],
    ]
    story.append(tbl(["Code", "Type", "Entitlement", "Carry Forward", "Notice"], leave_types, [U*0.08, U*0.20, U*0.18, U*0.28, U*0.26]))
    story.append(b("Leave request workflow: <b>Draft -> Pending -> Approved / Rejected</b>"))
    story.append(b("Balance auto-deducted on approval"))
    story.append(b("Admin can bulk-allocate from leave policies"))

    story.append(Paragraph("3.4 Payroll Tab", styles["Sub"]))
    story.append(b("Monthly payroll batch creation for all active employees"))
    story.append(b("Workflow: <b>Draft -> Submitted -> Approved -> Paid</b>"))
    story.append(b("Auto-computes: Basic, HRA, allowances from salary structure"))
    story.append(b("Statutory deductions: PF (12%), ESI (0.75%/3.25%), Professional Tax"))
    story.append(b("TDS computed per employee based on regime and declarations"))
    story.append(b("Overtime pay: OT hours x (Basic / 26 / 8) x 1.5"))
    story.append(b("Payslip detail view per employee"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 4. SALARY & TAX
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("4. Salary Structure & Tax Declarations", styles["Sec"]))
    story.append(img("04_hr_salary.png"))
    story.append(caption("Salary Structure - CTC breakdown with revision history"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("4.1 Salary Structure", styles["Sub"]))
    story.append(b("Select an employee from the dropdown to view their CTC breakdown"))
    story.append(b("Shows: Annual CTC, Basic (40%), HRA (50% of Basic), Special Allowance, Conveyance (19,200), Medical (15,000)"))
    story.append(b("Revision history timeline with effective dates"))
    story.append(b("<b>Admin action</b>: Click 'Set / Revise Salary' to enter new CTC (auto-calculates breakdown)"))

    story.append(Paragraph("4.2 Tax Declarations", styles["Sub"]))
    story.append(b("Employee selects tax regime: <b>New</b> (default) or <b>Old</b>"))
    story.append(b("Declaration fields: Section 80C, 80D, HRA exemption, Home Loan interest"))
    story.append(b("<b>Compare Regimes</b> button shows side-by-side tax under both regimes with recommendation"))

    story.append(Paragraph("4.3 TDS Slabs (FY 2025-26)", styles["Sub"]))
    story.append(Paragraph("<b>New Regime:</b>", styles["Body"]))
    ns = [["0 - 4L", "Nil"], ["4 - 8L", "5%"], ["8 - 12L", "10%"], ["12 - 16L", "15%"], ["16 - 20L", "20%"], ["20 - 24L", "25%"], ["> 24L", "30%"]]
    story.append(tbl(["Income Slab", "Rate"], ns, [U*0.40, U*0.60]))
    story.append(b("Standard Deduction: INR 75,000 | Rebate u/s 87A if taxable <= 12.75L | 4% Cess"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 5. HOLIDAYS & LEAVE SYSTEM
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("5. Holiday & Leave System", styles["Sec"]))
    story.append(img("05_hr_holidays.png"))
    story.append(caption("Holiday Calendar - National, State, Optional holidays for 2026"))
    story.append(Spacer(1, 6))
    story.append(b("Pre-configured with Indian national and Tamil Nadu state holidays"))
    story.append(b("Holiday types shown as colored badges: <b>National</b> (blue), <b>State</b> (green), <b>Optional</b> (amber), <b>Company</b> (gray)"))
    story.append(b("Year selector to filter holidays"))
    story.append(b("<b>Admin action</b>: 'Add Holiday' button to create new holidays"))
    story.append(b("<b>Admin action</b>: Delete button on each row (Super Admin / Admin only)"))
    story.append(b("Leave types and policies configurable by Admin (code, name, entitled days, carry-forward rules, notice period, gender applicability)"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 6. CRM
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("6. Sales CRM Module", styles["Sec"]))
    story.append(img("06_crm.png"))
    story.append(caption("CRM Dashboard - Lead pipeline with value tracking"))
    story.append(Spacer(1, 6))
    story.append(img("07_crm_pipeline.png"))
    story.append(caption("CRM Pipeline - Drag-and-drop Kanban board"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("6.1 Lead Management", styles["Sub"]))
    story.append(b("Pipeline stages: <b>New Lead -> Qualified -> Quoted -> Negotiation -> Won / Lost</b>"))
    story.append(b("Each lead tracks: company, contact, product, deal value, probability, source"))
    story.append(b("Drag-and-drop Kanban board for visual pipeline management"))

    story.append(Paragraph("6.2 Contacts & Quotations", styles["Sub"]))
    story.append(b("Contact directory linked to companies"))
    story.append(b("Quotation generator with cost breakdown: bare PCB, components, SMT, THT, testing, stencil"))
    story.append(b("Auto-GST calculation at 18%"))
    story.append(b("Activity log: calls, emails, meetings per lead"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 7. FINANCE
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("7. Finance Module", styles["Sec"]))
    story.append(img("08_finance.png"))
    story.append(caption("Finance - Invoices, receivables, vendor payments, payroll approval"))
    story.append(Spacer(1, 6))
    story.append(b("<b>Overview</b>: Total receivables vs payables, cash flow summary"))
    story.append(b("<b>Customer Payments</b>: Invoice aging (0-30, 30-60, 60-90, 90+ days)"))
    story.append(b("<b>Vendor Payments</b>: Bill tracking with due dates and payment status"))
    story.append(b("<b>Payroll Approval</b>: Review and approve submitted payroll batches"))
    story.append(b("<b>Reports</b>: Form 24Q, ECR, Form 16, PF Annual Return (statutory)"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 8. SUPPLY CHAIN
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("8. Supply Chain Module", styles["Sec"]))
    story.append(img("09_supply_chain.png"))
    story.append(caption("Supply Chain Dashboard - Orders, BOM, procurement overview"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("8.1 Sales Orders", styles["Sub"]))
    story.append(img("10_sales_orders.png"))
    story.append(caption("Sales Orders - Status tabs with order details"))
    story.append(b("Order creation: customer, board, quantity, unit price, due date"))
    story.append(b("Line items and payment milestones (Advance / On Delivery / Net 30)"))
    story.append(b("Status: <b>Draft -> Confirmed -> Production -> Shipped -> Delivered</b>"))

    story.append(Paragraph("8.2 BOM Management", styles["Sub"]))
    story.append(img("11_bom.png"))
    story.append(caption("BOM Manager - Component list with category, MSL, pricing"))
    story.append(b("Bill of Materials per board/revision with ref designator, part number, value, package, manufacturer"))
    story.append(b("BOM revision history, alternate parts, where-used cross-reference"))

    story.append(Paragraph("8.3 Purchase Orders & Suppliers", styles["Sub"]))
    story.append(img("13_suppliers.png"))
    story.append(caption("Supplier Management - Scorecard with OTD, quality, certifications"))
    story.append(b("PO workflow: Draft -> Sent -> Confirmed -> Partially Received -> Received"))
    story.append(b("Supplier scorecard: Rating (1-5), On-Time Delivery %, Quality Score %, certifications"))
    story.append(b("Supplier groups: Strategic (Tier 1), Preferred (Tier 2), Approved (Tier 3)"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 9. INVENTORY & ITEM MASTER
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("9. Inventory & Item Master", styles["Sec"]))
    story.append(img("14_inventory.png"))
    story.append(caption("Inventory Dashboard - Stock levels, reorder alerts, valuation"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("9.1 Stock Management", styles["Sub"]))
    story.append(b("KPIs: Total SKUs, Total Value, Low Stock Count, Out of Stock"))
    story.append(b("Stock adjustment with reason tracking (+/- quantity)"))
    story.append(b("Reorder point alerts when stock drops below threshold"))
    story.append(b("Inventory valuation: total value = stock quantity x unit price"))

    story.append(Paragraph("9.2 Item Master", styles["Sub"]))
    story.append(img("15_item_master.png"))
    story.append(caption("Item Master - Categorized catalog with group filter"))
    story.append(b("Hierarchical item groups: ICs (Microcontrollers, Transceivers, Regulators), Passives (Resistors, Capacitors), Connectors, etc."))
    story.append(b("Item fields: part number, description, manufacturer, package, UoM, HSN code, status"))
    story.append(b("Group filter dropdown + text search"))
    story.append(b("<b>Admin action</b>: 'Add Item' to create new catalog entries"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 10. MSL
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("10. MSL Control Module", styles["Sec"]))
    story.append(img("16_msl.png"))
    story.append(caption("MSL Dashboard - Reel tracking with auto-decrement floor life"))
    story.append(Spacer(1, 6))
    story.append(b("Tracks moisture-sensitive components per IPC/JEDEC J-STD-033"))
    story.append(b("MSL Levels: 1 (unlimited), 2 (1 year), 3 (168 hrs), 4 (72 hrs), 5 (48 hrs), 6 (24 hrs)"))
    story.append(b("<b>Auto-decrement</b>: Remaining hours computed dynamically from opened_at timestamp"))
    story.append(b("Status badges: <b>OK</b> (green, >25%), <b>Warning</b> (amber, 10-25%), <b>Critical</b> (red, <10%), <b>Expired</b> (gray, 0%)"))
    story.append(b("Bake cycle: Start bake to reset moisture exposure"))
    story.append(b("Location tracking: SMT Line, Dry Cabinet, Bake Queue"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 11. MANUFACTURING
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("11. Manufacturing Module", styles["Sec"]))
    story.append(img("17_manufacturing.png"))
    story.append(caption("Manufacturing - Production lines, work orders, OEE tracking"))
    story.append(Spacer(1, 6))
    story.append(b("Production lines: SMT Line 1, SMT Line 2, THT Line 1"))
    story.append(b("OEE (Overall Equipment Effectiveness) per line - target 85%+"))
    story.append(b("Work orders: board, customer, quantity, progress %, assigned line"))
    story.append(b("Status workflow: <b>Scheduled -> Active -> Completed</b>"))
    story.append(b("Route steps for process flow definition"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 12. QUALITY
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("12. Quality Module (QMS)", styles["Sec"]))
    story.append(img("18_quality.png"))
    story.append(caption("Quality Dashboard - FPY, DPMO, NCR trends, defect Pareto"))
    story.append(Spacer(1, 6))
    story.append(img("19_quality_ncr.png"))
    story.append(caption("NCR List - Non-conformance tracking with severity and status"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("12.1 NCR Management", styles["Sub"]))
    story.append(b("Defect types: Solder bridge, Missing component, Tombstone, Mechanical, Functional"))
    story.append(b("Severity levels: Minor, Major, Critical"))
    story.append(b("Workflow: <b>Open -> Investigating -> Contained -> Closed</b>"))

    story.append(Paragraph("12.2 CAPA", styles["Sub"]))
    story.append(b("Corrective and Preventive Actions linked to NCRs"))
    story.append(b("Workflow: <b>Open -> In Progress -> Verification -> Closed</b>"))

    story.append(Paragraph("12.3 Quality Metrics", styles["Sub"]))
    story.append(b("First Pass Yield (FPY): target 99%+"))
    story.append(b("DPMO: Defects Per Million Opportunities"))
    story.append(b("Defect Pareto chart showing top defect categories"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 13. NPI & ECO
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("13. Engineering: NPI & ECO", styles["Sec"]))
    story.append(img("20_npi.png"))
    story.append(caption("NPI Pipeline - New Product Introduction stages"))
    story.append(Spacer(1, 6))
    story.append(img("21_eco.png"))
    story.append(caption("ECO Management - Engineering change orders with approval workflow"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("13.1 NPI Pipeline", styles["Sub"]))
    story.append(b("Stages: <b>Feasibility -> Prototype -> Pilot -> Production Ready</b>"))
    story.append(b("Tracks: customer, board, estimated volume, target date, assigned engineer"))

    story.append(Paragraph("13.2 ECO Management", styles["Sub"]))
    story.append(b("Reasons: Quality, Cost Reduction, Customer Request, Design Improvement, Obsolescence"))
    story.append(b("Workflow: <b>Draft -> Pending -> Approved -> Implemented</b>"))
    story.append(b("Impact analysis section and approval tracking"))
    story.append(b("Nested status tabs: All, Pending, In Progress, Closed"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 14. OPERATIONS
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("14. Operations", styles["Sec"]))

    story.append(Paragraph("14.1 Equipment Maintenance", styles["Sub"]))
    story.append(img("23_maintenance.png"))
    story.append(caption("Maintenance Dashboard - Equipment PM schedule and status"))
    story.append(b("Equipment: Reflow Oven, Pick & Place, AOI, SPI, ICT"))
    story.append(b("PM status: <b>OK</b>, <b>Due</b>, <b>Overdue</b> with usage hours"))

    story.append(Paragraph("14.2 Delivery & Shipping", styles["Sub"]))
    story.append(img("24_delivery.png"))
    story.append(caption("Delivery Dashboard - Shipment tracking with carrier details"))
    story.append(b("Shipment tracking: carrier, tracking number, ETA"))
    story.append(b("Status: Preparing -> In Transit -> Delivered"))

    story.append(Paragraph("14.3 RMA Returns", styles["Sub"]))
    story.append(img("25_rma.png"))
    story.append(caption("RMA Dashboard - Customer returns management"))
    story.append(b("Reason codes: Defective, Wrong Item, Damaged, Functional Failure"))
    story.append(b("Workflow: Received -> Inspecting -> Rework/Replace -> Closed"))

    story.append(Paragraph("14.4 Traceability", styles["Sub"]))
    story.append(img("22_traceability.png"))
    story.append(caption("Traceability - Board and component serial tracking"))
    story.append(b("Board-level serial tracking linked to work orders"))
    story.append(b("Component-level reel-to-board placement mapping"))
    story.append(b("Search by board serial, work order, or reel ID"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 15. SETTINGS & ADMIN
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("15. Settings & Admin Guide", styles["Sec"]))
    story.append(img("26_settings.png"))
    story.append(caption("Settings - System configuration and payroll parameters"))
    story.append(Spacer(1, 6))

    story.append(Paragraph("15.1 Role-Based Access Matrix", styles["Sub"]))
    rm = [
        ["Item Groups / Item Master", "Yes", "Yes", "No"],
        ["Supplier Groups", "Yes", "Yes", "No"],
        ["Salary Structure (set/revise)", "Yes", "Yes", "Yes"],
        ["Tax Declarations", "Yes", "Yes", "Yes"],
        ["Holidays (add)", "Yes", "Yes", "Yes"],
        ["Holidays (delete)", "Yes", "Yes", "No"],
        ["Leave Types & Policies", "Yes", "Yes", "Yes"],
        ["Leave Allocation", "Yes", "Yes", "Yes"],
        ["Payroll (create/submit)", "Yes", "Yes", "Yes"],
        ["Payroll (approve)", "Yes", "No", "No"],
        ["System Settings", "Yes", "Yes", "No"],
    ]
    story.append(tbl(["Feature", "Super Admin", "Admin", "HR Manager"], rm, [U*0.35, U*0.22, U*0.22, U*0.21]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("15.2 How to Manage Master Data", styles["Sub"]))
    story.append(b("<b>Add Item Group</b>: Sidebar > Item Master > 'Add Group' button"))
    story.append(b("<b>Add Item</b>: Sidebar > Item Master > 'Add Item' button (select group, enter part number, manufacturer, etc.)"))
    story.append(b("<b>Add Holiday</b>: Sidebar > Holidays > 'Add Holiday' (date, name, type)"))
    story.append(b("<b>Revise Salary</b>: Sidebar > Salary Structure > select employee > 'Set / Revise Salary'"))
    story.append(b("<b>Configure Leave</b>: HR > Leave tab > Admin can add leave types and policies via API"))
    story.append(b("<b>Allocate Leaves</b>: HR > use '/hr/leave-allocate' API to auto-generate balances for year"))
    story.append(b("<b>Payroll Config</b>: Settings > Payroll Configuration (PF rates, ESI ceiling, tax regime, etc.)"))
    story.append(PageBreak())

    # ══════════════════════════════════════════════════════════════════
    # 16. TECHNICAL REFERENCE
    # ══════════════════════════════════════════════════════════════════
    story.append(Paragraph("16. Technical Reference", styles["Sec"]))
    tr = [
        ["Frontend", "https://thinksemi-pcb-erp.netlify.app"],
        ["Backend API", "https://thinksemi-erp-api.onrender.com/api/v1"],
        ["Swagger Docs", "https://thinksemi-erp-api.onrender.com/docs"],
        ["GitHub", "https://github.com/koppulasandeep/thinksemi-erp"],
        ["Frontend Stack", "React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui"],
        ["Backend Stack", "FastAPI + SQLAlchemy 2.0 + PostgreSQL"],
        ["Auth", "JWT (HS256) with bcrypt passwords"],
        ["API Endpoints", "150+ across 18 routers"],
        ["Database", "51 tables, UUID PKs, multi-tenant"],
        ["Tests", "85 backend (pytest) + 42 frontend (vitest)"],
    ]
    story.append(tbl(["Item", "Details"], tr, [U*0.22, U*0.78]))
    story.append(Spacer(1, 20))
    story.append(Paragraph("---", ParagraphStyle("hr", parent=styles["Body"], alignment=TA_CENTER, textColor=GRAY)))
    story.append(Paragraph("End of User Guide | Thinksemi Infotech Ltd | Chennai | April 2026",
                            ParagraphStyle("end", parent=styles["Body"], alignment=TA_CENTER, textColor=GRAY, fontSize=9)))

    doc.build(story)
    print(f"PDF: {doc.filename} ({len(story)} elements)")


if __name__ == "__main__":
    build()
