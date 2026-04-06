import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { ChevronUp, ChevronDown, Search } from "lucide-react"

interface Column<T> {
  key: keyof T & string
  label: string
  sortable?: boolean
  render?: (value: T[keyof T], row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
}

type SortDir = "asc" | "desc" | null

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const v = row[col.key]
        return typeof v === "string" && v.toLowerCase().includes(q)
      })
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null || bv == null) return 0
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const paged = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)
  const start = sorted.length === 0 ? 0 : safePage * pageSize + 1
  const end = Math.min((safePage + 1) * pageSize, sorted.length)

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir("asc")
    } else if (sortDir === "asc") {
      setSortDir("desc")
    } else {
      setSortKey(null)
      setSortDir(null)
    }
    setPage(0)
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 dark:bg-muted/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-foreground"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && sortDir === "asc" && (
                      <ChevronUp className="h-3.5 w-3.5" />
                    )}
                    {col.sortable && sortKey === col.key && sortDir === "desc" && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyMessage} description={search ? "Try adjusting your search" : undefined} />
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b last:border-b-0 transition-colors hover:bg-muted/40 dark:hover:bg-muted/20",
                    i % 2 === 1 && "bg-muted/20 dark:bg-muted/10"
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {start}-{end} of {sorted.length}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
            >
              Previous
            </Button>
            <span className="px-2 font-medium text-foreground">
              {safePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
