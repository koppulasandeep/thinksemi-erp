import { useState } from "react"
import {
  RotateCcw,
  Search,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  Plus,
  FileText,
  BarChart3,
  MessageSquare,
  TrendingDown,
  Eye,
  Camera,
  Link2,
  CheckCircle,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { cn } from "@/lib/utils"

// ─── Tabs ───
const tabs = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "active-rmas", label: "Active RMAs", icon: RotateCcw },
  { id: "failure-analysis", label: "Failure Analysis", icon: BarChart3 },
  { id: "complaints", label: "Customer Complaints", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: FileText },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Mock Data: RMAs ───
const rmaData = [
  { id: "RMA-009", customer: "Bosch", board: "ECU-X500", qty: 2, serialNumbers: "SN-50012, SN-50013", reportedIssue: "No power output on both boards",
    woId: "WO-2026-045", line: "Line 1", prodDate: "2026-02-15", operator: "Rajesh K",
    rootCause: "Defective voltage regulator IC U7 - bad batch from supplier", disposition: "Rework" as const,
    reworkStatus: "in_progress" as const, shippingBack: "pending" as const, status: "analysis" as const, daysOpen: 3, cost: 4500 },
  { id: "RMA-008", customer: "L&T", board: "Relay-BR", qty: 5, serialNumbers: "SN-30101 to SN-30105", reportedIssue: "Intermittent relay chatter under load",
    woId: "WO-2026-038", line: "Line 2", prodDate: "2026-01-20", operator: "Suresh M",
    rootCause: "Solder joint crack on relay pads - insufficient reflow profile", disposition: "Rework" as const,
    reworkStatus: "completed" as const, shippingBack: "in_transit" as const, status: "rework" as const, daysOpen: 7, cost: 8200 },
  { id: "RMA-007", customer: "Continental", board: "ADAS-M1", qty: 1, serialNumbers: "SN-70044", reportedIssue: "Dead IC U3, no communication on CAN bus",
    woId: "WO-2026-031", line: "Line 1", prodDate: "2025-12-10", operator: "Amit P",
    rootCause: "ESD damage during handling", disposition: "Replace" as const,
    reworkStatus: "completed" as const, shippingBack: "delivered" as const, status: "shipped" as const, daysOpen: 0, cost: 12000 },
  { id: "RMA-006", customer: "ABB", board: "VFD-CTRL", qty: 3, serialNumbers: "SN-40201, SN-40202, SN-40203", reportedIssue: "Overheating IC U5 during operation",
    woId: "WO-2026-042", line: "Line 1", prodDate: "2026-02-01", operator: "Deepak S",
    rootCause: "Thermal pad voids detected - stencil aperture issue", disposition: "Rework" as const,
    reworkStatus: "in_progress" as const, shippingBack: "pending" as const, status: "analysis" as const, daysOpen: 5, cost: 6800 },
  { id: "RMA-005", customer: "Tata Elxsi", board: "IoT-200", qty: 1, serialNumbers: "SN-20088", reportedIssue: "WiFi module not responding after 2hr operation",
    woId: "WO-2026-035", line: "Line 2", prodDate: "2026-01-05", operator: "Rajesh K",
    rootCause: "Component placement offset on WiFi module - pick & place calibration drift", disposition: "Rework" as const,
    reworkStatus: "completed" as const, shippingBack: "in_transit" as const, status: "rework" as const, daysOpen: 12, cost: 3200 },
  { id: "RMA-004", customer: "Bosch", board: "ECU-X500", qty: 2, serialNumbers: "SN-50008, SN-50009", reportedIssue: "Erratic ADC readings on channel 3",
    woId: "WO-2026-028", line: "Line 1", prodDate: "2025-11-15", operator: "Amit P",
    rootCause: "Contamination on ADC input traces - flux residue", disposition: "Rework" as const,
    reworkStatus: "completed" as const, shippingBack: "delivered" as const, status: "shipped" as const, daysOpen: 0, cost: 2800 },
  { id: "RMA-003", customer: "L&T", board: "Relay-BR", qty: 1, serialNumbers: "SN-30098", reportedIssue: "Board dead on arrival - no output",
    woId: "WO-2026-025", line: "Line 2", prodDate: "2025-10-20", operator: "Suresh M",
    rootCause: "Missing component R12 - placement skip", disposition: "Credit" as const,
    reworkStatus: "completed" as const, shippingBack: "delivered" as const, status: "shipped" as const, daysOpen: 0, cost: 1500 },
]

