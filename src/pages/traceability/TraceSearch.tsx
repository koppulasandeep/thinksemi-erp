import { useState } from "react"
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  User,
  Package,
  AlertTriangle,
  FileBarChart,
  Layers,
  CircuitBoard,
  Truck,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// ─── Tab definitions ───
const tabs = [
  { key: "board", label: "Board Trace", icon: CircuitBoard },
  { key: "component", label: "Component Trace", icon: Cpu },
  { key: "lot", label: "Lot Trace", icon: Layers },
  { key: "recall", label: "Recall Simulation", icon: AlertTriangle },
  { key: "reports", label: "Reports", icon: FileBarChart },
] as const

type TabKey = (typeof tabs)[number]["key"]

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
}

// ─── Board Trace Data ───
interface TraceStep {
  step: string
  station: string
  machine: string
  operator: string
  timestamp: string
  result: "pass" | "fail" | "pending"
  details?: string
}

interface TraceComponent {
  ref: string
  part: string
  lot: string
  manufacturer: string
  dateCode: string
  reel: string
}

const traceResult = {
  serialNumber: "SN-ECU-X500-00847",
  board: "ECU-X500",
  wo: "WO-2026-0341",
  customer: "Bosch",
  dateBuilt: "2026-03-29",
  steps: [
    { step: "Paste Print", station: "PP-01", machine: "DEK Horizon 03iX", operator: "Ravi K", timestamp: "2026-03-29 06:12:34", result: "pass" as const, details: "Pressure: 8.5kg, Speed: 40mm/s" },
    { step: "SPI", station: "SPI-01", machine: "Koh Young Zenith", operator: "System", timestamp: "2026-03-29 06:13:02", result: "pass" as const, details: "Volume: 98.2%, Area: 97.8%" },
    { step: "Pick & Place", station: "PNP-01", machine: "Fuji NXT III", operator: "Ravi K", timestamp: "2026-03-29 06:15:45", result: "pass" as const, details: "462 placements, 0 rejects" },
    { step: "Reflow", station: "RF-01", machine: "Heller 1913 MK5", operator: "System", timestamp: "2026-03-29 06:22:10", result: "pass" as const, details: "Peak: 248C, TAL: 62s, Profile: ECU-X500-v3" },
    { step: "AOI", station: "AOI-01", machine: "Omron VT-S730", operator: "System", timestamp: "2026-03-29 06:24:33", result: "pass" as const, details: "0 defects detected" },
    { step: "ICT", station: "ICT-01", machine: "Keysight i3070", operator: "Deepa N", timestamp: "2026-03-29 07:05:12", result: "pass" as const, details: "All 847 nets passed" },
    { step: "FCT", station: "FCT-01", machine: "Custom Fixture F-42", operator: "Deepa N", timestamp: "2026-03-29 07:12:48", result: "pass" as const, details: "All functions verified, Vout: 5.02V" },
  ] as TraceStep[],
  components: [
    { ref: "U1", part: "STM32F407VGT6", lot: "LOT-2026-03-A", manufacturer: "ST", dateCode: "2548", reel: "RL-88421" },
    { ref: "U2", part: "LM358BDR", lot: "LOT-2026-02-C", manufacturer: "TI", dateCode: "2546", reel: "RL-88425" },
    { ref: "C1-C24", part: "GRM155R71C104K", lot: "LOT-2026-03-B", manufacturer: "Murata", dateCode: "2550", reel: "RL-88440" },
    { ref: "R1-R36", part: "RC0402FR-07100R", lot: "LOT-2026-01-D", manufacturer: "Yageo", dateCode: "2544", reel: "RL-88390" },
    { ref: "J1", part: "105450-0101", lot: "LOT-2026-02-A", manufacturer: "Molex", dateCode: "2547", reel: "RL-88410" },
    { ref: "Q1", part: "SI2301CDS", lot: "LOT-2026-03-C", manufacturer: "Vishay", dateCode: "2549", reel: "RL-88432" },
  ] as TraceComponent[],
}

// ─── Component Trace Data (reverse trace) ───
interface ComponentTraceBoard {
  serial: string
  board: string
  wo: string
  customer: string
  dateBuilt: string
  shipmentStatus: "shipped" | "in_stock" | "in_production" | "scrapped"
  shipmentId?: string
}

