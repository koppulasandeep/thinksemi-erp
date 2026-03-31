import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Factory,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Activity,
  Gauge,
  CircuitBoard,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { cn, formatNumber } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { workOrders } from "@/lib/mock-data"

type TabFilter = "all" | "active" | "scheduled" | "on_hold" | "completed"

const tabs: { key: TabFilter; label: string; count: number }[] = [
  { key: "all", label: "All", count: workOrders.length },
  { key: "active", label: "Active", count: workOrders.filter((wo) => wo.status === "active").length },
  { key: "scheduled", label: "Scheduled", count: workOrders.filter((wo) => wo.status === "scheduled").length },
  { key: "on_hold", label: "On Hold", count: workOrders.filter((wo) => (wo.status as string) === "on_hold").length },
  { key: "completed", label: "Completed", count: workOrders.filter((wo) => (wo.status as string) === "completed").length },
]

const summaryKPIs = {
  activeWOs: workOrders.filter((wo) => wo.status === "active").length,
  avgOEE:
    Math.round(
      workOrders.filter((wo) => wo.oee > 0).reduce((a, b) => a + b.oee, 0) /
        workOrders.filter((wo) => wo.oee > 0).length
    ) || 0,
  boardsToday: workOrders
    .filter((wo) => wo.status === "active")
    .reduce((a, b) => a + Math.round((b.progress / 100) * b.qty), 0),
  onTimeCompletion: 94.2,
}

export function WorkOrders() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabFilter>("all")
  const navigate = useNavigate()

  const filtered = workOrders.filter((wo) => {
    const matchesSearch =
      wo.id.toLowerCase().includes(search.toLowerCase()) ||
      wo.board.toLowerCase().includes(search.toLowerCase()) ||
      wo.customer.toLowerCase().includes(search.toLowerCase())
    const matchesTab = activeTab === "all" || wo.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Orders"
        description="Track and manage production work orders across all lines."
        action={{ label: "New Work Order", icon: Factory }}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active WOs"
          value={String(summaryKPIs.activeWOs)}
          icon={Activity}
          color="green"
          subtitle="Currently running"
        />
        <KPICard
          title="OEE Average"
          value={`${summaryKPIs.avgOEE}%`}
          icon={Gauge}
          color="blue"
          subtitle="Running lines"
        />
        <KPICard
          title="Boards Produced Today"
          value={formatNumber(summaryKPIs.boardsToday)}
          icon={CircuitBoard}
          color="purple"
        />
        <KPICard
          title="On-Time Completion"
          value={`${summaryKPIs.onTimeCompletion}%`}
          icon={CheckCircle2}
          color="teal"
          change={1.8}
          changePeriod="vs last week"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold tabular-nums",
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-background text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {activeTab === "all" ? "All" : tabs.find((t) => t.key === activeTab)?.label} Work Orders
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search WO, board, customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-[240px] text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
              <ExportButtons
                data={filtered.map((wo) => ({
                  id: wo.id,
                  soId: wo.soId,
                  board: wo.board,
                  customer: wo.customer,
                  qty: formatNumber(wo.qty),
                  line: wo.line,
                  progress: `${wo.progress}%`,
                  oee: wo.oee > 0 ? `${wo.oee}%` : "--",
                  status: wo.status,
                }))}
                columns={[
                  { key: "id", label: "WO #" },
                  { key: "soId", label: "SO #" },
                  { key: "board", label: "Board" },
                  { key: "customer", label: "Customer" },
                  { key: "qty", label: "Qty" },
                  { key: "line", label: "Line" },
                  { key: "progress", label: "Progress" },
                  { key: "oee", label: "OEE" },
                  { key: "status", label: "Status" },
                ]}
                filename="work-orders"
                title="Work Orders"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["WO #", "SO #", "Board", "Customer", "Qty", "Line", "Progress", "OEE", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1">
                          {h}
                          {h && h !== "" && (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </div>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => navigate(`/manufacturing/${wo.id}`)}
                    className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-primary">
                      {wo.id}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {wo.soId}
                    </td>
                    <td className="py-3 px-3 font-medium">{wo.board}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {wo.customer}
                    </td>
                    <td className="py-3 px-3 tabular-nums">
                      {formatNumber(wo.qty)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {wo.line}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              wo.progress >= 80
                                ? "bg-emerald-500"
                                : wo.progress > 0
                                ? "bg-blue-500"
                                : "bg-muted"
                            )}
                            style={{ width: `${wo.progress}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-[36px] text-right font-medium">
                          {wo.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {wo.oee > 0 ? (
                        <span
                          className={cn(
                            "text-xs font-semibold tabular-nums",
                            wo.oee >= 80
                              ? "text-emerald-600"
                              : wo.oee >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                          )}
                        >
                          {wo.oee}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="py-3 px-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No work orders found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
