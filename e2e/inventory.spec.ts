import { test, expect } from "@playwright/test"

test.describe("Inventory & Item Master", () => {
  test("inventory dashboard loads with KPIs", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page.getByText(/Inventory/i).first()).toBeVisible()
    await expect(page.getByText(/Total|SKU|Stock|Value/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("inventory page renders data", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page.getByText(/Inventory/i).first()).toBeVisible()
    await page.waitForTimeout(3_000)
    const bodyText = await page.locator("body").innerText()
    expect(bodyText.length).toBeGreaterThan(100)
  })

  test("item master page loads", async ({ page }) => {
    await page.goto("/inventory/item-master")
    await expect(page.getByText(/Item Master/i).first()).toBeVisible()
  })

  test("item master shows items from API", async ({ page }) => {
    await page.goto("/inventory/item-master")
    await expect(page.getByText(/STM32|TDA4|Murata|Yageo/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("MSL dashboard loads", async ({ page }) => {
    await page.goto("/msl")
    await expect(page.getByText(/MSL|Moisture/i).first()).toBeVisible()
  })

  test("MSL shows reel status badges", async ({ page }) => {
    await page.goto("/msl")
    await expect(page.getByText(/ok|warning|critical|expired/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
