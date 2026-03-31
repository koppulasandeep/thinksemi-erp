import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Upload,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Cpu,
  PackageCheck,
  ShoppingCart,
  History,
  PieChart,
  ArrowRightLeft,
  Layers,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { bomItems, bomWhereUsed, bomRevisions, bomAlternates } from "@/lib/mock-data"
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

type StockLevel = "out" | "low" | "ok"
type BOMTab = "items" | "where-used" | "revisions" | "cost" | "alternates"

const bomTabs: { key: BOMTab; label: string; icon: React.ElementType }[] = [
  { key: "items", label: "BOM Items", icon: Layers },
  { key: "where-used", label: "Where-Used", icon: ArrowRightLeft },
  { key: "revisions", label: "Revision History", icon: History },
  { key: "cost", label: "Cost Analysis", icon: PieChart },
  { key: "alternates", label: "Alternates", icon: PackageCheck },
]

function getStockLevel(item: (typeof bomItems)[0]): StockLevel {
  if (item.stock === 0) return "out"
  const threshold = item.price > 10 ? 500 : 1000
  if (item.stock < threshold) return "low"
  return "ok"
}

const stockColorMap: Record<StockLevel, string> = {
  out: "text-destructive font-semibold",
  low: "text-warning font-semibold",
  ok: "text-foreground",
}

const stockBgMap: Record<StockLevel, string> = {
  out: "bg-destructive/5",
  low: "bg-warning/5",
  ok: "",
}

const categoryMap: Record<string, string> = {
  ICs: "#3b82f6",
  Passives: "#22c55e",
  Connectors: "#f59e0b",
  Mechanicals: "#8b5cf6",
}

