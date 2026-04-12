import { test, expect } from "@playwright/test"

test.describe("Manufacturing Module", () => {
  test("manufacturing dashboard loads", async ({ page }) => {
    await page.goto("/manufacturing")
    await expect(page.getByText(/Manufacturing|Production/i).first()).toBeVisible()
  })

  test("production lines visible", async ({ page }) => {
    await page.goto("/manufacturing")
    await expect(page.getByText(/SMT Line|THT Line/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("work orders visible", async ({ page }) => {
    await page.goto("/manufacturing")
    await expect(page.getByText(/WO-|Work Order|ECU|SENSOR/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("tabs present", async ({ page }) => {
    await page.goto("/manufacturing")
    const buttons = page.getByRole("button")
    expect(await buttons.count()).toBeGreaterThan(1)
  })
})
