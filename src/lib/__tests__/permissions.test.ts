import { describe, it, expect } from "vitest"
import { canAccess, getDefaultRoute } from "../permissions"

describe("canAccess", () => {
  it("super_admin can access everything", () => {
    expect(canAccess("super_admin", "/hr")).toBe(true)
    expect(canAccess("super_admin", "/finance")).toBe(true)
    expect(canAccess("super_admin", "/anything")).toBe(true)
  })

  it("operator cannot access finance", () => {
    expect(canAccess("operator", "/finance")).toBe(false)
  })

  it("operator can access manufacturing", () => {
    expect(canAccess("operator", "/manufacturing")).toBe(true)
  })

  it("customer can only access portal", () => {
    expect(canAccess("customer", "/portal")).toBe(true)
    expect(canAccess("customer", "/")).toBe(false)
    expect(canAccess("customer", "/hr")).toBe(false)
  })

  it("returns false for undefined role", () => {
    expect(canAccess(undefined, "/")).toBe(false)
  })

  it("hr_manager can access root dashboard", () => {
    expect(canAccess("hr_manager", "/")).toBe(true)
  })

  it("handles sub-routes correctly", () => {
    expect(canAccess("hr_manager", "/hr/employees")).toBe(true)
    expect(canAccess("hr_manager", "/finance/invoices")).toBe(false)
  })
})

describe("getDefaultRoute", () => {
  it("returns /portal for customer role", () => {
    expect(getDefaultRoute("customer")).toBe("/portal")
  })

  it("returns / for admin role", () => {
    expect(getDefaultRoute("admin")).toBe("/")
  })
})
