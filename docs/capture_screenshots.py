"""Capture screenshots of all ERP modules using Playwright."""

import time
from playwright.sync_api import sync_playwright

BASE = "https://thinksemi-pcb-erp.netlify.app"
OUT = "/Users/sandeepkoppula/Desktop/ERP/pcb-erp/docs/screenshots"

PAGES = [
    ("01_login", "/login", "Login Page"),
    ("02_dashboard", "/", "Dashboard"),
    ("03_hr_overview", "/hr", "HR & Payroll - Overview"),
    ("04_hr_salary", "/hr/salary", "Salary Structure"),
    ("05_hr_holidays", "/hr/holidays", "Holiday Calendar"),
    ("06_crm", "/crm", "Sales CRM"),
    ("07_crm_pipeline", "/crm/pipeline", "CRM Pipeline"),
    ("08_finance", "/finance", "Finance"),
    ("09_supply_chain", "/supply-chain", "Supply Chain Dashboard"),
    ("10_sales_orders", "/supply-chain/sales-orders", "Sales Orders"),
    ("11_bom", "/supply-chain/bom", "BOM Manager"),
    ("12_purchase_orders", "/supply-chain/purchase-orders", "Purchase Orders"),
    ("13_suppliers", "/supply-chain/suppliers", "Suppliers"),
    ("14_inventory", "/inventory", "Inventory Dashboard"),
    ("15_item_master", "/inventory/item-master", "Item Master"),
    ("16_msl", "/msl", "MSL Control"),
    ("17_manufacturing", "/manufacturing", "Manufacturing"),
    ("18_quality", "/quality", "Quality (QMS)"),
    ("19_quality_ncr", "/quality/ncr", "NCR List"),
    ("20_npi", "/npi", "NPI Pipeline"),
    ("21_eco", "/eco", "ECO / Revisions"),
    ("22_traceability", "/traceability", "Traceability"),
    ("23_maintenance", "/maintenance", "Maintenance"),
    ("24_delivery", "/delivery", "Delivery & Shipping"),
    ("25_rma", "/rma", "RMA Returns"),
    ("26_settings", "/settings", "Settings"),
]


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = ctx.new_page()

        # Take login screenshot first
        page.goto(f"{BASE}/login", wait_until="networkidle", timeout=60000)
        time.sleep(2)
        page.screenshot(path=f"{OUT}/01_login.png", full_page=False)
        print("01_login.png")

        # Log in
        page.fill('input[type="email"]', "admin@thinksemi.com")
        page.fill('input[type="password"]', "ThinkSemi@ERP2026!")
        page.click('button[type="submit"]')
        time.sleep(5)  # wait for login + redirect + data load
        page.wait_for_load_state("networkidle", timeout=30000)
        time.sleep(3)

        # Take screenshots of each page
        for filename, path, label in PAGES[1:]:  # skip login, already done
            try:
                page.goto(f"{BASE}{path}", wait_until="networkidle", timeout=30000)
                time.sleep(3)  # let data + charts render
                page.screenshot(path=f"{OUT}/{filename}.png", full_page=True)
                print(f"{filename}.png - {label}")
            except Exception as e:
                print(f"SKIP {filename}: {e}")

        browser.close()
    print(f"\nDone! {len(PAGES)} screenshots saved to {OUT}")


if __name__ == "__main__":
    run()
