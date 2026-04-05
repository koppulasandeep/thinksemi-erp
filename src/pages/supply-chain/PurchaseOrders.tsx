import { useState } from "react"
import {
  Search,
  Plus,
  Truck,
  ChevronDown,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  Clock,
  PackageCheck,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { purchaseOrders, suppliers } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"

const tabs = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "confirmed", label: "Sent" },
  { key: "partially_received", label: "Partially Received" },
  { key: "delayed", label: "Delayed" },
  { key: "closed", label: "Closed" },
] as const

type TabKey = (typeof tabs)[number]["key"]

export function PurchaseOrders() {
  const { data: poData } = useApiData(
    "/supply-chain/purchase-orders",
    purchaseOrders,
    (raw: any) => {
      const arr = raw?.purchase_orders ?? raw
      if (!Array.isArray(arr)) return purchaseOrders
      return arr.map((po: any) => {
        const c = snakeToCamel(po)
        return {
          id: c.refNumber ?? c.id,
          supplier: c.supplierName ?? c.supplier,
          items: c.items ?? c.itemCount ?? 0,
          total: c.total ?? c.totalValue ?? 0,
          eta: c.eta ?? c.expectedDate ?? "",
          status: c.status ?? "draft",
          orderedQty: c.orderedQty ?? 0,
          receivedQty: c.receivedQty ?? 0,
          leadTimeDays: c.leadTimeDays ?? 0,
          lineItems: (c.lineItems ?? []).map((li: any) => snakeToCamel(li)),
        }
      }) as typeof purchaseOrders
    }
  )

  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [search, setSearch] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [receivingPO, setReceivingPO] = useState<string | null>(null)

  const filtered = poData.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(search.toLowerCase()) ||
      po.supplier.toLowerCase().includes(search.toLowerCase())
    const matchesTab = activeTab === "all" || po.status === activeTab
    return matchesSearch && matchesTab
  })

  const tabCounts: Record<string, number> = {}
  for (const tab of tabs) {
    tabCounts[tab.key] =
      tab.key === "all"
        ? poData.length
        : poData.filter((po) => po.status === tab.key).length
  }

  // KPIs
  const openPOs = poData.filter((po) => po.status !== "closed").length
  const pendingValue = poData
    .filter((po) => po.status !== "closed")
    .reduce((s, po) => s + po.total, 0)
  const overduePOs = poData.filter((po) => {
    return po.status === "delayed" || (new Date(po.eta) < new Date() && po.status !== "closed")
  }).length
  const avgLeadTime = Math.round(
    poData.reduce((s, po) => s + po.leadTimeDays, 0) / poData.length
  )

  // Supplier performance lookup
  const supplierPerf = (name: string) => suppliers.find((s) => s.name.includes(name.split(" ")[0]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage procurement from component distributors."
        action={{ label: "New PO", icon: Plus }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Open POs"
          value={String(openPOs)}
          subtitle={`${poData.filter((p) => p.status === "confirmed").length} confirmed`}
          icon={ClipboardCheck}
          color="blue"
        />
        <KPICard
          title="Total Pending Value"
          value={formatCurrency(pendingValue)}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Overdue Deliveries"
          value={String(overduePOs)}
          subtitle={overduePOs > 0 ? "Requires attention" : "All on track"}
          icon={AlertTriangle}
          color="orange"
        />
        <KPICard
          title="Avg Lead Time"
          value={`${avgLeadTime} days`}
          subtitle="Across all suppliers"
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span
                className={cn(
                  "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search PO# or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <ExportButtons
          data={filtered.map((po) => ({
            id: po.id,
            supplier: po.supplier,
            items: po.items,
            total: formatCurrency(po.total),
            eta: new Date(po.eta).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            status: po.status,
          }))}
          columns={[
            { key: "id", label: "PO #" },
            { key: "supplier", label: "Supplier" },
            { key: "items", label: "Items" },
            { key: "total", label: "Total" },
            { key: "eta", label: "ETA" },
            { key: "status", label: "Status" },
          ]}
          filename="purchase-orders"
          title="Purchase Orders"
        />
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2 py-3" />
                <th className="text-left font-medium text-muted-foreground px-4 py-3">PO #</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Supplier</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Items</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Total</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">ETA</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Received</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => {
                const isExpanded = expandedRow === po.id
                const isReceiving = receivingPO === po.id
                const receivePct = po.orderedQty > 0 ? (po.receivedQty / po.orderedQty) * 100 : 0
                return (
                  <>
                    <tr
                      key={po.id}
                      onClick={() => setExpandedRow(isExpanded ? null : po.id)}
                      className={cn(
                        "border-b hover:bg-muted/30 transition-colors cursor-pointer",
                        isExpanded && "bg-muted/20"
                      )}
                    >
                      <td className="px-2 py-3 text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{po.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{po.supplier}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{po.items}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatCurrency(po.total)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(po.eta).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-mono">
                            {po.receivedQty}/{po.orderedQty}
                          </span>
                          <Progress value={receivePct} className="h-1.5 w-16" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={po.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {po.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReceivingPO(isReceiving ? null : po.id)
                              setExpandedRow(po.id)
                            }}
                          >
                            <PackageCheck className="h-3 w-3 mr-1" />
                            Receive
                          </Button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${po.id}-detail`}>
                        <td colSpan={9} className="bg-muted/10 px-6 py-4 border-b">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* PO Line Items */}
                            <div className="lg:col-span-2">
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                                {isReceiving ? "Receive Goods - GRN Entry" : "PO Line Items"}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b bg-muted/50">
                                      <th className="text-left font-medium text-muted-foreground px-2 py-1.5">Part</th>
                                      <th className="text-right font-medium text-muted-foreground px-2 py-1.5">Ordered</th>
                                      <th className="text-right font-medium text-muted-foreground px-2 py-1.5">Received</th>
                                      <th className="text-right font-medium text-muted-foreground px-2 py-1.5">Unit Price</th>
                                      {isReceiving && (
                                        <>
                                          <th className="text-right font-medium text-muted-foreground px-2 py-1.5">Qty to Receive</th>
                                          <th className="text-center font-medium text-muted-foreground px-2 py-1.5">QC Check</th>
                                          <th className="text-left font-medium text-muted-foreground px-2 py-1.5">Location</th>
                                        </>
                                      )}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {po.lineItems.map((li, idx) => {
                                      const remaining = li.qty - li.received
                                      return (
                                        <tr key={idx} className="border-b last:border-0">
                                          <td className="px-2 py-1.5 font-mono font-medium">{li.part}</td>
                                          <td className="px-2 py-1.5 text-right font-mono">{formatNumber(li.qty)}</td>
                                          <td className="px-2 py-1.5 text-right font-mono">
                                            <span className={cn(li.received === li.qty ? "text-emerald-600" : li.received > 0 ? "text-amber-600" : "text-muted-foreground")}>
                                              {formatNumber(li.received)}
                                            </span>
                                          </td>
                                          <td className="px-2 py-1.5 text-right font-mono">{formatCurrency(li.unitPrice)}</td>
                                          {isReceiving && (
                                            <>
                                              <td className="px-2 py-1.5 text-right">
                                                <Input
                                                  type="number"
                                                  min={0}
                                                  max={remaining}
                                                  defaultValue={remaining}
                                                  className="h-6 w-20 text-xs text-right ml-auto"
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </td>
                                              <td className="px-2 py-1.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-emerald-600 hover:text-emerald-700">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                  </Button>
                                                  <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-600 hover:text-red-700">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                  </Button>
                                                </div>
                                              </td>
                                              <td className="px-2 py-1.5">
                                                <Input
                                                  placeholder="e.g. R4-B2"
                                                  className="h-6 w-20 text-xs"
                                                  onClick={(e) => e.stopPropagation()}
                                                />
                                              </td>
                                            </>
                                          )}
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {isReceiving && (
                                <div className="flex items-center gap-2 mt-3">
                                  <Button size="sm" className="text-xs h-7">
                                    <PackageCheck className="h-3 w-3 mr-1" />
                                    Confirm Receipt
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setReceivingPO(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Supplier Performance */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Supplier Performance</h4>
                              {(() => {
                                const sup = supplierPerf(po.supplier)
                                if (!sup) return <p className="text-xs text-muted-foreground">No data available.</p>
                                return (
                                  <div className="space-y-3">
                                    <div className="bg-background rounded border p-3 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">On-Time Delivery</span>
                                        <span className={cn("font-medium", sup.onTimeDelivery >= 90 ? "text-emerald-600" : "text-amber-600")}>
                                          {sup.onTimeDelivery}%
                                        </span>
                                      </div>
                                      <Progress value={sup.onTimeDelivery} className="h-1.5" />
                                    </div>
                                    <div className="bg-background rounded border p-3 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Quality Rate</span>
                                        <span className={cn("font-medium", sup.qualityScore >= 95 ? "text-emerald-600" : "text-amber-600")}>
                                          {sup.qualityScore}%
                                        </span>
                                      </div>
                                      <Progress value={sup.qualityScore} className="h-1.5" />
                                    </div>
                                    <div className="bg-background rounded border p-3 space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Price Competitiveness</span>
                                        <span className="font-medium">{sup.priceCompetitiveness}%</span>
                                      </div>
                                      <Progress value={sup.priceCompetitiveness} className="h-1.5" />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                      <span>Payment: {sup.paymentTerms}</span>
                                      <span className="mx-2">&middot;</span>
                                      <span>Lead time: {po.leadTimeDays}d</span>
                                    </div>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filtered.length} PO{filtered.length !== 1 ? "s" : ""} &middot; Total:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(filtered.reduce((s, o) => s + o.total, 0))}
            </span>
          </p>
        </div>
      </Card>
    </div>
  )
}
