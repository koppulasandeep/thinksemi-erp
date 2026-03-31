import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  User,
} from "lucide-react"

const stageColorMap: Record<string, string> = {
  Incoming: "bg-muted text-muted-foreground",
  "DFM Review": "bg-warning/10 text-warning",
  "Prototype Build": "bg-info/10 text-info",
  Validation: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Done: "bg-success/10 text-success",
}

const milestoneLabels = ["Files Received", "DFM Review", "Prototype", "Validation", "Released"]

interface ProjectTimelineData {
  id: string
  board: string
  customer: string
  assignee: string
  stage: string
  startDate: string
  milestones: { label: string; date: string | null; done: boolean }[]
}

const timelineData: ProjectTimelineData[] = [
  {
    id: "npi-001",
    board: "ECU-X500",
    customer: "Bosch",
    assignee: "Priya S",
    stage: "Incoming",
    startDate: "2026-03-20",
    milestones: [
      { label: "Files Received", date: "2026-03-20", done: true },
      { label: "DFM Review", date: null, done: false },
      { label: "Prototype", date: null, done: false },
      { label: "Validation", date: null, done: false },
      { label: "Released", date: null, done: false },
    ],
  },
  {
    id: "npi-002",
    board: "IoT-200",
    customer: "Tata Elxsi",
    assignee: "Arun K",
    stage: "DFM Review",
    startDate: "2026-03-12",
    milestones: [
      { label: "Files Received", date: "2026-03-12", done: true },
      { label: "DFM Review", date: "2026-03-16", done: true },
      { label: "Prototype", date: null, done: false },
      { label: "Validation", date: null, done: false },
      { label: "Released", date: null, done: false },
    ],
  },
  {
    id: "npi-003",
    board: "ADAS-M1",
    customer: "Continental",
    assignee: "Line 1",
    stage: "Prototype Build",
    startDate: "2026-03-05",
    milestones: [
      { label: "Files Received", date: "2026-03-05", done: true },
      { label: "DFM Review", date: "2026-03-08", done: true },
      { label: "Prototype", date: "2026-03-15", done: true },
      { label: "Validation", date: null, done: false },
      { label: "Released", date: null, done: false },
    ],
  },
  {
    id: "npi-004",
    board: "EV-CHG-3",
    customer: "TechCorp",
    assignee: "Deepa N",
    stage: "Validation",
    startDate: "2026-02-20",
    milestones: [
      { label: "Files Received", date: "2026-02-20", done: true },
      { label: "DFM Review", date: "2026-02-25", done: true },
      { label: "Prototype", date: "2026-03-05", done: true },
      { label: "Validation", date: "2026-03-18", done: true },
      { label: "Released", date: null, done: false },
    ],
  },
]

export function NPITimeline() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="NPI Timeline"
        description="Visual timeline of all NPI projects showing milestones and progress."
      />

      {/* Timeline header with milestone labels */}
      <Card>
        <CardContent className="p-6">
          {/* Column labels */}
          <div className="flex items-center mb-6">
            <div className="w-56 shrink-0" />
            <div className="flex-1 flex items-center justify-between px-4">
              {milestoneLabels.map((label) => (
                <span key={label} className="text-xs font-medium text-muted-foreground text-center w-24">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Project rows */}
          <div className="space-y-4">
            {timelineData.map((proj) => {
              const doneCount = proj.milestones.filter((m) => m.done).length
              const isSelected = selectedProject === proj.id
              return (
                <div
                  key={proj.id}
                  className={cn(
                    "flex items-center rounded-lg p-3 transition-colors cursor-pointer border",
                    isSelected ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20" : "border-transparent hover:bg-accent/30"
                  )}
                  onClick={() => setSelectedProject(isSelected ? null : proj.id)}
                >
                  {/* Project info */}
                  <div className="w-56 shrink-0 pr-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{proj.board}</p>
                      <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", stageColorMap[proj.stage])}>
                        {proj.stage}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{proj.customer}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <User className="h-2.5 w-2.5" />
                      {proj.assignee}
                    </div>
                  </div>

                  {/* Horizontal timeline */}
                  <div className="flex-1 relative flex items-center justify-between px-4">
                    {/* Background line */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-border" />
                    {/* Progress line */}
                    <div
                      className="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-teal-500 transition-all"
                      style={{ width: `${((doneCount - (doneCount > 0 ? 0.5 : 0)) / (milestoneLabels.length - 1)) * (100 - 10)}%` }}
                    />
                    {proj.milestones.map((m, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-1 w-24">
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            m.done ? "border-teal-500 bg-teal-500 text-white" : "border-muted-foreground/30 bg-background"
                          )}
                        >
                          {m.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3 text-muted-foreground/50" />}
                        </div>
                        {m.date && (
                          <span className="text-[9px] text-muted-foreground">{m.date.slice(5)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected project detail */}
      {selectedProject && (() => {
        const proj = timelineData.find((p) => p.id === selectedProject)
        if (!proj) return null
        const completedMilestones = proj.milestones.filter((m) => m.done)
        const nextMilestone = proj.milestones.find((m) => !m.done)
        return (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold mb-4">{proj.board} - Milestone Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Completed Milestones</p>
                  <div className="space-y-2">
                    {completedMilestones.map((m) => (
                      <div key={m.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm">{m.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{m.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Next Milestone</p>
                  {nextMilestone ? (
                    <div className="rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 p-4 text-center">
                      <p className="text-sm font-medium">{nextMilestone.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">Estimated completion based on average cycle time</p>
                      <Badge className="mt-2 bg-teal-600">In Progress</Badge>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-700 p-4 text-center">
                      <p className="text-sm font-medium text-emerald-600">All milestones completed</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
