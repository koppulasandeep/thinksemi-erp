import { useState } from "react"
import {
  Factory,
  Activity,
  Gauge,
  CalendarDays,
  BookOpen,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, formatNumber } from "@/lib/utils"
import { productionLines as mockProductionLines, workOrders as mockWorkOrders } from "@/lib/mock-data"
import { useApiData, transformList } from "@/lib/useApi"

import { WorkOrders } from "./WorkOrders"
import { ProductionSchedule } from "./ProductionSchedule"
import { WorkInstructions } from "@/pages/work-instructions/WorkInstructions"

type DashTab = "floor" | "workorders" | "schedule" | "instructions"

const dashTabs: { key: DashTab; label: string; icon: typeof Factory }[] = [
  { key: "floor", label: "Floor Status", icon: Factory },
  { key: "workorders", label: "Work Orders", icon: Activity },
  { key: "schedule", label: "Schedule", icon: CalendarDays },
  { key: "instructions", label: "Work Instructions", icon: BookOpen },
]

function computeFloorKPIs(productionLines: typeof mockProductionLines, workOrders: typeof mockWorkOrders) {
  return {
    linesRunning: productionLines.filter((l) => l.status === "running").length,
    totalLines: productionLines.length,
    avgOEE: Math.round(
      productionLines.filter((l) => l.oee > 0).reduce((a, b) => a + b.oee, 0) /
        productionLines.filter((l) => l.oee > 0).length
    ) || 0,
    totalOutput: productionLines.reduce((a, b) => a + b.completed, 0),
    totalDefects: productionLines.reduce((a, b) => a + b.defects, 0),
    activeWOs: workOrders.filter((wo) => wo.status === "active").length,
  }
}

export function ManufacturingDashboard() {
  const [activeTab, setActiveTab] = useState<DashTab>("floor")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manufacturing"
        description="Production floor overview, work orders, scheduling, and work instructions."
        action={{ label: "New Work Order", icon: Factory }}
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {dashTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
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
      {activeTab === "floor" && <FloorStatusContent />}
      {activeTab === "workorders" && <WorkOrders />}
      {activeTab === "schedule" && <ProductionSchedule />}
      {activeTab === "instructions" && <WorkInstructions />}
    </div>
  )
}

/* ─── Floor Status Content ─── */
function FloorStatusContent() {
  const { data: productionLines } = useApiData("/manufacturing/lines", mockProductionLines, (raw: any) => transformList(raw?.lines ?? [], undefined) as typeof mockProductionLines)
  const { data: workOrders } = useApiData("/manufacturing/work-orders", mockWorkOrders, (raw: any) => transformList(raw?.work_orders ?? [], undefined) as typeof mockWorkOrders)
  const floorKPIs = computeFloorKPIs(productionLines, workOrders)

  return (
    <div className="space-y-6">
      {/* Floor KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Lines Running"
          value={`${floorKPIs.linesRunning} / ${floorKPIs.totalLines}`}
          icon={Zap}
          color="green"
          subtitle={`${floorKPIs.totalLines - floorKPIs.linesRunning} in changeover/idle`}
        />
        <KPICard
          title="Average OEE"
          value={`${floorKPIs.avgOEE}%`}
          icon={Gauge}
          color="blue"
          change={2.1}
          changePeriod="vs yesterday"
        />
        <KPICard
          title="Total Output Today"
          value={formatNumber(floorKPIs.totalOutput)}
          icon={CheckCircle2}
          color="purple"
          subtitle="boards completed"
        />
        <KPICard
          title="Defects Today"
          value={String(floorKPIs.totalDefects)}
          icon={AlertTriangle}
          color="orange"
          subtitle={`${((floorKPIs.totalDefects / floorKPIs.totalOutput) * 100).toFixed(2)}% defect rate`}
        />
      </div>

      {/* Production Line Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {productionLines.map((line) => {
          const progress = line.total > 0 ? Math.round((line.completed / line.total) * 100) : 0
          const isRunning = line.status === "running"
          const isChangeover = line.status === "changeover"

          return (
            <Card
              key={line.id}
              className={cn(
                "overflow-hidden transition-shadow hover:shadow-md",
                isRunning && "border-l-4 border-l-emerald-500",
                isChangeover && "border-l-4 border-l-amber-500",
                !isRunning && !isChangeover && "border-l-4 border-l-slate-300"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">{line.name}</CardTitle>
                    {isRunning && (
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </span>
                    )}
                  </div>
                  <StatusBadge status={line.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRunning && (
                  <>
                    {/* WO Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-mono font-medium text-primary">{line.workOrder}</span>
                        <span className="text-muted-foreground ml-2">{line.board}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{line.customer}</span>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Production Progress</span>
                        <span className="font-medium tabular-nums">
                          {formatNumber(line.completed)} / {formatNumber(line.total)}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            progress >= 80 ? "bg-emerald-500" : "bg-blue-500"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{progress}% complete</span>
                        <span>{formatNumber(line.total - line.completed)} remaining</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-md bg-muted/50">
                        <p className={cn(
                          "text-lg font-bold tabular-nums",
                          line.oee >= (line.oeeTarget ?? 85) ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {line.oee}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">OEE</p>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted/50">
                        <p className="text-lg font-bold tabular-nums">{line.oeeTarget ?? 85}%</p>
                        <p className="text-[10px] text-muted-foreground">Target</p>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted/50">
                        <p className={cn(
                          "text-lg font-bold tabular-nums",
                          line.defects > 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                          {line.defects}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Defects</p>
                      </div>
                    </div>
                  </>
                )}

                {isChangeover && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">
                        Changeover in progress: <span className="font-medium text-foreground">{(line as any).setupMinutes ?? 0} min remaining</span>
                      </span>
                    </div>
                    {(line as any).nextWorkOrder && (
                      <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">
                          Next: <span className="font-mono font-medium text-primary">{(line as any).nextWorkOrder}</span>
                        </span>
                      </div>
                    )}
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                )}

                {!isRunning && !isChangeover && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Line is currently idle
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Work Orders Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            <Badge variant="outline" className="text-xs">{workOrders.filter((wo) => wo.status === "active").length} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {workOrders
              .filter((wo) => wo.status === "active")
              .map((wo) => (
                <div key={wo.id} className="flex items-center gap-4 rounded-md border p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-primary text-sm">{wo.id}</span>
                      <span className="text-sm font-medium">{wo.board}</span>
                      <span className="text-xs text-muted-foreground">{wo.customer}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">{wo.line}</Badge>
                  <div className="w-24 flex items-center gap-2 shrink-0">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          wo.progress >= 80 ? "bg-emerald-500" : "bg-blue-500"
                        )}
                        style={{ width: `${wo.progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{wo.progress}%</span>
                  </div>
                  <span className={cn(
                    "text-xs font-semibold tabular-nums shrink-0",
                    wo.oee >= 80 ? "text-emerald-600" : wo.oee >= 60 ? "text-amber-600" : "text-red-600"
                  )}>
                    {wo.oee}% OEE
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
