import { useState } from "react"
import {
  Package,
  Search,
  AlertTriangle,
  XCircle,
  Filter,
  MapPin,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { inventoryItems } from "@/lib/mock-data"

export function InventoryDashboard() {
  const [search, setSearch] = useState("")

  const filtered = inventoryItems.filter(
    (item) =>
      item.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
  )

  // KPI calculations
  const totalSKUs = inventoryItems.length
  // Approximate total value (stock * avg unit price based on mock data)
  const totalValue = 1842000
  const lowStockCount = inventoryItems.filter(
    (i) => i.stock > 0 && i.stock < i.reorderPoint
  ).length
  const outOfStockCount = inventoryItems.filter((i) => i.stock === 0).length
  const expiredCount = 0 // Placeholder

  function getStockStatus(item: (typeof inventoryItems)[0]) {
    if (item.stock === 0) return "out"
    if (item.stock < item.reorderPoint) return "low"
    return "ok"
  }

  const statusColorMap = {
    out: "text-destructive",
    low: "text-warning",
    ok: "text-foreground",
  }

  const rowBgMap = {
    out: "bg-destructive/5",
    low: "bg-warning/5",
    ok: "",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Component stock levels, reel tracking, and bin locations."
        action={{ label: "Add Item", icon: Package }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total SKUs"
          value={String(totalSKUs)}
          icon={Package}
          iconColor="text-primary"
        />
        <KPICard
          title="Total Value"
          value={formatCurrency(totalValue)}
          icon={Package}
          iconColor="text-info"
        />
        <KPICard
          title="Low Stock"
          value={String(lowStockCount)}
          subtitle={`${outOfStockCount} out of stock`}
          icon={AlertTriangle}
          iconColor="text-warning"
        />
        <KPICard
          title="Expired Reels"
          value={String(expiredCount)}
          icon={XCircle}
          iconColor="text-destructive"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search part number, description, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1.5" />
          Filter
        </Button>
        <ExportButtons
          data={filtered.map((item) => ({
            partNumber: item.partNumber,
            description: item.description,
            stock: formatNumber(item.stock),
            reelCount: item.reelCount,
            location: item.location,
            msl: item.msl,
            reorderPoint: formatNumber(item.reorderPoint),
          }))}
          columns={[
            { key: "partNumber", label: "Part Number" },
            { key: "description", label: "Description" },
            { key: "stock", label: "Stock" },
            { key: "reelCount", label: "Reels" },
            { key: "location", label: "Location" },
            { key: "msl", label: "MSL" },
            { key: "reorderPoint", label: "Reorder Point" },
          ]}
          filename="inventory"
          title="Inventory"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Part Number</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Description</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Stock</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Reels</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Location</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">MSL</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Reorder Point</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const status = getStockStatus(item)
                return (
                  <tr
                    key={item.partNumber}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                      rowBgMap[status]
                    )}
                  >
                    <td className="px-4 py-3 font-mono font-medium">{item.partNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                    <td className={cn("px-4 py-3 text-right font-mono font-medium", statusColorMap[status])}>
                      <span className="inline-flex items-center gap-1">
                        {status === "out" && <XCircle className="h-3.5 w-3.5" />}
                        {status === "low" && <AlertTriangle className="h-3.5 w-3.5" />}
                        {formatNumber(item.stock)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{item.reelCount}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={item.msl >= 3 ? "warning" : "secondary"}
                        className="text-xs px-1.5 py-0"
                      >
                        MSL {item.msl}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {formatNumber(item.reorderPoint)}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </Card>
    </div>
  )
}
