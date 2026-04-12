import { test, expect } from "@playwright/test"

test.describe("Engineering: NPI & ECO", () => {
  test("NPI pipeline loads", async ({ page }) => {
    await page.goto("/npi")
    await expect(page.getByText(/NPI|New Product/i).first()).toBeVisible()
  })

  test("NPI projects visible", async ({ page }) => {
    await page.goto("/npi")
    // NPI cards or table should render with project data
    await expect(page.locator("[class*=card], [class*=Card], table").first()).toBeVisible({ timeout: 15_000 })
  })

  test("ECO list loads", async ({ page }) => {
    await page.goto("/eco")
    await expect(page.getByText(/ECO|Engineering Change/i).first()).toBeVisible()
  })

  test("ECO entries visible", async ({ page }) => {
    await page.goto("/eco")
    await expect(page.getByText(/ECU-X500|ADAS|Cap Change|DDR3/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("NPI stages visible", async ({ page }) => {
    await page.goto("/npi")
    await expect(page.getByText(/feasibility|prototype|pilot|production.ready/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
