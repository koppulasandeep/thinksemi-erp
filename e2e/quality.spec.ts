import { test, expect } from "@playwright/test"

test.describe("Quality Module (QMS)", () => {
  test("quality dashboard loads", async ({ page }) => {
    await page.goto("/quality")
    await expect(page.getByText(/Quality|QMS/i).first()).toBeVisible()
  })

  test("quality metrics visible", async ({ page }) => {
    await page.goto("/quality")
    await expect(page.getByText(/First Pass Yield|FPY|DPMO|Open NCR/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("NCR list page loads", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.getByText(/NCR|Non-Conformance/i).first()).toBeVisible()
  })

  test("NCR data renders", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.locator("table, [class*=card], [class*=Card]").first()).toBeVisible({ timeout: 15_000 })
  })

  test("NCR severity badges visible", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.getByText(/major|minor|critical/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
