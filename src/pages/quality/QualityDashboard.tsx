import { useState } from "react"
import {
  CheckCircle,
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  MessageSquareWarning,
  TrendingDown,
  Search,
  Filter,
  ChevronRight,
  Plus,
  CalendarDays,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  Target,
  Clock,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { cn } from "@/lib/utils"
import { qualityMetrics, defectPareto } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts"

// ─── Tab definitions ───
const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "ncr", label: "NCR Management", icon: FileWarning },
  { key: "capa", label: "CAPA", icon: ShieldAlert },
  { key: "spc", label: "SPC Charts", icon: Target },
  { key: "audit", label: "Audit", icon: ClipboardCheck },
  { key: "ipc", label: "IPC Compliance", icon: ShieldCheck },
] as const

type TabKey = (typeof tabs)[number]["key"]

// ─── Mock Data ───

const fpyTrend = [
  { month: "Oct", fpy: 96.8 },
  { month: "Nov", fpy: 97.1 },
  { month: "Dec", fpy: 96.5 },
  { month: "Jan", fpy: 97.4 },
  { month: "Feb", fpy: 97.6 },
  { month: "Mar", fpy: 97.8 },
]

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
}

// NCR data
interface NCR {
  id: string
  board: string
  detectedAt: string
  wo: string
  severity: "critical" | "major" | "minor"
  defectType: string
  status: string
  dateOpened: string
  assignee: string
  rootCause: string
  disposition: string
  description: string
}

const ncrData: NCR[] = [
  {
    id: "NCR-2026-041",
    board: "ECU-X500",
    detectedAt: "AOI",
    wo: "WO-2026-0341",
    severity: "major",
    defectType: "Solder Bridge",
    status: "pending",
    dateOpened: "2026-03-29",
    assignee: "Priya S",
    rootCause: "Stencil wear on 0.5mm pitch QFP apertures causing excess paste deposit",
    disposition: "Rework - touchup and re-inspect",
    description: "Solder bridge detected between pins 42-43 on U1 (STM32F407) during AOI inspection.",
  },
  {
    id: "NCR-2026-040",
    board: "ECU-X500",
    detectedAt: "AOI",
    wo: "WO-2026-0341",
    severity: "minor",
    defectType: "Tombstone",
    status: "in_progress",
    dateOpened: "2026-03-29",
    assignee: "Priya S",
    rootCause: "Thermal imbalance on 0402 pads due to asymmetric copper pour",
    disposition: "Rework - reflow and verify",
    description: "Component C14 (0402 cap) tombstoned. Single occurrence on batch of 847 boards.",
  },
  {
    id: "NCR-2026-039",
    board: "PS-220",
    detectedAt: "ICT",
    wo: "WO-2026-0338",
    severity: "critical",
    defectType: "Open Circuit",
    status: "pending",
    dateOpened: "2026-03-28",
    assignee: "Deepa N",
    rootCause: "Under investigation - suspected cold solder joint on through-hole connector J3",
    disposition: "Quarantine pending root cause analysis",
    description: "ICT detected open circuit on net VCC_5V. Board failed electrical test at fixture station 2.",
  },
  {
    id: "NCR-2026-038",
    board: "ADAS-M1",
    detectedAt: "FCT",
    wo: "WO-2026-0335",
    severity: "major",
    defectType: "Wrong Polarity",
    status: "in_progress",
    dateOpened: "2026-03-27",
    assignee: "Arun K",
    rootCause: "Feeder loaded with wrong orientation. Operator training gap identified.",
    disposition: "Scrap affected boards (3 units), retrain operator",
    description: "Electrolytic capacitor C8 placed with reversed polarity. FCT detected overcurrent on 3.3V rail.",
  },
  {
    id: "NCR-2026-037",
    board: "IoT-200",
    detectedAt: "Visual",
    wo: "WO-2026-0330",
    severity: "minor",
    defectType: "Missing Part",
    status: "completed",
    dateOpened: "2026-03-25",
    assignee: "Priya S",
    rootCause: "Vacuum nozzle clog on feeder slot 14. Cleared and verified.",
    disposition: "Reworked - component placed manually and reflowed",
    description: "Missing R22 (10k resistor) found during visual inspection after AOI pass.",
  },
  {
    id: "NCR-2026-036",
    board: "VFD-CTRL",
    detectedAt: "AOI",
    wo: "WO-2026-0328",
    severity: "major",
    defectType: "Insufficient Solder",
    status: "completed",
    dateOpened: "2026-03-24",
    assignee: "Deepa N",
    rootCause: "Stencil aperture ratio below 0.66 for QFN-32 center pad",
    disposition: "Reworked - manual solder addition under microscope",
    description: "Insufficient solder on U5 (QFN-32 package) ground pad. Thermal pad coverage below 60%.",
  },
  {
    id: "NCR-2026-035",
    board: "ECU-X500",
    detectedAt: "Incoming QC",
    wo: "N/A",
    severity: "critical",
    defectType: "Damaged Component",
    status: "completed",
    dateOpened: "2026-03-22",
    assignee: "Mohan R",
    rootCause: "Shipping damage - dented reel from Arrow shipment PO-2026-48",
    disposition: "Returned to supplier. Replacement received.",
    description: "Incoming inspection found bent leads on 15 units of STM32F407 from reel RL-88401.",
  },
]

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-200",
  major: "bg-amber-500/10 text-amber-600 border-amber-200",
  minor: "bg-blue-500/10 text-blue-600 border-blue-200",
}

