import "@testing-library/jest-dom/vitest"

// Mock window.location (needed by logout and 401 handler)
Object.defineProperty(window, "location", {
  writable: true,
  value: { href: "/", assign: vi.fn(), replace: vi.fn() },
})

// Ensure localStorage is available with all methods
if (typeof globalThis.localStorage === "undefined" || !globalThis.localStorage.clear) {
  const store: Record<string, string> = {}
  const mockStorage: Storage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
  }
  Object.defineProperty(globalThis, "localStorage", { value: mockStorage, writable: true })
}
