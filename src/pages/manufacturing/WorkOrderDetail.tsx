import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  Gauge,
  CheckCircle,
  AlertTriangle,
  Package,
  Cpu,
  Layers,
  ClipboardList,
  FlaskConical,
  Settings2,
  Users,
  Link2,
  Eye,
  Maximize2,
  SquareCheck,
  CircleDot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { cn, formatNumber } from "@/lib/utils"
import { routeSteps } from "@/lib/mock-data"

type DetailTab = "route" | "material" | "quality" | "gerber" | "operators"

const detailTabs: { key: DetailTab; label: string; icon: typeof Layers }[] = [
  { key: "route", label: "Route Progress", icon: Layers },
  { key: "material", label: "Material Consumption", icon: ClipboardList },
  { key: "quality", label: "Quality", icon: FlaskConical },
  { key: "gerber", label: "Gerber / Setup", icon: Settings2 },
  { key: "operators", label: "Operator Log", icon: Users },
]

const woDetail = {
  id: "WO-2026-0341",
  soId: "SO-2026-089",
  board: "ECU-X500",
  customer: "Bosch",
  qty: 1200,
  line: "Line 1",
  oee: 82,
  status: "active" as const,
  startTime: "2026-03-29 06:00",
  estimatedEnd: "2026-03-29 18:00",
  operator: "Karthik Raja",
}

const materialConsumption = [
  { ref: "U1", part: "STM32F407VGT6", required: 1200, consumed: 850, uom: "pcs", reelId: "RL-2026-4401", lot: "LOT-STM-2026-03" },
  { ref: "C1-C24", part: "GRM155R71C104K", required: 28800, consumed: 20400, uom: "pcs", reelId: "RL-2026-4455", lot: "LOT-MUR-2026-02" },
  { ref: "R1-R36", part: "RC0402FR-07100R", required: 43200, consumed: 30600, uom: "pcs", reelId: "RL-2026-4470", lot: "LOT-YAG-2026-01" },
  { ref: "J1", part: "105450-0101 (USB-C)", required: 1200, consumed: 850, uom: "pcs", reelId: "RL-2026-4512", lot: "LOT-MOL-2026-01" },
  { ref: "Solder", part: "SAC305 Paste", required: 2.4, consumed: 1.7, uom: "kg", reelId: "JAR-2026-089", lot: "LOT-SAC-2026-03" },
  { ref: "Q1", part: "SI2301CDS (P-MOSFET)", required: 1200, consumed: 850, uom: "pcs", reelId: "RL-2026-4490", lot: "LOT-VIS-2026-02" },
  { ref: "D1", part: "SS34 (Schottky)", required: 1200, consumed: 850, uom: "pcs", reelId: "RL-2026-4501", lot: "LOT-ONS-2026-01" },
]

const qualityData = {
  spiStats: { inspected: 1200, passRate: 99.2, avgVolume: 98.4, bridgingCount: 3, insufficientCount: 5 },
  aoiResults: { inspected: 847, defectsFound: 8, falseCallRate: 62.5, realDefects: 3, images: ["AOI capture - Board #847 - Solder bridge on U1 pin 32", "AOI capture - Board #412 - Tombstone on C15"] },
  ictResults: { tested: 0, passed: 0, failed: 0, coverage: 98.5, status: "pending" },
  fctResults: { tested: 0, passed: 0, failed: 0, testCases: 24, status: "pending" },
  overallFPY: 99.6,
  defects: [
    { type: "Solder Bridge", count: 2, location: "U1 pin 32", severity: "major" },
    { type: "Tombstone", count: 1, location: "C15", severity: "minor" },
  ],
}

