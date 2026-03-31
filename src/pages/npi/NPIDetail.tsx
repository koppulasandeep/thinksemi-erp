import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { npiProjects, bomItems } from "@/lib/mock-data"
import {
  ArrowLeft,
  CheckSquare,
  Square,
  FileText,
  Upload,
  Layers,
  Cpu,
  Download,
  Eye,
  TestTube,
  Award,
  History,
  Search,
  Ruler,
  MousePointer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle2,
  Clock,
  Camera,
  XCircle,
  User,
  Zap,
} from "lucide-react"

// Mock detail for the first NPI project
const project = npiProjects[1] // IoT-200 has good mid-state data

// --- Progress stages ---
const progressStages = ["Intake", "DFM", "Prototype", "Validation", "Released"] as const
const currentStageIndex = 1 // DFM Review

// --- Checklist ---
interface ChecklistStep {
  id: string
  label: string
  done: boolean
}

const initialChecklist: ChecklistStep[] = [
  { id: "gerber", label: "Gerber files received", done: true },
  { id: "bom", label: "BOM received", done: true },
  { id: "bom-valid", label: "BOM validated", done: false },
  { id: "pnp", label: "Pick & Place file ready", done: true },
  { id: "stencil", label: "Stencil ordered", done: true },
  { id: "dfm", label: "DFM review complete", done: false },
  { id: "test-plan", label: "Test plan approved", done: false },
  { id: "first-article", label: "First article inspection", done: false },
]

const gerberLayers = ["Top Copper", "Bottom Copper", "Top Mask", "Bottom Mask", "Top Silk", "Bottom Silk", "Drill", "Paste Top", "Paste Bottom", "Board Outline"]

const files = [
  { name: "ECU-X500_Gerber_v2.3.zip", type: "Gerber", size: "4.2 MB", date: "2026-03-26" },
  { name: "ECU-X500_BOM_rev3.xlsx", type: "BOM", size: "128 KB", date: "2026-03-26" },
  { name: "ECU-X500_PnP.csv", type: "Pick & Place", size: "42 KB", date: "2026-03-27" },
  { name: "ECU-X500_DFM_Report.pdf", type: "DFM Report", size: "1.8 MB", date: "2026-03-28" },
]

// BOM summary from bomItems
const smdCount = bomItems.filter(
  (b) => b.package.includes("0402") || b.package.includes("SOIC") || b.package.includes("LQFP") || b.package.includes("SOT") || b.package === "SMD" || b.package === "SMA"
).length
const thtCount = bomItems.filter((b) => b.package.includes("12x12")).length
const uniqueParts = new Set(bomItems.map((b) => b.partNumber)).size

// BOM Analysis data
const bomAnalysis = bomItems.map((item) => ({
  ...item,
  availability: item.stock > 500 ? "in_stock" as const : item.stock > 0 ? "low_stock" as const : "out_of_stock" as const,
  leadTime: item.stock > 500 ? "In stock" : item.stock > 0 ? "2-3 weeks" : "6-8 weeks",
  totalCost: item.price * (item.stock > 0 ? 1200 : 0),
  alternateAvailable: item.alternates > 0,
}))

// Test Plan data
const testPoints = [
  { id: "tp-1", type: "ICT", name: "Power Rail 3.3V", criteria: "3.3V +/- 5%", threshold: "3.135V - 3.465V", status: "defined" },
  { id: "tp-2", type: "ICT", name: "Power Rail 5V", criteria: "5.0V +/- 5%", threshold: "4.75V - 5.25V", status: "defined" },
  { id: "tp-3", type: "ICT", name: "MCU VDDIO", criteria: "3.3V +/- 3%", threshold: "3.201V - 3.399V", status: "defined" },
  { id: "tp-4", type: "ICT", name: "R1-R12 Resistance", criteria: "Nominal +/- 1%", threshold: "Per BOM", status: "defined" },
  { id: "tp-5", type: "ICT", name: "C1-C8 Capacitance", criteria: "Nominal +/- 20%", threshold: "Per BOM", status: "pending" },
  { id: "tp-6", type: "FCT", name: "USB Enumeration", criteria: "Device detected", threshold: "< 2s", status: "defined" },
  { id: "tp-7", type: "FCT", name: "LED Sequence", criteria: "All LEDs cycle", threshold: "Pass/Fail", status: "defined" },
  { id: "tp-8", type: "FCT", name: "UART Loopback", criteria: "Data integrity", threshold: "0 errors / 1000 bytes", status: "pending" },
  { id: "tp-9", type: "FCT", name: "Current Draw Idle", criteria: "< 50mA", threshold: "0 - 50 mA", status: "defined" },
  { id: "tp-10", type: "FCT", name: "Current Draw Active", criteria: "< 250mA", threshold: "0 - 250 mA", status: "pending" },
]

