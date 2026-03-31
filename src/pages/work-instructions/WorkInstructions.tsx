import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Eye,
  Maximize2,
  BookOpen,
  ListOrdered,
  Table2,
  Layers,
  Settings2,
  History,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MousePointer2,
  EyeOff,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"

type WITab = "steps" | "bom" | "gerber" | "setup" | "history"

const wiTabs: { key: WITab; label: string; icon: typeof ListOrdered }[] = [
  { key: "steps", label: "Step View", icon: ListOrdered },
  { key: "bom", label: "Full BOM", icon: Table2 },
  { key: "gerber", label: "Gerber Overlay", icon: Layers },
  { key: "setup", label: "Setup Guide", icon: Settings2 },
  { key: "history", label: "Revision History", icon: History },
]

const totalSteps = 12

interface WIStep {
  number: number
  title: string
  description: string
  components: { ref: string; part: string; qty: number; notes?: string }[]
  notes: string[]
  warnings?: string[]
  imagePlaceholder: string
}

const steps: WIStep[] = [
  {
    number: 1,
    title: "Apply Solder Paste",
    description: "Load the stencil on the screen printer. Align to PCB fiducials. Apply SAC305 paste with a single squeegee pass at 40mm/s, 8.5kg pressure.",
    components: [
      { ref: "Solder", part: "SAC305 Paste (Type 4)", qty: 1, notes: "Check expiry date" },
    ],
    notes: ["Verify stencil aperture cleanliness before first print", "Wipe every 5 boards with IPA"],
    warnings: ["Paste must be at room temp for 4hrs before use"],
    imagePlaceholder: "Stencil alignment view with fiducial markers",
  },
  {
    number: 2,
    title: "SPI Inspection",
    description: "Run board through SPI machine. Verify paste volume is within 80-120% spec. Check for bridging or insufficient deposits.",
    components: [],
    notes: ["Auto-reject boards below 75% volume", "Log all borderline results"],
    imagePlaceholder: "SPI color map showing paste volume distribution",
  },
  {
    number: 3,
    title: "Place SMD Components - Top Side",
    description: "Load component reels on Fuji NXT III feeders per the BOM. Run the pick and place program ECU-X500-TOP-v3.2. Verify first article placement accuracy.",
    components: [
      { ref: "U1", part: "STM32F407VGT6", qty: 1, notes: "MSL-3: Check floor life" },
      { ref: "C1-C24", part: "GRM155R71C104K", qty: 24 },
      { ref: "R1-R36", part: "RC0402FR-07100R", qty: 36 },
      { ref: "J1", part: "105450-0101 (USB-C)", qty: 1, notes: "Verify connector orientation" },
      { ref: "Q1", part: "SI2301CDS (P-MOSFET)", qty: 1 },
      { ref: "D1", part: "SS34 (Schottky)", qty: 1, notes: "Check polarity mark" },
    ],
    notes: [
      "Run first article inspection: verify U1 pin 1 orientation",
      "Check 0402 component rotation on first 3 boards",
      "Ensure feeder tension is correct for USB-C connector reel",
    ],
    warnings: [
      "U1 (STM32) is MSL-3. Verify remaining floor life before loading.",
      "J1 connector must be oriented with pins facing board edge.",
    ],
    imagePlaceholder: "PCB top-side component placement diagram with reference designators",
  },
  {
    number: 4,
    title: "Reflow Soldering",
    description: "Run board through Heller 1913 MK5 reflow oven using profile ECU-X500-v3. Peak temperature 248C, TAL 62 seconds.",
    components: [],
    notes: ["Verify thermocouple readings match profile", "Log profile data for traceability"],
    warnings: ["Do not exceed 250C peak temperature"],
    imagePlaceholder: "Reflow temperature profile graph showing zones and peak",
  },
]