const componentTraceResult = {
  reelId: "RL-88421",
  part: "STM32F407VGT6",
  lot: "LOT-2026-03-A",
  manufacturer: "ST",
  dateCode: "2548",
  poNumber: "PO-2026-42",
  receivedDate: "2026-03-15",
  qtyReceived: 500,
  qtyUsed: 312,
  qtyRemaining: 188,
  boards: [
    { serial: "SN-ECU-X500-00801", board: "ECU-X500", wo: "WO-2026-0341", customer: "Bosch", dateBuilt: "2026-03-28", shipmentStatus: "shipped" as const, shipmentId: "SH-2026-020" },
    { serial: "SN-ECU-X500-00802", board: "ECU-X500", wo: "WO-2026-0341", customer: "Bosch", dateBuilt: "2026-03-28", shipmentStatus: "shipped" as const, shipmentId: "SH-2026-020" },
    { serial: "SN-ECU-X500-00847", board: "ECU-X500", wo: "WO-2026-0341", customer: "Bosch", dateBuilt: "2026-03-29", shipmentStatus: "in_stock" as const },
    { serial: "SN-ECU-X500-00848", board: "ECU-X500", wo: "WO-2026-0341", customer: "Bosch", dateBuilt: "2026-03-29", shipmentStatus: "in_stock" as const },
    { serial: "SN-ADAS-M1-00201", board: "ADAS-M1", wo: "WO-2026-0335", customer: "Continental", dateBuilt: "2026-03-27", shipmentStatus: "shipped" as const, shipmentId: "SH-2026-019" },
    { serial: "SN-ADAS-M1-00205", board: "ADAS-M1", wo: "WO-2026-0335", customer: "Continental", dateBuilt: "2026-03-27", shipmentStatus: "in_production" as const },
    { serial: "SN-ECU-X500-00812", board: "ECU-X500", wo: "WO-2026-0341", customer: "Bosch", dateBuilt: "2026-03-28", shipmentStatus: "scrapped" as const },
  ] as ComponentTraceBoard[],
}

// ─── Lot Trace Data ───
interface LotReel {
  reelId: string
  part: string
  qtyReceived: number
  qtyUsed: number
  boards: { serial: string; board: string; status: "shipped" | "in_stock" | "scrapped" }[]
}

const lotTraceResult = {
  lotNumber: "LOT-2026-03-A",
  manufacturer: "ST",
  dateCode: "2548",
  part: "STM32F407VGT6",
  totalReels: 3,
  totalQty: 1500,
  reels: [
    {
      reelId: "RL-88421",
      part: "STM32F407VGT6",
      qtyReceived: 500,
      qtyUsed: 312,
      boards: [
        { serial: "SN-ECU-X500-00801", board: "ECU-X500", status: "shipped" as const },
        { serial: "SN-ECU-X500-00847", board: "ECU-X500", status: "in_stock" as const },
        { serial: "SN-ADAS-M1-00201", board: "ADAS-M1", status: "shipped" as const },
      ],
    },
    {
      reelId: "RL-88422",
      part: "STM32F407VGT6",
      qtyReceived: 500,
      qtyUsed: 488,
      boards: [
        { serial: "SN-ECU-X500-00501", board: "ECU-X500", status: "shipped" as const },
        { serial: "SN-IoT-200-00110", board: "IoT-200", status: "shipped" as const },
        { serial: "SN-IoT-200-00115", board: "IoT-200", status: "in_stock" as const },
      ],
    },
    {
      reelId: "RL-88423",
      part: "STM32F407VGT6",
      qtyReceived: 500,
      qtyUsed: 45,
      boards: [
        { serial: "SN-VFD-CTRL-00301", board: "VFD-CTRL", status: "in_stock" as const },
      ],
    },
  ] as LotReel[],
}

// ─── Recall Simulation Data ───
const recallSimResult = {
  triggerComponent: "STM32F407VGT6",
  triggerLot: "LOT-2026-03-A",
  reason: "Potential ESD damage during manufacturing (supplier advisory SA-2026-0012)",
  totalBoardsAffected: 59,
  boardsShipped: 47,
  boardsInStock: 12,
  boardsScrapped: 0,
  customersAffected: [
    { name: "Bosch", boardCount: 34, shipments: ["SH-2026-018", "SH-2026-020"], contact: "Hans Mueller" },
    { name: "Continental", boardCount: 18, shipments: ["SH-2026-019"], contact: "Anna Schmidt" },
    { name: "L&T", boardCount: 7, shipments: ["SH-2026-017"], contact: "Vikram Desai" },
  ],
  estimatedRecallCost: {
    shipping: 12500,
    rework: 35000,
    replacement: 28000,
    admin: 5000,
    total: 80500,
  },
  affectedWorkOrders: ["WO-2026-0335", "WO-2026-0338", "WO-2026-0341"],
}