export function BOMManager() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<BOMTab>("items")
  const [availabilityChecked, setAvailabilityChecked] = useState(false)
  const [whereUsedSearch, setWhereUsedSearch] = useState("")

  const filtered = bomItems.filter(
    (item) =>
      item.ref.toLowerCase().includes(search.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.value.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(search.toLowerCase())
  )

  const outOfStock = filtered.filter((i) => getStockLevel(i) === "out").length
  const lowStock = filtered.filter((i) => getStockLevel(i) === "low").length
  const okStock = filtered.filter((i) => getStockLevel(i) === "ok").length
  const totalCost = filtered.reduce((sum, i) => sum + i.price * i.qtyPerBoard, 0)

  // Cost analysis data
  const costByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const item of bomItems) {
      const cat = item.category
      map[cat] = (map[cat] || 0) + item.price * item.qtyPerBoard
    }
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: categoryMap[name] || "#94a3b8",
    }))
  }, [])

  const costTrend = bomRevisions
    .slice()
    .reverse()
    .map((r) => ({ rev: r.rev, cost: r.totalCost, parts: r.partCount }))

  // Where-used filtered
  const whereUsedFiltered = bomWhereUsed.filter(
    (w) =>
      !whereUsedSearch ||
      w.partNumber.toLowerCase().includes(whereUsedSearch.toLowerCase())
  )



  return (
    <div className="space-y-4">
      <PageHeader
        title="BOM Manager"
        description="ECU-X500 Rev C &mdash; Bill of Materials with real-time stock status."
        action={{ label: "Import BOM", icon: Upload }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAvailabilityChecked(!availabilityChecked)}
          className={cn(availabilityChecked && "border-primary text-primary")}
        >
          <PackageCheck className="h-4 w-4 mr-1.5" />
          Check Availability
        </Button>
        <Button variant="outline" size="sm">
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          Generate Purchase List
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {bomTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* BOM Items Tab */}
      {activeTab === "items" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ref, part number, value, mfr..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Filter className="h-3.5 w-3.5 mr-1" />
              Filter
            </Button>
            <ExportButtons
              data={filtered.map((item) => ({
                ref: item.ref,
                partNumber: item.partNumber,
                value: item.value,
                package: item.package,
                manufacturer: item.manufacturer,
                stock: formatNumber(item.stock),
                price: formatCurrency(item.price),
                alternates: item.alternates,
                msl: item.msl,
              }))}
              columns={[
                { key: "ref", label: "Ref" },
                { key: "partNumber", label: "Part Number" },
                { key: "value", label: "Value" },
                { key: "package", label: "Package" },
                { key: "manufacturer", label: "Manufacturer" },
                { key: "stock", label: "Stock" },
                { key: "price", label: "Price" },
                { key: "alternates", label: "Alternates" },
                { key: "msl", label: "MSL" },
              ]}
              filename="bom"
              title="BOM - ECU-X500 Rev C"
            />
          </div>

          {/* Dense Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2 w-14">Ref</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Part Number</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2 w-20">Value</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2 w-20">Package</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Manufacturer</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2 w-16">Category</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2 w-14">Qty/Bd</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2 w-20">Stock</th>
                    {availabilityChecked && (
                      <th className="text-center font-medium text-muted-foreground px-3 py-2 w-20">Avail</th>
                    )}
                    <th className="text-right font-medium text-muted-foreground px-3 py-2 w-20">Price</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2 w-16">Alt</th>
                    <th className="text-center font-medium text-muted-foreground px-3 py-2 w-14">MSL</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const level = getStockLevel(item)
                    const needed = item.qtyPerBoard * 1000
                    const sufficient = item.stock >= needed
                    return (
                      <tr
                        key={item.ref}
                        className={cn(
                          "border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                          stockBgMap[level]
                        )}
                      >
                        <td className="px-3 py-1.5 font-mono font-semibold text-muted-foreground">
                          {item.ref}
                        </td>
                        <td className="px-3 py-1.5 font-mono">
                          <span className="font-medium">{item.partNumber}</span>
                        </td>
                        <td className="px-3 py-1.5">{item.value}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{item.package}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{item.manufacturer}</td>
                        <td className="px-3 py-1.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">{item.qtyPerBoard}</td>
                        <td className={cn("px-3 py-1.5 text-right font-mono", stockColorMap[level])}>
                          <span className="inline-flex items-center gap-1">
                            {level === "out" && <XCircle className="h-3 w-3" />}
                            {level === "low" && <AlertTriangle className="h-3 w-3" />}
                            {formatNumber(item.stock)}
                          </span>
                        </td>
                        {availabilityChecked && (
                          <td className="px-3 py-1.5 text-center">
                            {sufficient ? (
                              <Badge variant="success" className="text-[10px] px-1.5 py-0">OK</Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Short {formatNumber(needed - item.stock)}
                              </Badge>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-1.5 text-right font-mono">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {item.alternates > 0 ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {item.alternates}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <Badge
                            variant={item.msl >= 3 ? "warning" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {item.msl}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        No BOM items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t bg-muted/30 text-xs">
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className={cn(outOfStock > 0 ? "text-destructive font-semibold" : "text-muted-foreground")}>
                  {outOfStock} out of stock
                </span>
              </div>
              <span className="text-muted-foreground/30">|</span>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                <span className={cn(lowStock > 0 ? "text-warning font-semibold" : "text-muted-foreground")}>
                  {lowStock} low stock
                </span>
              </div>
              <span className="text-muted-foreground/30">|</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-success" />
                <span className="text-muted-foreground">{okStock} OK</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="h-3.5 w-3.5" />
                <span>
                  {filtered.length} line items &middot; Unit cost:{" "}
                  <span className="font-medium text-foreground">{formatCurrency(totalCost)}</span>
                </span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Where-Used Tab */}
      {activeTab === "where-used" && (
        <Card className="p-4 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search component part number..."
              value={whereUsedSearch}
              onChange={(e) => setWhereUsedSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="space-y-3">
            {whereUsedFiltered.map((item) => (
              <div key={item.partNumber} className="border rounded-lg p-3">
                <div className="font-mono font-medium text-sm mb-2">{item.partNumber}</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.usedIn.map((product) => (
                    <Badge key={product} variant="secondary" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Used in {item.usedIn.length} product{item.usedIn.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
            {whereUsedFiltered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No components found.</p>
            )}
          </div>
        </Card>
      )}

      {/* Revision History Tab */}
      {activeTab === "revisions" && (
        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-semibold">ECU-X500 BOM Revision History</h3>
          <div className="space-y-3">
            {bomRevisions.map((rev, idx) => (
              <div
                key={rev.rev}
                className={cn(
                  "border rounded-lg p-4",
                  idx === 0 && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? "default" : "secondary"} className="text-xs">
                      {rev.rev}
                    </Badge>
                    {idx === 0 && (
                      <Badge variant="success" className="text-[10px]">Current</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>{new Date(rev.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    <div>by {rev.author}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{rev.changes}</p>
                <Separator className="my-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Parts: <span className="font-medium text-foreground">{rev.partCount}</span></span>
                  <span>BOM Cost: <span className="font-medium text-foreground">{formatCurrency(rev.totalCost)}</span></span>
                  {idx < bomRevisions.length - 1 && (
                    <span>
                      Cost change:{" "}
                      <span className={cn("font-medium", rev.totalCost > bomRevisions[idx + 1].totalCost ? "text-red-600" : "text-emerald-600")}>
                        {rev.totalCost > bomRevisions[idx + 1].totalCost ? "+" : ""}
                        {formatCurrency(rev.totalCost - bomRevisions[idx + 1].totalCost)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === "cost" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1">Cost Breakdown by Category</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Total BOM cost per unit: <span className="font-medium text-foreground">{formatCurrency(totalCost)}</span>
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={costByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {costByCategory.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {costByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}: {formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-1">BOM Cost Trend Over Revisions</h3>
            <p className="text-xs text-muted-foreground mb-4">Tracking cost changes across BOM revisions</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="rev" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v}`} />
                  <Tooltip formatter={(val: any) => formatCurrency(val)} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top cost items */}
          <Card className="p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold mb-3">Top Cost Components (per unit)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Ref</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Part</th>
                    <th className="text-left font-medium text-muted-foreground px-3 py-2">Category</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2">Unit Price</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2">Qty/Board</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2">Ext Cost</th>
                    <th className="text-right font-medium text-muted-foreground px-3 py-2">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...bomItems]
                    .sort((a, b) => b.price * b.qtyPerBoard - a.price * a.qtyPerBoard)
                    .slice(0, 8)
                    .map((item) => {
                      const extCost = item.price * item.qtyPerBoard
                      const pct = totalCost > 0 ? ((extCost / totalCost) * 100).toFixed(1) : "0"
                      return (
                        <tr key={item.ref} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-1.5 font-mono font-semibold text-muted-foreground">{item.ref}</td>
                          <td className="px-3 py-1.5 font-mono font-medium">{item.partNumber}</td>
                          <td className="px-3 py-1.5"><Badge variant="secondary" className="text-[10px] px-1.5 py-0">{item.category}</Badge></td>
                          <td className="px-3 py-1.5 text-right font-mono">{formatCurrency(item.price)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{item.qtyPerBoard}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-medium">{formatCurrency(extCost)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{pct}%</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Alternates Tab */}
      {activeTab === "alternates" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Ref</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Primary Part</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Alternate Part</th>
                  <th className="text-left font-medium text-muted-foreground px-3 py-2">Supplier</th>
                  <th className="text-right font-medium text-muted-foreground px-3 py-2">Price</th>
                  <th className="text-right font-medium text-muted-foreground px-3 py-2">Lead Time</th>
                  <th className="text-center font-medium text-muted-foreground px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bomAlternates.map((alt, idx) => (
                  <tr
                    key={`${alt.ref}-${alt.alternate}-${idx}`}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-muted-foreground">{alt.ref}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{alt.primary}</td>
                    <td className="px-3 py-2 font-mono font-medium">{alt.alternate}</td>
                    <td className="px-3 py-2">{alt.supplier}</td>
                    <td className="px-3 py-2 text-right font-mono">{formatCurrency(alt.price)}</td>
                    <td className="px-3 py-2 text-right">{alt.leadTime}</td>
                    <td className="px-3 py-2 text-center">
                      <StatusBadge status={alt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t bg-muted/30 text-xs text-muted-foreground">
            {bomAlternates.length} alternate parts &middot;{" "}
            {bomAlternates.filter((a) => a.status === "approved").length} approved &middot;{" "}
            {bomAlternates.filter((a) => a.status === "qualified").length} qualified
          </div>
        </Card>
      )}
    </div>
  )
}