const gerberSetup = {
  stencilId: "STN-ECU-X500-R3",
  squeegurePressure: "8.5 kg",
  squeegeeSpeed: "40 mm/s",
  reflowProfile: "ECU-X500-v3",
  reflowPeak: "248C",
  reflowTAL: "62 sec",
  pnpProgram: "ECU-X500-TOP-v3.2",
  pnpMachine: "Fuji NXT III",
  aoiProgram: "ECU-X500-AOI-v2.1",
  ictFixture: "FIX-ECU-X500-R2",
  checklist: [
    { item: "Stencil aperture cleanliness verified", checked: true, by: "Karthik Raja", time: "06:05" },
    { item: "Paste temperature verification (room temp 4hrs)", checked: true, by: "Karthik Raja", time: "06:08" },
    { item: "Fiducial alignment confirmed", checked: true, by: "Karthik Raja", time: "06:12" },
    { item: "First article SPI passed", checked: true, by: "Karthik Raja", time: "06:20" },
    { item: "P&P feeder verification complete", checked: true, by: "Ravi Kumar", time: "06:25" },
    { item: "Reflow profile thermocouple validated", checked: true, by: "Ravi Kumar", time: "06:35" },
    { item: "ICT fixture connected and self-test passed", checked: false, by: null, time: null },
    { item: "FCT jig connected and calibrated", checked: false, by: null, time: null },
  ],
  gerberLayers: ["Top Copper", "Bottom Copper", "Top Silk", "Bottom Silk", "Top Paste", "Bottom Paste", "Drill"],
}

const operatorLog = [
  { name: "Karthik Raja", role: "Lead Operator", shift: "A (06:00-14:00)", clockIn: "05:55", clockOut: null, station: "Paste Print + SPI", notes: "Stencil cleaned at board #400. Paste jar #2 opened at 08:30.", handover: null },
  { name: "Ravi Kumar", role: "Operator", shift: "A (06:00-14:00)", clockIn: "06:00", clockOut: null, station: "Pick & Place + Reflow", notes: "Feeder 12 jam cleared at board #320. Nozzle N2 replaced at board #600.", handover: null },
  { name: "Priya Sharma", role: "QC Inspector", shift: "A (06:00-14:00)", clockIn: "06:00", clockOut: null, station: "AOI + Manual Inspection", notes: "2 solder bridges reworked and re-inspected. 1 tombstone sent to NCR.", handover: null },
  { name: "Arjun Mehta", role: "Lead Operator", shift: "B (14:00-22:00)", clockIn: null, clockOut: null, station: "Paste Print + SPI", notes: null, handover: "Shift B handover: Continue from board #847. New paste jar may be needed by board #1000." },
]

export function WorkOrderDetail() {
  const [activeTab, setActiveTab] = useState<DetailTab>("route")
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => navigate("/manufacturing")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight font-mono">
                {woDetail.id}
              </h1>
              <StatusBadge status={woDetail.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {woDetail.board} for {woDetail.customer} &middot; SO {woDetail.soId} &middot; {woDetail.line}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Print Traveler
          </Button>
          <Button size="sm">Update Status</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard title="Quantity" value={formatNumber(woDetail.qty)} icon={Package} color="blue" />
        <KPICard title="OEE" value={`${woDetail.oee}%`} icon={Gauge} color="green" />
        <KPICard title="FPY" value={`${qualityData.overallFPY}%`} icon={CheckCircle} color="teal" />
        <KPICard title="Operator" value={woDetail.operator} icon={Cpu} color="purple" />
        <KPICard title="Est. End" value="18:00" subtitle="Today" icon={Clock} color="orange" />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {detailTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "route" && <RouteProgressTab />}
      {activeTab === "material" && <MaterialConsumptionTab />}
      {activeTab === "quality" && <QualityTab />}
      {activeTab === "gerber" && <GerberSetupTab />}
      {activeTab === "operators" && <OperatorLogTab />}
    </div>
  )
}