// CAPA data
interface CAPA {
  id: string
  linkedNCR: string
  type: "corrective" | "preventive"
  status: "open" | "analysis" | "action" | "verification" | "closed"
  assignee: string
  dueDate: string
  title: string
  effectiveness: string
}

const capaData: CAPA[] = [
  {
    id: "CAPA-2026-012",
    linkedNCR: "NCR-2026-041",
    type: "corrective",
    status: "analysis",
    assignee: "Priya S",
    dueDate: "2026-04-12",
    title: "Stencil replacement schedule for fine-pitch apertures",
    effectiveness: "Pending",
  },
  {
    id: "CAPA-2026-011",
    linkedNCR: "NCR-2026-039",
    type: "corrective",
    status: "open",
    assignee: "Deepa N",
    dueDate: "2026-04-10",
    title: "THT wave solder parameter optimization for PS-220",
    effectiveness: "Pending",
  },
  {
    id: "CAPA-2026-010",
    linkedNCR: "NCR-2026-038",
    type: "preventive",
    status: "action",
    assignee: "Arun K",
    dueDate: "2026-04-05",
    title: "Implement feeder verification scan at loading station",
    effectiveness: "Pending",
  },
  {
    id: "CAPA-2026-009",
    linkedNCR: "NCR-2026-036",
    type: "corrective",
    status: "verification",
    assignee: "Deepa N",
    dueDate: "2026-03-30",
    title: "Redesign stencil aperture for QFN-32 center pad (ratio > 0.75)",
    effectiveness: "Effective",
  },
  {
    id: "CAPA-2026-008",
    linkedNCR: "NCR-2026-035",
    type: "preventive",
    status: "closed",
    assignee: "Mohan R",
    dueDate: "2026-03-28",
    title: "Incoming inspection protocol update for sensitive ICs",
    effectiveness: "Effective",
  },
  {
    id: "CAPA-2026-007",
    linkedNCR: "NCR-2026-033",
    type: "corrective",
    status: "closed",
    assignee: "Priya S",
    dueDate: "2026-03-20",
    title: "Reflow profile update for lead-free BGA rework",
    effectiveness: "Effective",
  },
  {
    id: "CAPA-2026-006",
    linkedNCR: "NCR-2026-030",
    type: "preventive",
    status: "closed",
    assignee: "Ravi K",
    dueDate: "2026-03-15",
    title: "AOI programming update for new 0201 component library",
    effectiveness: "Not Effective",
  },
]

const capaStatusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  analysis: "bg-blue-100 text-blue-700",
  action: "bg-amber-100 text-amber-700",
  verification: "bg-violet-100 text-violet-700",
  closed: "bg-emerald-100 text-emerald-700",
}

