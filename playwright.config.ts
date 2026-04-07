import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL || "https://thinksemi-pcb-erp.netlify.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
  },

  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/, teardown: undefined },
    {
      name: "admin",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      dependencies: ["setup"],
      testIgnore: /role-access/,
    },
    {
      name: "roles",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
      testMatch: /role-access/,
    },
  ],
})
