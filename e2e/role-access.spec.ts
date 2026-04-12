import { test, expect } from "@playwright/test"

test.describe("Role-Based Access Control", () => {
  test("operator can access manufacturing", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/operator.json" })
    const page = await ctx.newPage()
    await page.goto("/manufacturing")
    await expect(page.getByText(/Manufacturing|Production/i).first()).toBeVisible()
    await ctx.close()
  })

  test("operator can access quality", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/operator.json" })
    const page = await ctx.newPage()
    await page.goto("/quality")
    await expect(page.getByText(/Quality|QMS/i).first()).toBeVisible()
    await ctx.close()
  })

  test("operator can access HR", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/operator.json" })
    const page = await ctx.newPage()
    await page.goto("/hr")
    await expect(page.getByText(/Human Resources/i).first()).toBeVisible()
    await ctx.close()
  })

  test("customer can access portal", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/customer.json" })
    const page = await ctx.newPage()
    await page.goto("/portal")
    await expect(page.getByText(/Portal|Order|Customer/i).first()).toBeVisible()
    await ctx.close()
  })

  test("hr_manager can access HR", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/hr.json" })
    const page = await ctx.newPage()
    await page.goto("/hr")
    await expect(page.getByText(/Human Resources/i).first()).toBeVisible()
    await ctx.close()
  })

  test("hr_manager can access settings", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/hr.json" })
    const page = await ctx.newPage()
    await page.goto("/settings")
    await expect(page.getByText(/Settings/i).first()).toBeVisible()
    await ctx.close()
  })

  test("sales can access CRM", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/sales.json" })
    const page = await ctx.newPage()
    await page.goto("/crm")
    await expect(page.getByText(/CRM|Sales/i).first()).toBeVisible()
    await ctx.close()
  })

  test("sales can access supply chain", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: "e2e/.auth/sales.json" })
    const page = await ctx.newPage()
    await page.goto("/supply-chain")
    await expect(page.getByText(/Supply Chain/i).first()).toBeVisible()
    await ctx.close()
  })
})
