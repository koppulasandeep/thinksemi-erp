import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getToken, setToken, clearToken, apiFetch } from "../api"

beforeEach(() => {
  localStorage.clear()
})

describe("token management", () => {
  it("getToken returns null when empty", () => {
    expect(getToken()).toBeNull()
  })

  it("setToken + getToken roundtrip", () => {
    setToken("test-token-123")
    expect(getToken()).toBe("test-token-123")
  })

  it("clearToken removes token", () => {
    setToken("test-token-123")
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe("apiFetch", () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("adds Authorization header when token exists", async () => {
    setToken("my-jwt")
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "test" }),
    })

    await apiFetch("/test")

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers["Authorization"]).toBe("Bearer my-jwt")
  })

  it("parses JSON on 200", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: 42 }),
    })

    const data = await apiFetch("/test")
    expect(data).toEqual({ result: 42 })
  })

  it("clears token and throws on 401", async () => {
    setToken("old-token")
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
    })

    await expect(apiFetch("/test")).rejects.toThrow("Unauthorized")
    expect(getToken()).toBeNull()
  })

  it("throws with detail message on error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: "Bad request" }),
    })

    await expect(apiFetch("/test")).rejects.toThrow("Bad request")
  })

  it("returns undefined on 204", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    })

    const result = await apiFetch("/test")
    expect(result).toBeUndefined()
  })
})