const fullBOM = [
  { seq: 1, ref: "U1", part: "STM32F407VGT6", pkg: "LQFP-100", qty: 1, side: "Top", feeder: "F01", msl: "MSL-3", notes: "Pin 1 at NE corner" },
  { seq: 2, ref: "U2", part: "LM3940IT-3.3", pkg: "SOT-223", qty: 1, side: "Top", feeder: "F02", msl: "MSL-1", notes: "" },
  { seq: 3, ref: "C1-C24", part: "GRM155R71C104K", pkg: "0402", qty: 24, side: "Top", feeder: "F03", msl: "MSL-1", notes: "100nF decoupling" },
  { seq: 4, ref: "C25-C28", part: "GRM188R61E106M", pkg: "0603", qty: 4, side: "Top", feeder: "F04", msl: "MSL-1", notes: "10uF bulk" },
  { seq: 5, ref: "R1-R36", part: "RC0402FR-07100R", pkg: "0402", qty: 36, side: "Top", feeder: "F05", msl: "MSL-1", notes: "100R" },
  { seq: 6, ref: "R37-R40", part: "RC0402FR-0710K", pkg: "0402", qty: 4, side: "Top", feeder: "F06", msl: "MSL-1", notes: "10K pull-up" },
  { seq: 7, ref: "J1", part: "105450-0101", pkg: "USB-C", qty: 1, side: "Top", feeder: "Tray-01", msl: "MSL-1", notes: "Pins facing edge" },
  { seq: 8, ref: "J2", part: "5031821852", pkg: "FPC-20", qty: 1, side: "Top", feeder: "Tray-02", msl: "MSL-1", notes: "Display connector" },
  { seq: 9, ref: "Q1", part: "SI2301CDS", pkg: "SOT-23", qty: 1, side: "Top", feeder: "F07", msl: "MSL-1", notes: "P-MOSFET" },
  { seq: 10, ref: "D1", part: "SS34", pkg: "SMA", qty: 1, side: "Top", feeder: "F08", msl: "MSL-1", notes: "Check polarity" },
  { seq: 11, ref: "Y1", part: "ABM8-8.000MHz", pkg: "ABM8", qty: 1, side: "Top", feeder: "F09", msl: "MSL-1", notes: "Crystal" },
  { seq: 12, ref: "L1", part: "LQH32CN4R7M", pkg: "1210", qty: 1, side: "Top", feeder: "F10", msl: "MSL-1", notes: "4.7uH inductor" },
  { seq: 13, ref: "FB1-FB2", part: "BLM18PG121SN1D", pkg: "0603", qty: 2, side: "Top", feeder: "F11", msl: "MSL-1", notes: "Ferrite bead" },
  { seq: 14, ref: "LED1-LED3", part: "LTST-C171KRKT", pkg: "0603", qty: 3, side: "Top", feeder: "F12", msl: "MSL-1", notes: "Red LED" },
  { seq: 15, ref: "R41-R43", part: "RC0402FR-07330R", pkg: "0402", qty: 3, side: "Bottom", feeder: "F13", msl: "MSL-1", notes: "330R LED resistors" },
]

const gerberComponents = [
  { ref: "U1", x: 30, y: 20, w: 10, h: 10, label: "STM32F407", pkg: "LQFP-100", side: "Top", pins: 100, rotation: 0 },
  { ref: "U2", x: 15, y: 35, w: 5, h: 3, label: "LM3940", pkg: "SOT-223", side: "Top", pins: 4, rotation: 0 },
  { ref: "C1-C24", x: 42, y: 18, w: 2, h: 1, label: "100nF", pkg: "0402", side: "Top", pins: 2, rotation: 0 },
  { ref: "J1", x: 70, y: 55, w: 8, h: 5, label: "USB-C", pkg: "USB-C", side: "Top", pins: 24, rotation: 90 },
  { ref: "J2", x: 10, y: 70, w: 12, h: 3, label: "FPC-20", pkg: "FPC", side: "Top", pins: 20, rotation: 0 },
  { ref: "Y1", x: 48, y: 30, w: 3, h: 2, label: "8MHz", pkg: "ABM8", side: "Top", pins: 4, rotation: 0 },
  { ref: "Q1", x: 22, y: 50, w: 3, h: 2, label: "P-MOSFET", pkg: "SOT-23", side: "Top", pins: 3, rotation: 0 },
  { ref: "D1", x: 60, y: 40, w: 4, h: 2, label: "SS34", pkg: "SMA", side: "Top", pins: 2, rotation: 0 },
  { ref: "L1", x: 35, y: 45, w: 4, h: 3, label: "4.7uH", pkg: "1210", side: "Top", pins: 2, rotation: 0 },
  { ref: "LED1", x: 80, y: 15, w: 2, h: 1, label: "Red LED", pkg: "0603", side: "Top", pins: 2, rotation: 0 },
  { ref: "LED2", x: 80, y: 20, w: 2, h: 1, label: "Red LED", pkg: "0603", side: "Top", pins: 2, rotation: 0 },
  { ref: "LED3", x: 80, y: 25, w: 2, h: 1, label: "Red LED", pkg: "0603", side: "Top", pins: 2, rotation: 0 },
]