// ─── Mock Data: Failure Analysis ───
const failureModeData = [
  { name: "Solder Joint", value: 28, color: "#ef4444" },
  { name: "Component Failure", value: 22, color: "#f59e0b" },
  { name: "ESD Damage", value: 15, color: "#8b5cf6" },
  { name: "Thermal Issues", value: 18, color: "#3b82f6" },
  { name: "Placement Offset", value: 10, color: "#14b8a6" },
  { name: "Other", value: 7, color: "#6b7280" },
]

const failureByBoard = [
  { board: "ECU-X500", failures: 8, returns: 4 },
  { board: "Relay-BR", failures: 6, returns: 6 },
  { board: "ADAS-M1", failures: 3, returns: 1 },
  { board: "VFD-CTRL", failures: 4, returns: 3 },
  { board: "IoT-200", failures: 2, returns: 1 },
]

const failureByCustomer = [
  { customer: "Bosch", count: 4, boards: 4, pct: 0.4 },
  { customer: "L&T", count: 2, boards: 6, pct: 0.6 },
  { customer: "Continental", count: 1, boards: 1, pct: 0.5 },
  { customer: "ABB", count: 1, boards: 3, pct: 0.6 },
  { customer: "Tata Elxsi", count: 1, boards: 1, pct: 1.0 },
]

const failureByPeriod = [
  { month: "Oct", solder: 3, component: 2, esd: 1, thermal: 1, placement: 0 },
  { month: "Nov", solder: 4, component: 1, esd: 2, thermal: 2, placement: 1 },
  { month: "Dec", solder: 2, component: 3, esd: 1, thermal: 1, placement: 1 },
  { month: "Jan", solder: 5, component: 2, esd: 2, thermal: 3, placement: 2 },
  { month: "Feb", solder: 3, component: 4, esd: 1, thermal: 2, placement: 1 },
  { month: "Mar", solder: 2, component: 1, esd: 1, thermal: 2, placement: 1 },
]

// ─── Mock Data: Customer Complaints ───
const complaints = [
  { id: "CC-001", customer: "Bosch", date: "2026-03-26", description: "Multiple boards failing in field within 30 days of deployment", severity: "critical" as const,
    linkedRMAs: ["RMA-009", "RMA-004"], responseDueDate: "2026-03-28", status: "investigating" as const, capaLink: "CAPA-2026-012" },
  { id: "CC-002", customer: "L&T", date: "2026-03-22", description: "Relay boards showing intermittent failures under thermal cycling", severity: "major" as const,
    linkedRMAs: ["RMA-008"], responseDueDate: "2026-03-29", status: "open" as const, capaLink: null },
  { id: "CC-003", customer: "ABB", date: "2026-03-24", description: "VFD controller boards overheating beyond thermal spec", severity: "major" as const,
    linkedRMAs: ["RMA-006"], responseDueDate: "2026-03-31", status: "investigating" as const, capaLink: "CAPA-2026-013" },
  { id: "CC-004", customer: "Continental", date: "2026-02-15", description: "ADAS module communication failure - safety-critical concern", severity: "critical" as const,
    linkedRMAs: ["RMA-007"], responseDueDate: "2026-02-18", status: "resolved" as const, capaLink: "CAPA-2026-008" },
  { id: "CC-005", customer: "Tata Elxsi", date: "2026-03-17", description: "IoT board WiFi drops after extended runtime", severity: "minor" as const,
    linkedRMAs: ["RMA-005"], responseDueDate: "2026-03-31", status: "resolved" as const, capaLink: "CAPA-2026-010" },
]

// ─── Mock Data: Reports ───
const turnaroundTrend = [
  { month: "Oct", avgDays: 14 },
  { month: "Nov", avgDays: 12 },
  { month: "Dec", avgDays: 11 },
  { month: "Jan", avgDays: 9 },
  { month: "Feb", avgDays: 8 },
  { month: "Mar", avgDays: 7 },
]

const returnRateByProduct = [
  { board: "ECU-X500", shipped: 2400, returned: 4, rate: 0.17 },
  { board: "Relay-BR", shipped: 1800, returned: 6, rate: 0.33 },
  { board: "ADAS-M1", shipped: 600, returned: 1, rate: 0.17 },
  { board: "VFD-CTRL", shipped: 1200, returned: 3, rate: 0.25 },
  { board: "IoT-200", shipped: 500, returned: 1, rate: 0.20 },
]

