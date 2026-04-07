import { test, expect } from "@playwright/test"

test.describe("Operations", () => {
  test("maintenance dashboard loads", async ({ page }) => {
    await page.goto("/maintenance")
    await expect(page.getByText(/Maintenance|Equipment/i).first()).toBeVisible()
  })

  test("equipment list visible", async ({ page }) => {
    await page.goto("/maintenance")
    await expect(page.getByText(/Reflow|Pick|AOI|SPI|ICT|Equipment/i).first()).toBeVisible({ timeout: 20_000 })
  })

  test("delivery dashboard loads", async ({ page }) => {
    await page.goto("/delivery")
    await expect(page.getByText(/Delivery|Shipping|Shipment/i).first()).toBeVisible()
  })

  test("RMA dashboard loads", async ({ page }) => {
    await page.goto("/rma")
    await expect(page.getByText(/RMA|Return/i).first()).toBeVisible()
  })

  test("traceability search loads", async ({ page }) => {
    await page.goto("/traceability")
    await expect(page.getByText(/Traceability|Trace/i).first()).toBeVisible()
  })

  test("settings page loads", async ({ page }) => {
    await page.goto("/settings")
    await expect(page.getByText(/Settings/i).first()).toBeVisible()
  })
})
