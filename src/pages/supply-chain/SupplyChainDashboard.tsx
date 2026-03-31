import { useState } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Cpu,
  ClipboardList,
  Building2,
  AlertTriangle,
  Package,
  DollarSign,
  Truck,
  Calendar,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { salesOrders, purchaseOrders, bomItems, suppliers } from "@/lib/mock-data"
import { SalesOrders } from "./SalesOrders"
import { BOMManager } from "./BOMManager"
import { PurchaseOrders } from "./PurchaseOrders"
import { Suppliers } from "./Suppliers"

type DashTab = "overview" | "sales" | "bom" | "po" | "suppliers"

const dashTabs: { key: DashTab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "sales", label: "Sales Orders", icon: ShoppingCart },
  { key: "bom", label: "BOM Manager", icon: Cpu },
  { key: "po", label: "Purchase Orders", icon: ClipboardList },
  { key: "suppliers", label: "Suppliers", icon: Building2 },
]

function OverviewTab() {
  const today = new Date()

  // KPIs
  const totalSOValue = salesOrders.reduce((s, o) => s + o.value, 0)
  const totalPOValue = purchaseOrders.reduce((s, o) => s + o.total, 0)
  const activeOrders = salesOrders.filter((so) =>
    ["production", "material_pending", "scheduled"].includes(so.status)
  ).length
  const openPOs = purchaseOrders.filter((po) => po.status !== "closed").length

  // Material shortages
  const shortages = bomItems.filter((item) => {
    const needed = item.qtyPerBoard * 1000
    return item.stock < needed
  })

  // Upcoming deliveries
  const upcomingDeliveries = salesOrders
    .flatMap((so) =>
      so.deliverySchedule
        .filter((d) => d.status !== "shipped")
        .map((d) => ({ ...d, soId: so.id, customer: so.customer, board: so.board }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  // PO status summary
  const poByStatus = {
    confirmed: purchaseOrders.filter((p) => p.status === "confirmed").length,
    delayed: purchaseOrders.filter((p) => p.status === "delayed").length,
    partial: purchaseOrders.filter((p) => p.status === "partially_received").length,
    closed: purchaseOrders.filter((p) => p.status === "closed").length,
  }

  // Payment schedule
  const pendingPayments = salesOrders
    .flatMap((so) =>
      so.paymentMilestones
        .filter((pm) => pm.status !== "paid")
        .map((pm) => ({ ...pm, soId: so.id, customer: so.customer }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total SO Value"
          value={formatCurrency(totalSOValue)}
          subtitle={`${activeOrders} active orders`}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Open POs"
          value={String(openPOs)}
          subtitle={formatCurrency(totalPOValue) + " total"}
          icon={ClipboardList}
          color="blue"
        />
        <KPICard
          title="Material Shortages"
          value={String(shortages.length)}
          subtitle={shortages.length > 0 ? "Action required" : "All stocked"}
          icon={AlertTriangle}
          color="orange"
        />
        <KPICard
          title="Active Suppliers"
          value={String(suppliers.filter((s) => s.activePOs > 0).length)}
          subtitle={`of ${suppliers.length} total`}
          icon={Building2}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Material Shortage Alerts */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Material Shortage Alerts</h3>
          </div>
          {shortages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All materials adequately stocked.</p>
          ) : (
            <div className="space-y-2">
              {shortages.slice(0, 5).map((item) => {
                const needed = item.qtyPerBoard * 1000
                const shortBy = needed - item.stock
                return (
                  <div key={item.ref} className="flex items-center justify-between text-sm bg-destructive/5 rounded p-2 border border-destructive/10">
                    <div>
                      <span className="font-mono font-medium">{item.ref}</span>
                      <span className="mx-1.5 text-muted-foreground">-</span>
                      <span className="font-mono text-xs">{item.partNumber}</span>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-destructive font-medium">Short by {formatNumber(shortBy)}</div>
                      <div className="text-muted-foreground">Stock: {formatNumber(item.stock)} / Need: {formatNumber(needed)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* PO Status Summary */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold">PO Status Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600">{poByStatus.confirmed}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{poByStatus.delayed}</div>
              <div className="text-xs text-muted-foreground">Delayed</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-600">{poByStatus.partial}</div>
              <div className="text-xs text-muted-foreground">Partially Received</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-600">{poByStatus.closed}</div>
              <div className="text-xs text-muted-foreground">Closed</div>
            </div>
          </div>
        </Card>

        {/* Upcoming Deliveries */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-semibold">Upcoming Deliveries</h3>
          </div>
          <div className="space-y-2">
            {upcomingDeliveries.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm border rounded p-2">
                <div>
                  <div className="font-medium">{d.customer} - {d.board}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.soId} &middot; Batch {d.batch} &middot; {formatNumber(d.qty)} pcs
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">
                    {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </div>
                  <StatusBadge status={d.status} className="text-[10px]" />
                </div>
              </div>
            ))}
            {upcomingDeliveries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming deliveries.</p>
            )}
          </div>
        </Card>

        {/* Payment Schedule */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-teal-500" />
            <h3 className="text-sm font-semibold">Pending Payment Schedule</h3>
          </div>
          <div className="space-y-2">
            {pendingPayments.map((pm, idx) => {
              const isOverdue = new Date(pm.date) < today
              return (
                <div key={idx} className={cn("flex items-center justify-between text-sm border rounded p-2", isOverdue && "border-red-200 bg-red-50/50 dark:bg-red-900/10")}>
                  <div>
                    <div className="font-medium text-xs">{pm.customer} - {pm.soId}</div>
                    <div className="text-xs text-muted-foreground">{pm.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium text-xs">{formatCurrency(pm.amount)}</div>
                    <div className={cn("text-xs", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
                      {new Date(pm.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      {isOverdue && " (overdue)"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function SupplyChainDashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>("overview")

  return (
    <div className="space-y-6">
      {/* Top-level tab navigation */}
      <div className="flex items-center gap-1 border-b">
        {dashTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "sales" && <SalesOrders />}
      {activeTab === "bom" && <BOMManager />}
      {activeTab === "po" && <PurchaseOrders />}
      {activeTab === "suppliers" && <Suppliers />}
    </div>
  )
}
