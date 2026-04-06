import { describe, it, expect } from "vitest"
import { cn, formatCurrency, formatNumber, formatPercent, getInitials, getStatusColor } from "../utils"

describe("formatCurrency", () => {
  it("formats INR amount with Indian grouping", () => {
    const result = formatCurrency(50000)
    expect(result).toContain("50,000")
  })

  it("handles zero", () => {
    const result = formatCurrency(0)
    expect(result).toContain("0")
  })

  it("handles large numbers", () => {
    const result = formatCurrency(1234567)
    expect(result).toContain("12,34,567")
  })
})

describe("formatNumber", () => {
  it("formats with Indian grouping", () => {
    expect(formatNumber(1234567)).toBe("12,34,567")
  })
})

describe("formatPercent", () => {
  it("formats with one decimal", () => {
    expect(formatPercent(85.678)).toBe("85.7%")
  })
})

describe("getInitials", () => {
  it("returns two-letter initials from full name", () => {
    expect(getInitials("Sandeep Koppula")).toBe("SK")
  })

  it("limits to 2 characters for three-word names", () => {
    expect(getInitials("A B C")).toBe("AB")
  })

  it("returns single initial for single name", () => {
    expect(getInitials("Sandeep")).toBe("S")
  })
})

describe("getStatusColor", () => {
  it("returns emerald classes for active status", () => {
    expect(getStatusColor("active")).toContain("emerald")
  })

  it("returns slate fallback for unknown status", () => {
    expect(getStatusColor("unknown_xyz")).toContain("slate")
  })

  it("handles case-insensitive input", () => {
    expect(getStatusColor("ACTIVE")).toContain("emerald")
  })
})

describe("cn", () => {
  it("merges tailwind classes correctly", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })
})
