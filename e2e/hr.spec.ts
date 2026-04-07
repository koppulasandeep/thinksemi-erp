import { test, expect } from "@playwright/test"

test.describe("HR & Payroll Module", () => {
  test("HR page loads with tabs", async ({ page }) => {
    await page.goto("/hr")
    await expect(page.getByText("Human Resources")).toBeVisible()
    for (const tab of ["Overview", "Attendance", "Leave", "Payroll", "Salary"]) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible()
    }
  })

  test("tab switching works", async ({ page }) => {
    await page.goto("/hr")
    await page.getByRole("button", { name: "Attendance" }).click()
    await expect(page.getByText(/present today|attendance/i).first()).toBeVisible()
    await page.getByRole("button", { name: "Leave" }).click()
    await expect(page.getByText(/leave/i).first()).toBeVisible()
  })

  test("overview shows employee directory", async ({ page }) => {
    await page.goto("/hr")
    await expect(page.getByText("Total Employees").first()).toBeVisible({ timeout: 15_000 })
  })

  test("salary tab loads with employee selector", async ({ page }) => {
    await page.goto("/hr/salary")
    await expect(page.getByText("Salary Structure").first()).toBeVisible()
    // Either shows select or loading
    await expect(page.getByText(/Select Employee|Loading/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("holidays tab shows holiday table", async ({ page }) => {
    await page.goto("/hr/holidays")
    await expect(page.getByText(/Holiday/i).first()).toBeVisible()
    // Should show holiday entries from seed data
    await expect(page.getByText(/Republic Day|Pongal|Diwali/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test("payroll tab loads", async ({ page }) => {
    await page.goto("/hr")
    await page.getByRole("button", { name: "Payroll" }).click()
    await expect(page.getByText(/payroll|batch/i).first()).toBeVisible()
  })

  test("leave tab shows leave types", async ({ page }) => {
    await page.goto("/hr")
    await page.getByRole("button", { name: "Leave" }).click()
    await expect(page.getByText(/earned|casual|sick/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
