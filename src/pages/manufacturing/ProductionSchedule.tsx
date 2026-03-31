import { useState } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  ArrowLeftRight,
  Wrench,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn } from "@/lib/utils"

const weekDays = ["Mon 31", "Tue 01", "Wed 02", "Thu 03", "Fri 04", "Sat 05", "Sun 06"]
const hours = Array.from({ length: 13 }, (_, i) => `${(6 + i).toString().padStart(2, "0")}:00`)

interface ScheduleBar {
  id: string
  wo: string
  board: string
  customer: string
  startDay: number
  startHour: number
  endDay: number
  endHour: number
  color: string
  status: "active" | "scheduled" | "completed"
  progress: number
}

const scheduleData: { line: string; lineLabel: string; capacity: number; bars: ScheduleBar[] }[] = [
  {
    line: "line-1",
    lineLabel: "SMT Line 1",
    capacity: 87,
    bars: [
      {
        id: "bar-1",
        wo: "WO-0341",
        board: "ECU-X500",
        customer: "Bosch",
        startDay: 0,
        startHour: 0,
        endDay: 2,
        endHour: 8,
        color: "bg-blue-500",
        status: "active",
        progress: 71,
      },
      {
        id: "bar-2",
        wo: "WO-0345",
        board: "VFD-CTRL",
        customer: "ABB",
        startDay: 2,
        startHour: 10,
        endDay: 5,
        endHour: 6,
        color: "bg-violet-500",
        status: "scheduled",
        progress: 0,
      },
    ],
  },
  {
    line: "line-2",
    lineLabel: "SMT Line 2",
    capacity: 62,
    bars: [
      {
        id: "bar-3",
        wo: "WO-0343",
        board: "ECU-X500",
        customer: "Bosch",
        startDay: 0,
        startHour: 4,
        endDay: 3,
        endHour: 4,
        color: "bg-blue-500",
        status: "scheduled",
        progress: 0,
      },
      {
        id: "bar-4",
        wo: "WO-0347",
        board: "ADAS-M1",
        customer: "Continental",
        startDay: 3,
        startHour: 8,
        endDay: 6,
        endHour: 2,
        color: "bg-emerald-500",
        status: "scheduled",
        progress: 0,
      },
    ],
  },
  {
    line: "tht-1",
    lineLabel: "THT Line 1",
    capacity: 78,
    bars: [
      {
        id: "bar-5",
        wo: "WO-0338",
        board: "PS-220",
        customer: "L&T",
        startDay: 0,
        startHour: 0,
        endDay: 1,
        endHour: 10,
        color: "bg-amber-500",
        status: "active",
        progress: 64,
      },
      {
        id: "bar-6",
        wo: "WO-0349",
        board: "Relay-BR",
        customer: "L&T",
        startDay: 2,
        startHour: 0,
        endDay: 4,
        endHour: 6,
        color: "bg-amber-500",
        status: "scheduled",
        progress: 0,
      },
    ],
  },
]

const totalSlots = weekDays.length * hours.length

function getBarPosition(bar: ScheduleBar) {
  const startSlot = bar.startDay * hours.length + bar.startHour
  const endSlot = bar.endDay * hours.length + bar.endHour
  const left = (startSlot / totalSlots) * 100
  const width = ((endSlot - startSlot) / totalSlots) * 100
  return { left: `${left}%`, width: `${Math.max(width, 1)}%` }
}

const kpis = {
  linesActive: scheduleData.filter((l) => l.bars.some((b) => b.status === "active")).length,
  scheduleAdherence: 92.5,
  changeoversToday: 2,
  maintenanceBlocks: 1,
}