// SPC data - X-bar chart for solder bridge defects
const xBarData = Array.from({ length: 25 }, (_, i) => {
  const base = 2.4
  const noise = Math.sin(i * 0.7) * 0.8 + (Math.random() - 0.5) * 0.6
  return {
    sample: i + 1,
    xBar: +(base + noise).toFixed(2),
    range: +(0.8 + Math.random() * 1.2).toFixed(2),
  }
})
const xBarMean = +(xBarData.reduce((s, d) => s + d.xBar, 0) / xBarData.length).toFixed(2)
const xBarUCL = +(xBarMean + 1.8).toFixed(2)
const xBarLCL = +Math.max(0, xBarMean - 1.8).toFixed(2)
const rMean = +(xBarData.reduce((s, d) => s + d.range, 0) / xBarData.length).toFixed(2)
const rUCL = +(rMean * 2.114).toFixed(2)

// p-chart data
const pChartData = Array.from({ length: 20 }, (_, i) => {
  const base = 0.022
  const noise = Math.sin(i * 0.5) * 0.008 + (Math.random() - 0.5) * 0.006
  return {
    lot: `L${(i + 1).toString().padStart(2, "0")}`,
    proportion: +Math.max(0.005, base + noise).toFixed(4),
    sampleSize: 500,
  }
})
const pMean = +(pChartData.reduce((s, d) => s + d.proportion, 0) / pChartData.length).toFixed(4)
const pUCL = +(pMean + 3 * Math.sqrt((pMean * (1 - pMean)) / 500)).toFixed(4)
const pLCL = +Math.max(0, pMean - 3 * Math.sqrt((pMean * (1 - pMean)) / 500)).toFixed(4)

// c-chart data
const cChartData = Array.from({ length: 20 }, (_, i) => {
  const base = 3.2
  const noise = Math.sin(i * 0.6) * 1.5 + (Math.random() - 0.5) * 1.0
  return {
    board: `B${(i + 1).toString().padStart(3, "0")}`,
    defects: Math.max(0, Math.round(base + noise)),
  }
})
const cMean = +(cChartData.reduce((s, d) => s + d.defects, 0) / cChartData.length).toFixed(1)
const cUCL = +(cMean + 3 * Math.sqrt(cMean)).toFixed(1)
const cLCL = +Math.max(0, cMean - 3 * Math.sqrt(cMean)).toFixed(1)

// Audit data
interface Audit {
  id: string
  area: string
  type: "process" | "product" | "system"
  scheduledDate: string
  auditor: string
  findingsCount: number
  status: string
  standard: string
}

const auditData: Audit[] = [
  { id: "AUD-2026-018", area: "SMT", type: "process", scheduledDate: "2026-04-05", auditor: "Rajesh M", findingsCount: 0, status: "scheduled", standard: "IATF 16949" },
  { id: "AUD-2026-017", area: "QC Lab", type: "product", scheduledDate: "2026-04-02", auditor: "External - TUV", findingsCount: 0, status: "scheduled", standard: "ISO 9001" },
  { id: "AUD-2026-016", area: "Store", type: "system", scheduledDate: "2026-03-28", auditor: "Priya S", findingsCount: 2, status: "completed", standard: "ISO 9001" },
  { id: "AUD-2026-015", area: "THT", type: "process", scheduledDate: "2026-03-22", auditor: "Deepa N", findingsCount: 1, status: "completed", standard: "IATF 16949" },
  { id: "AUD-2026-014", area: "SMT", type: "product", scheduledDate: "2026-03-15", auditor: "Rajesh M", findingsCount: 3, status: "completed", standard: "IPC-A-610" },
  { id: "AUD-2026-013", area: "QC Lab", type: "system", scheduledDate: "2026-03-10", auditor: "External - BSI", findingsCount: 0, status: "completed", standard: "ISO 9001" },
  { id: "AUD-2026-012", area: "Store", type: "process", scheduledDate: "2026-03-05", auditor: "Mohan R", findingsCount: 4, status: "completed", standard: "IATF 16949" },
  { id: "AUD-2026-011", area: "SMT", type: "system", scheduledDate: "2026-04-15", auditor: "External - TUV", findingsCount: 0, status: "scheduled", standard: "IATF 16949" },
]

// IPC compliance data
interface IPCStandard {
  standard: string
  fullName: string
  version: string
  classTracked: string
  status: "compliant" | "non-compliant" | "partial"
  lastReview: string
  nextReview: string
  checklistItems: { item: string; status: "compliant" | "non-compliant" | "partial" }[]
}