// ─── Reports Data ───
const traceabilityReports = {
  coverageRate: 98.4,
  boardsWithFullTrace: 4812,
  totalBoards: 4890,
  avgComponentsPerBoard: 462,
  componentUsage: [
    { part: "STM32F407VGT6", used: 1580, boards: 1580, supplier: "ST" },
    { part: "GRM155R71C104K", used: 37920, boards: 1580, supplier: "Murata" },
    { part: "RC0402FR-07100R", used: 56880, boards: 1580, supplier: "Yageo" },
    { part: "LM358BDR", used: 3160, boards: 1580, supplier: "TI" },
    { part: "105450-0101", used: 1580, boards: 1580, supplier: "Molex" },
  ],
  traceGaps: [
    { board: "PS-220", issue: "Missing reel scan for R1-R12 on WO-2026-0338", severity: "minor" },
    { board: "IoT-200", issue: "No FCT data for SN-IoT-200-00098 through 00102", severity: "major" },
  ],
  coverageTrend: [
    { month: "Oct", coverage: 95.2 },
    { month: "Nov", coverage: 96.1 },
    { month: "Dec", coverage: 96.8 },
    { month: "Jan", coverage: 97.5 },
    { month: "Feb", coverage: 98.0 },
    { month: "Mar", coverage: 98.4 },
  ],
}

const shipmentStatusColors: Record<string, string> = {
  shipped: "bg-emerald-100 text-emerald-700",
  in_stock: "bg-blue-100 text-blue-700",
  in_production: "bg-amber-100 text-amber-700",
  scrapped: "bg-red-100 text-red-700",
}

const shipmentStatusLabels: Record<string, string> = {
  shipped: "Shipped",
  in_stock: "In Stock",
  in_production: "In Production",
  scrapped: "Scrapped",
}

// ─── Tab Components ───

