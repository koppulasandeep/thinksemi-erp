"""Seed comprehensive demo data for Thinksemi PCB Assembly ERP."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import *  # noqa
from app.models.item_master import ItemGroup, ItemMaster, SupplierGroup
from app.models.salary import SalaryStructure, TaxDeclaration
from app.models.holiday import Holiday, LeaveType, LeavePolicy

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TENANT_DATA = {
    "name": "Thinksemi Infotech Ltd",
    "slug": "thinksemi",
    "currency": "INR",
    "gst_rate": 18.0,
    "address": "Plot No. 7, SIDCO Industrial Estate, Ambattur, Chennai - 600058",
    "phone": "+91-44-2625-XXXX",
    "email": "info@thinksemiinfotech.com",
    "website": "www.thinksemiinfotech.com",
    "gstin": "33AABCT1234A1Z5",
    "pan": "AABCT1234A",
    "cin": "U31909TN2015PLC123456",
}

USERS = [
    {"email": "superadmin@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Sandeep K", "role": "super_admin", "designation": "CEO / Super Admin"},
    {"email": "admin@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Rajesh Venkat", "role": "admin", "designation": "Factory Manager"},
    {"email": "hr@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Lakshmi Venkat", "role": "hr_manager", "designation": "HR Manager"},
    {"email": "finance@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Deepa Krishnan", "role": "finance_manager", "designation": "Finance Manager"},
    {"email": "engineering@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Arun Krishnan", "role": "engineering_manager", "designation": "Engineering Manager"},
    {"email": "production@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Karthik Raja", "role": "production_manager", "designation": "Production Manager"},
    {"email": "scm@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Mohan Rajan", "role": "scm_manager", "designation": "Supply Chain Manager"},
    {"email": "sales@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Suresh Babu", "role": "sales_crm", "designation": "Sales Manager"},
    {"email": "quality@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Priya Sharma", "role": "quality_engineer", "designation": "Quality Manager"},
    {"email": "operator@thinksemi.com", "password": "ThinkSemi@ERP2026!", "full_name": "Ravi Kumar", "role": "operator", "designation": "SMT Operator"},
    {"email": "customer@bosch.com", "password": "Bosch@Portal2026!", "full_name": "Rahul Menon", "role": "customer", "designation": "Bosch India - Procurement"},
]


def seed():
    db: Session = SessionLocal()
    try:
        existing = db.query(Tenant).filter(Tenant.slug == "thinksemi").first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        # --- Tenant + Users ---
        tenant = Tenant(**TENANT_DATA)
        db.add(tenant)
        db.flush()
        tid = tenant.id
        print(f"Created tenant: {tenant.name} (id={tid})")

        for u in USERS:
            db.add(User(tenant_id=tid, email=u["email"], password_hash=pwd_context.hash(u["password"]),
                        full_name=u["full_name"], role=u["role"], designation=u["designation"]))
            print(f"  Created user: {u['email']} ({u['role']})")
        db.flush()

        db.add(PayrollConfig(tenant_id=tid))
        today = date.today()

        # --- Employees ---
        user_objs = db.query(User).filter(User.tenant_id == tid).all()
        user_map = {u.email: u for u in user_objs}
        emp_data = [
            {"emp_code": "EMP-001", "name": "Sandeep K", "email": "superadmin@thinksemi.com", "phone": "+91-9000000001", "department": "Management", "designation": "CEO / Super Admin", "shift": "general", "date_of_joining": date(2020, 1, 15), "date_of_birth": date(1988, 5, 10), "pan": "ABCPK1234A", "uan": "100100001234", "bank_account": "1234567890", "bank_ifsc": "ICIC0001234", "bank_name": "ICICI Bank"},
            {"emp_code": "EMP-002", "name": "Rajesh Venkat", "email": "admin@thinksemi.com", "phone": "+91-9000000002", "department": "Operations", "designation": "Factory Manager", "shift": "general", "date_of_joining": date(2020, 3, 1), "date_of_birth": date(1985, 8, 22), "pan": "ABCPR2345B", "uan": "100100002345", "bank_account": "2345678901", "bank_ifsc": "SBIN0005678", "bank_name": "SBI"},
            {"emp_code": "EMP-003", "name": "Lakshmi Venkat", "email": "hr@thinksemi.com", "phone": "+91-9000000003", "department": "HR", "designation": "HR Manager", "shift": "general", "date_of_joining": date(2021, 6, 15), "date_of_birth": date(1990, 3, 14), "pan": "ABCPL3456C", "uan": "100100003456", "bank_account": "3456789012", "bank_ifsc": "HDFC0006789", "bank_name": "HDFC Bank"},
            {"emp_code": "EMP-004", "name": "Deepa Krishnan", "email": "finance@thinksemi.com", "phone": "+91-9000000004", "department": "Finance", "designation": "Finance Manager", "shift": "general", "date_of_joining": date(2021, 8, 1), "date_of_birth": date(1987, 11, 30), "pan": "ABCPD4567D", "uan": "100100004567", "bank_account": "4567890123", "bank_ifsc": "ICIC0002345", "bank_name": "ICICI Bank"},
            {"emp_code": "EMP-005", "name": "Arun Krishnan", "email": "engineering@thinksemi.com", "phone": "+91-9000000005", "department": "Engineering", "designation": "Engineering Manager", "shift": "general", "date_of_joining": date(2020, 5, 10), "date_of_birth": date(1986, 7, 5), "pan": "ABCPA5678E", "uan": "100100005678", "bank_account": "5678901234", "bank_ifsc": "SBIN0007890", "bank_name": "SBI"},
            {"emp_code": "EMP-006", "name": "Karthik Raja", "email": "production@thinksemi.com", "phone": "+91-9000000006", "department": "Production", "designation": "Production Manager", "shift": "shift_a", "date_of_joining": date(2022, 1, 10), "date_of_birth": date(1992, 2, 18), "pan": "ABCPK6789F", "uan": "100100006789", "bank_account": "6789012345", "bank_ifsc": "HDFC0008901", "bank_name": "HDFC Bank"},
            {"emp_code": "EMP-007", "name": "Mohan Rajan", "email": "scm@thinksemi.com", "phone": "+91-9000000007", "department": "Supply Chain", "designation": "Supply Chain Manager", "shift": "general", "date_of_joining": date(2022, 3, 15), "date_of_birth": date(1991, 9, 25), "pan": "ABCPM7890G", "uan": "100100007890", "bank_account": "7890123456", "bank_ifsc": "AXIS0001234", "bank_name": "Axis Bank"},
            {"emp_code": "EMP-008", "name": "Suresh Babu", "email": "sales@thinksemi.com", "phone": "+91-9000000008", "department": "Sales", "designation": "Sales Manager", "shift": "general", "date_of_joining": date(2023, 2, 1), "date_of_birth": date(1989, 12, 8), "pan": "ABCPS8901H", "uan": "100100008901", "bank_account": "8901234567", "bank_ifsc": "SBIN0009012", "bank_name": "SBI"},
            {"emp_code": "EMP-009", "name": "Priya Sharma", "email": "quality@thinksemi.com", "phone": "+91-9000000009", "department": "Quality", "designation": "Quality Manager", "shift": "general", "date_of_joining": date(2023, 4, 15), "date_of_birth": date(1993, 6, 20), "pan": "ABCPP9012J", "uan": "100100009012", "bank_account": "9012345678", "bank_ifsc": "ICIC0003456", "bank_name": "ICICI Bank"},
            {"emp_code": "EMP-010", "name": "Ravi Kumar", "email": "operator@thinksemi.com", "phone": "+91-9000000010", "department": "Production", "designation": "SMT Operator", "shift": "shift_a", "date_of_joining": date(2024, 1, 5), "date_of_birth": date(1995, 4, 12), "pan": "ABCPR0123K", "uan": "100100010123", "bank_account": "0123456789", "bank_ifsc": "HDFC0001234", "bank_name": "HDFC Bank"},
        ]
        employees = []
        for ed in emp_data:
            user = user_map.get(ed["email"])
            emp = Employee(tenant_id=tid, user_id=user.id if user else None, **ed)
            db.add(emp)
            employees.append(emp)
        db.flush()

        # --- Attendance (last 7 working days) ---
        for emp in employees:
            for days_back in range(1, 8):
                d = today - timedelta(days=days_back)
                if d.weekday() >= 5:
                    continue  # skip weekends
                status = "P" if days_back != 3 else ("A" if emp.emp_code == "EMP-010" else "P")
                db.add(Attendance(
                    tenant_id=tid, employee_id=emp.id, date=d,
                    status=status, shift_hours=8.0 if status == "P" else 0,
                    overtime_hours=1.5 if emp.department == "Production" and status == "P" else 0,
                ))

        # --- Leave Balances (2026) ---
        for emp in employees:
            for lt, entitled, used in [("EL", 15, 3), ("CL", 8, 2), ("SL", 10, 1), ("CO", 5, 0)]:
                db.add(LeaveBalance(
                    tenant_id=tid, employee_id=emp.id, leave_type=lt,
                    entitled=entitled, used=used, balance=entitled - used, year=2026,
                ))

        # --- Leave Requests ---
        leave_requests = [
            {"employee_idx": 9, "leave_type": "CL", "from_date": today + timedelta(days=5), "to_date": today + timedelta(days=6), "days": 2, "reason": "Personal work", "status": "pending"},
            {"employee_idx": 5, "leave_type": "EL", "from_date": today + timedelta(days=10), "to_date": today + timedelta(days=14), "days": 5, "reason": "Family vacation", "status": "approved"},
            {"employee_idx": 3, "leave_type": "SL", "from_date": today - timedelta(days=3), "to_date": today - timedelta(days=2), "days": 2, "reason": "Unwell", "status": "approved"},
        ]
        for lr in leave_requests:
            idx = lr.pop("employee_idx")
            db.add(LeaveRequest(tenant_id=tid, employee_id=employees[idx].id, **lr))

        # --- Payroll Batch (March 2026) ---
        batch = PayrollBatch(
            tenant_id=tid, ref_number="PAY-2026-03", month=3, year=2026,
            total_employees=10, total_gross=850000, total_deductions=127500,
            total_net=722500, total_employer_pf=51000, total_employer_esi=28050,
            status="approved",
        )
        db.add(batch)
        db.flush()
        for emp in employees:
            basic = 45000 if "Manager" in (emp.designation or "") else 25000
            hra = basic * 0.4
            special = basic * 0.2
            gross = basic + hra + special + 1600 + 1250
            pf_emp = min(basic * 0.12, 1800)
            esi_emp = gross * 0.0075 if gross <= 21000 else 0
            pt = 200
            tds = gross * 0.1 if gross > 30000 else 0
            deductions = pf_emp + esi_emp + pt + tds
            db.add(PayrollEmployee(
                tenant_id=tid, batch_id=batch.id, employee_id=emp.id,
                basic=basic, hra=hra, special_allowance=special, conveyance=1600, medical=1250,
                gross=gross, pf_employee=pf_emp, pf_employer=pf_emp, esi_employee=esi_emp,
                esi_employer=gross * 0.0325 if gross <= 21000 else 0, professional_tax=pt,
                tds=tds, total_deductions=deductions, net_pay=gross - deductions,
                days_worked=26, days_absent=0, ot_hours=12 if emp.department == "Production" else 0,
                ot_pay=2500 if emp.department == "Production" else 0,
            ))

        # --- Suppliers ---
        suppliers = []
        for s in [
            {"name": "Mouser Electronics", "location": "USA", "category": "components", "payment_terms": "net_30", "rating": 4.5, "on_time_delivery": 96.5, "quality_score": 98.2},
            {"name": "Digi-Key", "location": "USA", "category": "components", "payment_terms": "net_30", "rating": 4.3, "on_time_delivery": 94.0, "quality_score": 97.5},
            {"name": "Arrow Electronics", "location": "USA", "category": "components", "payment_terms": "net_60", "rating": 4.0, "on_time_delivery": 91.0, "quality_score": 96.0},
            {"name": "Element14", "location": "Singapore", "category": "components", "payment_terms": "net_30", "rating": 4.2, "on_time_delivery": 93.5, "quality_score": 97.0},
            {"name": "PCB Power", "location": "India", "category": "pcb", "payment_terms": "advance", "rating": 3.8, "on_time_delivery": 85.0, "quality_score": 92.0},
            {"name": "SRM Circuits", "location": "India", "category": "pcb", "payment_terms": "net_30", "rating": 4.0, "on_time_delivery": 88.0, "quality_score": 94.0},
        ]:
            sup = Supplier(tenant_id=tid, **s)
            db.add(sup)
            suppliers.append(sup)
        db.flush()

        # --- Production Lines ---
        lines = []
        for l in [
            {"name": "SMT Line 1", "line_type": "smt", "status": "running", "oee": 87.5},
            {"name": "SMT Line 2", "line_type": "smt", "status": "idle", "oee": 0.0},
            {"name": "THT Line 1", "line_type": "tht", "status": "running", "oee": 82.0},
        ]:
            line = ProductionLine(tenant_id=tid, **l)
            db.add(line)
            lines.append(line)
        db.flush()

        # --- Equipment ---
        for e in [
            {"name": "Reflow Oven 1", "equipment_type": "reflow", "status": "overdue", "next_pm_date": date(2026, 3, 25), "usage_hours": 1240},
            {"name": "Pick & Place 1", "equipment_type": "pick_place", "status": "due", "next_pm_date": date(2026, 4, 1), "usage_hours": 890},
            {"name": "AOI-1", "equipment_type": "aoi", "status": "due", "next_pm_date": date(2026, 4, 2), "usage_hours": 450},
            {"name": "SPI-1", "equipment_type": "spi", "status": "ok", "next_pm_date": date(2026, 4, 15), "usage_hours": 200},
            {"name": "ICT-1", "equipment_type": "ict", "status": "ok", "next_pm_date": date(2026, 5, 1), "usage_hours": 120},
        ]:
            db.add(Equipment(tenant_id=tid, **e))

        # --- CRM Leads ---
        crm_leads = [
            {"ref_number": "LEAD-001", "company": "Bosch India", "contact_person": "Rahul Menon", "email": "rahul.menon@bosch.com", "phone": "+91-9876543210", "product": "ECU-X500", "value": 4500000, "stage": "won", "probability": 100, "source": "referral"},
            {"ref_number": "LEAD-002", "company": "Continental AG", "contact_person": "Markus Weber", "email": "m.weber@continental.com", "phone": "+49-123456789", "product": "ADAS-PRO", "value": 3200000, "stage": "negotiation", "probability": 70, "source": "trade_show"},
            {"ref_number": "LEAD-003", "company": "Tata Elxsi", "contact_person": "Priya Nair", "email": "priya.n@tataelxsi.com", "phone": "+91-9123456789", "product": "IoT-GW-100", "value": 1800000, "stage": "quoted", "probability": 50, "source": "website"},
            {"ref_number": "LEAD-004", "company": "L&T Technology", "contact_person": "Vikram Shah", "email": "v.shah@ltts.com", "phone": "+91-9234567890", "product": "PWR-CTRL-200", "value": 2500000, "stage": "qualified", "probability": 30, "source": "cold_call"},
            {"ref_number": "LEAD-005", "company": "Mahindra Electric", "contact_person": "Ananya Reddy", "email": "a.reddy@mahindra.com", "phone": "+91-9345678901", "product": "BMS-EV-50", "value": 5200000, "stage": "new_lead", "probability": 10, "source": "referral"},
            {"ref_number": "LEAD-006", "company": "TVS Electronics", "contact_person": "Karthik S", "email": "karthik@tvs-e.com", "phone": "+91-9456789012", "product": "SENSOR-HUB", "value": 980000, "stage": "won", "probability": 100, "source": "website"},
            {"ref_number": "LEAD-007", "company": "Wipro DOP", "contact_person": "Suresh Kumar", "email": "suresh.k@wipro.com", "phone": "+91-9567890123", "product": "DISPLAY-CTRL", "value": 1500000, "stage": "lost", "probability": 0, "source": "trade_show"},
        ]
        for lead in crm_leads:
            db.add(CRMLead(tenant_id=tid, **lead))

        # --- Sales Orders with Line Items + Payment Milestones ---
        so_data = [
            {"ref_number": "SO-001", "customer_name": "Bosch India", "board_name": "ECU-X500", "quantity": 5000, "unit_price": 450, "status": "production", "priority": "high", "payment_status": "partial"},
            {"ref_number": "SO-002", "customer_name": "Continental AG", "board_name": "ADAS-PRO", "quantity": 2000, "unit_price": 800, "status": "confirmed", "priority": "high", "payment_status": "pending"},
            {"ref_number": "SO-003", "customer_name": "Tata Elxsi", "board_name": "IoT-GW-100", "quantity": 10000, "unit_price": 120, "status": "material_pending", "priority": "medium", "payment_status": "pending"},
            {"ref_number": "SO-004", "customer_name": "TVS Electronics", "board_name": "SENSOR-HUB", "quantity": 3000, "unit_price": 280, "status": "shipped", "priority": "medium", "payment_status": "paid"},
            {"ref_number": "SO-005", "customer_name": "Bosch India", "board_name": "ECU-X500 Rev B", "quantity": 2000, "unit_price": 470, "status": "draft", "priority": "low", "payment_status": "pending"},
        ]
        for so in so_data:
            total = so["quantity"] * so["unit_price"]
            order = SalesOrder(
                tenant_id=tid, ref_number=so["ref_number"], customer_name=so["customer_name"],
                board_name=so["board_name"], quantity=so["quantity"], unit_price=so["unit_price"],
                total_value=total, due_date=today + timedelta(days=30), priority=so["priority"],
                status=so["status"], payment_status=so["payment_status"],
            )
            db.add(order)
            db.flush()
            # Line items
            db.add(SOLineItem(tenant_id=tid, sales_order_id=order.id, description=f"PCB Assembly - {so['board_name']}", quantity=so["quantity"], unit_price=so["unit_price"], total=total))
            # Payment milestones
            for pct, label in [(50, "Advance"), (30, "On Delivery"), (20, "Net 30")]:
                db.add(SOPaymentMilestone(
                    tenant_id=tid, sales_order_id=order.id, label=label,
                    percentage=pct, amount=total * pct / 100,
                    due_date=today + timedelta(days=15 * (pct // 20)),
                    status="paid" if so["payment_status"] == "paid" else "pending",
                ))

        # --- BOM Items ---
        bom_items = [
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "U1", "part_number": "STM32F407VGT6", "value": "MCU", "package": "LQFP-100", "manufacturer": "STMicroelectronics", "category": "ics", "qty_per_board": 1, "unit_price": 12.50, "msl_level": 3},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "U2", "part_number": "TJA1050T", "value": "CAN Transceiver", "package": "SO-8", "manufacturer": "NXP", "category": "ics", "qty_per_board": 2, "unit_price": 1.80, "msl_level": 1},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "R1-R20", "part_number": "RC0402JR-07100KL", "value": "100K", "package": "0402", "manufacturer": "Yageo", "category": "passives", "qty_per_board": 20, "unit_price": 0.005, "msl_level": 1},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "C1-C15", "part_number": "GRM155R71C104KA88D", "value": "100nF", "package": "0402", "manufacturer": "Murata", "category": "passives", "qty_per_board": 15, "unit_price": 0.008, "msl_level": 1},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "J1", "part_number": "5-534206-4", "value": "34-pin Connector", "package": "THT", "manufacturer": "TE Connectivity", "category": "connectors", "qty_per_board": 1, "unit_price": 2.40, "msl_level": 1},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "U3", "part_number": "LM2596S-5.0", "value": "5V Regulator", "package": "TO-263", "manufacturer": "TI", "category": "ics", "qty_per_board": 1, "unit_price": 1.95, "msl_level": 3},
            {"board_name": "ECU-X500", "revision": "A", "ref_designator": "Y1", "part_number": "ABM8-8.000MHZ", "value": "8MHz Crystal", "package": "ABM8", "manufacturer": "Abracon", "category": "passives", "qty_per_board": 1, "unit_price": 0.65, "msl_level": 1},
            {"board_name": "ADAS-PRO", "revision": "A", "ref_designator": "U1", "part_number": "TDA4VM", "value": "Vision SoC", "package": "BGA-841", "manufacturer": "TI", "category": "ics", "qty_per_board": 1, "unit_price": 85.00, "msl_level": 4},
            {"board_name": "ADAS-PRO", "revision": "A", "ref_designator": "U2", "part_number": "MT41K256M16TW", "value": "4Gb DDR3", "package": "BGA-96", "manufacturer": "Micron", "category": "ics", "qty_per_board": 2, "unit_price": 6.50, "msl_level": 3},
        ]
        for b in bom_items:
            db.add(BOMItem(tenant_id=tid, **b))
        # BOM Revisions
        db.add(BOMRevision(tenant_id=tid, board_name="ECU-X500", revision="A", date=today - timedelta(days=60), author="Arun K", changes_description="Initial release", total_cost=Decimal("19.43"), part_count=7))
        db.add(BOMRevision(tenant_id=tid, board_name="ADAS-PRO", revision="A", date=today - timedelta(days=30), author="Arun K", changes_description="Initial release", total_cost=Decimal("98.00"), part_count=3))

        # --- Purchase Orders ---
        po_data = [
            {"ref_number": "PO-001", "supplier_name": "Mouser Electronics", "total_items": 5, "total_amount": 125000, "status": "confirmed", "lead_time_days": 14},
            {"ref_number": "PO-002", "supplier_name": "Digi-Key", "total_items": 8, "total_amount": 87500, "status": "sent", "lead_time_days": 10},
            {"ref_number": "PO-003", "supplier_name": "PCB Power", "total_items": 2, "total_amount": 340000, "status": "partially_received", "lead_time_days": 21},
        ]
        for po in po_data:
            sup = next((s for s in suppliers if s.name == po["supplier_name"]), None)
            order = PurchaseOrder(
                tenant_id=tid, ref_number=po["ref_number"], supplier_id=sup.id if sup else None,
                supplier_name=po["supplier_name"], total_items=po["total_items"],
                total_amount=po["total_amount"], order_date=today - timedelta(days=10),
                eta_date=today + timedelta(days=po["lead_time_days"]),
                status=po["status"], lead_time_days=po["lead_time_days"],
            )
            db.add(order)
            db.flush()
            db.add(POLineItem(tenant_id=tid, purchase_order_id=order.id, part_number="STM32F407VGT6", description="MCU ARM Cortex-M4", quantity=5000, unit_price=12.50))
            db.add(POLineItem(tenant_id=tid, purchase_order_id=order.id, part_number="TJA1050T", description="CAN Transceiver", quantity=10000, unit_price=1.80))

        # --- Inventory ---
        inv_items = [
            {"part_number": "STM32F407VGT6", "description": "MCU ARM Cortex-M4 168MHz", "stock_quantity": 12500, "reel_count": 5, "location": "Rack A1", "msl_level": 3, "reorder_point": 5000, "unit_price": 12.50},
            {"part_number": "TJA1050T", "description": "CAN Transceiver High Speed", "stock_quantity": 25000, "reel_count": 10, "location": "Rack A2", "msl_level": 1, "reorder_point": 10000, "unit_price": 1.80},
            {"part_number": "RC0402JR-07100KL", "description": "100K Ohm 0402 5%", "stock_quantity": 500000, "reel_count": 50, "location": "Rack B1", "msl_level": 1, "reorder_point": 100000, "unit_price": 0.005},
            {"part_number": "GRM155R71C104KA88D", "description": "100nF MLCC 0402 16V", "stock_quantity": 350000, "reel_count": 35, "location": "Rack B2", "msl_level": 1, "reorder_point": 100000, "unit_price": 0.008},
            {"part_number": "TDA4VM", "description": "TDA4VM Vision SoC BGA-841", "stock_quantity": 200, "reel_count": 1, "location": "Dry Cabinet 1", "msl_level": 4, "reorder_point": 100, "unit_price": 85.00},
            {"part_number": "LM2596S-5.0", "description": "5V 3A Step-Down Regulator", "stock_quantity": 8000, "reel_count": 4, "location": "Rack A3", "msl_level": 3, "reorder_point": 3000, "unit_price": 1.95},
            {"part_number": "5-534206-4", "description": "34-pin Automotive Connector", "stock_quantity": 3000, "reel_count": 0, "location": "Rack C1", "msl_level": 1, "reorder_point": 1000, "unit_price": 2.40},
            {"part_number": "MT41K256M16TW", "description": "4Gb DDR3L SDRAM BGA-96", "stock_quantity": 500, "reel_count": 2, "location": "Dry Cabinet 1", "msl_level": 3, "reorder_point": 200, "unit_price": 6.50},
        ]
        for i in inv_items:
            db.add(InventoryItem(tenant_id=tid, **i))

        # --- MSL Reels ---
        now = datetime.now(timezone.utc)
        msl_reels = [
            {"reel_id": "REEL-STM32-001", "part_number": "STM32F407VGT6", "msl_level": 3, "floor_life_hours": 168, "remaining_hours": 120, "status": "ok", "location": "SMT Line 1"},
            {"reel_id": "REEL-STM32-002", "part_number": "STM32F407VGT6", "msl_level": 3, "floor_life_hours": 168, "remaining_hours": 24, "status": "warning", "location": "SMT Line 1", "opened_at": now - timedelta(hours=144)},
            {"reel_id": "REEL-TDA4-001", "part_number": "TDA4VM", "msl_level": 4, "floor_life_hours": 72, "remaining_hours": 8, "status": "critical", "location": "SMT Line 2", "opened_at": now - timedelta(hours=64)},
            {"reel_id": "REEL-TDA4-002", "part_number": "TDA4VM", "msl_level": 4, "floor_life_hours": 72, "remaining_hours": 0, "status": "expired", "location": "Bake Queue", "opened_at": now - timedelta(hours=80)},
            {"reel_id": "REEL-LM2596-001", "part_number": "LM2596S-5.0", "msl_level": 3, "floor_life_hours": 168, "remaining_hours": 168, "status": "ok", "location": "Dry Cabinet 2"},
            {"reel_id": "REEL-DDR3-001", "part_number": "MT41K256M16TW", "msl_level": 3, "floor_life_hours": 168, "remaining_hours": 50, "status": "warning", "location": "SMT Line 2", "opened_at": now - timedelta(hours=118)},
        ]
        for r in msl_reels:
            db.add(MSLReel(tenant_id=tid, **r))

        # --- Work Orders ---
        wo_data = [
            {"ref_number": "WO-001", "board_name": "ECU-X500", "customer_name": "Bosch India", "quantity": 2500, "status": "active", "progress": 65, "line_id": lines[0].id},
            {"ref_number": "WO-002", "board_name": "ECU-X500", "customer_name": "Bosch India", "quantity": 2500, "status": "scheduled", "progress": 0, "line_id": lines[0].id},
            {"ref_number": "WO-003", "board_name": "SENSOR-HUB", "customer_name": "TVS Electronics", "quantity": 3000, "status": "completed", "progress": 100, "line_id": lines[2].id},
        ]
        for wo in wo_data:
            lid = wo.pop("line_id")
            wo["progress"] = wo.pop("progress")
            order = WorkOrder(tenant_id=tid, line_id=lid, **wo)
            db.add(order)

        # --- NPI Projects ---
        npi_data = [
            {"ref_number": "NPI-001", "name": "ADAS-PRO NPI", "customer_name": "Continental AG", "board_name": "ADAS-PRO", "stage": "prototype", "estimated_volume": 2000, "target_date": today + timedelta(days=60)},
            {"ref_number": "NPI-002", "name": "BMS-EV-50 NPI", "customer_name": "Mahindra Electric", "board_name": "BMS-EV-50", "stage": "feasibility", "estimated_volume": 5000, "target_date": today + timedelta(days=90)},
            {"ref_number": "NPI-003", "name": "IoT-GW-100 NPI", "customer_name": "Tata Elxsi", "board_name": "IoT-GW-100", "stage": "production_ready", "estimated_volume": 10000, "target_date": today + timedelta(days=15)},
        ]
        for n in npi_data:
            db.add(NPIProject(tenant_id=tid, **n))

        # --- ECOs ---
        eco_data = [
            {"ref_number": "ECO-001", "title": "ECU-X500 Cap Change", "board_name": "ECU-X500", "description": "Replace C5-C8 with higher voltage rating caps", "reason": "quality", "status": "approved"},
            {"ref_number": "ECO-002", "title": "ADAS-PRO DDR3 Alt", "board_name": "ADAS-PRO", "description": "Add Samsung DDR3 as alternate source", "reason": "obsolescence", "status": "draft"},
        ]
        for e in eco_data:
            db.add(ECO(tenant_id=tid, **e))

        # --- NCRs ---
        ncr_data = [
            {"ref_number": "NCR-001", "title": "Solder bridge on U1", "description": "Solder bridge detected between pins 45-46 on STM32", "board_name": "ECU-X500", "defect_type": "solder_bridge", "severity": "major", "quantity_affected": 12, "status": "investigating"},
            {"ref_number": "NCR-002", "title": "Missing component R15", "description": "R15 not placed on 8 boards in WO-001 batch 3", "board_name": "ECU-X500", "defect_type": "missing_component", "severity": "minor", "quantity_affected": 8, "status": "open"},
            {"ref_number": "NCR-003", "title": "Tombstoning on C3", "description": "Tombstone defect on 100nF caps, reflow profile issue", "board_name": "SENSOR-HUB", "defect_type": "tombstone", "severity": "major", "quantity_affected": 25, "status": "contained"},
        ]
        for n in ncr_data:
            db.add(NCR(tenant_id=tid, **n))

        # --- Invoices ---
        inv_data = [
            {"ref_number": "INV-001", "customer_name": "Bosch India", "subtotal": 1125000, "gst_amount": 202500, "total": 1327500, "status": "paid", "due_date": today - timedelta(days=5)},
            {"ref_number": "INV-002", "customer_name": "TVS Electronics", "subtotal": 840000, "gst_amount": 151200, "total": 991200, "status": "sent", "due_date": today + timedelta(days=15)},
            {"ref_number": "INV-003", "customer_name": "Continental AG", "subtotal": 480000, "gst_amount": 86400, "total": 566400, "status": "draft", "due_date": today + timedelta(days=30)},
        ]
        for inv in inv_data:
            amt_paid = inv["total"] if inv["status"] == "paid" else 0
            balance = inv["total"] - amt_paid
            db.add(Invoice(tenant_id=tid, amount_paid=amt_paid, balance_due=balance, issue_date=today - timedelta(days=10), **inv))

        # --- Vendor Bills ---
        vb_data = [
            {"ref_number": "VB-001", "supplier_name": "Mouser Electronics", "subtotal": 125000, "gst_amount": 22500, "total": 147500, "status": "approved", "due_date": today + timedelta(days=10)},
            {"ref_number": "VB-002", "supplier_name": "PCB Power", "subtotal": 340000, "gst_amount": 61200, "total": 401200, "status": "pending", "due_date": today + timedelta(days=20)},
        ]
        for vb in vb_data:
            db.add(VendorBill(tenant_id=tid, balance_due=vb["total"], issue_date=today - timedelta(days=5), **vb))

        # --- Shipments ---
        ship_data = [
            {"ref_number": "SHP-001", "customer_name": "TVS Electronics", "board_count": 3000, "carrier": "BlueDart", "tracking_number": "BD-2026-45678", "status": "delivered", "eta_date": today - timedelta(days=2)},
            {"ref_number": "SHP-002", "customer_name": "Bosch India", "board_count": 1000, "carrier": "FedEx", "tracking_number": "FX-2026-78901", "status": "in_transit", "eta_date": today + timedelta(days=3)},
        ]
        for sh in ship_data:
            db.add(Shipment(tenant_id=tid, **sh))

        # --- RMAs ---
        rma_data = [
            {"ref_number": "RMA-001", "customer_name": "Bosch India", "customer_email": "rahul.menon@bosch.com", "board_name": "ECU-X500", "quantity": 15, "reason": "field_failure", "description": "Power supply section failure in field", "status": "inspecting"},
        ]
        for r in rma_data:
            db.add(RMA(tenant_id=tid, **r))

        # --- Item Groups ---
        ig_map = {}
        for name, desc in [("ICs", "Integrated Circuits"), ("Passives", "Resistors, Capacitors, Inductors"), ("Connectors", "Board-to-board, wire-to-board"), ("Mechanicals", "Heatsinks, enclosures, screws"), ("PCB", "Bare PCBs and substrates"), ("Packaging", "ESD bags, trays, boxes")]:
            ig = ItemGroup(tenant_id=tid, name=name, description=desc)
            db.add(ig)
            ig_map[name] = ig
        db.flush()
        # Sub-groups
        for parent, children in [("ICs", ["Microcontrollers", "Transceivers", "Regulators", "Memory"]), ("Passives", ["Resistors", "Capacitors", "Crystals"])]:
            for child in children:
                db.add(ItemGroup(tenant_id=tid, name=child, parent_id=ig_map[parent].id))

        # --- Item Master Entries ---
        for pn, desc, grp, mfr, pkg, hsn in [
            ("STM32F407VGT6", "MCU ARM Cortex-M4 168MHz", "ICs", "STMicroelectronics", "LQFP-100", "8542"),
            ("TJA1050T", "CAN Transceiver High Speed", "ICs", "NXP", "SO-8", "8542"),
            ("RC0402JR-07100KL", "100K Ohm 0402 5%", "Passives", "Yageo", "0402", "8533"),
            ("GRM155R71C104KA88D", "100nF MLCC 0402 16V", "Passives", "Murata", "0402", "8532"),
            ("TDA4VM", "Vision SoC BGA-841", "ICs", "TI", "BGA-841", "8542"),
            ("LM2596S-5.0", "5V 3A Step-Down Regulator", "ICs", "TI", "TO-263", "8542"),
            ("5-534206-4", "34-pin Automotive Connector", "Connectors", "TE Connectivity", "THT", "8536"),
            ("MT41K256M16TW", "4Gb DDR3L SDRAM", "ICs", "Micron", "BGA-96", "8542"),
        ]:
            db.add(ItemMaster(tenant_id=tid, part_number=pn, description=desc, item_group_id=ig_map[grp].id, manufacturer=mfr, package=pkg, hsn_code=hsn))

        # --- Supplier Groups ---
        sg_data = [
            SupplierGroup(tenant_id=tid, name="Strategic", description="Top-tier partners with long-term contracts", priority=1),
            SupplierGroup(tenant_id=tid, name="Preferred", description="Approved vendors with good track record", priority=2),
            SupplierGroup(tenant_id=tid, name="Approved", description="Qualified vendors for spot purchases", priority=3),
        ]
        for sg in sg_data:
            db.add(sg)

        # --- Salary Structures ---
        salary_ctcs = {
            "EMP-001": 1800000, "EMP-002": 1200000, "EMP-003": 900000, "EMP-004": 1000000,
            "EMP-005": 1100000, "EMP-006": 780000, "EMP-007": 850000, "EMP-008": 750000,
            "EMP-009": 720000, "EMP-010": 360000,
        }
        for code, eid in emp_ids.items():
            ctc = salary_ctcs.get(code, 360000)
            basic = ctc * 0.40
            hra = basic * 0.50
            db.add(SalaryStructure(
                tenant_id=tid, employee_id=eid, annual_ctc=ctc,
                basic=basic, hra=hra,
                special_allowance=ctc - basic - hra - 19200 - 15000,
                conveyance=19200, medical=15000,
                effective_from=date(2026, 1, 1),
            ))

        # --- Tax Declarations ---
        for code, regime, s80c, s80d in [("EMP-001", "old", 150000, 25000), ("EMP-002", "new", 0, 0), ("EMP-004", "old", 100000, 15000)]:
            db.add(TaxDeclaration(
                tenant_id=tid, employee_id=emp_ids[code],
                financial_year="2025-26", regime=regime,
                section_80c=s80c, section_80d=s80d,
            ))

        # --- Holidays 2026 ---
        holidays_2026 = [
            (date(2026, 1, 14), "Pongal", "state"),
            (date(2026, 1, 15), "Thiruvalluvar Day", "state"),
            (date(2026, 1, 26), "Republic Day", "national"),
            (date(2026, 3, 17), "Holi", "national"),
            (date(2026, 4, 6), "Ugadi", "state"),
            (date(2026, 4, 14), "Tamil New Year", "state"),
            (date(2026, 5, 1), "May Day", "national"),
            (date(2026, 8, 15), "Independence Day", "national"),
            (date(2026, 9, 2), "Vinayagar Chaturthi", "state"),
            (date(2026, 10, 2), "Gandhi Jayanti", "national"),
            (date(2026, 10, 20), "Ayudha Pooja", "state"),
            (date(2026, 10, 21), "Vijayadashami", "national"),
            (date(2026, 11, 10), "Diwali", "national"),
            (date(2026, 12, 25), "Christmas", "national"),
            (date(2026, 4, 10), "Good Friday", "optional"),
        ]
        for hdate, hname, htype in holidays_2026:
            db.add(Holiday(tenant_id=tid, date=hdate, name=hname, type=htype, year=2026))

        # --- Leave Types ---
        lt_map = {}
        for code, name, desc in [
            ("EL", "Earned Leave", "Paid leave accrued monthly at 1.25 days/month"),
            ("CL", "Casual Leave", "Short-duration personal leave, no carry-forward"),
            ("SL", "Sick Leave", "Medical leave with carry-forward"),
            ("ML", "Maternity Leave", "26 weeks statutory maternity leave"),
            ("PL", "Paternity Leave", "15 days paternity leave"),
            ("CO", "Compensatory Off", "Off granted for working on holidays/weekends"),
            ("LOP", "Loss of Pay", "Unpaid leave when balance exhausted"),
        ]:
            lt = LeaveType(tenant_id=tid, code=code, name=name, description=desc)
            db.add(lt)
            lt_map[code] = lt
        db.flush()

        # --- Leave Policies ---
        for code, entitled, cf, cf_max, max_consec, notice, gender in [
            ("EL", 15, True, 30, 5, 3, "all"),
            ("CL", 8, False, 0, 3, 0, "all"),
            ("SL", 10, True, 20, None, 0, "all"),
            ("ML", 182, False, 0, None, 30, "female"),
            ("PL", 15, False, 0, None, 7, "male"),
            ("CO", 5, False, 0, 2, 0, "all"),
        ]:
            db.add(LeavePolicy(
                tenant_id=tid, leave_type_id=lt_map[code].id,
                entitled_days=entitled, carry_forward_enabled=cf,
                carry_forward_max=cf_max, max_consecutive_days=max_consec,
                min_notice_days=notice, applicable_gender=gender,
            ))

        db.commit()
        print(f"\nSeed complete!")
        print(f"  11 users, 10 employees, 6 suppliers, 3 lines, 5 equipment")
        print(f"  7 CRM leads, 5 sales orders, 9 BOM items, 3 POs")
        print(f"  8 inventory items, 6 MSL reels, 3 work orders")
        print(f"  3 NPI projects, 2 ECOs, 3 NCRs")
        print(f"  3 invoices, 2 vendor bills, 2 shipments, 1 RMA")
        print(f"  Attendance, leave balances, leave requests, 1 payroll batch")
        print(f"  6 item groups + sub-groups, 8 item master, 3 supplier groups")
        print(f"  10 salary structures, 3 tax declarations, 15 holidays")
        print(f"  7 leave types, 6 leave policies")
        print(f"Tenant ID: {tid}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
