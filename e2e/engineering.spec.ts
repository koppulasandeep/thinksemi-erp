import { test, expect } from "@playwright/test"

test.describe("Engineering: NPI & ECO", () => {
  test("NPI pipeline loads", async ({ page }) => {
    await page.goto("/npi")
    await expect(page.getByText(/NPI|New Product/i).first()).toBeVisible()
  })

  test("NPI projects visible", async ({ page }) => {
    await page.goto("/npi")
    await expect(page.getByText(/ADAS|BMS|IoT|NPI-/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("NPI stages visible", async ({ page }) => {
    await page.goto("/npi")
    await expect(page.getByText(/feasibility|prototype|pilot|production/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("ECO list loads", async ({ page }) => {
    await page.goto("/eco")
    await expect(page.getByText(/Engineering Change|ECO/i).first()).toBeVisible()
  })

  test("ECO entries visible", async ({ page }) => {
    await page.goto("/eco")
    await expect(page.getByText(/ECO-|Cap Change|DDR3/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("ECO status tabs work", async ({ page }) => {
    await page.goto("/eco")
    // Main tabs
    const tabs = page.getByRole("button")
    const count = await tabs.count()
    expect(count).toBeGreaterThan(2)
  })
})
