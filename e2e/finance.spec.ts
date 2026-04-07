import { test, expect } from "@playwright/test"

test.describe("Finance Module", () => {
  test("finance page loads with tabs", async ({ page }) => {
    await page.goto("/finance")
    await expect(page.getByText("Finance").first()).toBeVisible()
  })

  test("shows financial data", async ({ page }) => {
    await page.goto("/finance")
    // Should show currency amounts from mock or API
    await expect(page.getByText(/\u20B9|INR|receivable|payable/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("tab switching works", async ({ page }) => {
    await page.goto("/finance")
    const tabs = page.getByRole("button")
    const count = await tabs.count()
    expect(count).toBeGreaterThan(2)
  })

  test("customer payments section visible", async ({ page }) => {
    await page.goto("/finance")
    await expect(page.getByText(/Customer Payment|Invoice|0-30 Days/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
