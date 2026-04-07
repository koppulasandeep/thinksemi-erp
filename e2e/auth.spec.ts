import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // unauthenticated

  test("login page renders with form fields", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    await expect(page.getByText("Welcome Back")).toBeVisible()
  })

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[type="email"]', "admin@thinksemi.com")
    await page.fill('input[type="password"]', "ThinkSemi@ERP2026!")
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 30_000 })
    // After login, should be on main app (not login page)
    await expect(page.locator('input[type="email"]')).not.toBeVisible({ timeout: 5_000 })
  })

  test("wrong password shows error or stays on login", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[type="email"]', "admin@thinksemi.com")
    await page.fill('input[type="password"]', "wrongpassword")
    await page.click('button[type="submit"]')
    // Should remain on login page (either show error text or stay on /login)
    await page.waitForTimeout(5_000)
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test("unauthenticated access redirects to login", async ({ page }) => {
    await page.goto("/hr")
    await page.waitForURL(/login/, { timeout: 10_000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })
})
