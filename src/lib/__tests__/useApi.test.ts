import { describe, it, expect } from "vitest"
import { snakeToCamel, transformList } from "../useApi"

describe("snakeToCamel", () => {
  it("converts snake_case keys to camelCase", () => {
    expect(snakeToCamel({ part_number: "X", created_at: "Y" })).toEqual({
      partNumber: "X",
      createdAt: "Y",
    })
  })

  it("leaves non-snake keys unchanged", () => {
    expect(snakeToCamel({ name: "A", id: "1" })).toEqual({ name: "A", id: "1" })
  })

  it("handles empty object", () => {
    expect(snakeToCamel({})).toEqual({})
  })
})

describe("transformList", () => {
  it("converts array of snake_case objects without mapFn", () => {
    const input = [{ part_number: "X" }, { part_number: "Y" }]
    const result = transformList(input)
    expect(result).toEqual([{ partNumber: "X" }, { partNumber: "Y" }])
  })

  it("applies custom mapFn when provided", () => {
    const input = [{ a: 1 }, { a: 2 }]
    const result = transformList(input, (item) => ({ val: item.a * 10 }))
    expect(result).toEqual([{ val: 10 }, { val: 20 }])
  })

  it("handles empty array", () => {
    expect(transformList([])).toEqual([])
  })
})
