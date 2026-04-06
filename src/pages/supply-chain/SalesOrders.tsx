import { useState } from "react"
import {
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Clock,
  Package,
  FileText,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, formatCurrency, formatNumber } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { salesOrders } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"

const tabs = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "material_pending", label: "Pending Material" },
  { key: "shipped", label: "Shipped" },
  { key: "invoiced", label: "Invoiced" },
] as const

type TabKey = (typeof tabs)[number]["key"]

function getTabFilter(tab: TabKey) {
  if (tab === "all") return () => true
  if (tab === "active") return (so: (typeof salesOrders)[0]) => ["production", "scheduled"].includes(so.status)
  return (so: (typeof salesOrders)[0]) => so.status === tab
}

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-blue-500",
}

const priorityLabels = {
  high: "High",
  medium: "Med",
  low: "Low",
}

const paymentStatusColors = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  pending: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
}

const milestoneIcons = {
  paid: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  overdue: <AlertCircle className="h-4 w-4 text-red-500" />,
}

export function SalesOrders() {
  const { data: orders, loading } = useApiData(
    "/supply-chain/sales-orders",
    salesOrders,
    (raw: any) => {
      const arr = raw?.sales_orders ?? raw
      if (!Array.isArray(arr)) return salesOrders
      return arr.map((so: any) => {
        const c = snakeToCamel(so)
        return {
          id: c.refNumber ?? c.id,
          customer: c.customerName ?? c.customer,
          board: c.boardName ?? c.board,
          qty: c.qty ?? c.quantity ?? 0,
          value: c.totalValue ?? c.value ?? 0,
          dueDate: c.dueDate ?? "",
          orderDate: c.orderDate ?? "",
          status: c.status ?? "scheduled",
          paymentStatus: c.paymentStatus ?? "pending",
          priority: c.priority ?? "medium",
          lineItems: c.lineItems ?? [],
          paymentMilestones: c.paymentMilestones ?? [],
          deliverySchedule: c.deliverySchedule ?? [],
          bomId: c.bomId ?? "",
          woId: c.woId ?? "",
        }
      }) as typeof salesOrders
    }
  )

  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const tabFilter = getTabFilter(activeTab)
  const filtered = orders
    .filter(tabFilter)
    .filter(
      (so) =>
        so.id.toLowerCase().includes(search.toLowerCase()) ||
        so.customer.toLowerCase().includes(search.toLowerCase()) ||
        so.board.toLowerCase().includes(search.toLowerCase())
    )

  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear = today.getFullYear()

  // KPIs
  const totalOrders = orders.length
  const revenueThisMonth = orders
    .filter((so) => {
      const d = new Date(so.orderDate)
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    .reduce((s, o) => s + o.value, 0)
  const shippedOnTime = orders.filter((so) => so.status === "shipped" || so.status === "invoiced").length
  const totalCompleted = orders.filter((so) =>
    ["shipped", "invoiced", "production"].includes(so.status)
  ).length
  const onTimePercent = totalCompleted > 0 ? ((shippedOnTime / totalCompleted) * 100) : 0
  const avgOrderValue = orders.reduce((s, o) => s + o.value, 0) / orders.length

  const tabCounts: Record<string, number> = {}
  for (const tab of tabs) {
    tabCounts[tab.key] = orders.filter(getTabFilter(tab.key)).length
  }

  function isOverdue(dueDate: string, status: string) {
    return new Date(dueDate) < today && status !== "shipped" && status !== "delivered" && status !== "invoiced"
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        description="Track customer orders from booking through delivery."
        action={{ label: "New Order", icon: ShoppingCart }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Orders"
          value={String(totalOrders)}
          subtitle={`${orders.filter((s) => s.status === "production").length} in production`}
          icon={Package}
          color="blue"
        />
        <KPICard
          title="Revenue This Month"
          value={formatCurrency(revenueThisMonth || orders.reduce((s, o) => s + o.value, 0))}
          change={12}
          changePeriod="MoM"
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="On-Time Delivery"
          value={`${onTimePercent.toFixed(1)}%`}
          subtitle="Last 30 days"
          icon={Clock}
          color="purple"
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          change={5.2}
          changePeriod="MoM"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all rounded-lg cursor-pointer",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.key
                  ? "bg-white/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SO#, customer, or board..."
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
          data={filtered.map((so) => ({
            id: so.id,
            customer: so.customer,
            board: so.board,
            qty: so.qty,
            dueDate: new Date(so.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            status: so.status,
            value: formatCurrency(so.value),
            paymentStatus: so.paymentStatus,
            priority: so.priority,
          }))}
          columns={[
            { key: "id", label: "SO #" },
            { key: "customer", label: "Customer" },
            { key: "board", label: "Board" },
            { key: "qty", label: "Qty" },
            { key: "dueDate", label: "Due Date" },
            { key: "status", label: "Status" },
            { key: "value", label: "Value" },
            { key: "paymentStatus", label: "Payment" },
            { key: "priority", label: "Priority" },
          ]}
          filename="sales-orders"
          title="Sales Orders"
        />
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading sales orders..." /> : <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-8 px-2 py-3" />
                <th className="text-left font-medium text-muted-foreground px-4 py-3">SO #</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Customer</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Board</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Qty</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Due Date</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">Priority</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Payment</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((so) => {
                const overdue = isOverdue(so.dueDate, so.status)
                const isExpanded = expandedRow === so.id
                return (
                  <>
                    <tr
                      key={so.id}
                      onClick={() => setExpandedRow(isExpanded ? null : so.id)}
                      className={cn(
                        "border-b hover:bg-muted/30 transition-colors cursor-pointer",
                        overdue && "bg-destructive/5",
                        isExpanded && "bg-muted/20"
                      )}
                    >
                      <td className="px-2 py-3 text-muted-foreground">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{so.id}</td>
                      <td className="px-4 py-3 font-medium">{so.customer}</td>
                      <td className="px-4 py-3 text-muted-foreground">{so.board}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatNumber(so.qty)}</td>
                      <td className={cn("px-4 py-3", overdue && "text-destructive font-medium")}>
                        {new Date(so.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        {overdue && <span className="ml-1.5 text-xs">(overdue)</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={cn("h-2 w-2 rounded-full", priorityColors[so.priority])} />
                          <span className="text-xs text-muted-foreground">{priorityLabels[so.priority]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={so.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("border-0 font-semibold text-xs", paymentStatusColors[so.paymentStatus])}>
                          {so.paymentStatus === "paid" ? "Paid" : so.paymentStatus === "partial" ? "Partial" : "Pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium">
                        {formatCurrency(so.value)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${so.id}-detail`}>
                        <td colSpan={10} className="bg-muted/10 px-6 py-4 border-b">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Line Items */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Order Line Items</h4>
                              <div className="space-y-2">
                                {so.lineItems.map((li, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm bg-background rounded p-2 border">
                                    <span className="font-medium">{li.part}</span>
                                    <div className="text-right text-xs text-muted-foreground">
                                      <div>{formatNumber(li.qty)} pcs</div>
                                      <div>{formatCurrency(li.unitPrice)}/unit</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>BOM: <span className="font-mono font-medium text-foreground">{so.bomId}</span></span>
                                {so.woId && (
                                  <>
                                    <span>&middot;</span>
                                    <span>WO: <span className="font-mono font-medium text-foreground">{so.woId}</span></span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Payment Milestones */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Payment Milestones (50/30/20)</h4>
                              <div className="space-y-2">
                                {so.paymentMilestones.map((pm, idx) => (
                                  <div key={idx} className="flex items-center gap-3 text-sm bg-background rounded p-2 border">
                                    {milestoneIcons[pm.status]}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-xs">{pm.label}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Due: {new Date(pm.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-mono font-medium text-xs">{formatCurrency(pm.amount)}</div>
                                      <Badge variant="outline" className={cn("border-0 text-[10px] px-1.5 py-0", pm.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" : pm.status === "overdue" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400")}>
                                        {pm.status === "paid" ? "Paid" : pm.status === "overdue" ? "Overdue" : "Pending"}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                  <span>Payment Progress</span>
                                  <span>{so.paymentMilestones.filter((m) => m.status === "paid").length}/{so.paymentMilestones.length}</span>
                                </div>
                                <Progress
                                  value={(so.paymentMilestones.filter((m) => m.status === "paid").length / so.paymentMilestones.length) * 100}
                                  className="h-1.5"
                                />
                              </div>
                            </div>

                            {/* Delivery Schedule */}
                            <div>
                              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Delivery Schedule</h4>
                              <div className="space-y-2">
                                {so.deliverySchedule.map((ds, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-sm bg-background rounded p-2 border">
                                    <div>
                                      <div className="font-medium text-xs">Batch {ds.batch}</div>
                                      <div className="text-xs text-muted-foreground">{formatNumber(ds.qty)} pcs</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs">{new Date(ds.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                                      <StatusBadge status={ds.status} className="text-[10px]" />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Separator className="my-3" />

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {so.status !== "shipped" && so.status !== "invoiced" && (
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <Wrench className="h-3 w-3 mr-1" />
                                    Create Work Order
                                  </Button>
                                )}
                                {(so.status === "shipped" || so.status === "production") && (
                                  <Button size="sm" variant="outline" className="text-xs h-7">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Create Invoice
                                  </Button>
                                )}
                              </div>
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
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No sales orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} &middot; Total value:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(filtered.reduce((s, o) => s + o.value, 0))}
            </span>
          </p>
        </div>
      </Card>}
    </div>
  )
}
