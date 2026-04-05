import { useState, useEffect, useCallback } from "react"
import { api } from "./api"

/**
 * Fetch data from API with mock data fallback.
 * If the API call fails (backend down, cold start, etc.), the mock data is kept.
 */
export function useApiData<T>(
  endpoint: string,
  fallback: T,
  transform?: (raw: any) => T
): { data: T; loading: boolean; error: string | null; refetch: () => void } {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    api
      .get<any>(endpoint)
      .then((raw) => {
        const result = transform ? transform(raw) : (raw as T)
        setData(result)
      })
      .catch((err) => {
        setError(err.message || "API error")
        // keep fallback data
      })
      .finally(() => setLoading(false))
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Perform a mutation (POST/PATCH/PUT/DELETE) with loading state.
 */
export function useApiMutation<TResult = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(
    async (
      method: "post" | "patch" | "put" | "delete",
      endpoint: string,
      body?: any
    ): Promise<TResult | null> => {
      setLoading(true)
      setError(null)
      try {
        const result = await api[method]<TResult>(endpoint, body)
        return result
      } catch (err: any) {
        setError(err.message || "Mutation failed")
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { mutate, loading, error }
}

/** Convert snake_case keys to camelCase (shallow) */
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = obj[key]
  }
  return result
}

/** Convert an array of snake_case objects to camelCase */
export function transformList<T>(data: any[], mapFn?: (item: any) => T): T[] {
  if (mapFn) return data.map(mapFn)
  return data.map((item) => snakeToCamel(item) as T)
}
