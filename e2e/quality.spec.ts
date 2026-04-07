import { test, expect } from "@playwright/test"

test.describe("Quality Module", () => {
  test("quality dashboard loads with metrics", async ({ page }) => {
    await page.goto("/quality")
    await expect(page.getByText(/Quality/i).first()).toBeVisible()
    await expect(page.getByText(/First Pass Yield|FPY|DPMO|NCR/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("NCR list page loads", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.getByText(/NCR|Non-Conformance/i).first()).toBeVisible()
  })

  test("NCR page renders data", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.getByText(/NCR|Non-Conformance/i).first()).toBeVisible()
    await page.waitForTimeout(3_000)
    const bodyText = await page.locator("body").innerText()
    expect(bodyText.length).toBeGreaterThan(100)
  })

  test("severity badges visible", async ({ page }) => {
    await page.goto("/quality/ncr")
    await expect(page.getByText(/major|minor|critical/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("quality tabs work", async ({ page }) => {
    await page.goto("/quality")
    const tabs = page.getByRole("button")
    const count = await tabs.count()
    expect(count).toBeGreaterThan(2)
  })

  test("quality dashboard shows charts area", async ({ page }) => {
    await page.goto("/quality")
    // Charts or metric cards should be present
    await expect(page.locator(".recharts-wrapper, [class*=Card]").first()).toBeVisible({ timeout: 15_000 })
  })
})
