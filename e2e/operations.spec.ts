import { test, expect } from "@playwright/test"

test.describe("Operations", () => {
  test("maintenance dashboard loads", async ({ page }) => {
    await page.goto("/maintenance")
    await expect(page.getByText(/Maintenance|Equipment/i).first()).toBeVisible()
  })

  test("equipment data renders", async ({ page }) => {
    await page.goto("/maintenance")
    await expect(page.locator("table, [class*=card], [class*=Card]").first()).toBeVisible({ timeout: 15_000 })
  })

  test("delivery dashboard loads", async ({ page }) => {
    await page.goto("/delivery")
    await expect(page.getByText(/Delivery|Shipping|Shipment/i).first()).toBeVisible()
  })

  test("shipment data visible", async ({ page }) => {
    await page.goto("/delivery")
    await expect(page.getByText(/BlueDart|FedEx|SHP-|transit|delivered/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("RMA dashboard loads", async ({ page }) => {
    await page.goto("/rma")
    await expect(page.getByText(/RMA|Return/i).first()).toBeVisible()
  })

  test("traceability page loads", async ({ page }) => {
    await page.goto("/traceability")
    await expect(page.getByText(/Traceability|Trace|Search/i).first()).toBeVisible()
  })
})