function BoardTraceTab() {
  const [query, setQuery] = useState("SN-ECU-X500-00847")
  const [searched, setSearched] = useState(true)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const handleSearch = () => {
    if (query.trim()) {
      setSearched(true)
      // Fire API search (results will be used when endpoint is ready)
      api.get(`/traceability/search?q=${encodeURIComponent(query.trim())}`).catch(() => {})
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-sm text-muted-foreground text-center">Enter board serial number or barcode for forward trace</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Enter serial number..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-10 h-11 text-base" />
              </div>
              <Button className="h-11 px-6 bg-teal-600 hover:bg-teal-700" onClick={handleSearch}>Search</Button>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              {["SN-ECU-X500-00847", "SN-ADAS-M1-00201", "SN-PS-220-00322"].map((sn, i) => (
                <span key={sn}>
                  {i > 0 && <span className="mr-3">&middot;</span>}
                  <button className="hover:text-foreground transition-colors" onClick={() => { setQuery(sn); setSearched(true) }}>{sn}</button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          {/* Board Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold font-mono">{traceResult.serialNumber}</p>
                    <p className="text-sm text-muted-foreground">{traceResult.board} &middot; {traceResult.customer} &middot; {traceResult.wo}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0">All Tests Passed</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Built: {traceResult.dateBuilt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Process Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {traceResult.steps.map((step, idx) => {
                  const isLast = idx === traceResult.steps.length - 1
                  const isExpanded = expandedStep === idx

                  return (
                    <div key={step.step} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <button
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer",
                            step.result === "pass" ? "bg-emerald-500/10 hover:bg-emerald-500/20" : step.result === "fail" ? "bg-red-500/10 hover:bg-red-500/20" : "bg-muted hover:bg-muted/80"
                          )}
                          onClick={() => setExpandedStep(isExpanded ? null : idx)}
                        >
                          {step.result === "pass" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          ) : step.result === "fail" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>

                      <div className="flex-1 min-w-0 pb-2">
                        <div
                          className="cursor-pointer"
                          onClick={() => setExpandedStep(isExpanded ? null : idx)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{step.step}</p>
                              <Badge variant="outline" className={cn("text-[10px] border-0", step.result === "pass" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                                {step.result.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">{step.timestamp.split(" ")[1]}</span>
                          </div>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{step.machine}</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{step.operator}</span>
                          <span>Station: {step.station}</span>
                        </div>
                        {(step.details && isExpanded) && (
                          <div className="mt-2 bg-muted/50 rounded-md px-3 py-2 text-xs text-muted-foreground border">
                            <p className="font-medium text-foreground mb-1">Process Parameters</p>
                            <p>{step.details}</p>
                            <p className="mt-1">Full timestamp: {step.timestamp}</p>
                          </div>
                        )}
                        {(step.details && !isExpanded) && (
                          <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded-md px-2 py-1 inline-block">{step.details}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Component Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Component Traceability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Ref", "Part Number", "Lot", "Manufacturer", "Date Code", "Reel ID"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {traceResult.components.map((comp) => (
                      <tr key={comp.ref} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs font-medium">{comp.ref}</td>
                        <td className="py-3 px-3 font-mono text-xs">{comp.part}</td>
                        <td className="py-3 px-3 font-mono text-xs text-teal-600">{comp.lot}</td>
                        <td className="py-3 px-3 text-muted-foreground">{comp.manufacturer}</td>
                        <td className="py-3 px-3 font-mono text-xs">{comp.dateCode}</td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{comp.reel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ComponentTraceTab() {
  const [query, setQuery] = useState("RL-88421")
  const [searched, setSearched] = useState(true)

  const handleSearch = () => {
    if (query.trim()) {
      setSearched(true)
      api.get(`/traceability/search?q=${encodeURIComponent(query.trim())}`).catch(() => {})
    }
  }

  const statusCounts = componentTraceResult.boards.reduce((acc, b) => {
    acc[b.shipmentStatus] = (acc[b.shipmentStatus] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-sm text-muted-foreground text-center">Enter reel ID or lot number for reverse trace (component to boards)</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Enter reel ID or lot number..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-10 h-11 text-base" />
              </div>
              <Button className="h-11 px-6 bg-teal-600 hover:bg-teal-700" onClick={handleSearch}>Search</Button>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              {["RL-88421", "RL-88440", "LOT-2026-03-A"].map((id, i) => (
                <span key={id}>
                  {i > 0 && <span className="mr-3">&middot;</span>}
                  <button className="hover:text-foreground transition-colors" onClick={() => { setQuery(id); setSearched(true) }}>{id}</button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          {/* Reel Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold font-mono">{componentTraceResult.reelId}</p>
                    <p className="text-sm text-muted-foreground">{componentTraceResult.part} &middot; {componentTraceResult.manufacturer} &middot; DC {componentTraceResult.dateCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold">{componentTraceResult.qtyReceived}</p>
                    <p className="text-xs text-muted-foreground">Received</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-teal-600">{componentTraceResult.qtyUsed}</p>
                    <p className="text-xs text-muted-foreground">Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{componentTraceResult.qtyRemaining}</p>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status summary */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KPICard title="Total Boards" value={String(componentTraceResult.boards.length)} icon={CircuitBoard} iconColor="text-slate-500" />
            <KPICard title="Shipped" value={String(statusCounts.shipped || 0)} icon={Truck} iconColor="text-emerald-500" />
            <KPICard title="In Stock" value={String(statusCounts.in_stock || 0)} icon={Package} iconColor="text-blue-500" />
            <KPICard title="In Production" value={String(statusCounts.in_production || 0)} icon={Cpu} iconColor="text-amber-500" />
          </div>

          {/* Board list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Boards Using This Component</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Serial Number", "Board", "Work Order", "Customer", "Date Built", "Shipment Status", "Shipment ID"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {componentTraceResult.boards.map((b) => (
                      <tr key={b.serial} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-3 font-mono text-xs font-medium text-teal-600">{b.serial}</td>
                        <td className="py-3 px-3 font-medium">{b.board}</td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{b.wo}</td>
                        <td className="py-3 px-3">{b.customer}</td>
                        <td className="py-3 px-3 font-mono text-xs">{b.dateBuilt}</td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={cn("text-xs border-0", shipmentStatusColors[b.shipmentStatus])}>
                            {shipmentStatusLabels[b.shipmentStatus]}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{b.shipmentId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function LotTraceTab() {
  const [query, setQuery] = useState("LOT-2026-03-A")
  const [searched, setSearched] = useState(true)
  const [expandedReel, setExpandedReel] = useState<string | null>(null)

  const handleSearch = () => {
    if (query.trim()) {
      setSearched(true)
      api.get(`/traceability/search?q=${encodeURIComponent(query.trim())}`).catch(() => {})
    }
  }

  const allBoards = lotTraceResult.reels.flatMap((r) => r.boards)
  const shippedCount = allBoards.filter((b) => b.status === "shipped").length
  const inStockCount = allBoards.filter((b) => b.status === "in_stock").length

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-sm text-muted-foreground text-center">Enter lot number or date code to trace all reels and boards</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Enter lot number or date code..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-10 h-11 text-base" />
              </div>
              <Button className="h-11 px-6 bg-teal-600 hover:bg-teal-700" onClick={handleSearch}>Search</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {searched && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold font-mono">{lotTraceResult.lotNumber}</p>
                    <p className="text-sm text-muted-foreground">{lotTraceResult.part} &middot; {lotTraceResult.manufacturer} &middot; DC {lotTraceResult.dateCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-lg font-bold">{lotTraceResult.totalReels}</p>
                    <p className="text-xs text-muted-foreground">Reels</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{lotTraceResult.totalQty}</p>
                    <p className="text-xs text-muted-foreground">Total Qty</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{shippedCount}</p>
                    <p className="text-xs text-muted-foreground">Shipped</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{inStockCount}</p>
                    <p className="text-xs text-muted-foreground">In Stock</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reels */}
          <div className="space-y-3">
            {lotTraceResult.reels.map((reel) => (
              <Card key={reel.reelId}>
                <div
                  className="p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedReel(expandedReel === reel.reelId ? null : reel.reelId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedReel === reel.reelId && "rotate-90")} />
                      <div>
                        <p className="font-mono font-medium">{reel.reelId}</p>
                        <p className="text-xs text-muted-foreground">{reel.qtyUsed} of {reel.qtyReceived} used &middot; {reel.boards.length} boards traced</p>
                      </div>
                    </div>
                    <div className="w-32">
                      <Progress value={(reel.qtyUsed / reel.qtyReceived) * 100} className="h-2" indicatorClassName="bg-teal-500" />
                      <p className="text-xs text-muted-foreground text-right mt-0.5">{Math.round((reel.qtyUsed / reel.qtyReceived) * 100)}% used</p>
                    </div>
                  </div>
                </div>
                {expandedReel === reel.reelId && (
                  <div className="border-t px-4 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          {["Serial", "Board", "Status"].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reel.boards.map((b) => (
                          <tr key={b.serial} className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono text-xs text-teal-600">{b.serial}</td>
                            <td className="py-2 px-3 text-sm">{b.board}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className={cn("text-xs border-0", shipmentStatusColors[b.status])}>
                                {shipmentStatusLabels[b.status]}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RecallSimTab() {
  const [query, setQuery] = useState("LOT-2026-03-A")
  const [simulated, setSimulated] = useState(true)

  const handleSimulate = () => {
    if (query.trim()) setSimulated(true)
  }

  const statusPie = [
    { name: "In Field (Shipped)", value: recallSimResult.boardsShipped, color: "#ef4444" },
    { name: "In Stock", value: recallSimResult.boardsInStock, color: "#3b82f6" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <p className="text-sm text-muted-foreground text-center">Enter a component lot or part number to simulate a recall scenario</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Enter lot number or component..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSimulate()} className="pl-10 h-11 text-base" />
              </div>
              <Button className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white" onClick={handleSimulate}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Simulate Recall
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {simulated && (
        <>
          {/* Impact Summary */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border-l-4 border-l-red-500">
              <p className="text-xs text-muted-foreground uppercase font-medium">Boards in Field</p>
              <p className="text-3xl font-bold text-red-600">{recallSimResult.boardsShipped}</p>
              <p className="text-xs text-muted-foreground">Already shipped to customers</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-blue-500">
              <p className="text-xs text-muted-foreground uppercase font-medium">Boards in Stock</p>
              <p className="text-3xl font-bold text-blue-600">{recallSimResult.boardsInStock}</p>
              <p className="text-xs text-muted-foreground">Can be quarantined immediately</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-amber-500">
              <p className="text-xs text-muted-foreground uppercase font-medium">Customers Affected</p>
              <p className="text-3xl font-bold text-amber-600">{recallSimResult.customersAffected.length}</p>
              <p className="text-xs text-muted-foreground">Require notification</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-violet-500">
              <p className="text-xs text-muted-foreground uppercase font-medium">Est. Recall Cost</p>
              <p className="text-3xl font-bold text-violet-600">${(recallSimResult.estimatedRecallCost.total / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground">Shipping + rework + replacement</p>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Board Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {statusPie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Estimated Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Return Shipping", value: recallSimResult.estimatedRecallCost.shipping },
                    { label: "Rework/Repair", value: recallSimResult.estimatedRecallCost.rework },
                    { label: "Replacement Boards", value: recallSimResult.estimatedRecallCost.replacement },
                    { label: "Admin & Communication", value: recallSimResult.estimatedRecallCost.admin },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-mono font-medium">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Total Estimated Cost</span>
                    <span className="text-lg font-bold font-mono text-red-600">${recallSimResult.estimatedRecallCost.total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Affected Customers */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Affected Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Customer", "Boards Affected", "Shipments", "Contact"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recallSimResult.customersAffected.map((c) => (
                      <tr key={c.name} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-3 font-medium">{c.name}</td>
                        <td className="py-3 px-3">
                          <span className="text-sm font-bold text-red-600">{c.boardCount}</span>
                          <span className="text-xs text-muted-foreground ml-1">boards</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {c.shipments.map((s) => (
                              <Badge key={s} variant="outline" className="text-xs font-mono">{s}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{c.contact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Trigger info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Trigger Component</p>
                  <p className="text-sm font-mono">{recallSimResult.triggerComponent}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Trigger Lot</p>
                  <p className="text-sm font-mono">{recallSimResult.triggerLot}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Affected Work Orders</p>
                  <div className="flex gap-1 flex-wrap">
                    {recallSimResult.affectedWorkOrders.map((wo) => (
                      <Badge key={wo} variant="outline" className="text-xs font-mono">{wo}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Reason</p>
                <p className="text-sm text-muted-foreground">{recallSimResult.reason}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Coverage KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard title="Trace Coverage" value={`${traceabilityReports.coverageRate}%`} subtitle="Full trace coverage" icon={CheckCircle} iconColor="text-emerald-500" />
        <KPICard title="Boards Traced" value={`${traceabilityReports.boardsWithFullTrace.toLocaleString()}`} subtitle={`of ${traceabilityReports.totalBoards.toLocaleString()} total`} icon={CircuitBoard} iconColor="text-teal-500" />
        <KPICard title="Avg Components/Board" value={String(traceabilityReports.avgComponentsPerBoard)} icon={Cpu} iconColor="text-blue-500" />
        <KPICard title="Trace Gaps" value={String(traceabilityReports.traceGaps.length)} subtitle="Requiring attention" icon={AlertTriangle} iconColor="text-amber-500" />
      </div>

      {/* Coverage Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Traceability Coverage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={traceabilityReports.coverageTrend} margin={{ left: 5, right: 20, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} domain={[90, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${value}%`, "Coverage"]} />
                <Bar dataKey="coverage" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Component Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Component Usage Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Part Number", "Supplier", "Units Used", "Boards"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {traceabilityReports.componentUsage.map((c) => (
                    <tr key={c.part} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs">{c.part}</td>
                      <td className="py-2 px-3 text-muted-foreground">{c.supplier}</td>
                      <td className="py-2 px-3 font-mono text-xs">{c.used.toLocaleString()}</td>
                      <td className="py-2 px-3 font-mono text-xs">{c.boards.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trace Gaps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Traceability Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {traceabilityReports.traceGaps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No traceability gaps found.</div>
            ) : (
              <div className="space-y-3">
                {traceabilityReports.traceGaps.map((gap, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{gap.board}</span>
                      <Badge variant="outline" className={cn("text-xs border-0", gap.severity === "major" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                        {gap.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{gap.issue}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Component ───

export function TraceSearch() {
  const [activeTab, setActiveTab] = useState<TabKey>("board")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traceability"
        description="Full forward and backward traceability for every board, component, and process step."
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
      {activeTab === "board" && <BoardTraceTab />}
      {activeTab === "component" && <ComponentTraceTab />}
      {activeTab === "lot" && <LotTraceTab />}
      {activeTab === "recall" && <RecallSimTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  )
}