// First Article data
const faiResults = [
  { id: "fai-1", characteristic: "PCB Thickness", nominal: "1.6mm", tolerance: "+/- 0.1mm", measured: "1.58mm", status: "pass" },
  { id: "fai-2", characteristic: "Board Dimensions L", nominal: "85.0mm", tolerance: "+/- 0.2mm", measured: "85.1mm", status: "pass" },
  { id: "fai-3", characteristic: "Board Dimensions W", nominal: "55.0mm", tolerance: "+/- 0.2mm", measured: "54.9mm", status: "pass" },
  { id: "fai-4", characteristic: "Solder Paste Height", nominal: "150um", tolerance: "+/- 25um", measured: "142um", status: "pass" },
  { id: "fai-5", characteristic: "Component Placement U1", nominal: "Center", tolerance: "+/- 0.05mm", measured: "+0.02mm", status: "pass" },
  { id: "fai-6", characteristic: "Reflow Profile Peak", nominal: "245C", tolerance: "+/- 5C", measured: "247C", status: "pass" },
  { id: "fai-7", characteristic: "ICT Coverage", nominal: "95%", tolerance: ">90%", measured: "---", status: "pending" },
  { id: "fai-8", characteristic: "FCT Pass Rate", nominal: "100%", tolerance: ">95%", measured: "---", status: "pending" },
]

// History / Audit log
const auditLog = [
  { date: "2026-03-28 14:22", user: "Arun K", action: "Updated DFM report", detail: "Uploaded ECU-X500_DFM_Report.pdf" },
  { date: "2026-03-27 11:05", user: "Priya S", action: "PnP file uploaded", detail: "ECU-X500_PnP.csv validated successfully" },
  { date: "2026-03-27 09:30", user: "System", action: "Stencil ordered", detail: "Auto-triggered stencil order via procurement" },
  { date: "2026-03-26 16:45", user: "Arun K", action: "BOM uploaded", detail: "ECU-X500_BOM_rev3.xlsx - 10 unique parts" },
  { date: "2026-03-26 16:40", user: "Arun K", action: "Gerber uploaded", detail: "ECU-X500_Gerber_v2.3.zip - 6 layers" },
  { date: "2026-03-26 10:00", user: "Sandeep K", action: "NPI created", detail: "Project NPI-002 initiated for IoT-200" },
  { date: "2026-03-25 17:00", user: "Sales", action: "Request received", detail: "Tata Elxsi requested NPI for IoT-200 board" },
]

// --- Tab definitions ---
const detailTabs = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "gerber", label: "Gerber Viewer", icon: Layers },
  { id: "bom", label: "BOM Analysis", icon: Cpu },
  { id: "test", label: "Test Plan", icon: TestTube },
  { id: "fai", label: "First Article", icon: Award },
  { id: "history", label: "History", icon: History },
] as const

type DetailTab = (typeof detailTabs)[number]["id"]

// --- Tab content components ---

