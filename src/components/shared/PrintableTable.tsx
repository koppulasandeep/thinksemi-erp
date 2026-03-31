import { forwardRef } from "react"
import type { ExportColumn } from "@/components/shared/ExportButtons"

interface PrintableTableProps {
  data: Record<string, unknown>[]
  columns: ExportColumn[]
  title: string
}

export const PrintableTable = forwardRef<HTMLDivElement, PrintableTableProps>(
  function PrintableTable({ data, columns, title }, ref) {
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    return (
      <div ref={ref} className="printable-table">
        <div className="printable-table-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/thinksemi-logo.png"
              alt="Thinksemi Infotech"
              style={{ height: "36px", objectFit: "contain" }}
            />
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>{title}</h1>
              <p style={{ fontSize: "11px", color: "#666", margin: "4px 0 0" }}>
                Thinksemi Infotech Ltd &middot; Plot No. 7, SIDCO Industrial Estate, Ambattur, Chennai - 600058
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "11px", color: "#666" }}>
            <p style={{ margin: 0 }}>Generated: {today}</p>
            <p style={{ margin: "2px 0 0" }}>{data.length} records</p>
          </div>
        </div>

        <table className="printable-table-content">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key}>{String(row[col.key] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: "16px",
            paddingTop: "8px",
            borderTop: "1px solid #ccc",
            fontSize: "10px",
            color: "#999",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Thinksemi Infotech Ltd &middot; ERP System</span>
          <span>Page 1</span>
        </div>
      </div>
    )
  }
)
