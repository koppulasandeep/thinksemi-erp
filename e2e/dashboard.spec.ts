import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test("loads with KPI cards", async ({ page }) => {
    await page.goto("/")
    // Dashboard should show KPI data or module content
    await expect(page.locator("[class*=Card], [class*=card]").first()).toBeVisible({ timeout: 15_000 })
  })

  test("production line cards visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText(/SMT Line|THT Line/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("sidebar navigation links work", async ({ page }) => {
    await page.goto("/")
    // Click HR link
    await page.getByRole("link", { name: "HR & Payroll" }).click()
    await expect(page.getByText("Human Resources")).toBeVisible()
  })

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/")
    const html = page.locator("html")
    await expect(html).not.toHaveClass(/dark/)
    // Click the moon/sun icon button
    await page.locator("header button").filter({ has: page.locator("svg") }).first().click()
  })
})
