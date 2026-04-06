"""Recapture Salary Structure and Holidays screenshots with data loaded."""

import time
from playwright.sync_api import sync_playwright

BASE = "https://thinksemi-pcb-erp.netlify.app"
OUT = "/Users/sandeepkoppula/Desktop/ERP/pcb-erp/docs/screenshots"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = ctx.new_page()

        # Login
        page.goto(f"{BASE}/login", wait_until="networkidle", timeout=60000)
        time.sleep(2)
        page.fill('input[type="email"]', "admin@thinksemi.com")
        page.fill('input[type="password"]', "ThinkSemi@ERP2026!")
        page.click('button[type="submit"]')
        time.sleep(8)  # extra time for cold start
        page.wait_for_load_state("networkidle", timeout=60000)
        time.sleep(3)
        print("Logged in")

        # Salary Structure - select an employee first
        page.goto(f"{BASE}/hr/salary", wait_until="networkidle", timeout=60000)
        time.sleep(6)
        # Wait for select to appear (loading finished)
        try:
            page.wait_for_selector("select", timeout=15000)
            time.sleep(1)
            page.select_option("select", index=1)
            time.sleep(5)  # wait for salary data to load from API
        except Exception as e:
            print(f"Could not select employee: {e}")
        page.screenshot(path=f"{OUT}/04_hr_salary.png", full_page=True)
        print("04_hr_salary.png - with employee selected")

        # Holidays
        page.goto(f"{BASE}/hr/holidays", wait_until="networkidle", timeout=30000)
        time.sleep(5)  # extra wait for holidays data
        page.screenshot(path=f"{OUT}/05_hr_holidays.png", full_page=True)
        print("05_hr_holidays.png")

        # Also recapture HR overview with data loaded (since backend is warm now)
        page.goto(f"{BASE}/hr", wait_until="networkidle", timeout=30000)
        time.sleep(4)
        page.screenshot(path=f"{OUT}/03_hr_overview.png", full_page=True)
        print("03_hr_overview.png")

        # Recapture Item Master with data
        page.goto(f"{BASE}/inventory/item-master", wait_until="networkidle", timeout=30000)
        time.sleep(4)
        page.screenshot(path=f"{OUT}/15_item_master.png", full_page=True)
        print("15_item_master.png")

        # Recapture Inventory
        page.goto(f"{BASE}/inventory", wait_until="networkidle", timeout=30000)
        time.sleep(4)
        page.screenshot(path=f"{OUT}/14_inventory.png", full_page=True)
        print("14_inventory.png")

        browser.close()
    print("Done!")


if __name__ == "__main__":
    run()