export function ProductionSchedule() {
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Schedule"
        description="Weekly Gantt view of work order scheduling across production lines."
        action={{ label: "Schedule WO", icon: Calendar }}
      >
        <Button variant="outline" size="sm" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Auto-Schedule
        </Button>
        <div className="flex items-center gap-1 border rounded-md">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-2">
            Mar 31 - Apr 06, 2026
          </span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Lines Active"
          value={`${kpis.linesActive} / ${scheduleData.length}`}
          icon={Activity}
          color="green"
        />
        <KPICard
          title="Schedule Adherence"
          value={`${kpis.scheduleAdherence}%`}
          icon={Target}
          color="blue"
          change={1.3}
          changePeriod="vs last week"
        />
        <KPICard
          title="Changeovers Today"
          value={String(kpis.changeoversToday)}
          icon={ArrowLeftRight}
          color="orange"
        />
        <KPICard
          title="Maintenance Blocks"
          value={String(kpis.maintenanceBlocks)}
          icon={Wrench}
          color="purple"
          subtitle="Reflow Oven 1 tomorrow"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
          <span>Bosch</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
          <span>ABB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>Continental</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span>L&T</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-6 rounded-sm overflow-hidden flex">
              <div className="h-full w-[60%] bg-blue-500" />
              <div className="h-full flex-1 bg-blue-500/30" />
            </div>
            <span>Progress within bar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-blue-500 ring-2 ring-blue-500/30" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/30 border border-border" />
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header */}
              <div className="flex border-b border-border">
                <div className="w-[120px] shrink-0 px-4 py-2 text-xs font-medium text-muted-foreground border-r border-border">
                  Line
                </div>
                <div className="flex-1 flex">
                  {weekDays.map((day, i) => (
                    <div
                      key={day}
                      className={cn(
                        "flex-1 text-center py-2 text-xs font-medium border-r border-border last:border-r-0",
                        i === 0 && "text-primary font-semibold",
                        i >= 5 && "text-muted-foreground bg-muted/30"
                      )}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              {scheduleData.map((line) => (
                <div
                  key={line.line}
                  className="flex border-b border-border/50 last:border-b-0"
                >
                  <div className="w-[120px] shrink-0 px-4 py-4 border-r border-border flex items-center">
                    <div>
                      <p className="text-sm font-medium">{line.lineLabel}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {line.bars.length} work orders
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 relative" style={{ height: "80px" }}>
                    {/* Day grid lines */}
                    {weekDays.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "absolute top-0 bottom-0 border-r border-border/30",
                          i >= 5 && "bg-muted/20"
                        )}
                        style={{
                          left: `${(i / weekDays.length) * 100}%`,
                          width: `${(1 / weekDays.length) * 100}%`,
                        }}
                      />
                    ))}

                    {/* Bars with progress fill */}
                    {line.bars.map((bar) => {
                      const pos = getBarPosition(bar)
                      const isActive = bar.status === "active"
                      const isHovered = hoveredBar === bar.id

                      return (
                        <div
                          key={bar.id}
                          className="absolute top-3 group/bar"
                          style={{ left: pos.left, width: pos.width, height: "52px" }}
                        >
                          {/* Background (unfilled) */}
                          <div
                            className={cn(
                              "absolute inset-0 rounded-md overflow-hidden cursor-pointer transition-all",
                              bar.color,
                              isActive ? "opacity-100" : "opacity-60",
                              isActive && "ring-2 ring-offset-1 ring-offset-background",
                              isActive && bar.color === "bg-blue-500" && "ring-blue-400",
                              isActive && bar.color === "bg-amber-500" && "ring-amber-400",
                              selectedBar === bar.id && "ring-2 ring-foreground scale-[1.02]"
                            )}
                            onClick={() => setSelectedBar(selectedBar === bar.id ? null : bar.id)}
                            onMouseEnter={() => setHoveredBar(bar.id)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Progress fill overlay */}
                            {bar.progress > 0 && (
                              <div
                                className="absolute inset-0 bg-white/20"
                                style={{ width: `${bar.progress}%` }}
                              />
                            )}
                            {/* Unfilled portion - darker overlay */}
                            {bar.progress > 0 && bar.progress < 100 && (
                              <div
                                className="absolute top-0 bottom-0 right-0 bg-black/20"
                                style={{ width: `${100 - bar.progress}%` }}
                              />
                            )}

                            {/* Text content */}
                            <div className="relative z-10 h-full flex items-center px-2.5 text-white text-xs font-medium">
                              <div className="truncate">
                                <span className="font-semibold">{bar.wo}</span>
                                <span className="opacity-80 ml-1.5 hidden sm:inline">{bar.board}</span>
                                {bar.progress > 0 && (
                                  <span className="opacity-70 ml-1.5 text-[10px]">{bar.progress}%</span>
                                )}
                              </div>
                              {isActive && (
                                <span className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* Hover tooltip */}
                          {isHovered && (
                            <div className="absolute -top-[72px] left-1/2 -translate-x-1/2 bg-popover border rounded-lg shadow-lg p-2.5 z-50 whitespace-nowrap pointer-events-none">
                              <p className="text-xs font-semibold font-mono">{bar.wo}</p>
                              <p className="text-[10px] text-muted-foreground">{bar.board} - {bar.customer}</p>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                <span>{weekDays[bar.startDay]} {hours[bar.startHour]}</span>
                                <span>to</span>
                                <span>{weekDays[bar.endDay]} {hours[bar.endHour]}</span>
                              </div>
                              {bar.progress > 0 && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden w-16">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bar.progress}%` }} />
                                  </div>
                                  <span className="text-[10px] tabular-nums font-medium">{bar.progress}%</span>
                                </div>
                              )}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r rotate-45" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Load Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Line Load - Capacity Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduleData.map((line) => {
              const isOverloaded = line.capacity > 90
              const isLow = line.capacity < 50
              return (
                <div key={line.line} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{line.lineLabel}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold tabular-nums",
                        isOverloaded ? "text-red-600" : isLow ? "text-amber-600" : "text-emerald-600"
                      )}
                    >
                      {line.capacity}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isOverloaded ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${line.capacity}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{line.bars.length} WOs scheduled</span>
                    <span>{line.bars.filter((b) => b.status === "active").length} active</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail panel for selected bar */}
      {selectedBar && (() => {
        const bar = scheduleData.flatMap((l) => l.bars).find((b) => b.id === selectedBar)
        if (!bar) return null
        return (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("h-3 w-3 rounded-sm", bar.color)} />
                  <div>
                    <p className="text-sm font-semibold font-mono">{bar.wo}</p>
                    <p className="text-xs text-muted-foreground">
                      {bar.board} &middot; {bar.customer}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    bar.status === "active"
                      ? "bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/50 dark:text-emerald-400"
                      : "bg-secondary"
                  )}
                >
                  {bar.status === "active" ? "In Progress" : "Scheduled"}
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Start</p>
                  <p className="font-medium">
                    {weekDays[bar.startDay]?.split(" ")[1] ?? ""} Apr @ {hours[bar.startHour]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">End</p>
                  <p className="font-medium">
                    {weekDays[bar.endDay]?.split(" ")[1] ?? ""} Apr @ {hours[bar.endHour]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Line</p>
                  <p className="font-medium">
                    {scheduleData.find((l) => l.bars.some((b) => b.id === selectedBar))?.lineLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", bar.progress > 0 ? "bg-emerald-500" : "bg-muted")}
                        style={{ width: `${bar.progress}%` }}
                      />
                    </div>
                    <span className="text-xs tabular-nums font-medium">{bar.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