const setupGuide = {
  stencil: [
    "Retrieve stencil STN-ECU-X500-R3 from storage rack",
    "Inspect apertures under magnification - clean if paste residue visible",
    "Mount stencil on printer frame and lock",
    "Load SAC305 Type 4 paste (verify lot, expiry, room temp 4hrs)",
    "Set squeegee pressure to 8.5kg, speed 40mm/s",
    "Print test board and verify with SPI",
  ],
  feederLoading: [
    { feeder: "F01", part: "STM32F407VGT6", reel: "RL-4401", note: "MSL-3 - verify floor life" },
    { feeder: "F02", part: "LM3940IT-3.3", reel: "RL-4410", note: "" },
    { feeder: "F03", part: "GRM155R71C104K", reel: "RL-4455", note: "0402 - check feeder tension" },
    { feeder: "F04", part: "GRM188R61E106M", reel: "RL-4460", note: "" },
    { feeder: "F05", part: "RC0402FR-07100R", reel: "RL-4470", note: "0402 - check feeder tension" },
    { feeder: "F06", part: "RC0402FR-0710K", reel: "RL-4475", note: "" },
    { feeder: "F07", part: "SI2301CDS", reel: "RL-4490", note: "" },
    { feeder: "F08", part: "SS34", reel: "RL-4501", note: "Check polarity orientation" },
    { feeder: "Tray-01", part: "105450-0101 (USB-C)", reel: "RL-4512", note: "Tray - verify orientation" },
    { feeder: "Tray-02", part: "5031821852 (FPC)", reel: "RL-4520", note: "Tray - verify orientation" },
  ],
  reflowProfile: {
    name: "ECU-X500-v3",
    preheatRate: "1.5C/s",
    soakTemp: "150-200C",
    soakTime: "60-90 sec",
    rampRate: "2.0C/s",
    peakTemp: "248C",
    tal: "62 sec",
    coolingRate: "3.0C/s",
  },
  aoiProgram: {
    name: "ECU-X500-AOI-v2.1",
    machine: "Omron VT-S730",
    lastCalibrated: "2026-03-25",
    inspectionPoints: 156,
  },
}

const revisionHistory = [
  { version: "3.2", date: "2026-03-15", author: "Sandeep K", bomRev: "R3", gerberRev: "G3.2", changes: "Updated U1 placement coordinates after ECO-042. Added J2 FPC connector." },
  { version: "3.1", date: "2026-02-20", author: "Priya Sharma", bomRev: "R3", gerberRev: "G3.1", changes: "Corrected reflow profile TAL from 58s to 62s per supplier recommendation." },
  { version: "3.0", date: "2026-01-10", author: "Sandeep K", bomRev: "R3", gerberRev: "G3.0", changes: "Major BOM revision - replaced U2 with LM3940. Updated stencil apertures. New feeder layout." },
  { version: "2.4", date: "2025-11-28", author: "Karthik Raja", bomRev: "R2", gerberRev: "G2.4", changes: "Added MSL warnings for U1. Updated SPI inspection thresholds." },
  { version: "2.3", date: "2025-10-15", author: "Sandeep K", bomRev: "R2", gerberRev: "G2.3", changes: "Changed C1-C24 from 0603 to 0402 package. Updated P&P program." },
]

