import { test, expect } from "@playwright/test"

test.describe("Supply Chain Module", () => {
  test("supply chain dashboard loads", async ({ page }) => {
    await page.goto("/supply-chain")
    await expect(page.getByText(/Supply Chain|Orders|Revenue/i).first()).toBeVisible()
  })

  test("sales orders page loads", async ({ page }) => {
    await page.goto("/supply-chain/sales-orders")
    await expect(page.getByText(/Sales Orders/i).first()).toBeVisible()
  })

  test("BOM manager loads", async ({ page }) => {
    await page.goto("/supply-chain/bom")
    await expect(page.getByText(/BOM|Bill of Materials/i).first()).toBeVisible()
  })

  test("purchase orders page loads", async ({ page }) => {
    await page.goto("/supply-chain/purchase-orders")
    await expect(page.getByText(/Purchase Order/i).first()).toBeVisible()
  })

  test("suppliers page shows supplier data", async ({ page }) => {
    await page.goto("/supply-chain/suppliers")
    await expect(page.getByText(/Supplier/i).first()).toBeVisible()
    await expect(page.getByText(/Mouser|Digi-Key|Arrow|PCB Power/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("sales orders show data table", async ({ page }) => {
    await page.goto("/supply-chain/sales-orders")
    await expect(page.locator("table, [class*=card], [class*=Card]").first()).toBeVisible({ timeout: 15_000 })
  })

  test("BOM shows component data", async ({ page }) => {
    await page.goto("/supply-chain/bom")
    await expect(page.getByText(/ECU|ADAS|STM32|BGA/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("sidebar navigation between sub-pages", async ({ page }) => {
    await page.goto("/supply-chain")
    await page.getByRole("link", { name: /Inventory/i }).first().click()
    await expect(page.getByText(/Inventory|Stock/i).first()).toBeVisible()
  })
})