const costOfReturns = [
  { month: "Oct", cost: 8500 },
  { month: "Nov", cost: 12000 },
  { month: "Dec", cost: 6800 },
  { month: "Jan", cost: 15200 },
  { month: "Feb", cost: 9800 },
  { month: "Mar", cost: 11500 },
]

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  major: "bg-amber-100 text-amber-700 border-amber-200",
  minor: "bg-blue-100 text-blue-700 border-blue-200",
}

const dispositionColors: Record<string, string> = {
  Rework: "bg-amber-100 text-amber-700",
  Replace: "bg-blue-100 text-blue-700",
  Credit: "bg-violet-100 text-violet-700",
  Reject: "bg-red-100 text-red-700",
}

export function RMADashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [search, setSearch] = useState("")
  const [expandedRMA, setExpandedRMA] = useState<string | null>(null)

  const openCount = rmaData.filter((r) => r.status !== "shipped").length
  const avgDays = Math.round(
    rmaData.filter((r) => r.status !== "shipped").reduce((a, b) => a + b.daysOpen, 0) /
    Math.max(rmaData.filter((r) => r.status !== "shipped").length, 1)
  )
  const totalShipped = 6500
  const totalReturned = rmaData.reduce((a, b) => a + b.qty, 0)
  const returnRate = ((totalReturned / totalShipped) * 100).toFixed(2)
  const topFailure = "Solder Joint"
  const custSatisfaction = 4.2

  const filtered = rmaData.filter(
    (rma) =>
      rma.id.toLowerCase().includes(search.toLowerCase()) ||
      rma.customer.toLowerCase().includes(search.toLowerCase()) ||
      rma.board.toLowerCase().includes(search.toLowerCase()) ||
      rma.reportedIssue.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="RMA Management"
        description="Track return merchandise authorizations, failure analysis, complaints, and resolution."
        action={{ label: "New RMA", icon: Plus }}
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard title="Open RMAs" value={String(openCount)} subtitle={`${rmaData.length} total this quarter`} icon={RotateCcw} color="teal" />
        <KPICard title="Avg Resolution" value={`${avgDays} days`} subtitle="Target: 10 days" icon={Clock} color="blue" />
        <KPICard title="Return Rate" value={`${returnRate}%`} subtitle={`${totalReturned} of ${totalShipped.toLocaleString()} shipped`} icon={TrendingDown} color="orange" />
        <KPICard title="Top Failure Mode" value={topFailure} subtitle="28% of all failures" icon={AlertTriangle} iconColor="text-red-500" color="pink" />
        <KPICard title="Customer Satisfaction" value={`${custSatisfaction}/5`} subtitle="Based on resolution surveys" icon={MessageSquare} color="green" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-slate-600 border hover:bg-teal-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === "overview" && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">All RMAs</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search RMA, customer, board..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 w-[240px] text-sm" />
                  </div>
                  <ExportButtons
                    data={rmaData.map((rma) => ({ id: rma.id, customer: rma.customer, board: rma.board, qty: rma.qty, issue: rma.reportedIssue, status: rma.status, daysOpen: rma.daysOpen === 0 ? "Closed" : `${rma.daysOpen}d`, disposition: rma.disposition, cost: rma.cost }))}
                    columns={[
                      { key: "id", label: "RMA #" }, { key: "customer", label: "Customer" }, { key: "board", label: "Board" },
                      { key: "qty", label: "Qty" }, { key: "issue", label: "Issue" }, { key: "disposition", label: "Disposition" },
                      { key: "status", label: "Status" }, { key: "daysOpen", label: "Days Open" }, { key: "cost", label: "Cost" },
                    ]}
                    filename="rma-list"
                    title="RMA Management"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["RMA #", "Customer", "Board", "Qty", "Issue", "Disposition", "Status", "Days Open"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rma) => (
                      <tr key={rma.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group">
                        <td className="py-3 px-3 font-mono font-medium text-teal-600">{rma.id}</td>
                        <td className="py-3 px-3 font-medium">{rma.customer}</td>
                        <td className="py-3 px-3"><Badge variant="outline" className="font-mono text-xs">{rma.board}</Badge></td>
                        <td className="py-3 px-3 tabular-nums">{rma.qty}</td>
                        <td className="py-3 px-3 text-muted-foreground max-w-[200px] truncate">{rma.reportedIssue}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={cn("text-xs border-0", dispositionColors[rma.disposition])}>{rma.disposition}</Badge>
                        </td>
                        <td className="py-3 px-3"><StatusBadge status={rma.status} /></td>
                        <td className="py-3 px-3">
                          <span className={cn("text-xs tabular-nums font-medium",
                            rma.daysOpen === 0 ? "text-emerald-600" : rma.daysOpen > 10 ? "text-red-500" : rma.daysOpen > 5 ? "text-amber-500" : "text-foreground"
                          )}>{rma.daysOpen === 0 ? "Closed" : `${rma.daysOpen}d`}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">No RMAs found matching your search.</div>
              )}
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top Failure Modes</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {failureModeData.map((f) => (
                    <div key={f.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{f.name}</span>
                          <span className="text-xs text-muted-foreground">{f.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${f.value}%`, backgroundColor: f.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">RMA by Customer</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {failureByCustomer.map((c) => (
                    <div key={c.customer} className="flex items-center justify-between text-sm rounded-md border px-3 py-2.5">
                      <div>
                        <span className="font-medium">{c.customer}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{c.count} RMA{c.count > 1 ? "s" : ""}</span>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">{c.boards} boards</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ─── Active RMAs Tab ─── */}
      {activeTab === "active-rmas" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active RMAs - Detailed View</CardTitle>
              <span className="text-xs text-muted-foreground">{rmaData.filter((r) => r.status !== "shipped").length} active</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rmaData.map((rma) => (
                <div key={rma.id}>
                  <div
                    onClick={() => setExpandedRMA(expandedRMA === rma.id ? null : rma.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                      rma.status === "analysis" ? "border-amber-200 bg-amber-500/5" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {expandedRMA === rma.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium">
                          <span className="font-mono text-teal-600">{rma.id}</span>
                          <span className="mx-2 text-muted-foreground">&middot;</span>
                          {rma.customer}
                          <span className="mx-2 text-muted-foreground">&middot;</span>
                          <Badge variant="outline" className="font-mono text-xs">{rma.board}</Badge>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{rma.reportedIssue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={cn("text-xs border-0", dispositionColors[rma.disposition])}>{rma.disposition}</Badge>
                      <StatusBadge status={rma.status} />
                      <span className={cn("text-xs tabular-nums font-medium",
                        rma.daysOpen === 0 ? "text-emerald-600" : rma.daysOpen > 10 ? "text-red-500" : "text-foreground"
                      )}>{rma.daysOpen === 0 ? "Closed" : `${rma.daysOpen}d`}</span>
                    </div>
                  </div>

                  {expandedRMA === rma.id && (
                    <div className="ml-12 mr-4 mt-1 mb-2 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Customer & Board Info */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer & Board</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{rma.customer}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Board</span><span className="font-mono">{rma.board}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Qty</span><span>{rma.qty}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Serial Numbers</span><span className="font-mono">{rma.serialNumbers}</span></div>
                          </div>
                        </div>

                        {/* Production Data */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            <Link2 className="h-3 w-3 inline mr-1" />Linked Production Data
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between"><span className="text-muted-foreground">Work Order</span><span className="font-mono text-teal-600">{rma.woId}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Line</span><span>{rma.line}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Prod Date</span><span className="font-mono tabular-nums">{rma.prodDate}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Operator</span><span>{rma.operator}</span></div>
                          </div>
                        </div>

                        {/* Root Cause & Disposition */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Analysis & Resolution</p>
                          <div className="space-y-1 text-xs">
                            <div><span className="text-muted-foreground">Root Cause:</span> <span className="font-medium">{rma.rootCause}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Disposition</span>
                              <Badge variant="outline" className={cn("text-xs border-0", dispositionColors[rma.disposition])}>{rma.disposition}</Badge>
                            </div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Rework Status</span><StatusBadge status={rma.reworkStatus} /></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Ship Back</span><StatusBadge status={rma.shippingBack} /></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span className="font-mono text-red-600">&#8377;{rma.cost.toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> Photos: <span className="text-foreground">Upload photos placeholder</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Failure Analysis Tab ─── */}
      {activeTab === "failure-analysis" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Failure Mode Pie Chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failure Mode Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={failureModeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                        {failureModeData.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Failure by Board Type */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failures by Board Type</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={failureByBoard}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="board" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="failures" name="Total Failures" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="returns" name="Returns" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failure by Customer */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failure by Customer</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Customer", "RMAs", "Boards Returned", "Return Rate %"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {failureByCustomer.map((c) => (
                      <tr key={c.customer} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-3 font-medium">{c.customer}</td>
                        <td className="py-3 px-3 tabular-nums">{c.count}</td>
                        <td className="py-3 px-3 tabular-nums">{c.boards}</td>
                        <td className="py-3 px-3">
                          <span className={cn("font-mono tabular-nums font-medium", c.pct > 0.5 ? "text-red-600" : "text-foreground")}>{c.pct.toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Failure Trend by Period */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failure Trend by Production Period</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={failureByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="solder" name="Solder Joint" stackId="a" fill="#ef4444" />
                    <Bar dataKey="component" name="Component" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="esd" name="ESD" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="thermal" name="Thermal" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="placement" name="Placement" stackId="a" fill="#14b8a6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Customer Complaints Tab ─── */}
      {activeTab === "complaints" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Customer Complaint Register</CardTitle>
              <Button variant="outline" size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New Complaint</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Complaint #", "Customer", "Date", "Description", "Severity", "Linked RMAs", "Response Due", "Status", "CAPA"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} className={cn("border-b border-border/50 hover:bg-accent/50 transition-colors",
                      c.severity === "critical" && c.status !== "resolved" ? "bg-red-500/5" : ""
                    )}>
                      <td className="py-3 px-3 font-mono font-medium text-teal-600">{c.id}</td>
                      <td className="py-3 px-3 font-medium">{c.customer}</td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums">{c.date}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground max-w-[220px] truncate">{c.description}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={cn("text-xs", severityColors[c.severity])}>{c.severity}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {c.linkedRMAs.map((rma) => (
                            <Badge key={rma} variant="outline" className="text-xs font-mono">{rma}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className={cn("py-3 px-3 font-mono text-xs tabular-nums",
                        c.status !== "resolved" && new Date(c.responseDueDate) < new Date() ? "text-red-600 font-medium" : ""
                      )}>{c.responseDueDate}</td>
                      <td className="py-3 px-3"><StatusBadge status={c.status} /></td>
                      <td className="py-3 px-3">
                        {c.capaLink ? (
                          <Badge variant="outline" className="text-xs font-mono bg-teal-50 text-teal-700 border-teal-200">
                            <Link2 className="h-3 w-3 mr-1" />{c.capaLink}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Reports Tab ─── */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Turnaround Time Trend */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">RMA Turnaround Time Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={turnaroundTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" days" />
                      <Tooltip />
                      <Line type="monotone" dataKey="avgDays" name="Avg Days" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: "#14b8a6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Improving trend: 14 days down to 7 days (50% reduction)
                </div>
              </CardContent>
            </Card>

            {/* Cost of Returns */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Cost of Returns (Monthly)</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costOfReturns}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`Rs ${Number(value).toLocaleString()}`, "Cost"]} />
                      <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Total Q1 cost: &#8377;{costOfReturns.reduce((a, b) => a + b.cost, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Return Rate by Product */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Return Rate by Product</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Board", "Shipped", "Returned", "Return Rate", "Status"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {returnRateByProduct.map((r) => (
                      <tr key={r.board} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-3"><Badge variant="outline" className="font-mono text-xs">{r.board}</Badge></td>
                        <td className="py-3 px-3 tabular-nums">{r.shipped.toLocaleString()}</td>
                        <td className="py-3 px-3 tabular-nums">{r.returned}</td>
                        <td className="py-3 px-3">
                          <span className={cn("font-mono tabular-nums font-semibold",
                            r.rate > 0.25 ? "text-red-600" : r.rate > 0.15 ? "text-amber-600" : "text-emerald-600"
                          )}>{r.rate.toFixed(2)}%</span>
                        </td>
                        <td className="py-3 px-3">
                          {r.rate > 0.25 ? (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />Needs Review
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />Acceptable
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Repeat Failure Analysis */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Repeat Failure Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { board: "ECU-X500", customer: "Bosch", failures: 2, issue: "Power output failures", firstOccurrence: "2025-11-15", lastOccurrence: "2026-03-26", rootCause: "Voltage regulator supply chain issue", capaStatus: "Open" },
                  { board: "Relay-BR", customer: "L&T", failures: 2, issue: "Solder joint failures on relay pads", firstOccurrence: "2025-10-20", lastOccurrence: "2026-03-22", rootCause: "Reflow profile needs optimization", capaStatus: "In Progress" },
                ].map((item) => (
                  <div key={`${item.board}-${item.customer}`} className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium">{item.board} - {item.customer}</span>
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700">{item.failures} occurrences</Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">{item.capaStatus}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div><span className="text-muted-foreground">Issue:</span> {item.issue}</div>
                      <div><span className="text-muted-foreground">Root Cause:</span> {item.rootCause}</div>
                      <div><span className="text-muted-foreground">First:</span> <span className="font-mono tabular-nums">{item.firstOccurrence}</span></div>
                      <div><span className="text-muted-foreground">Last:</span> <span className="font-mono tabular-nums">{item.lastOccurrence}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