export function WorkInstructions() {
  const [currentStep, setCurrentStep] = useState(2)
  const [activeTab, setActiveTab] = useState<WITab>("steps")
  const step = steps[currentStep]

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }
  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Instructions"
        description="ECU-X500 Assembly Guide &middot; Rev 3.2"
        action={{ label: "Edit Instructions", icon: BookOpen }}
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {wiTabs.map((tab) => {
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
      {activeTab === "steps" && (
        <StepViewTab
          step={step}
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepsCount={steps.length}
          goNext={goNext}
          goPrev={goPrev}
          setCurrentStep={setCurrentStep}
        />
      )}
      {activeTab === "bom" && <FullBOMTab />}
      {activeTab === "gerber" && <GerberOverlayTab />}
      {activeTab === "setup" && <SetupGuideTab />}
      {activeTab === "history" && <RevisionHistoryTab />}
    </div>
  )
}

/* ─── Step View Tab ─── */
function StepViewTab({
  step,
  currentStep,
  totalSteps,
  stepsCount,
  goNext,
  goPrev,
  setCurrentStep,
}: {
  step: WIStep
  currentStep: number
  totalSteps: number
  stepsCount: number
  goNext: () => void
  goPrev: () => void
  setCurrentStep: (n: number) => void
}) {
  return (
    <>
      {/* Progress bar and step navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={goPrev} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <span className="text-sm font-medium">Step {step.number} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground ml-2">{step.title}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {Math.round((step.number / totalSteps) * 100)}% complete
              </span>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={goNext} disabled={currentStep === stepsCount - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={(step.number / totalSteps) * 100} className="h-1.5" indicatorClassName="bg-teal-500" />
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                onClick={() => { if (i < stepsCount) setCurrentStep(i) }}
                className={cn(
                  "h-2 rounded-full transition-all shrink-0",
                  i === currentStep
                    ? "w-6 bg-teal-500"
                    : i < stepsCount
                    ? i < currentStep
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    : "w-2 bg-muted cursor-not-allowed"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Image / Diagram Area */}
        <Card className="lg:row-span-2">
          <CardContent className="p-0">
            <div className="aspect-[4/3] bg-muted/50 rounded-t-lg flex flex-col items-center justify-center border-b border-border relative">
              <div className="text-center p-8 space-y-3">
                <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{step.imagePlaceholder}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Image displayed here in production</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="absolute top-3 right-3 h-7 w-7 p-0 text-muted-foreground">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Step {step.number}: {step.title}</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">Step {step.number}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            {step.warnings && step.warnings.length > 0 && (
              <div className="space-y-2">
                {step.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-500/5 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                  </div>
                ))}
              </div>
            )}
            {step.notes.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
                {step.notes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component List */}
        {step.components.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Components for This Step</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Ref", "Part", "Qty", "Notes"].map((h) => (
                        <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {step.components.map((comp) => (
                      <tr key={comp.ref} className="border-b border-border/50">
                        <td className="py-2 px-2 font-mono text-xs font-medium">{comp.ref}</td>
                        <td className="py-2 px-2 text-xs">{comp.part}</td>
                        <td className="py-2 px-2 text-xs tabular-nums text-center">{comp.qty}</td>
                        <td className="py-2 px-2 text-xs text-muted-foreground">
                          {comp.notes ? (
                            <span className={cn(
                              comp.notes.toLowerCase().includes("msl") ||
                              comp.notes.toLowerCase().includes("polarity") ||
                              comp.notes.toLowerCase().includes("orientation")
                                ? "text-amber-600 font-medium"
                                : ""
                            )}>
                              {comp.notes}
                            </span>
                          ) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={goPrev} disabled={currentStep === 0}>
          <ChevronLeft className="h-4 w-4 mr-1.5" />
          Previous: {currentStep > 0 ? steps[currentStep - 1]?.title : ""}
        </Button>
        <Button onClick={goNext} disabled={currentStep === steps.length - 1}>
          Next: {currentStep < steps.length - 1 ? steps[currentStep + 1]?.title : ""}
          <ChevronRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </>
  )
}

/* ─── Full BOM Tab ─── */
function FullBOMTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Full BOM - ECU-X500 Rev 3</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{fullBOM.length} line items</Badge>
            <Badge variant="outline" className="text-xs font-mono">BOM-R3</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Seq", "Ref Des", "Part Number", "Package", "Qty", "Side", "Feeder", "MSL", "Notes"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fullBOM.map((item) => (
                <tr key={item.seq} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                  <td className="py-2 px-2 text-xs tabular-nums text-muted-foreground">{item.seq}</td>
                  <td className="py-2 px-2 font-mono text-xs font-medium text-primary">{item.ref}</td>
                  <td className="py-2 px-2 text-xs font-medium">{item.part}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.pkg}</Badge>
                  </td>
                  <td className="py-2 px-2 text-xs tabular-nums text-center">{item.qty}</td>
                  <td className="py-2 px-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 border-0",
                        item.side === "Top"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                      )}
                    >
                      {item.side}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-xs font-mono text-muted-foreground">{item.feeder}</td>
                  <td className="py-2 px-2">
                    <span className={cn(
                      "text-xs font-medium",
                      item.msl !== "MSL-1" ? "text-amber-600" : "text-muted-foreground"
                    )}>
                      {item.msl}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-xs text-muted-foreground max-w-[160px] truncate">{item.notes || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Gerber Overlay Tab ─── */
function GerberOverlayTab() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [layers, setLayers] = useState({
    topCopper: true,
    bottomCopper: false,
    topSilk: true,
    topPaste: false,
    drill: false,
  })

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const selected = gerberComponents.find((c) => c.ref === selectedComponent)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Gerber Viewer */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">PCB Layout - ECU-X500 Rev 3.2</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-[4/3] bg-slate-950 rounded-b-lg relative overflow-hidden">
              {/* Board outline */}
              <div className="absolute inset-6 border-2 border-emerald-500/40 rounded-sm">
                {/* Grid */}
                <div className="absolute inset-0 opacity-5">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-emerald-400" style={{ top: `${(i + 1) * 5}%` }} />
                  ))}
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-emerald-400" style={{ left: `${(i + 1) * 5}%` }} />
                  ))}
                </div>

                {/* Copper traces (if layer enabled) */}
                {layers.topCopper && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-[22%] left-[35%] w-[30%] h-[0.5px] bg-emerald-400" />
                    <div className="absolute top-[30%] left-[30%] w-[0.5px] h-[20%] bg-emerald-400" />
                    <div className="absolute top-[50%] left-[40%] w-[25%] h-[0.5px] bg-emerald-400" />
                    <div className="absolute top-[25%] left-[50%] w-[0.5px] h-[30%] bg-blue-400" />
                    <div className="absolute top-[40%] left-[20%] w-[15%] h-[0.5px] bg-emerald-400" />
                    <div className="absolute top-[60%] left-[55%] w-[20%] h-[0.5px] bg-blue-400" />
                    <div className="absolute top-[35%] left-[60%] w-[0.5px] h-[25%] bg-emerald-400" />
                  </div>
                )}

                {/* Bottom copper traces */}
                {layers.bottomCopper && (
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-[28%] left-[25%] w-[40%] h-[0.5px] bg-red-400" />
                    <div className="absolute top-[45%] left-[35%] w-[0.5px] h-[25%] bg-red-400" />
                    <div className="absolute top-[55%] left-[30%] w-[35%] h-[0.5px] bg-red-400" />
                  </div>
                )}

                {/* Drill holes */}
                {layers.drill && (
                  <div className="absolute inset-0">
                    {[
                      { x: 5, y: 5 }, { x: 95, y: 5 }, { x: 5, y: 95 }, { x: 95, y: 95 },
                      { x: 72, y: 57 }, { x: 72, y: 63 }, { x: 12, y: 72 }, { x: 20, y: 72 },
                    ].map((h, i) => (
                      <div key={i} className="absolute w-1.5 h-1.5 rounded-full border border-yellow-400/60" style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%, -50%)" }} />
                    ))}
                  </div>
                )}

                {/* Component outlines */}
                {gerberComponents.map((comp) => {
                  const isSelected = selectedComponent === comp.ref
                  return (
                    <button
                      key={comp.ref}
                      onClick={() => setSelectedComponent(isSelected ? null : comp.ref)}
                      className={cn(
                        "absolute border rounded-[2px] flex items-center justify-center transition-all cursor-pointer group/comp",
                        isSelected
                          ? "border-yellow-400 bg-yellow-400/20 ring-2 ring-yellow-400/40 z-20"
                          : "border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-400/10 z-10",
                        layers.topPaste && "shadow-[0_0_4px_rgba(168,85,247,0.3)]"
                      )}
                      style={{
                        left: `${comp.x}%`,
                        top: `${comp.y}%`,
                        width: `${comp.w}%`,
                        height: `${comp.h}%`,
                      }}
                    >
                      {/* Silk layer label */}
                      {layers.topSilk && (
                        <span className={cn(
                          "text-[7px] font-mono leading-none",
                          isSelected ? "text-yellow-400" : "text-emerald-400/70 group-hover/comp:text-emerald-400"
                        )}>
                          {comp.ref}
                        </span>
                      )}
                      {/* Paste layer indicator */}
                      {layers.topPaste && (
                        <div className="absolute inset-[2px] border border-purple-400/30 rounded-[1px]" />
                      )}
                    </button>
                  )
                })}

                {/* Fiducials */}
                <div className="absolute top-[3%] left-[3%] w-2 h-2 rounded-full border border-white/50 bg-white/10" />
                <div className="absolute bottom-[3%] right-[3%] w-2 h-2 rounded-full border border-white/50 bg-white/10" />
                <div className="absolute bottom-[3%] left-[3%] w-2 h-2 rounded-full border border-white/50 bg-white/10" />
              </div>

              {/* Coordinates display */}
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-emerald-400/50">
                ECU-X500 Rev 3.2 | 85mm x 60mm
              </div>
              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-emerald-400/50">
                <MousePointer2 className="h-3 w-3" />
                Click component for details
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="space-y-4">
        {/* Layer Toggles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Layer Visibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: "topCopper" as const, label: "Top Copper", color: "bg-emerald-500" },
              { key: "bottomCopper" as const, label: "Bottom Copper", color: "bg-red-500" },
              { key: "topSilk" as const, label: "Top Silk", color: "bg-white" },
              { key: "topPaste" as const, label: "Paste Stencil", color: "bg-purple-500" },
              { key: "drill" as const, label: "Drill Holes", color: "bg-yellow-500" },
            ].map((layer) => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm transition-colors text-left",
                  layers[layer.key] ? "bg-accent border-border" : "bg-transparent border-transparent hover:bg-muted/50"
                )}
              >
                <div className={cn("h-3 w-3 rounded-sm", layer.color, !layers[layer.key] && "opacity-30")} />
                <span className={cn("flex-1 text-xs font-medium", !layers[layer.key] && "text-muted-foreground")}>
                  {layer.label}
                </span>
                {layers[layer.key] ? (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Component Details */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Component Details</CardTitle>
              {selected && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedComponent(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-primary">{selected.ref}</span>
                  <Badge variant="outline" className="text-[10px]">{selected.pkg}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Component", value: selected.label },
                    { label: "Package", value: selected.pkg },
                    { label: "Side", value: selected.side },
                    { label: "Pins", value: String(selected.pins) },
                    { label: "Rotation", value: `${selected.rotation} deg` },
                    { label: "Position", value: `X: ${selected.x}%, Y: ${selected.y}%` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-muted-foreground text-xs">{row.label}</span>
                      <span className="text-xs font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
                {/* Cross-reference to BOM */}
                {(() => {
                  const bomItem = fullBOM.find((b) => b.ref === selected.ref)
                  if (!bomItem) return null
                  return (
                    <div className="mt-3 p-2.5 rounded-md bg-muted/50 border text-xs space-y-1">
                      <p className="font-medium">BOM Reference</p>
                      <p className="text-muted-foreground">Part: {bomItem.part}</p>
                      <p className="text-muted-foreground">Feeder: {bomItem.feeder}</p>
                      <p className={cn("text-muted-foreground", bomItem.msl !== "MSL-1" && "text-amber-600 font-medium")}>
                        MSL: {bomItem.msl}
                      </p>
                      {bomItem.notes && <p className="text-muted-foreground">Note: {bomItem.notes}</p>}
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MousePointer2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Click a component on the PCB layout to view its details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ─── Setup Guide Tab ─── */
function SetupGuideTab() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Stencil Preparation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stencil Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {setupGuide.stencil.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400 text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Reflow Profile */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Reflow Profile</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">{setupGuide.reflowProfile.name}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {[
                { label: "Preheat Rate", value: setupGuide.reflowProfile.preheatRate },
                { label: "Soak Temperature", value: setupGuide.reflowProfile.soakTemp },
                { label: "Soak Time", value: setupGuide.reflowProfile.soakTime },
                { label: "Ramp Rate", value: setupGuide.reflowProfile.rampRate },
                { label: "Peak Temperature", value: setupGuide.reflowProfile.peakTemp },
                { label: "Time Above Liquidus", value: setupGuide.reflowProfile.tal },
                { label: "Cooling Rate", value: setupGuide.reflowProfile.coolingRate },
              ].map((param) => (
                <div key={param.label} className="flex justify-between text-sm">
                  <span className="text-xs text-muted-foreground">{param.label}</span>
                  <span className="text-xs font-medium font-mono">{param.value}</span>
                </div>
              ))}
            </div>

            {/* Mini reflow profile visualization */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="h-20 relative">
                <svg viewBox="0 0 200 60" className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M 0 55 L 30 40 L 70 35 L 90 35 L 120 8 L 130 8 L 160 35 L 200 55"
                    fill="none"
                    stroke="currentColor"
                    className="text-teal-500"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0 55 L 30 40 L 70 35 L 90 35 L 120 8 L 130 8 L 160 35 L 200 55"
                    fill="url(#profileGradient)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="profileGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" className="text-teal-500" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  {/* Peak marker */}
                  <line x1="125" y1="8" x2="125" y2="55" stroke="currentColor" className="text-red-400" strokeWidth="0.5" strokeDasharray="2,2" />
                  <text x="125" y="6" textAnchor="middle" className="text-[5px] fill-red-400">248C</text>
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-muted-foreground">
                  <span>Preheat</span>
                  <span>Soak</span>
                  <span>Reflow</span>
                  <span>Cool</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feeder Loading Sequence */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Feeder Loading Sequence</CardTitle>
            <Badge variant="outline" className="text-xs">{setupGuide.feederLoading.length} feeders</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Feeder", "Part Number", "Reel ID", "Special Notes"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {setupGuide.feederLoading.map((f) => (
                  <tr key={f.feeder} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-2 px-2 font-mono text-xs font-medium">{f.feeder}</td>
                    <td className="py-2 px-2 text-xs">{f.part}</td>
                    <td className="py-2 px-2 text-xs font-mono text-muted-foreground">{f.reel}</td>
                    <td className="py-2 px-2 text-xs">
                      {f.note ? (
                        <span className={cn(
                          f.note.toLowerCase().includes("msl") ? "text-amber-600 font-medium" : "text-muted-foreground"
                        )}>
                          {f.note}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AOI Program Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">AOI Program Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Program", value: setupGuide.aoiProgram.name, mono: true },
              { label: "Machine", value: setupGuide.aoiProgram.machine },
              { label: "Last Calibrated", value: setupGuide.aoiProgram.lastCalibrated },
              { label: "Inspection Points", value: String(setupGuide.aoiProgram.inspectionPoints) },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className={cn("text-sm font-medium mt-1", item.mono && "font-mono text-xs")}>{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Revision History Tab ─── */
function RevisionHistoryTab() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Revision History - ECU-X500 Work Instructions</CardTitle>
          <Badge variant="outline" className="text-xs font-mono">Current: v3.2</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {revisionHistory.map((rev, i) => (
            <div key={rev.version} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline line */}
              {i < revisionHistory.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-border" />
              )}
              {/* Timeline dot */}
              <div className={cn(
                "absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                i === 0
                  ? "bg-teal-600 text-white ring-4 ring-teal-600/20"
                  : "bg-muted text-muted-foreground border-2 border-border"
              )}>
                {i === 0 ? "C" : i + 1}
              </div>

              <div className={cn("rounded-lg border p-4", i === 0 && "border-teal-200 bg-teal-500/5 dark:border-teal-800")}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-mono">v{rev.version}</span>
                      {i === 0 && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-teal-600 text-white border-0">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{rev.date} by {rev.author}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">BOM {rev.bomRev}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">Gerber {rev.gerberRev}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{rev.changes}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
