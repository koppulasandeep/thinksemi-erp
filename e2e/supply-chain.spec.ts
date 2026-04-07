import { test, expect } from "@playwright/test"

test.describe("Supply Chain Module", () => {
  test("supply chain dashboard loads", async ({ page }) => {
    await page.goto("/supply-chain")
    await expect(page.getByText(/Supply Chain/i).first()).toBeVisible()
  })

  test("sales orders page with status tabs", async ({ page }) => {
    await page.goto("/supply-chain/sales-orders")
    await expect(page.getByText(/Sales Order/i).first()).toBeVisible()
    // Status tabs
    await expect(page.getByRole("button", { name: /All/i }).first()).toBeVisible()
  })

  test("sales orders page renders content", async ({ page }) => {
    await page.goto("/supply-chain/sales-orders")
    await expect(page.getByText(/Sales Order/i).first()).toBeVisible()
    // Page structure loaded — tabs or data present
    await page.waitForTimeout(3_000)
    const bodyText = await page.locator("body").innerText()
    expect(bodyText.length).toBeGreaterThan(100)
  })

  test("BOM manager loads", async ({ page }) => {
    await page.goto("/supply-chain/bom")
    await expect(page.getByText(/BOM|Bill of Materials/i).first()).toBeVisible()
  })

  test("purchase orders page loads", async ({ page }) => {
    await page.goto("/supply-chain/purchase-orders")
    await expect(page.getByText(/Purchase Order/i).first()).toBeVisible()
  })

  test("suppliers page shows supplier cards", async ({ page }) => {
    await page.goto("/supply-chain/suppliers")
    await expect(page.getByText(/Supplier/i).first()).toBeVisible()
    await expect(page.getByText(/Mouser|Digi-Key|Arrow/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("supplier scorecard visible", async ({ page }) => {
    await page.goto("/supply-chain/suppliers")
    await expect(page.getByText(/On-Time|Quality|Rating/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("sidebar navigation between sub-pages", async ({ page }) => {
    await page.goto("/supply-chain")
    await page.getByRole("link", { name: "Inventory" }).click()
    await expect(page.getByText(/Inventory/i).first()).toBeVisible()
  })
})
