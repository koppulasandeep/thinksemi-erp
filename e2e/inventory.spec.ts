import { test, expect } from "@playwright/test"

test.describe("Inventory & Item Master", () => {
  test("inventory dashboard loads", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page.getByText(/Inventory|Stock/i).first()).toBeVisible()
  })

  test("inventory shows data table or cards", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page.locator("table, [class*=card], [class*=Card]").first()).toBeVisible({ timeout: 15_000 })
  })

  test("item master page loads", async ({ page }) => {
    await page.goto("/inventory/item-master")
    await expect(page.getByText(/Item Master/i).first()).toBeVisible()
  })

  test("item master shows items", async ({ page }) => {
    await page.goto("/inventory/item-master")
    await expect(page.getByText(/STM32|TDA4VM|Murata|Yageo/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("MSL dashboard loads", async ({ page }) => {
    await page.goto("/msl")
    await expect(page.getByText(/MSL|Moisture/i).first()).toBeVisible()
  })

  test("MSL shows status badges", async ({ page }) => {
    await page.goto("/msl")
    await expect(page.getByText(/ok|warning|critical|expired/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
