"""Seed demo data matching the frontend mock data."""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.database import SessionLocal, engine, Base
from app.models import *  # noqa

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
        # Check if already seeded
        existing = db.query(Tenant).filter(Tenant.slug == "thinksemi").first()
        if existing:
            print("Database already seeded. Skipping.")
            return

        # Create tenant
        tenant = Tenant(**TENANT_DATA)
        db.add(tenant)
        db.flush()
        print(f"Created tenant: {tenant.name} (id={tenant.id})")

        # Create users
        for u in USERS:
            user = User(
                tenant_id=tenant.id,
                email=u["email"],
                password_hash=pwd_context.hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                designation=u["designation"],
            )
            db.add(user)
            print(f"  Created user: {u['email']} ({u['role']})")

        db.flush()

        # Create payroll config
        config = PayrollConfig(tenant_id=tenant.id)
        db.add(config)

        # Create some suppliers
        suppliers_data = [
            {"name": "Mouser Electronics", "location": "USA", "category": "components", "payment_terms": "net_30", "rating": 4.5},
            {"name": "Digi-Key", "location": "USA", "category": "components", "payment_terms": "net_30", "rating": 4.3},
            {"name": "Arrow Electronics", "location": "USA", "category": "components", "payment_terms": "net_60", "rating": 4.0},
            {"name": "Element14", "location": "Singapore", "category": "components", "payment_terms": "net_30", "rating": 4.2},
            {"name": "PCB Power", "location": "India", "category": "pcb", "payment_terms": "advance", "rating": 3.8},
            {"name": "SRM Circuits", "location": "India", "category": "pcb", "payment_terms": "net_30", "rating": 4.0},
        ]
        for s in suppliers_data:
            db.add(Supplier(tenant_id=tenant.id, **s))

        # Create production lines
        lines_data = [
            {"name": "SMT Line 1", "line_type": "smt", "status": "running"},
            {"name": "SMT Line 2", "line_type": "smt", "status": "idle"},
            {"name": "THT Line 1", "line_type": "tht", "status": "running"},
        ]
        for l in lines_data:
            db.add(ProductionLine(tenant_id=tenant.id, **l))

        # Create equipment
        equip_data = [
            {"name": "Reflow Oven 1", "equipment_type": "reflow", "status": "overdue", "next_pm_date": "2026-03-25", "usage_hours": 1240},
            {"name": "Pick & Place 1", "equipment_type": "pick_place", "status": "due", "next_pm_date": "2026-04-01", "usage_hours": 890},
            {"name": "AOI-1", "equipment_type": "aoi", "status": "due", "next_pm_date": "2026-04-02", "usage_hours": 450},
            {"name": "SPI-1", "equipment_type": "spi", "status": "ok", "next_pm_date": "2026-04-15", "usage_hours": 200},
            {"name": "ICT-1", "equipment_type": "ict", "status": "ok", "next_pm_date": "2026-05-01", "usage_hours": 120},
        ]
        from datetime import date
        for e in equip_data:
            pm = e.pop("next_pm_date")
            hours = e.pop("usage_hours")
            db.add(Equipment(tenant_id=tenant.id, next_pm_date=date.fromisoformat(pm), usage_hours=hours, **e))

        db.commit()
        print("\nSeed complete! 11 users, 6 suppliers, 3 lines, 5 equipment created.")
        print(f"Tenant ID: {tenant.id}")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