const ipcStandards: IPCStandard[] = [
  {
    standard: "IPC-A-610",
    fullName: "Acceptability of Electronic Assemblies",
    version: "Rev G",
    classTracked: "Class 2 / Class 3",
    status: "compliant",
    lastReview: "2026-03-15",
    nextReview: "2026-06-15",
    checklistItems: [
      { item: "Solder joint acceptability (Class 2)", status: "compliant" },
      { item: "Solder joint acceptability (Class 3)", status: "compliant" },
      { item: "Component placement accuracy", status: "compliant" },
      { item: "PCB cleanliness (ionic contamination)", status: "compliant" },
      { item: "Wire dress and routing", status: "compliant" },
      { item: "Conformal coating coverage", status: "partial" },
    ],
  },
  {
    standard: "IPC-J-STD-001",
    fullName: "Requirements for Soldered Electrical & Electronic Assemblies",
    version: "Rev H",
    classTracked: "Class 2 / Class 3",
    status: "compliant",
    lastReview: "2026-03-01",
    nextReview: "2026-06-01",
    checklistItems: [
      { item: "Solder alloy compliance (SAC305)", status: "compliant" },
      { item: "Flux activity levels", status: "compliant" },
      { item: "Reflow profile documentation", status: "compliant" },
      { item: "Through-hole fill requirements", status: "compliant" },
      { item: "Hand soldering workmanship", status: "partial" },
    ],
  },
  {
    standard: "IPC-7711/7721",
    fullName: "Rework, Modification & Repair of Electronic Assemblies",
    version: "Rev C",
    classTracked: "All classes",
    status: "partial",
    lastReview: "2026-02-20",
    nextReview: "2026-05-20",
    checklistItems: [
      { item: "BGA rework station validation", status: "compliant" },
      { item: "Component removal procedures", status: "compliant" },
      { item: "Pad repair documentation", status: "non-compliant" },
      { item: "Operator certification records", status: "partial" },
      { item: "Rework limit tracking per board", status: "compliant" },
    ],
  },
  {
    standard: "IPC-1782",
    fullName: "Manufacturing Traceability Data Standard",
    version: "Rev A",
    classTracked: "Level 3",
    status: "compliant",
    lastReview: "2026-03-10",
    nextReview: "2026-06-10",
    checklistItems: [
      { item: "Unique board serialization", status: "compliant" },
      { item: "Component lot traceability", status: "compliant" },
      { item: "Process parameter logging", status: "compliant" },
      { item: "Environmental condition recording", status: "partial" },
      { item: "Test result data retention (10 yr)", status: "compliant" },
    ],
  },
]

const ipcStatusColor: Record<string, string> = {
  compliant: "bg-emerald-100 text-emerald-700",
  "non-compliant": "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
}

// Severity breakdown for charts
const severityBreakdown = [
  { name: "Critical", value: 2, color: "#ef4444" },
  { name: "Major", value: 3, color: "#f59e0b" },
  { name: "Minor", value: 2, color: "#3b82f6" },
]

const detectionBreakdown = [
  { station: "AOI", count: 3 },
  { station: "ICT", count: 1 },
  { station: "FCT", count: 1 },
  { station: "Visual", count: 1 },
  { station: "Incoming QC", count: 1 },
]