/* ─── Route Progress Tab ─── */
function RouteProgressTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Route Progress</CardTitle>
          <span className="text-xs text-muted-foreground">
            {routeSteps.filter((s) => s.status === "done").length} of {routeSteps.length} steps complete
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
          {routeSteps.map((step, idx) => {
            const isFirst = idx === 0
            const isLast = idx === routeSteps.length - 1

            return (
              <div key={step.step} className="flex items-stretch flex-1 min-w-[120px]">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center mb-3">
                    {!isFirst && (
                      <div
                        className={cn(
                          "h-0.5 flex-1",
                          step.status === "done"
                            ? "bg-emerald-500"
                            : step.status === "active"
                            ? "bg-blue-500"
                            : "bg-border"
                        )}
                      />
                    )}
                    {isFirst && <div className="flex-1" />}

                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        step.status === "done"
                          ? "bg-emerald-500 text-white"
                          : step.status === "active"
                          ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                          : "bg-muted text-muted-foreground border-2 border-border"
                      )}
                    >
                      {step.status === "done" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {!isLast && (
                      <div
                        className={cn(
                          "h-0.5 flex-1",
                          step.status === "done" ? "bg-emerald-500" : "bg-border"
                        )}
                      />
                    )}
                    {isLast && <div className="flex-1" />}
                  </div>

                  <div className="text-center px-1">
                    <p
                      className={cn(
                        "text-xs font-medium",
                        step.status === "active"
                          ? "text-blue-600"
                          : step.status === "done"
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.step}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      {formatNumber(step.completed)} / {formatNumber(step.total)}
                    </p>
                    {step.status === "active" && (
                      <div className="mt-1.5">
                        <Progress
                          value={(step.completed / step.total) * 100}
                          className="h-1 mx-auto max-w-[80px]"
                          indicatorClassName="bg-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Material Consumption Tab ─── */
function MaterialConsumptionTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Material Consumption &amp; Reel Traceability</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">
            {materialConsumption.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Ref", "Part Number", "Reel / Container ID", "Lot", "Required", "Consumed", "Remaining", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialConsumption.map((m) => {
                const pct = Math.round((m.consumed / m.required) * 100)
                const remaining = +(m.required - m.consumed).toFixed(2)
                return (
                  <tr key={m.ref} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-2.5 px-2 font-mono text-xs text-muted-foreground font-medium">
                      {m.ref}
                    </td>
                    <td className="py-2.5 px-2 text-xs font-medium">{m.part}</td>
                    <td className="py-2.5 px-2">
                      <button className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
                        <Link2 className="h-3 w-3" />
                        {m.reelId}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-xs font-mono text-muted-foreground">{m.lot}</td>
                    <td className="py-2.5 px-2 text-xs tabular-nums">
                      {m.required} {m.uom}
                    </td>
                    <td className="py-2.5 px-2 text-xs tabular-nums font-medium">
                      {m.consumed} {m.uom}
                    </td>
                    <td className="py-2.5 px-2 text-xs tabular-nums">
                      <span className={cn(remaining <= 0 ? "text-emerald-600" : "text-muted-foreground")}>
                        {remaining} {m.uom}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 w-[100px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              pct >= 100 ? "bg-emerald-500" : pct >= 70 ? "bg-blue-500" : "bg-amber-500"
                            )}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Quality Tab ─── */
function QualityTab() {
  return (
    <div className="space-y-4">
      {/* Overall FPY */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall FPY</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{qualityData.overallFPY}%</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SPI Pass Rate</p>
          <p className="text-2xl font-bold mt-1">{qualityData.spiStats.passRate}%</p>
          <p className="text-xs text-muted-foreground">{qualityData.spiStats.inspected} inspected</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-violet-500">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AOI Real Defects</p>
          <p className="text-2xl font-bold mt-1">{qualityData.aoiResults.realDefects}</p>
          <p className="text-xs text-muted-foreground">{qualityData.aoiResults.falseCallRate}% false call rate</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Defect Count</p>
          <p className="text-2xl font-bold mt-1">{qualityData.defects.reduce((a, d) => a + d.count, 0)}</p>
          <p className="text-xs text-muted-foreground">{qualityData.defects.length} defect types</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* SPI Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">SPI Inspection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Boards Inspected</span>
                <span className="font-medium tabular-nums">{formatNumber(qualityData.spiStats.inspected)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Paste Volume</span>
                <span className="font-medium tabular-nums">{qualityData.spiStats.avgVolume}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bridging Detections</span>
                <span className="font-medium tabular-nums text-amber-600">{qualityData.spiStats.bridgingCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Insufficient Deposits</span>
                <span className="font-medium tabular-nums text-amber-600">{qualityData.spiStats.insufficientCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AOI Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">AOI Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Boards Inspected</span>
              <span className="font-medium tabular-nums">{formatNumber(qualityData.aoiResults.inspected)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Flags</span>
              <span className="font-medium tabular-nums">{qualityData.aoiResults.defectsFound}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Real Defects</span>
              <span className="font-medium tabular-nums text-red-600">{qualityData.aoiResults.realDefects}</span>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Defect Images</p>
              {qualityData.aoiResults.images.map((img, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border p-2.5 bg-muted/30">
                  <div className="h-10 w-14 rounded bg-muted flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground">{img}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ICT Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">ICT Results</CardTitle>
              <StatusBadge status={qualityData.ictResults.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Test Coverage</span>
                <span className="font-medium tabular-nums">{qualityData.ictResults.coverage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tested / Passed / Failed</span>
                <span className="font-medium tabular-nums">
                  {qualityData.ictResults.tested} / {qualityData.ictResults.passed} / {qualityData.ictResults.failed}
                </span>
              </div>
              <div className="text-center py-4 text-muted-foreground text-xs">
                ICT testing will begin after AOI stage completes.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FCT Results */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">FCT Results</CardTitle>
              <StatusBadge status={qualityData.fctResults.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Test Cases</span>
                <span className="font-medium tabular-nums">{qualityData.fctResults.testCases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tested / Passed / Failed</span>
                <span className="font-medium tabular-nums">
                  {qualityData.fctResults.tested} / {qualityData.fctResults.passed} / {qualityData.fctResults.failed}
                </span>
              </div>
              <div className="text-center py-4 text-muted-foreground text-xs">
                FCT will begin after ICT stage completes.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Defect Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {qualityData.defects.map((d) => (
              <div key={d.type} className="flex items-center justify-between text-sm rounded-md border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-3.5 w-3.5", d.severity === "major" ? "text-red-500" : "text-amber-500")} />
                  <span className="font-medium">{d.type}</span>
                  <span className="text-xs text-muted-foreground">at {d.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs border-0",
                      d.severity === "major"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                    )}
                  >
                    {d.severity}
                  </Badge>
                  <Badge variant="outline" className="font-mono">{d.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Gerber / Setup Tab ─── */
function GerberSetupTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gerber Viewer Placeholder */}
        <Card className="lg:row-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Gerber Viewer - {woDetail.board}</CardTitle>
              <div className="flex items-center gap-1">
                {gerberSetup.gerberLayers.slice(0, 4).map((layer) => (
                  <Badge key={layer} variant="outline" className="text-[10px] px-1.5 py-0">
                    {layer.replace("Top ", "T-").replace("Bottom ", "B-")}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-square bg-slate-950 rounded-b-lg flex flex-col items-center justify-center relative overflow-hidden">
              {/* Simulated PCB board outline */}
              <div className="absolute inset-8 border-2 border-emerald-500/30 rounded-sm">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-emerald-400" style={{ top: `${(i + 1) * 9.09}%` }} />
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-emerald-400" style={{ left: `${(i + 1) * 9.09}%` }} />
                  ))}
                </div>
                {/* Simulated component pads */}
                <div className="absolute top-[20%] left-[30%] w-8 h-8 border border-emerald-400/60 rounded-sm flex items-center justify-center">
                  <span className="text-[8px] text-emerald-400/80 font-mono">U1</span>
                </div>
                <div className="absolute top-[15%] left-[55%] w-4 h-1 bg-blue-400/30 border border-blue-400/50 rounded-[1px]" />
                <div className="absolute top-[15%] left-[62%] w-4 h-1 bg-blue-400/30 border border-blue-400/50 rounded-[1px]" />
                <div className="absolute top-[40%] left-[20%] w-3 h-1 bg-red-400/30 border border-red-400/50 rounded-[1px]" />
                <div className="absolute top-[60%] left-[70%] w-6 h-4 border border-yellow-400/50 rounded-sm flex items-center justify-center">
                  <span className="text-[7px] text-yellow-400/80 font-mono">J1</span>
                </div>
                {/* Traces */}
                <div className="absolute top-[25%] left-[40%] w-[20%] h-[0.5px] bg-emerald-400/40" />
                <div className="absolute top-[35%] left-[30%] w-[0.5px] h-[15%] bg-emerald-400/40" />
                <div className="absolute top-[50%] left-[45%] w-[25%] h-[0.5px] bg-blue-400/30" />
                {/* Fiducials */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-white/40" />
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-white/40" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400/60 font-mono">ECU-X500 Rev 3</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/40 hover:text-white">
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Machine Setup Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Machine Setup Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Stencil ID", value: gerberSetup.stencilId, mono: true },
                { label: "Squeegee Pressure", value: gerberSetup.squeegurePressure },
                { label: "Squeegee Speed", value: gerberSetup.squeegeeSpeed },
                { label: "Reflow Profile", value: gerberSetup.reflowProfile, mono: true },
                { label: "Reflow Peak", value: gerberSetup.reflowPeak },
                { label: "Reflow TAL", value: gerberSetup.reflowTAL },
                { label: "P&P Program", value: gerberSetup.pnpProgram, mono: true },
                { label: "P&P Machine", value: gerberSetup.pnpMachine },
                { label: "AOI Program", value: gerberSetup.aoiProgram, mono: true },
                { label: "ICT Fixture", value: gerberSetup.ictFixture, mono: true },
              ].map((param) => (
                <div key={param.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{param.label}</span>
                  <span className={cn("font-medium", param.mono && "font-mono text-xs")}>{param.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setup Verification Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Setup Verification Checklist</CardTitle>
              <span className="text-xs text-muted-foreground">
                {gerberSetup.checklist.filter((c) => c.checked).length}/{gerberSetup.checklist.length} verified
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gerberSetup.checklist.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2.5 rounded-md border px-3 py-2",
                    item.checked ? "bg-emerald-500/5 border-emerald-200 dark:border-emerald-800" : "bg-muted/30"
                  )}
                >
                  {item.checked ? (
                    <SquareCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <CircleDot className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs", item.checked ? "text-foreground" : "text-muted-foreground")}>{item.item}</p>
                    {item.checked && item.by && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.by} at {item.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ─── Operator Log Tab ─── */
function OperatorLogTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Operator Log</CardTitle>
          <Badge variant="outline" className="text-xs">Shift A - Active</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operatorLog.map((op) => (
            <div
              key={op.name}
              className={cn(
                "rounded-lg border p-4",
                op.clockIn && !op.clockOut ? "border-emerald-200 bg-emerald-500/5 dark:border-emerald-800" : "bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{op.name}</p>
                    <Badge variant="outline" className="text-[10px]">{op.role}</Badge>
                    {op.clockIn && !op.clockOut && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        On Floor
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{op.station} &middot; {op.shift}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>In: {op.clockIn ?? "--"}</span>
                    <span className="text-muted-foreground/50">|</span>
                    <span>Out: {op.clockOut ?? "--"}</span>
                  </div>
                </div>
              </div>

              {op.notes && (
                <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
                  <span className="font-medium text-foreground">Notes:</span> {op.notes}
                </div>
              )}

              {op.handover && (
                <div className="mt-2 text-xs bg-amber-500/10 border border-amber-200 dark:border-amber-800 rounded-md p-2.5">
                  <span className="font-medium text-amber-700 dark:text-amber-400">Shift Handover:</span>{" "}
                  <span className="text-amber-700/80 dark:text-amber-400/80">{op.handover}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
