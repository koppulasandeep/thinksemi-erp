import { useRef, useState, useEffect, useCallback } from "react"
import { Download, ChevronDown, FileSpreadsheet, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintableTable } from "@/components/shared/PrintableTable"

export interface ExportColumn {
  key: string
  label: string
}

interface ExportButtonsProps {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  filename: string
  title?: string
}

function formatCSVValue(value: unknown): string {
  if (value == null) return ""
  const str = String(value)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function exportCSV(data: Record<string, unknown>[], columns: ExportColumn[], filename: string) {
  const header = columns.map((c) => formatCSVValue(c.label)).join(",")
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key]
        // Format dates
        if (val instanceof Date) {
          return formatCSVValue(val.toLocaleDateString("en-IN"))
        }
        return formatCSVValue(val)
      })
      .join(",")
  )

  // UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF"
  const csvContent = BOM + [header, ...rows].join("\r\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function ExportButtons({ data, columns, filename, title }: ExportButtonsProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, handleClose])

  const handlePrint = () => {
    setOpen(false)
    document.body.setAttribute("data-printing", "true")
    const el = printRef.current
    if (el) {
      el.setAttribute("data-print-active", "true")
    }
    window.print()
    document.body.removeAttribute("data-printing")
    if (el) {
      el.removeAttribute("data-print-active")
    }
  }

  const handleCSV = () => {
    setOpen(false)
    exportCSV(data, columns, filename)
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((prev) => !prev)}
        >
          <Download className="h-3.5 w-3.5" />
          Export
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>

        {open && (
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border bg-popover shadow-md">
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors rounded-t-md cursor-pointer"
              onClick={handleCSV}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
              Export as CSV
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors rounded-b-md cursor-pointer"
              onClick={handlePrint}
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Export as PDF
            </button>
          </div>
        )}
      </div>

      <PrintableTable
        ref={printRef}
        data={data}
        columns={columns}
        title={title ?? filename}
      />
    </>
  )
}