// ─── Components ───

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="First Pass Yield"
          value={`${qualityMetrics.fpy}%`}
          subtitle={`Target: ${qualityMetrics.fpyTarget}%`}
          icon={CheckCircle}
          iconColor="text-emerald-500"
        />
        <KPICard
          title="DPMO"
          value={String(qualityMetrics.dpmo)}
          change={qualityMetrics.dpmoChange}
          changePeriod="vs last month"
          icon={TrendingDown}
          iconColor="text-blue-500"
        />
        <KPICard
          title="Open NCRs"
          value={String(qualityMetrics.openNCRs)}
          icon={FileWarning}
          iconColor="text-amber-500"
        />
        <KPICard
          title="Open CAPAs"
          value={String(qualityMetrics.openCAPAs)}
          icon={ShieldAlert}
          iconColor="text-orange-500"
        />
        <KPICard
          title="Customer Complaints"
          value={String(qualityMetrics.customerComplaints)}
          subtitle="This month"
          icon={MessageSquareWarning}
          iconColor="text-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Defect Pareto Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={defectPareto}
                  layout="vertical"
                  margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="defect" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value} occurrences`, "Count"]} />
                  <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">FPY Trend (6 Months)</CardTitle>
              <span className="text-xs text-muted-foreground">Target: {qualityMetrics.fpyTarget}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fpyTrend} margin={{ left: 5, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} domain={[95, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}%`, "FPY"]} />
                  <Line type="monotone" dataKey={() => qualityMetrics.fpyTarget} stroke="#a3a3a3" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Target" />
                  <Line type="monotone" dataKey="fpy" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", stroke: "var(--background)", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#22c55e", stroke: "var(--background)", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Defect This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-lg font-bold">Solder Bridge</p>
                <p className="text-sm text-muted-foreground">34 occurrences &middot; 34% of all defects</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-muted rounded-md">Root cause: Stencil wear on apertures &gt; 1.5mm</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Performing Line</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-lg font-bold">SMT Line 1</p>
                <p className="text-sm text-muted-foreground">99.6% FPY &middot; 82% OEE</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-md">3 defects in 847 boards</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audit Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ISO 9001:2015</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">Valid until Dec 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IATF 16949</span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">Valid until Sep 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">IPC-A-610 Rev G</span>
                <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">Renewal due Apr 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function NCRTab() {
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = ncrData.filter(
    (ncr) =>
      ncr.id.toLowerCase().includes(search.toLowerCase()) ||
      ncr.board.toLowerCase().includes(search.toLowerCase()) ||
      ncr.defectType.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = ncrData.filter((n) => n.status !== "completed").length
  const criticalCount = ncrData.filter((n) => n.severity === "critical" && n.status !== "completed").length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total NCRs" value={String(ncrData.length)} subtitle="This month" icon={FileWarning} iconColor="text-slate-500" />
        <KPICard title="Open" value={String(openCount)} icon={AlertTriangle} iconColor="text-amber-500" />
        <KPICard title="Critical Open" value={String(criticalCount)} icon={XCircle} iconColor="text-red-500" />
        <KPICard title="Avg Resolution" value="3.2 days" subtitle="Target: 5 days" icon={Clock} iconColor="text-teal-500" />
      </div>

      {/* Breakdown Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Severity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {severityBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              {severityBreakdown.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detection Station */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Detection Station</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detectionBreakdown} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis dataKey="station" className="text-xs" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Defect Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Defect Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defectPareto.slice(0, 5).map((d) => (
                <div key={d.defect}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{d.defect}</span>
                    <span className="font-mono font-medium">{d.count}</span>
                  </div>
                  <Progress value={d.percentage} className="h-1.5" indicatorClassName="bg-teal-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NCR Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All NCRs</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NCR, board, defect..."
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
                data={filtered.map((ncr) => ({
                  id: ncr.id, board: ncr.board, detectedAt: ncr.detectedAt, wo: ncr.wo,
                  severity: ncr.severity, defectType: ncr.defectType, assignee: ncr.assignee,
                  status: ncr.status, dateOpened: ncr.dateOpened,
                }))}
                columns={[
                  { key: "id", label: "NCR #" }, { key: "board", label: "Board" },
                  { key: "detectedAt", label: "Detected At" }, { key: "wo", label: "WO #" },
                  { key: "severity", label: "Severity" }, { key: "defectType", label: "Defect Type" },
                  { key: "assignee", label: "Assignee" }, { key: "status", label: "Status" },
                  { key: "dateOpened", label: "Date Opened" },
                ]}
                filename="ncr-list"
                title="Non-Conformance Reports"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["", "NCR #", "Board", "Detected At", "WO #", "Severity", "Defect Type", "Assignee", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ncr) => (
                  <Fragment key={ncr.id}>
                    <tr
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedId(expandedId === ncr.id ? null : ncr.id)}
                    >
                      <td className="py-3 px-3">
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedId === ncr.id && "rotate-90")} />
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-teal-600">{ncr.id}</td>
                      <td className="py-3 px-3 font-medium">{ncr.board}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs font-mono">{ncr.detectedAt}</Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground text-xs">{ncr.wo}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={cn("text-xs capitalize", severityColors[ncr.severity])}>{ncr.severity}</Badge>
                      </td>
                      <td className="py-3 px-3">{ncr.defectType}</td>
                      <td className="py-3 px-3 text-muted-foreground">{ncr.assignee}</td>
                      <td className="py-3 px-3"><StatusBadge status={ncr.status} /></td>
                    </tr>
                    {expandedId === ncr.id && (
                      <tr className="bg-muted/30">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid gap-4 lg:grid-cols-3">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Description</p>
                              <p className="text-sm">{ncr.description}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Root Cause</p>
                              <p className="text-sm">{ncr.rootCause}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Disposition</p>
                              <p className="text-sm">{ncr.disposition}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No NCRs found matching your search.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CAPATab() {
  const closedCAPAs = capaData.filter((c) => c.status === "closed")
  const effectiveCount = closedCAPAs.filter((c) => c.effectiveness === "Effective").length
  const effectivenessRate = closedCAPAs.length > 0 ? Math.round((effectiveCount / closedCAPAs.length) * 100) : 0
  const openCAPAs = capaData.filter((c) => c.status !== "closed").length
  const overdueCAPAs = capaData.filter((c) => c.status !== "closed" && new Date(c.dueDate) < new Date("2026-03-29")).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total CAPAs" value={String(capaData.length)} subtitle="This month" icon={ShieldAlert} iconColor="text-slate-500" />
        <KPICard title="Open" value={String(openCAPAs)} icon={AlertTriangle} iconColor="text-amber-500" />
        <KPICard title="Overdue" value={String(overdueCAPAs)} icon={Clock} iconColor="text-red-500" />
        <KPICard title="Effectiveness Rate" value={`${effectivenessRate}%`} subtitle={`${effectiveCount}/${closedCAPAs.length} effective`} icon={Target} iconColor="text-emerald-500" />
      </div>

      {/* Status pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">CAPA Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {(["open", "analysis", "action", "verification", "closed"] as const).map((stage) => {
              const count = capaData.filter((c) => c.status === stage).length
              const labels: Record<string, string> = { open: "Open", analysis: "Analysis", action: "Action", verification: "Verification", closed: "Closed" }
              return (
                <div key={stage} className="text-center">
                  <div className={cn("rounded-lg py-3 px-2 mb-1", capaStatusColors[stage])}>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{labels[stage]}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* CAPA table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All CAPAs</CardTitle>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />New CAPA</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["CAPA #", "Linked NCR", "Type", "Title", "Assignee", "Due Date", "Status", "Effectiveness"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capaData.map((capa) => (
                  <tr key={capa.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-teal-600">{capa.id}</td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{capa.linkedNCR}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={cn("text-xs capitalize", capa.type === "corrective" ? "bg-blue-500/10 text-blue-600 border-blue-200" : "bg-violet-500/10 text-violet-600 border-violet-200")}>
                        {capa.type}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 max-w-[300px] truncate">{capa.title}</td>
                    <td className="py-3 px-3 text-muted-foreground">{capa.assignee}</td>
                    <td className="py-3 px-3 font-mono text-xs">{capa.dueDate}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={cn("text-xs capitalize border-0", capaStatusColors[capa.status])}>{capa.status}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md",
                        capa.effectiveness === "Effective" ? "bg-emerald-100 text-emerald-700" :
                        capa.effectiveness === "Not Effective" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {capa.effectiveness}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SPCTab() {
  const [chartType, setChartType] = useState<"xbar" | "range" | "pchart" | "cchart">("xbar")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        {([
          { key: "xbar", label: "X-bar Chart" },
          { key: "range", label: "R Chart" },
          { key: "pchart", label: "p-Chart" },
          { key: "cchart", label: "c-Chart" },
        ] as const).map((c) => (
          <button
            key={c.key}
            onClick={() => setChartType(c.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              chartType === c.key
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-slate-600 border hover:bg-teal-50"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {chartType === "xbar" && "X-bar Chart - Solder Bridge Defects per Subgroup"}
              {chartType === "range" && "Range (R) Chart - Solder Bridge Defect Variation"}
              {chartType === "pchart" && "p-Chart - Proportion Defective per Lot"}
              {chartType === "cchart" && "c-Chart - Defect Count per Board"}
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-500 inline-block" />UCL</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-emerald-500 inline-block" />CL</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-blue-500 inline-block" />LCL</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "xbar" ? (
                <LineChart data={xBarData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="sample" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} label={{ value: "Sample #", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value.toFixed(2), "X-bar"]} />
                  <ReferenceLine y={xBarUCL} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `UCL=${xBarUCL}`, position: "right", fontSize: 10, fill: "#ef4444" }} />
                  <ReferenceLine y={xBarMean} stroke="#22c55e" strokeWidth={1.5} label={{ value: `CL=${xBarMean}`, position: "right", fontSize: 10, fill: "#22c55e" }} />
                  <ReferenceLine y={xBarLCL} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `LCL=${xBarLCL}`, position: "right", fontSize: 10, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="xBar" stroke="#14b8a6" strokeWidth={2} dot={{ r: 3, fill: "#14b8a6" }} />
                </LineChart>
              ) : chartType === "range" ? (
                <LineChart data={xBarData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="sample" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} label={{ value: "Sample #", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value.toFixed(2), "Range"]} />
                  <ReferenceLine y={rUCL} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `UCL=${rUCL}`, position: "right", fontSize: 10, fill: "#ef4444" }} />
                  <ReferenceLine y={rMean} stroke="#22c55e" strokeWidth={1.5} label={{ value: `R-bar=${rMean}`, position: "right", fontSize: 10, fill: "#22c55e" }} />
                  <ReferenceLine y={0} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: "LCL=0", position: "right", fontSize: 10, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="range" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                </LineChart>
              ) : chartType === "pchart" ? (
                <LineChart data={pChartData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="lot" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} label={{ value: "Lot", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${(value * 100).toFixed(2)}%`, "Proportion"]} />
                  <ReferenceLine y={pUCL} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `UCL=${(pUCL * 100).toFixed(2)}%`, position: "right", fontSize: 10, fill: "#ef4444" }} />
                  <ReferenceLine y={pMean} stroke="#22c55e" strokeWidth={1.5} label={{ value: `p-bar=${(pMean * 100).toFixed(2)}%`, position: "right", fontSize: 10, fill: "#22c55e" }} />
                  <ReferenceLine y={pLCL} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `LCL=${(pLCL * 100).toFixed(2)}%`, position: "right", fontSize: 10, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="proportion" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: "#8b5cf6" }} />
                </LineChart>
              ) : (
                <LineChart data={cChartData} margin={{ left: 10, right: 20, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="board" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} label={{ value: "Board", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value, "Defects"]} />
                  <ReferenceLine y={cUCL} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `UCL=${cUCL}`, position: "right", fontSize: 10, fill: "#ef4444" }} />
                  <ReferenceLine y={cMean} stroke="#22c55e" strokeWidth={1.5} label={{ value: `c-bar=${cMean}`, position: "right", fontSize: 10, fill: "#22c55e" }} />
                  <ReferenceLine y={cLCL} stroke="#3b82f6" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: `LCL=${cLCL}`, position: "right", fontSize: 10, fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="defects" stroke="#ec4899" strokeWidth={2} dot={{ r: 3, fill: "#ec4899" }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SPC Summary */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">X-bar Status</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold">In Control</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">0 out-of-control points</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Range Chart</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold">In Control</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Variation stable</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Cpk (est.)</p>
          <p className="text-xl font-bold">1.34</p>
          <p className="text-xs text-muted-foreground mt-1">Target: &ge; 1.33</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Sigma Level</p>
          <p className="text-xl font-bold">4.02&sigma;</p>
          <p className="text-xs text-muted-foreground mt-1">Target: &ge; 4.0&sigma;</p>
        </Card>
      </div>
    </div>
  )
}

function AuditTab() {
  const completedAudits = auditData.filter((a) => a.status === "completed").length
  const totalFindings = auditData.reduce((s, a) => s + a.findingsCount, 0)
  const scheduledAudits = auditData.filter((a) => a.status === "scheduled").length

  const auditTypeColors: Record<string, string> = {
    process: "bg-blue-500/10 text-blue-600 border-blue-200",
    product: "bg-violet-500/10 text-violet-600 border-violet-200",
    system: "bg-teal-500/10 text-teal-600 border-teal-200",
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Audits" value={String(auditData.length)} subtitle="This quarter" icon={ClipboardCheck} iconColor="text-slate-500" />
        <KPICard title="Completed" value={String(completedAudits)} icon={CheckCircle} iconColor="text-emerald-500" />
        <KPICard title="Upcoming" value={String(scheduledAudits)} icon={CalendarDays} iconColor="text-teal-500" />
        <KPICard title="Total Findings" value={String(totalFindings)} subtitle="0 major non-conformities" icon={AlertTriangle} iconColor="text-amber-500" />
      </div>

      {/* Certifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Certification Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { cert: "IATF 16949:2016", body: "TUV SUD", validUntil: "Sep 2026", status: "Active", scope: "Automotive PCB Assembly" },
              { cert: "ISO 9001:2015", body: "BSI", validUntil: "Dec 2026", status: "Active", scope: "Electronic Assembly Manufacturing" },
            ].map((c) => (
              <div key={c.cert} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{c.cert}</p>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">{c.status}</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Certification Body: {c.body}</p>
                  <p>Valid Until: {c.validUntil}</p>
                  <p>Scope: {c.scope}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit schedule */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Audit Schedule</CardTitle>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Schedule Audit</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Audit ID", "Area", "Type", "Standard", "Date", "Auditor", "Findings", "Status"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditData.map((audit) => (
                  <tr key={audit.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-teal-600">{audit.id}</td>
                    <td className="py-3 px-3 font-medium">{audit.area}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className={cn("text-xs capitalize", auditTypeColors[audit.type])}>{audit.type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-xs">{audit.standard}</td>
                    <td className="py-3 px-3 font-mono text-xs">{audit.scheduledDate}</td>
                    <td className="py-3 px-3 text-muted-foreground">{audit.auditor}</td>
                    <td className="py-3 px-3">
                      {audit.findingsCount > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md">{audit.findingsCount} findings</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3"><StatusBadge status={audit.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function IPCTab() {
  const [expandedStd, setExpandedStd] = useState<string | null>(null)

  const compliantCount = ipcStandards.filter((s) => s.status === "compliant").length
  const totalChecks = ipcStandards.reduce((s, std) => s + std.checklistItems.length, 0)
  const passedChecks = ipcStandards.reduce((s, std) => s + std.checklistItems.filter((c) => c.status === "compliant").length, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Standards Tracked" value={String(ipcStandards.length)} icon={ShieldCheck} iconColor="text-teal-500" />
        <KPICard title="Fully Compliant" value={String(compliantCount)} subtitle={`of ${ipcStandards.length}`} icon={CheckCircle} iconColor="text-emerald-500" />
        <KPICard title="Checklist Items" value={`${passedChecks}/${totalChecks}`} subtitle="Items passing" icon={ClipboardCheck} iconColor="text-blue-500" />
        <KPICard title="Compliance Rate" value={`${Math.round((passedChecks / totalChecks) * 100)}%`} icon={Target} iconColor="text-violet-500" />
      </div>

      {/* Standards cards */}
      <div className="space-y-4">
        {ipcStandards.map((std) => (
          <Card key={std.standard}>
            <div
              className="p-4 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setExpandedStd(expandedStd === std.standard ? null : std.standard)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedStd === std.standard && "rotate-90")} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{std.standard}</p>
                      <span className="text-xs text-muted-foreground">{std.version}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{std.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-xs text-muted-foreground">
                    <p>Class: {std.classTracked}</p>
                    <p>Next review: {std.nextReview}</p>
                  </div>
                  <Badge variant="outline" className={cn("border-0 capitalize text-xs font-semibold", ipcStatusColor[std.status])}>
                    {std.status === "non-compliant" ? "Non-Compliant" : std.status === "partial" ? "Partial" : "Compliant"}
                  </Badge>
                </div>
              </div>
            </div>
            {expandedStd === std.standard && (
              <div className="border-t px-4 py-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Compliance Checklist</p>
                <div className="space-y-2">
                  {std.checklistItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        {item.status === "compliant" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : item.status === "non-compliant" ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm">{item.item}</span>
                      </div>
                      <Badge variant="outline" className={cn("border-0 text-xs capitalize", ipcStatusColor[item.status])}>
                        {item.status === "non-compliant" ? "Non-Compliant" : item.status === "partial" ? "Partial" : "Compliant"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// Need Fragment import for expandable rows
import { Fragment } from "react"

export function QualityDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Dashboard"
        description="Quality metrics, defect analysis, and continuous improvement tracking."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.key
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

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "ncr" && <NCRTab />}
      {activeTab === "capa" && <CAPATab />}
      {activeTab === "spc" && <SPCTab />}
      {activeTab === "audit" && <AuditTab />}
      {activeTab === "ipc" && <IPCTab />}
    </div>
  )
}