function OverviewTab({
  checklist,
  toggleStep,
}: {
  checklist: ChecklistStep[]
  toggleStep: (id: string) => void
}) {
  const completedSteps = checklist.filter((s) => s.done).length
  const totalSteps = checklist.length
  const progressPct = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">NPI Checklist</CardTitle>
            <span className="text-xs text-muted-foreground">{completedSteps}/{totalSteps} complete</span>
          </div>
          <Progress
            value={progressPct}
            className="h-1.5 mt-2"
            indicatorClassName={progressPct === 100 ? "bg-success" : "bg-primary"}
          />
        </CardHeader>
        <CardContent className="space-y-1">
          {checklist.map((step) => (
            <button
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={cn(
                "flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent/50 text-left",
                step.done && "text-muted-foreground"
              )}
            >
              {step.done ? (
                <CheckSquare className="h-4 w-4 text-success shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className={cn(step.done && "line-through")}>{step.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Upload className="h-3 w-3" />
              Upload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-accent/50 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.type} -- {file.size} -- {file.date}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BOM Summary */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">BOM Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border p-3 text-center">
              <Cpu className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{smdCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SMD Parts</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Cpu className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{thtCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">THT Parts</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <Cpu className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{uniqueParts}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unique Parts</p>
            </div>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-medium px-3 py-2 text-muted-foreground">Ref</th>
                  <th className="text-left font-medium px-3 py-2 text-muted-foreground">Part</th>
                  <th className="text-left font-medium px-3 py-2 text-muted-foreground">Package</th>
                  <th className="text-right font-medium px-3 py-2 text-muted-foreground">Stock</th>
                </tr>
              </thead>
              <tbody>
                {bomItems.slice(0, 6).map((item) => (
                  <tr key={item.ref} className="border-b last:border-0">
                    <td className="px-3 py-2 font-mono">{item.ref}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.value}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.package}</td>
                    <td className={cn("px-3 py-2 text-right font-medium", item.stock === 0 ? "text-destructive" : "text-foreground")}>
                      {item.stock.toLocaleString()}
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

function GerberViewerTab() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["Top Copper", "Top Mask", "Top Silk"]))
  const [searchComponent, setSearchComponent] = useState("")

  function toggleLayer(layer: string) {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(layer)) next.delete(layer)
      else next.add(layer)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8"><ZoomIn className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="sm" className="h-8"><ZoomOut className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="sm" className="h-8"><RotateCw className="h-3.5 w-3.5" /></Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Ruler className="h-3.5 w-3.5" /> Measure</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><MousePointer className="h-3.5 w-3.5" /> Select</Button>
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search component (e.g. U1)..."
                value={searchComponent}
                onChange={(e) => setSearchComponent(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Layer controls */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {gerberLayers.map((layer) => {
              const isActive = activeLayers.has(layer)
              const colorDot = layer.includes("Top") ? "bg-red-500" : layer.includes("Bottom") ? "bg-blue-500" : layer.includes("Drill") ? "bg-emerald-500" : layer.includes("Outline") ? "bg-yellow-500" : "bg-purple-500"
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={cn(
                    "flex items-center gap-2 w-full rounded-md px-3 py-2 text-xs transition-colors hover:bg-accent/50 text-left",
                    !isActive && "opacity-50"
                  )}
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full", colorDot, !isActive && "opacity-30")} />
                  <span>{layer}</span>
                  {isActive && <CheckCircle2 className="h-3 w-3 text-success ml-auto" />}
                </button>
              )
            })}
            <div className="pt-2 flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setActiveLayers(new Set(gerberLayers))}>All</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setActiveLayers(new Set())}>None</Button>
            </div>
          </CardContent>
        </Card>

        {/* Viewer placeholder */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <div className="rounded-lg border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center h-[450px] gap-3 relative">
              <Layers className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground text-center px-8">Gerber Viewer - Rendering from uploaded files</p>
              <p className="text-[10px] text-muted-foreground/60">{activeLayers.size} of {gerberLayers.length} layers active</p>
              {searchComponent && (
                <div className="absolute top-4 right-4 bg-background border rounded-md px-3 py-2 text-xs shadow-sm">
                  Searching for: <span className="font-mono font-medium">{searchComponent}</span>
                </div>
              )}
              {/* Measurement placeholder */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Zoom: 100%</Badge>
                <Badge variant="outline" className="text-[10px]">Grid: 0.1mm</Badge>
                <Badge variant="outline" className="text-[10px]">Units: mm</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BOMAnalysisTab() {
  const totalCost = bomAnalysis.reduce((sum, b) => sum + b.price * 1200, 0)
  const inStock = bomAnalysis.filter((b) => b.availability === "in_stock").length
  const lowStock = bomAnalysis.filter((b) => b.availability === "low_stock").length
  const outOfStock = bomAnalysis.filter((b) => b.availability === "out_of_stock").length

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">In Stock</p>
          <p className="text-2xl font-bold text-emerald-600">{inStock}</p>
          <p className="text-xs text-muted-foreground">parts available</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-amber-600">{lowStock}</p>
          <p className="text-xs text-muted-foreground">may need reorder</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          <p className="text-xs text-muted-foreground">blocking production</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. BOM Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-muted-foreground">for 1,200 units</p>
        </Card>
      </div>

      {/* Full BOM table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Component Availability & Lead Times</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Ref</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Part Number</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Value</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Package</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Availability</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Stock</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Lead Time</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Unit Price</th>
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Alternates</th>
                </tr>
              </thead>
              <tbody>
                {bomAnalysis.map((item) => (
                  <tr key={item.ref} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{item.ref}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.partNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.package}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] border-0 font-medium",
                          item.availability === "in_stock" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                          item.availability === "low_stock" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                        )}
                      >
                        {item.availability === "in_stock" ? "In Stock" : item.availability === "low_stock" ? "Low Stock" : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-medium", item.stock === 0 ? "text-destructive" : "text-foreground")}>
                      {item.stock.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.leadTime}</td>
                    <td className="px-4 py-3 text-right text-xs">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.alternateAvailable ? (
                        <Badge variant="outline" className="text-[10px] border-0 bg-info/10 text-info font-medium">{item.alternates} alt</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cost Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: "Passive Components (R, C, L)", cost: 2580, pct: 4 },
              { category: "Active ICs (MCU, Op-Amp)", cost: 598560, pct: 84 },
              { category: "Connectors", cost: 38400, pct: 5 },
              { category: "Discrete (MOSFET, Diode)", cost: 8760, pct: 1 },
              { category: "Inductors & Magnetics", cost: 14400, pct: 2 },
              { category: "PCB Fabrication", cost: 28800, pct: 4 },
            ].map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-xs w-48 text-muted-foreground">{item.category}</span>
                <div className="flex-1">
                  <Progress value={item.pct} className="h-2" />
                </div>
                <span className="text-xs font-medium w-24 text-right">{formatCurrency(item.cost)}</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TestPlanTab() {
  const ictTests = testPoints.filter((t) => t.type === "ICT")
  const fctTests = testPoints.filter((t) => t.type === "FCT")
  const definedCount = testPoints.filter((t) => t.status === "defined").length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Test Points</p>
          <p className="text-2xl font-bold">{testPoints.length}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Defined</p>
          <p className="text-2xl font-bold text-emerald-600">{definedCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Definition</p>
          <p className="text-2xl font-bold text-amber-600">{testPoints.length - definedCount}</p>
        </Card>
      </div>

      {/* ICT Tests */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">In-Circuit Test (ICT)</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border-0">{ictTests.length} tests</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Test Point</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Criteria</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Threshold</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {ictTests.map((tp) => (
                  <tr key={tp.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{tp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tp.criteria}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tp.threshold}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tp.status === "defined" ? "active" : "pending"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FCT Tests */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Functional Test (FCT)</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400 border-0">{fctTests.length} tests</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Test Point</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Criteria</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Pass/Fail Threshold</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {fctTests.map((tp) => (
                  <tr key={tp.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium">{tp.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tp.criteria}</td>
                    <td className="px-4 py-3 font-mono text-xs">{tp.threshold}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tp.status === "defined" ? "active" : "pending"} />
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

function FirstArticleTab() {
  const passCount = faiResults.filter((r) => r.status === "pass").length
  const pendingCount = faiResults.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Inspections Passed</p>
          <p className="text-2xl font-bold text-emerald-600">{passCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending Inspection</p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">FAI Status</p>
          <p className="text-2xl font-bold">{pendingCount === 0 ? "Complete" : "In Progress"}</p>
        </Card>
      </div>

      {/* FAI Report table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">First Article Inspection Report</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <Download className="h-3 w-3" /> Export FAI Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">#</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Characteristic</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Nominal</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Tolerance</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Measured</th>
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Result</th>
                </tr>
              </thead>
              <tbody>
                {faiResults.map((r, idx) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{r.characteristic}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.nominal}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.tolerance}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.measured}</td>
                    <td className="px-4 py-3 text-center">
                      {r.status === "pass" ? (
                        <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                      ) : r.status === "fail" ? (
                        <XCircle className="h-4 w-4 text-destructive mx-auto" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Photos placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Inspection Photos</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
              <Camera className="h-3 w-3" /> Add Photo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {["Top Side Assembly", "Bottom Side Assembly", "Solder Joint Close-up"].map((label) => (
              <div key={label} className="rounded-lg border-2 border-dashed bg-muted/30 flex flex-col items-center justify-center h-32 gap-2">
                <Camera className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HistoryTab() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
          <div className="space-y-6">
            {auditLog.map((entry, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/20 bg-background">
                  {entry.user === "System" ? (
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{entry.user}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NPIDetail() {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview")
  const [checklist, setChecklist] = useState(initialChecklist)

  function toggleStep(id: string) {
    setChecklist((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.board}</h1>
            <StatusBadge status={project.stage === "DFM Review" ? "review" : project.stage.toLowerCase()} />
          </div>
          <p className="text-sm text-muted-foreground">
            {project.customer} -- {project.id} -- Assigned to {project.assignee}
          </p>
        </div>
      </div>

      {/* Status Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {progressStages.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex
              const isCurrent = idx === currentStageIndex
              const isLast = idx === progressStages.length - 1
              return (
                <div key={stage} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                        isCompleted ? "bg-teal-600 border-teal-600 text-white" :
                        isCurrent ? "bg-teal-100 border-teal-600 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400" :
                        "bg-muted border-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className={cn("text-[10px] font-medium", isCurrent ? "text-teal-600 dark:text-teal-400" : isCompleted ? "text-foreground" : "text-muted-foreground")}>{stage}</span>
                  </div>
                  {!isLast && (
                    <div className={cn("flex-1 h-0.5 mx-2 rounded-full", isCompleted ? "bg-teal-600" : "bg-muted-foreground/20")} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Highlighted Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border overflow-x-auto">
        {detailTabs.map((tab) => {
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
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab checklist={checklist} toggleStep={toggleStep} />}
      {activeTab === "gerber" && <GerberViewerTab />}
      {activeTab === "bom" && <BOMAnalysisTab />}
      {activeTab === "test" && <TestPlanTab />}
      {activeTab === "fai" && <FirstArticleTab />}
      {activeTab === "history" && <HistoryTab />}
    </div>
  )
}
