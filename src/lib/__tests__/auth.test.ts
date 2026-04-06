import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getCurrentUser, isAuthenticated, login } from "../auth"

const STORAGE_KEY = "pcb_erp_user"

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal("fetch", vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("getCurrentUser", () => {
  it("returns null when nothing stored", () => {
    expect(getCurrentUser()).toBeNull()
  })

  it("returns parsed user when stored", () => {
    const user = { id: "1", name: "Test", email: "t@t.com", role: "admin", designation: "Admin", avatar: null }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    expect(getCurrentUser()).toEqual(user)
  })

  it("returns null on corrupt JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json{{{")
    expect(getCurrentUser()).toBeNull()
  })
})

describe("isAuthenticated", () => {
  it("returns false when no user", () => {
    expect(isAuthenticated()).toBe(false)
  })

  it("returns true when user stored", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: "1" }))
    expect(isAuthenticated()).toBe(true)
  })
})

describe("login", () => {
  it("falls back to demo users when API fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"))
    vi.stubGlobal("fetch", fetchMock)

    const user = await login("superadmin@thinksemi.com", "ThinkSemi@ERP2026!")
    expect(user).not.toBeNull()
    expect(user!.role).toBe("super_admin")
  })

  it("returns null for wrong credentials", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"))
    vi.stubGlobal("fetch", fetchMock)

    const user = await login("nobody@test.com", "wrongpass")
    expect(user).toBeNull()
  })
})
