import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { ecoList } from "@/lib/mock-data"
import {
  Plus,
  Search,
  Users,
  FileEdit,
  Clock,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Layers,
  User,
} from "lucide-react"

const listTabs = [
  { id: "all", label: "All ECOs", icon: FileEdit },
  { id: "my_approval", label: "Pending My Approval", icon: User },
  { id: "impact", label: "Impact Analysis", icon: AlertTriangle },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
] as const

type ListTab = (typeof listTabs)[number]["id"]

const statusTabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Closed" },
] as const

type StatusTabId = (typeof statusTabs)[number]["id"]

const typeColors: Record<string, string> = {
  "Component Swap": "bg-info/10 text-info",
  "BOM Revision": "bg-warning/10 text-warning",
  "Gerber Revision": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

// Mock: ECOs pending current user approval
const myApprovalEcos = ecoList.filter((e) => e.status === "pending")

// Mock: Impact analysis summary data
const impactSummary = {
  affectedWorkOrders: 4,
  totalBoardsAffected: 4800,
  inventoryDisposition: 3,
  estimatedCostImpact: 45000,
  ecosByType: [
    { type: "Component Swap", count: 2, impact: "Medium" },
    { type: "BOM Revision", count: 1, impact: "Low" },
    { type: "Gerber Revision", count: 1, impact: "High" },
  ],
  openImpacts: [
    { eco: "ECO-042", product: "ECU-X500", wosAffected: 2, inventoryItems: 2, costDelta: 12000, urgency: "high" },
    { eco: "ECO-040", product: "ADAS-M1", wosAffected: 1, inventoryItems: 1, costDelta: 28000, urgency: "medium" },
    { eco: "ECO-039", product: "PS-220", wosAffected: 1, inventoryItems: 0, costDelta: 5000, urgency: "low" },
  ],
}

// --- All ECOs Tab ---

function AllECOsTab({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const [statusFilter, setStatusFilter] = useState<StatusTabId>("all")

  const filtered = ecoList.filter((eco) => {
    const matchesTab = statusFilter === "all" || eco.status === statusFilter
    const matchesSearch =
      search === "" ||
      eco.id.toLowerCase().includes(search.toLowerCase()) ||
      eco.product.toLowerCase().includes(search.toLowerCase()) ||
      eco.reason.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-4">
      {/* Status sub-tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
          {statusTabs.map((tab) => {
            const count = tab.id === "all" ? ecoList.length : ecoList.filter((e) => e.status === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  statusFilter === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] text-muted-foreground">{count}</span>
              </button>
            )
          })}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search ECOs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">ECO #</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Product</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Type</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Reason</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Status</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Requested By</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Date</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Approvals</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">No ECOs match your filter.</td>
                  </tr>
                ) : (
                  filtered.map((eco) => (
                    <tr key={eco.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
                      <td className="px-4 py-3"><span className="font-mono font-medium text-sm">{eco.id}</span></td>
                      <td className="px-4 py-3"><span className="font-medium">{eco.product}</span></td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", typeColors[eco.type] ?? "bg-muted text-muted-foreground")}>{eco.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{eco.reason}</td>
                      <td className="px-4 py-3"><StatusBadge status={eco.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{eco.requestedBy}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{eco.date}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className={cn("text-xs font-medium", eco.approvalsGiven === eco.approvalsNeeded ? "text-success" : "text-muted-foreground")}>
                            {eco.approvalsGiven}/{eco.approvalsNeeded}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Pending My Approval Tab ---

function PendingApprovalTab() {
  return (
    <div className="space-y-4">
      {myApprovalEcos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No ECOs pending your approval</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium">You have {myApprovalEcos.length} ECO(s) awaiting your approval</p>
              <p className="text-xs text-muted-foreground">Review and approve or reject to keep the engineering process moving.</p>
            </div>
          </div>
          {myApprovalEcos.map((eco) => (
            <Card key={eco.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{eco.id}</span>
                      <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", typeColors[eco.type] ?? "bg-muted text-muted-foreground")}>{eco.type}</Badge>
                    </div>
                    <p className="text-sm font-medium">{eco.product}</p>
                    <p className="text-xs text-muted-foreground">{eco.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>Requested by {eco.requestedBy}</span>
                      <span>{eco.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {eco.approvalsGiven}/{eco.approvalsNeeded} approved
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  )
}

// --- Impact Analysis Tab ---

function ImpactAnalysisTab() {
  const urgencyColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-blue-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Affected WOs</p>
          </div>
          <p className="text-2xl font-bold">{impactSummary.affectedWorkOrders}</p>
          <p className="text-xs text-muted-foreground">{impactSummary.totalBoardsAffected.toLocaleString()} boards total</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Inventory Items</p>
          </div>
          <p className="text-2xl font-bold">{impactSummary.inventoryDisposition}</p>
          <p className="text-xs text-muted-foreground">requiring disposition</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-red-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Impact</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(impactSummary.estimatedCostImpact)}</p>
          <p className="text-xs text-muted-foreground">estimated delta</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-2 mb-1">
            <FileEdit className="h-4 w-4 text-purple-500" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Open ECOs</p>
          </div>
          <p className="text-2xl font-bold">{ecoList.filter((e) => e.status !== "completed").length}</p>
          <p className="text-xs text-muted-foreground">with active impact</p>
        </Card>
      </div>

      {/* Impact by ECO */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Open ECO Impact Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">ECO</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Product</th>
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">WOs Affected</th>
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Inventory Items</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Cost Delta</th>
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {impactSummary.openImpacts.map((item) => (
                  <tr key={item.eco} className="border-b last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono font-medium">{item.eco}</td>
                    <td className="px-4 py-3">{item.product}</td>
                    <td className="px-4 py-3 text-center font-medium">{item.wosAffected}</td>
                    <td className="px-4 py-3 text-center font-medium">{item.inventoryItems}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.costDelta)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={cn("text-[10px] border-0 font-medium capitalize", urgencyColors[item.urgency])}>
                        {item.urgency}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ECOs by type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">ECOs by Type & Impact Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {impactSummary.ecosByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", typeColors[item.type])}>{item.type}</Badge>
                  <span className="text-sm">{item.count} ECO(s)</span>
                </div>
                <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", urgencyColors[item.impact.toLowerCase()])}>
                  {item.impact} Impact
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Metrics Tab ---

function MetricsTab() {
  const totalEcos = ecoList.length
  const completedEcos = ecoList.filter((e) => e.status === "completed").length
  const implementationRate = Math.round((completedEcos / totalEcos) * 100)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Approval time analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Approval Time Analysis</h3>
            <div className="space-y-4">
              {[
                { label: "Component Swap", avg: "3.2 days", target: "5 days", status: "ok" },
                { label: "BOM Revision", avg: "4.8 days", target: "5 days", status: "ok" },
                { label: "Gerber Revision", avg: "6.1 days", target: "5 days", status: "warning" },
                { label: "Overall Average", avg: "4.5 days", target: "5 days", status: "ok" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.avg}</span>
                    <span className="text-xs text-muted-foreground">/ {item.target}</span>
                    <div className={cn("h-2 w-2 rounded-full", item.status === "ok" ? "bg-emerald-500" : "bg-amber-500")} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation tracking */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Implementation Rate</h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${implementationRate}, 100`}
                    className="text-teal-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{implementationRate}%</span>
                  <span className="text-[10px] text-muted-foreground">implemented</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total ECOs</span>
                <span className="font-medium">{totalEcos}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-success">{completedEcos}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">{ecoList.filter((e) => e.status === "in_progress").length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-warning">{ecoList.filter((e) => e.status === "pending").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly trend */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">ECO Volume Trend (6 months)</h3>
          <div className="space-y-3">
            {[
              { month: "Oct 2025", created: 3, closed: 2 },
              { month: "Nov 2025", created: 5, closed: 4 },
              { month: "Dec 2025", created: 2, closed: 3 },
              { month: "Jan 2026", created: 6, closed: 5 },
              { month: "Feb 2026", created: 4, closed: 3 },
              { month: "Mar 2026", created: 4, closed: 1 },
            ].map((item) => (
              <div key={item.month} className="flex items-center gap-3">
                <span className="text-xs w-20 text-muted-foreground">{item.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-muted/50 rounded-md overflow-hidden flex">
                    <div className="h-full bg-teal-500 rounded-l-md" style={{ width: `${(item.created / 8) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{item.created}</span>
                  <span className="text-[10px] text-muted-foreground w-14">created</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-4 bg-muted/50 rounded-md overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-l-md" style={{ width: `${(item.closed / 8) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-6 text-right">{item.closed}</span>
                  <span className="text-[10px] text-muted-foreground w-14">closed</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Main Component ---

export function ECOList() {
  const [activeTab, setActiveTab] = useState<ListTab>("all")
  const [search, setSearch] = useState("")

  // KPI calculations
  const openEcos = ecoList.filter((e) => e.status !== "completed").length
  const ecosThisMonth = ecoList.filter((e) => e.date.startsWith("2026-03")).length
  const completedEcos = ecoList.filter((e) => e.status === "completed").length
  const implementationRate = Math.round((completedEcos / ecoList.length) * 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Change Orders"
        description="Track and manage engineering changes across products."
        action={{ label: "New ECO", icon: Plus, onClick: () => {} }}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Open ECOs" value={String(openEcos)} subtitle="Pending + In Progress" icon={FileEdit} color="blue" />
        <KPICard title="Avg Approval Time" value="4.5 days" subtitle="Target: 5 days" icon={Clock} color="purple" change={-8} changePeriod="vs last month" />
        <KPICard title="ECOs This Month" value={String(ecosThisMonth)} subtitle="March 2026" icon={TrendingUp} color="orange" change={12} changePeriod="vs Feb" />
        <KPICard title="Implementation Rate" value={`${implementationRate}%`} subtitle="Completed / Total" icon={CheckCircle2} color="green" change={5} changePeriod="vs last quarter" />
      </div>

      {/* Highlighted Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border">
        {listTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "my_approval" && myApprovalEcos.length > 0 && (
                <span className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                )}>
                  {myApprovalEcos.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "all" && <AllECOsTab search={search} setSearch={setSearch} />}
      {activeTab === "my_approval" && <PendingApprovalTab />}
      {activeTab === "impact" && <ImpactAnalysisTab />}
      {activeTab === "metrics" && <MetricsTab />}
    </div>
  )
}
