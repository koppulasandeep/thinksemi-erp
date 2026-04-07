import { test as setup, expect } from "@playwright/test"

const USERS = [
  { file: "e2e/.auth/admin.json", email: "admin@thinksemi.com", password: "ThinkSemi@ERP2026!" },
  { file: "e2e/.auth/operator.json", email: "operator@thinksemi.com", password: "ThinkSemi@ERP2026!" },
  { file: "e2e/.auth/customer.json", email: "customer@bosch.com", password: "Bosch@Portal2026!" },
  { file: "e2e/.auth/hr.json", email: "hr@thinksemi.com", password: "ThinkSemi@ERP2026!" },
  { file: "e2e/.auth/sales.json", email: "sales@thinksemi.com", password: "ThinkSemi@ERP2026!" },
]

for (const { file, email, password } of USERS) {
  const label = email.split("@")[0]
  setup(`authenticate as ${label}`, async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    // Wait for redirect away from login
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 })
    await page.context().storageState({ path: file })
  })
}
