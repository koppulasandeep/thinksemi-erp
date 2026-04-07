import { test, expect } from "@playwright/test"

test.describe("Sales CRM Module", () => {
  test("CRM dashboard loads", async ({ page }) => {
    await page.goto("/crm")
    await expect(page.getByText(/CRM|Sales/i).first()).toBeVisible()
  })

  test("pipeline page shows kanban columns", async ({ page }) => {
    await page.goto("/crm/pipeline")
    await expect(page.getByText(/New Lead|Qualified|Quoted|Negotiation|Won|Lost/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("lead cards show company names", async ({ page }) => {
    await page.goto("/crm")
    await expect(page.getByText(/Bosch|Continental|Tata|Mahindra/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("contacts page loads", async ({ page }) => {
    await page.goto("/crm/contacts")
    await expect(page.getByText(/contact/i).first()).toBeVisible()
  })

  test("quotations page loads", async ({ page }) => {
    await page.goto("/crm/quotations")
    await expect(page.getByText(/quotation/i).first()).toBeVisible()
  })

  test("tab navigation works", async ({ page }) => {
    await page.goto("/crm")
    const tabs = page.getByRole("button")
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(2)
  })
})
