"""Generate Thinksemi ERP User Guide PDF using ReportLab."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.units import inch, mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether,
)

WIDTH, HEIGHT = A4
CYAN = HexColor("#0891b2")
DARK = HexColor("#1e293b")
GRAY = HexColor("#64748b")
LIGHT_BG = HexColor("#f8fafc")
ACCENT = HexColor("#06b6d4")

styles = getSampleStyleSheet()

# Custom styles
styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontSize=28, textColor=DARK, spaceAfter=6, alignment=TA_CENTER))
styles.add(ParagraphStyle("CoverSub", parent=styles["Normal"], fontSize=14, textColor=GRAY, alignment=TA_CENTER, spaceAfter=4))
styles.add(ParagraphStyle("SectionTitle", parent=styles["Heading1"], fontSize=18, textColor=CYAN, spaceBefore=18, spaceAfter=10, borderWidth=0))
styles.add(ParagraphStyle("SubSection", parent=styles["Heading2"], fontSize=13, textColor=DARK, spaceBefore=12, spaceAfter=6))
styles.add(ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, leading=14, spaceAfter=6, alignment=TA_JUSTIFY))
styles.add(ParagraphStyle("BulletItem", parent=styles["Normal"], fontSize=10, leading=14, leftIndent=20, bulletIndent=8, spaceAfter=3))
styles.add(ParagraphStyle("SmallNote", parent=styles["Normal"], fontSize=8, textColor=GRAY, spaceAfter=4))
styles.add(ParagraphStyle("TOCEntry", parent=styles["Normal"], fontSize=11, leading=18, leftIndent=10))
styles.add(ParagraphStyle("TOCSection", parent=styles["Normal"], fontSize=12, leading=20, leftIndent=0, textColor=CYAN))


def make_table(headers, rows, col_widths=None):
    data = [headers] + rows
    style = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CYAN),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, 0), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e2e8f0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, LIGHT_BG]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(style)
    return t


def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", styles["BulletItem"])


def build():
    doc = SimpleDocTemplate(
        "/Users/sandeepkoppula/Desktop/ERP/pcb-erp/docs/Thinksemi_ERP_User_Guide.pdf",
        pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm,
    )
    story = []
    usable = WIDTH - 40*mm

    # ─── COVER PAGE ───────────────────────────────────────────────────
    story.append(Spacer(1, 80))
    story.append(Paragraph("Thinksemi ERP", styles["CoverTitle"]))
    story.append(Paragraph("PCB Assembly Management System", styles["CoverSub"]))
    story.append(Spacer(1, 20))
    story.append(Paragraph("User Guide v1.0", ParagraphStyle("v", parent=styles["CoverSub"], fontSize=16, textColor=CYAN)))
    story.append(Spacer(1, 40))
    story.append(Paragraph("16 Integrated Modules | 60+ Screens | 150+ API Endpoints", styles["CoverSub"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Thinksemi Infotech Ltd", ParagraphStyle("co", parent=styles["CoverSub"], fontSize=12, textColor=DARK)))
    story.append(Paragraph("SIDCO Industrial Estate, Ambattur, Chennai - 600058", styles["CoverSub"]))
    story.append(Spacer(1, 30))
    story.append(Paragraph("April 2026", styles["CoverSub"]))
    story.append(PageBreak())

    # ─── TABLE OF CONTENTS ────────────────────────────────────────────
    story.append(Paragraph("Table of Contents", styles["SectionTitle"]))
    toc_items = [
        ("1", "Getting Started"),
        ("2", "Dashboard"),
        ("3", "HR & Payroll Module"),
        ("4", "Sales CRM Module"),
        ("5", "Finance Module"),
        ("6", "Supply Chain Module"),
        ("7", "Inventory & Item Master"),
        ("8", "MSL Control Module"),
        ("9", "Manufacturing Module"),
        ("10", "Quality Module (QMS)"),
        ("11", "Engineering: NPI & ECO"),
        ("12", "Operations: Maintenance, Delivery, RMA"),
        ("13", "Traceability"),
        ("14", "Settings & Administration"),
        ("15", "Admin & Super Admin Guide"),
        ("16", "Technical Reference"),
    ]
    for num, title in toc_items:
        story.append(Paragraph(f"<b>{num}.</b>  {title}", styles["TOCEntry"]))
    story.append(PageBreak())

    # ─── 1. GETTING STARTED ───────────────────────────────────────────
    story.append(Paragraph("1. Getting Started", styles["SectionTitle"]))

    story.append(Paragraph("System Access", styles["SubSection"]))
    story.append(Paragraph("The Thinksemi ERP is accessible via web browser at:", styles["Body"]))
    story.append(Paragraph("<b>https://thinksemi-pcb-erp.netlify.app</b>", styles["Body"]))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Login Credentials", styles["SubSection"]))
    story.append(Paragraph("The following accounts are available for demo and testing:", styles["Body"]))
    creds = [
        ["superadmin@thinksemi.com", "ThinkSemi@ERP2026!", "Super Admin", "Full system access"],
        ["admin@thinksemi.com", "ThinkSemi@ERP2026!", "Admin", "Factory management"],
        ["hr@thinksemi.com", "ThinkSemi@ERP2026!", "HR Manager", "HR, payroll, leave"],
        ["finance@thinksemi.com", "ThinkSemi@ERP2026!", "Finance Manager", "Finance, invoicing"],
        ["engineering@thinksemi.com", "ThinkSemi@ERP2026!", "Engineering Mgr", "NPI, ECO, BOM"],
        ["production@thinksemi.com", "ThinkSemi@ERP2026!", "Production Mgr", "Manufacturing, quality"],
        ["scm@thinksemi.com", "ThinkSemi@ERP2026!", "SCM Manager", "Supply chain, inventory"],
        ["sales@thinksemi.com", "ThinkSemi@ERP2026!", "Sales / CRM", "CRM, sales orders"],
        ["quality@thinksemi.com", "ThinkSemi@ERP2026!", "Quality Engineer", "Quality, traceability"],
        ["operator@thinksemi.com", "ThinkSemi@ERP2026!", "Operator", "Manufacturing, quality"],
        ["customer@bosch.com", "Bosch@Portal2026!", "Customer Portal", "Order tracking only"],
    ]
    story.append(make_table(["Email", "Password", "Role", "Access"], creds, [usable*0.30, usable*0.22, usable*0.18, usable*0.30]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Navigation", styles["SubSection"]))
    story.append(bullet("Left sidebar with module groups (People, Sales, Finance, Engineering, Supply Chain, etc.)"))
    story.append(bullet("Dark mode toggle in the top header bar"))
    story.append(bullet("Notification bell with system alerts"))
    story.append(bullet("User menu with role display and sign-out"))
    story.append(bullet("Mobile hamburger menu for small screens"))
    story.append(bullet("Global search bar (Cmd+K)"))

    story.append(Paragraph("Role-Based Access", styles["SubSection"]))
    story.append(Paragraph("Each role sees only the modules relevant to their function. Super Admin and Admin see all 16 modules. Operators see Manufacturing, Quality, and HR only. Customer Portal users see only their order status.", styles["Body"]))
    story.append(PageBreak())

    # ─── 2. DASHBOARD ─────────────────────────────────────────────────
    story.append(Paragraph("2. Dashboard", styles["SectionTitle"]))
    story.append(Paragraph("The main dashboard provides a real-time overview of factory operations:", styles["Body"]))
    story.append(Paragraph("Key Performance Indicators (KPIs)", styles["SubSection"]))
    kpis = [
        ["Revenue", "Monthly revenue in INR with trend indicator"],
        ["Active Orders", "Count of orders in production/confirmed status"],
        ["On-Time Delivery", "Percentage of orders delivered by due date"],
        ["OEE", "Overall Equipment Effectiveness of production lines"],
        ["First Pass Yield", "Percentage of boards passing quality on first attempt"],
        ["DPMO", "Defects Per Million Opportunities"],
    ]
    story.append(make_table(["KPI", "Description"], kpis, [usable*0.25, usable*0.75]))
    story.append(Spacer(1, 6))
    story.append(bullet("Production line status cards showing SMT Line 1, SMT Line 2, THT Line 1"))
    story.append(bullet("System alerts for equipment maintenance, low stock, and pending approvals"))
    story.append(bullet("Recent activity feed showing latest actions across all modules"))
    story.append(PageBreak())

    # ─── 3. HR & PAYROLL ──────────────────────────────────────────────
    story.append(Paragraph("3. HR & Payroll Module", styles["SectionTitle"]))
    story.append(Paragraph("Comprehensive human resources management with Indian payroll compliance.", styles["Body"]))

    story.append(Paragraph("3.1 Employee Directory", styles["SubSection"]))
    story.append(Paragraph("Manage 10+ employees across departments: Management, Operations, HR, Finance, Engineering, Production, Supply Chain, Sales, Quality. Each employee record includes emp_code, name, email, phone, department, designation, shift, date of joining, PAN, UAN, bank details.", styles["Body"]))

    story.append(Paragraph("3.2 Attendance Tracking", styles["SubSection"]))
    story.append(Paragraph("Daily attendance with the following status codes:", styles["Body"]))
    att_codes = [["P", "Present"], ["A", "Absent"], ["L", "Leave"], ["WO", "Week Off"], ["H", "Holiday"], ["CO", "Compensatory Off"], ["OT", "Overtime"]]
    story.append(make_table(["Code", "Meaning"], att_codes, [usable*0.15, usable*0.85]))
    story.append(Spacer(1, 4))
    story.append(bullet("Biometric in/out timestamps supported"))
    story.append(bullet("Overtime hours tracked per day"))

    story.append(Paragraph("3.3 Leave Management", styles["SubSection"]))
    story.append(Paragraph("Seven leave types with configurable policies:", styles["Body"]))
    leave_types = [
        ["EL", "Earned Leave", "15 days/year", "Yes (max 30)"],
        ["CL", "Casual Leave", "8 days/year", "No"],
        ["SL", "Sick Leave", "10 days/year", "Yes (max 20)"],
        ["ML", "Maternity Leave", "182 days", "No"],
        ["PL", "Paternity Leave", "15 days", "No"],
        ["CO", "Compensatory Off", "5 days", "No"],
        ["LOP", "Loss of Pay", "Unlimited", "N/A"],
    ]
    story.append(make_table(["Code", "Type", "Entitlement", "Carry Forward"], leave_types, [usable*0.10, usable*0.25, usable*0.25, usable*0.40]))
    story.append(Spacer(1, 4))
    story.append(bullet("Leave workflow: Draft -> Pending -> Approved/Rejected"))
    story.append(bullet("Auto-deduction from balance on approval"))
    story.append(bullet("Admin can bulk-allocate leave balances from policies"))

    story.append(Paragraph("3.4 Holiday Calendar", styles["SubSection"]))
    story.append(Paragraph("Pre-configured with Indian national and Tamil Nadu state holidays for 2026. Holiday types: National, State, Optional, Company. Admins can add/delete holidays through the UI.", styles["Body"]))

    story.append(Paragraph("3.5 Salary Structure", styles["SubSection"]))
    story.append(Paragraph("Per-employee CTC breakdown with revision history:", styles["Body"]))
    sal_breakdown = [
        ["Basic", "40% of Annual CTC"],
        ["HRA", "50% of Basic"],
        ["Special Allowance", "CTC - Basic - HRA - Conv - Medical"],
        ["Conveyance", "INR 19,200/year (fixed)"],
        ["Medical", "INR 15,000/year (fixed)"],
    ]
    story.append(make_table(["Component", "Calculation"], sal_breakdown, [usable*0.30, usable*0.70]))
    story.append(Spacer(1, 4))
    story.append(bullet("Salary revision creates new record; previous marked as 'revised'"))
    story.append(bullet("Effective date tracking for audit trail"))
    story.append(PageBreak())

    story.append(Paragraph("3.6 TDS / Income Tax Computation", styles["SubSection"]))
    story.append(Paragraph("Full Indian income tax calculation for FY 2025-26:", styles["Body"]))
    story.append(Paragraph("<b>New Tax Regime</b>", styles["Body"]))
    new_slabs = [
        ["Up to 4,00,000", "Nil"], ["4,00,001 - 8,00,000", "5%"],
        ["8,00,001 - 12,00,000", "10%"], ["12,00,001 - 16,00,000", "15%"],
        ["16,00,001 - 20,00,000", "20%"], ["20,00,001 - 24,00,000", "25%"],
        ["Above 24,00,000", "30%"],
    ]
    story.append(make_table(["Taxable Income (INR)", "Rate"], new_slabs, [usable*0.50, usable*0.50]))
    story.append(Spacer(1, 4))
    story.append(bullet("Standard Deduction: INR 75,000"))
    story.append(bullet("Rebate u/s 87A: No tax if taxable income <= INR 12,75,000"))
    story.append(bullet("4% Health & Education Cess on tax amount"))

    story.append(Paragraph("<b>Old Tax Regime</b>", styles["Body"]))
    old_slabs = [
        ["Up to 3,00,000", "Nil"], ["3,00,001 - 7,00,000", "5%"],
        ["7,00,001 - 10,00,000", "10%"], ["10,00,001 - 12,00,000", "15%"],
        ["12,00,001 - 15,00,000", "20%"], ["Above 15,00,000", "30%"],
    ]
    story.append(make_table(["Taxable Income (INR)", "Rate"], old_slabs, [usable*0.50, usable*0.50]))
    story.append(Spacer(1, 4))
    story.append(bullet("Standard Deduction: INR 50,000"))
    story.append(bullet("Section 80C: Up to INR 1,50,000 (PPF, ELSS, LIC, etc.)"))
    story.append(bullet("Section 80D: Up to INR 25,000 (Medical Insurance)"))
    story.append(bullet("HRA Exemption and Home Loan Interest deductions"))
    story.append(bullet("Regime comparison tool recommends the better option per employee"))

    story.append(Paragraph("3.7 Payroll Processing", styles["SubSection"]))
    story.append(Paragraph("Workflow: Draft -> Submitted -> Under Review -> Approved -> Payment Initiated -> Paid", styles["Body"]))
    story.append(bullet("Payroll batch created per month/year"))
    story.append(bullet("Auto-computes: Basic, HRA, allowances from salary structure"))
    story.append(bullet("Statutory deductions: PF (12% capped at 15K), ESI (0.75%/3.25%), Professional Tax"))
    story.append(bullet("TDS computed per employee based on regime and declarations"))
    story.append(bullet("Overtime: OT hours x (Basic/26/8) x 1.5 multiplier"))
    story.append(bullet("Payslip detail view per employee per batch"))
    story.append(PageBreak())

    # ─── 4. SALES CRM ─────────────────────────────────────────────────
    story.append(Paragraph("4. Sales CRM Module", styles["SectionTitle"]))
    story.append(Paragraph("Pipeline management for PCB assembly sales.", styles["Body"]))
    story.append(Paragraph("Lead Pipeline Stages", styles["SubSection"]))
    stages = [["New Lead", "Initial inquiry"], ["Qualified", "Budget/authority confirmed"], ["Quoted", "Quotation sent"], ["Negotiation", "Terms discussion"], ["Won", "Order confirmed"], ["Lost", "Deal lost"]]
    story.append(make_table(["Stage", "Description"], stages, [usable*0.25, usable*0.75]))
    story.append(Spacer(1, 4))
    story.append(bullet("Drag-and-drop Kanban pipeline board"))
    story.append(bullet("Contact management with company linkage"))
    story.append(bullet("Quotation generation with cost breakdown: bare PCB, components, SMT, THT, testing, stencil + 18% GST"))
    story.append(bullet("Activity tracking: calls, emails, meetings"))
    story.append(PageBreak())

    # ─── 5. FINANCE ───────────────────────────────────────────────────
    story.append(Paragraph("5. Finance Module", styles["SectionTitle"]))
    story.append(bullet("Customer invoices with INR formatting, GST computation, aging (0-30, 30-60, 60-90, 90+ days)"))
    story.append(bullet("Vendor bills tracking with payment status"))
    story.append(bullet("Cash flow overview: total receivables vs payables"))
    story.append(bullet("Payroll batch approval workflow"))
    story.append(bullet("Statutory reports: Form 24Q, ECR, Form 16, PF Annual Return"))
    story.append(PageBreak())

    # ─── 6. SUPPLY CHAIN ──────────────────────────────────────────────
    story.append(Paragraph("6. Supply Chain Module", styles["SectionTitle"]))
    story.append(Paragraph("6.1 Sales Orders", styles["SubSection"]))
    story.append(bullet("Order creation with customer, board, quantity, unit price"))
    story.append(bullet("Line items and payment milestones (Advance / On Delivery / Net 30)"))
    story.append(bullet("Status tracking: Draft -> Confirmed -> Production -> Shipped -> Delivered"))
    story.append(bullet("Delivery schedule batches per order"))

    story.append(Paragraph("6.2 BOM Management", styles["SubSection"]))
    story.append(bullet("Bill of Materials per board with revision control"))
    story.append(bullet("Component details: ref designator, part number, value, package, manufacturer"))
    story.append(bullet("BOM revision history with cost tracking"))
    story.append(bullet("Alternate parts management"))
    story.append(bullet("Where-used cross-reference"))

    story.append(Paragraph("6.3 Purchase Orders", styles["SubSection"]))
    story.append(bullet("PO creation linked to supplier"))
    story.append(bullet("Line items with part numbers and pricing"))
    story.append(bullet("Status: Draft -> Sent -> Confirmed -> Partially Received -> Received"))

    story.append(Paragraph("6.4 Supplier Management", styles["SubSection"]))
    story.append(bullet("Supplier directory with categories: Components, PCB, Packaging"))
    story.append(bullet("Supplier groups: Strategic (Tier 1), Preferred (Tier 2), Approved (Tier 3)"))
    story.append(bullet("Scorecard: Rating (1-5), On-Time Delivery %, Quality Score %, Price Competitiveness %, Responsiveness %"))
    story.append(bullet("Certifications tracking (ISO 9001, AS9120, etc.)"))
    story.append(PageBreak())

    # ─── 7. INVENTORY ─────────────────────────────────────────────────
    story.append(Paragraph("7. Inventory & Item Master", styles["SectionTitle"]))
    story.append(Paragraph("7.1 Stock Management", styles["SubSection"]))
    story.append(bullet("Stock quantity, reel count, location tracking per part"))
    story.append(bullet("Reorder point alerts for low stock"))
    story.append(bullet("Stock adjustment with reason tracking"))
    story.append(bullet("Inventory valuation: total value = stock x unit price per item"))

    story.append(Paragraph("7.2 Item Master", styles["SubSection"]))
    story.append(Paragraph("Centralized item catalog with categorization:", styles["Body"]))
    ig = [["ICs", "Microcontrollers, Transceivers, Regulators, Memory"], ["Passives", "Resistors, Capacitors, Crystals"], ["Connectors", "Board-to-board, wire-to-board"], ["Mechanicals", "Heatsinks, enclosures, screws"], ["PCB", "Bare PCBs and substrates"], ["Packaging", "ESD bags, trays, boxes"]]
    story.append(make_table(["Group", "Sub-groups"], ig, [usable*0.25, usable*0.75]))
    story.append(Spacer(1, 4))
    story.append(bullet("Fields: part number, description, manufacturer, package, UoM, HSN code, status"))
    story.append(bullet("Admin/Super-Admin can create and manage items and groups"))
    story.append(PageBreak())

    # ─── 8. MSL CONTROL ───────────────────────────────────────────────
    story.append(Paragraph("8. MSL Control Module", styles["SectionTitle"]))
    story.append(Paragraph("Moisture Sensitivity Level tracking per IPC/JEDEC J-STD-033.", styles["Body"]))
    msl_levels = [["MSL 1", "Unlimited floor life"], ["MSL 2", "1 year"], ["MSL 3", "168 hours (7 days)"], ["MSL 4", "72 hours (3 days)"], ["MSL 5", "48 hours (2 days)"], ["MSL 6", "24 hours"]]
    story.append(make_table(["Level", "Floor Life"], msl_levels, [usable*0.20, usable*0.80]))
    story.append(Spacer(1, 4))
    story.append(bullet("Auto-decrement: remaining hours computed dynamically from opened_at timestamp"))
    story.append(bullet("Status thresholds: OK (>25%), Warning (10-25%), Critical (<10%), Expired (0%)"))
    story.append(bullet("Bake cycle management to reset moisture exposure"))
    story.append(bullet("Reel-level tracking with location"))
    story.append(PageBreak())

    # ─── 9. MANUFACTURING ─────────────────────────────────────────────
    story.append(Paragraph("9. Manufacturing Module", styles["SectionTitle"]))
    story.append(bullet("Production lines: SMT Line 1, SMT Line 2, THT Line 1"))
    story.append(bullet("OEE tracking per line (target: 85%+)"))
    story.append(bullet("Work orders with board, quantity, customer, progress %"))
    story.append(bullet("Status: Scheduled -> Active -> Completed"))
    story.append(bullet("Route steps for process flow"))
    story.append(PageBreak())

    # ─── 10. QUALITY ──────────────────────────────────────────────────
    story.append(Paragraph("10. Quality Module (QMS)", styles["SectionTitle"]))
    story.append(Paragraph("10.1 NCR Management", styles["SubSection"]))
    story.append(Paragraph("Non-Conformance Reports for tracking defects:", styles["Body"]))
    story.append(bullet("Defect types: Solder bridge, Missing component, Tombstone, Mechanical, Functional"))
    story.append(bullet("Severity: Minor, Major, Critical"))
    story.append(bullet("Status workflow: Open -> Investigating -> Contained -> Closed"))
    story.append(bullet("Quantity affected tracking"))

    story.append(Paragraph("10.2 CAPA", styles["SubSection"]))
    story.append(bullet("Corrective and Preventive Actions linked to NCRs"))
    story.append(bullet("Status: Open -> In Progress -> Verification -> Closed"))

    story.append(Paragraph("10.3 Quality Metrics", styles["SubSection"]))
    story.append(bullet("First Pass Yield (FPY): target 99%+"))
    story.append(bullet("DPMO: Defects Per Million Opportunities"))
    story.append(bullet("Open NCR count and aging"))
    story.append(PageBreak())

    # ─── 11. ENGINEERING ──────────────────────────────────────────────
    story.append(Paragraph("11. Engineering: NPI & ECO", styles["SectionTitle"]))
    story.append(Paragraph("11.1 NPI Pipeline", styles["SubSection"]))
    story.append(Paragraph("New Product Introduction tracking from concept to production:", styles["Body"]))
    npi_stages = [["Feasibility", "Initial assessment"], ["Prototype", "First article build"], ["Pilot", "Small batch validation"], ["Production Ready", "Ready for volume production"]]
    story.append(make_table(["Stage", "Description"], npi_stages, [usable*0.25, usable*0.75]))

    story.append(Paragraph("11.2 ECO Management", styles["SubSection"]))
    story.append(Paragraph("Engineering Change Orders for controlled modifications:", styles["Body"]))
    story.append(bullet("Reasons: Quality, Cost Reduction, Customer Request, Design Improvement, Obsolescence"))
    story.append(bullet("Workflow: Draft -> Pending -> Approved -> Implemented"))
    story.append(bullet("Impact analysis and approval tracking"))
    story.append(PageBreak())

    # ─── 12. OPERATIONS ───────────────────────────────────────────────
    story.append(Paragraph("12. Operations", styles["SectionTitle"]))
    story.append(Paragraph("12.1 Equipment Maintenance (TPM)", styles["SubSection"]))
    story.append(bullet("Equipment registry: Reflow Oven, Pick & Place, AOI, SPI, ICT"))
    story.append(bullet("PM schedule tracking: OK, Due, Overdue status"))
    story.append(bullet("Usage hours monitoring"))

    story.append(Paragraph("12.2 Delivery & Shipping", styles["SubSection"]))
    story.append(bullet("Shipment tracking with carrier and tracking number"))
    story.append(bullet("Status: Preparing -> In Transit -> Delivered"))
    story.append(bullet("Board count per shipment"))

    story.append(Paragraph("12.3 RMA Returns", styles["SubSection"]))
    story.append(bullet("Return Material Authorization for customer returns"))
    story.append(bullet("Reason codes: Defective, Wrong Item, Damaged in Transit, Functional Failure"))
    story.append(bullet("Status: Received -> Inspecting -> Rework/Replace -> Closed"))
    story.append(PageBreak())

    # ─── 13. TRACEABILITY ─────────────────────────────────────────────
    story.append(Paragraph("13. Traceability", styles["SectionTitle"]))
    story.append(bullet("Board-level serial number tracking linked to work orders"))
    story.append(bullet("Component-level placement tracking (reel-to-board mapping)"))
    story.append(bullet("Full forward and backward traceability"))
    story.append(bullet("Search by board serial, work order, or component reel"))
    story.append(PageBreak())

    # ─── 14. SETTINGS ─────────────────────────────────────────────────
    story.append(Paragraph("14. Settings & Administration", styles["SectionTitle"]))
    story.append(Paragraph("14.1 System Settings", styles["SubSection"]))
    story.append(bullet("Company information: name, address, GSTIN, PAN, CIN"))
    story.append(bullet("Currency and GST rate configuration"))

    story.append(Paragraph("14.2 Payroll Configuration", styles["SubSection"]))
    payroll_config = [
        ["PF Rate", "12% (employee + employer)"],
        ["PF Ceiling", "INR 15,000/month"],
        ["ESI Employee Rate", "0.75%"],
        ["ESI Employer Rate", "3.25%"],
        ["ESI Ceiling", "INR 21,000/month gross"],
        ["Professional Tax", "INR 200/month (Tamil Nadu)"],
        ["Tax Regime", "New (default) or Old"],
        ["Basic %", "40% of CTC"],
        ["HRA %", "50% of Basic"],
    ]
    story.append(make_table(["Setting", "Default Value"], payroll_config, [usable*0.35, usable*0.65]))
    story.append(PageBreak())

    # ─── 15. ADMIN GUIDE ──────────────────────────────────────────────
    story.append(Paragraph("15. Admin & Super Admin Guide", styles["SectionTitle"]))
    story.append(Paragraph("Master data management is restricted by role:", styles["Body"]))

    role_matrix = [
        ["Item Groups", "Yes", "Yes", "No"],
        ["Item Master", "Yes", "Yes", "No"],
        ["Supplier Groups", "Yes", "Yes", "No"],
        ["Salary Structure", "Yes", "Yes", "Yes"],
        ["Tax Declarations", "Yes", "Yes", "Yes"],
        ["Holidays", "Yes", "Yes (add)", "Yes (add)"],
        ["Holiday Delete", "Yes", "Yes", "No"],
        ["Leave Types", "Yes", "Yes", "Yes"],
        ["Leave Policies", "Yes", "Yes", "Yes"],
        ["Leave Allocation", "Yes", "Yes", "Yes"],
        ["Payroll Create", "Yes", "Yes", "Yes"],
        ["Payroll Approve", "Yes", "No", "No"],
        ["System Settings", "Yes", "Yes", "No"],
    ]
    story.append(make_table(["Feature", "Super Admin", "Admin", "HR Manager"], role_matrix, [usable*0.30, usable*0.23, usable*0.23, usable*0.24]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("How to Manage Master Data", styles["SubSection"]))
    story.append(bullet("<b>Add Item Group:</b> Navigate to Item Master > click 'Add Group' button"))
    story.append(bullet("<b>Add Holiday:</b> Navigate to HR > Holidays tab > click 'Add Holiday'"))
    story.append(bullet("<b>Revise Salary:</b> Navigate to HR > Salary tab > select employee > click 'Set/Revise Salary'"))
    story.append(bullet("<b>Configure Leave:</b> Navigate to HR > Leave tab > admin can add leave types and policies"))
    story.append(bullet("<b>Allocate Leaves:</b> Navigate to HR > use 'Allocate Leaves' to auto-generate balances for all employees from policies"))
    story.append(PageBreak())

    # ─── 16. TECHNICAL REFERENCE ──────────────────────────────────────
    story.append(Paragraph("16. Technical Reference", styles["SectionTitle"]))
    tech_ref = [
        ["Frontend URL", "https://thinksemi-pcb-erp.netlify.app"],
        ["Backend API", "https://thinksemi-erp-api.onrender.com/api/v1"],
        ["Swagger Docs", "https://thinksemi-erp-api.onrender.com/docs"],
        ["GitHub Repo", "https://github.com/koppulasandeep/thinksemi-erp"],
        ["Frontend Stack", "React 19 + TypeScript + Vite + Tailwind CSS"],
        ["Backend Stack", "FastAPI + SQLAlchemy 2.0 + PostgreSQL"],
        ["Auth", "JWT (HS256) with bcrypt password hashing"],
        ["API Endpoints", "150+ across 18 routers"],
        ["Database Tables", "51 tables with UUID PKs"],
        ["Unit Tests", "85 backend (pytest) + 42 frontend (vitest)"],
    ]
    story.append(make_table(["Item", "Details"], tech_ref, [usable*0.25, usable*0.75]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("API Authentication", styles["SubSection"]))
    story.append(Paragraph("All API requests (except /health and /auth/login) require a JWT Bearer token in the Authorization header. Tokens are obtained via POST /api/v1/auth/login/json with email and password.", styles["Body"]))

    story.append(Spacer(1, 20))
    story.append(Paragraph("---", ParagraphStyle("hr", parent=styles["Body"], alignment=TA_CENTER, textColor=GRAY)))
    story.append(Paragraph("End of User Guide", ParagraphStyle("end", parent=styles["Body"], alignment=TA_CENTER, textColor=GRAY, fontSize=10)))
    story.append(Paragraph("Thinksemi Infotech Ltd | Chennai | April 2026", ParagraphStyle("footer", parent=styles["SmallNote"], alignment=TA_CENTER)))

    doc.build(story)
    print(f"PDF generated: {doc.filename}")


if __name__ == "__main__":
    build()
