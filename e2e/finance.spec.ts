import { test, expect } from "@playwright/test"

test.describe("Finance Module", () => {
  test("finance page loads with tabs", async ({ page }) => {
    await page.goto("/finance")
    await expect(page.getByText("Finance").first()).toBeVisible()
    // Should have multiple tab buttons
    await expect(page.getByRole("button").first()).toBeVisible()
  })

  test("customer payments tab shows aging", async ({ page }) => {
    await page.goto("/finance")
    await page.getByRole("button", { name: /customer/i }).click()
    await expect(page.getByText(/0-30 Days|30-60 Days/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("vendor payments tab loads", async ({ page }) => {
    await page.goto("/finance")
    await page.getByRole("button", { name: /vendor/i }).click()
    await expect(page.getByText(/vendor|supplier|bill/i).first()).toBeVisible()
  })

  test("reports tab loads", async ({ page }) => {
    await page.goto("/finance")
    await page.getByRole("button", { name: /reports/i }).click()
    await expect(page.getByText(/form 24q|statutory|report/i).first()).toBeVisible()
  })
})
