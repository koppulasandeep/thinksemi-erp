import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn } from "@/lib/utils"
import { npiProjects as mockNpiProjects } from "@/lib/mock-data"
import { useApiData, transformList } from "@/lib/useApi"
import { api } from "@/lib/api"
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  User,
  AlertTriangle,
  Layers,
  BarChart3,
  CalendarRange,
  Kanban,
  Filter,
  Target,
  TrendingUp,
} from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

const stages = [
  "Incoming",
  "DFM Review",
  "Prototype Build",
  "Validation",
  "Done",
] as const

type Stage = (typeof stages)[number]
type NpiProject = (typeof mockNpiProjects)[number]

const pipelineTabs = [
  { id: "pipeline", label: "Pipeline", icon: Kanban },
  { id: "board", label: "Board View", icon: Layers },
  { id: "timeline", label: "Timeline", icon: CalendarRange },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
] as const

type PipelineTab = (typeof pipelineTabs)[number]["id"]

// --- Helper functions ---

interface ChecklistItem {
  label: string
  key: string
  icon: "check" | "pending" | "waiting"
}

function getChecklist(project: NpiProject): ChecklistItem[] {
  return [
    { label: "Gerber", key: "gerber", icon: project.gerberUploaded ? "check" : "waiting" },
    { label: "BOM", key: "bom", icon: project.bomUploaded ? "check" : "waiting" },
    { label: "P&P", key: "pnp", icon: project.pnpReady ? "check" : "pending" },
    { label: "Stencil", key: "stencil", icon: project.stencilOrdered ? "check" : "pending" },
    { label: "DFM", key: "dfm", icon: project.dfmDone ? "check" : "pending" },
  ]
}

function getChecklistProgress(project: NpiProject): number {
  const items = getChecklist(project)
  const done = items.filter((i) => i.icon === "check").length
  return Math.round((done / items.length) * 100)
}

function ChecklistIcon({ type }: { type: "check" | "pending" | "waiting" }) {
  if (type === "check") return <CheckCircle2 className="h-3 w-3 text-success" />
  if (type === "pending") return <Clock className="h-3 w-3 text-warning" />
  return <Circle className="h-3 w-3 text-muted-foreground" />
}

const stageColorMap: Record<Stage, string> = {
  Incoming: "bg-muted text-muted-foreground",
  "DFM Review": "bg-warning/10 text-warning",
  "Prototype Build": "bg-info/10 text-info",
  Validation: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Done: "bg-success/10 text-success",
}

// --- Kanban card components (same as before) ---

function ProjectCardContent({ project, stage }: { project: NpiProject; stage: Stage }) {
  const checklist = getChecklist(project)
  const progress = getChecklistProgress(project)

  return (
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{project.board}</p>
          <p className="text-xs text-muted-foreground">{project.customer}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", stageColorMap[stage])}>
          {stage}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checklist.map((item) => (
          <div key={item.key} className="flex items-center gap-1">
            <ChecklistIcon type={item.icon} />
            <span className={cn("text-[11px]", item.icon === "check" ? "text-foreground" : "text-muted-foreground")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Checklist</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1" indicatorClassName={progress === 100 ? "bg-success" : "bg-primary"} />
      </div>

      {"dfmIssues" in project &&
        (project as Record<string, unknown>).dfmIssues !== undefined &&
        ((project as Record<string, unknown>).dfmIssues as number) > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-warning">
            <AlertTriangle className="h-3 w-3" />
            {(project as Record<string, unknown>).dfmIssues as number} DFM issues found
          </div>
        )}

      {"buildProgress" in project && (
        <div className="text-xs text-muted-foreground">
          Build progress: <span className="font-medium text-foreground">{(project as Record<string, unknown>).buildProgress as string}</span>
        </div>
      )}

      {"yield" in project && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            Yield: <span className="font-medium text-foreground">{(project as Record<string, unknown>).yield as number}%</span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t">
        <span className="text-[10px] text-muted-foreground font-mono">{project.id}</span>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <User className="h-3 w-3" />
          {project.assignee}
        </div>
      </div>
    </CardContent>
  )
}

function SortableProjectCard({ project, stage }: { project: NpiProject; stage: Stage }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-foreground/20", isDragging && "opacity-30")}
    >
      <ProjectCardContent project={project} stage={stage} />
    </Card>
  )
}

function DroppableColumn({ stage, projects, isOver }: { stage: Stage; projects: NpiProject[]; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: stage })

  return (
    <div className="flex-shrink-0 w-[280px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{stage}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{projects.length}</span>
        </div>
      </div>
      <div ref={setNodeRef} className={cn("space-y-3 min-h-[80px] rounded-lg p-1 transition-colors", isOver && "bg-accent/50 ring-2 ring-primary/20")}>
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">No projects</div>
          ) : (
            projects.map((project) => <SortableProjectCard key={project.id} project={project} stage={stage} />)
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// --- Board View (Table) ---

function BoardViewTab({ projects }: { projects: NpiProject[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">ID</th>
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Board</th>
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Customer</th>
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Stage</th>
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Assignee</th>
                <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Checklist</th>
                <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Gerber</th>
                <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">BOM</th>
                <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">P&P</th>
                <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">Stencil</th>
                <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground">DFM</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const progress = getChecklistProgress(p)
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs font-medium">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.board}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.customer}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", stageColorMap[p.stage as Stage])}>
                        {p.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.assignee}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={progress} className="h-1.5 flex-1" indicatorClassName={progress === 100 ? "bg-success" : "bg-primary"} />
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{p.gerberUploaded ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{p.bomUploaded ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{p.pnpReady ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{p.stencilOrdered ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
                    <td className="px-4 py-3 text-center">{p.dfmDone ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : <Circle className="h-4 w-4 text-muted-foreground mx-auto" />}</td>
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

// --- Timeline View ---

const timelineMilestones: Record<string, { date: string; milestones: { label: string; done: boolean }[] }> = {
  "npi-001": {
    date: "2026-03-20",
    milestones: [
      { label: "Files Received", done: true },
      { label: "DFM Review", done: false },
      { label: "Prototype", done: false },
      { label: "Validation", done: false },
      { label: "Release", done: false },
    ],
  },
  "npi-002": {
    date: "2026-03-12",
    milestones: [
      { label: "Files Received", done: true },
      { label: "DFM Review", done: true },
      { label: "Prototype", done: false },
      { label: "Validation", done: false },
      { label: "Release", done: false },
    ],
  },
  "npi-003": {
    date: "2026-03-05",
    milestones: [
      { label: "Files Received", done: true },
      { label: "DFM Review", done: true },
      { label: "Prototype", done: true },
      { label: "Validation", done: false },
      { label: "Release", done: false },
    ],
  },
  "npi-004": {
    date: "2026-02-20",
    milestones: [
      { label: "Files Received", done: true },
      { label: "DFM Review", done: true },
      { label: "Prototype", done: true },
      { label: "Validation", done: true },
      { label: "Release", done: false },
    ],
  },
}

function TimelineViewTab({ projects }: { projects: NpiProject[] }) {
  return (
    <div className="space-y-4">
      {projects.map((p) => {
        const data = timelineMilestones[p.id]
        if (!data) return null
        const doneCount = data.milestones.filter((m) => m.done).length
        const totalCount = data.milestones.length
        return (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold">{p.board}</p>
                  <p className="text-xs text-muted-foreground">{p.customer} -- Started {data.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", stageColorMap[p.stage as Stage])}>
                    {p.stage}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{p.assignee}</span>
                </div>
              </div>
              {/* Horizontal timeline */}
              <div className="relative flex items-center justify-between px-2">
                {/* Connecting line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-border" />
                <div
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-0.5 bg-teal-500 transition-all"
                  style={{ width: `${((doneCount - (doneCount > 0 ? 0.5 : 0)) / (totalCount - 1)) * 100}%` }}
                />
                {data.milestones.map((m, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        m.done ? "border-teal-500 bg-teal-500 text-white" : "border-muted-foreground/30 bg-background"
                      )}
                    >
                      {m.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3 text-muted-foreground/50" />}
                    </div>
                    <span className={cn("text-[10px] text-center max-w-[70px]", m.done ? "text-foreground font-medium" : "text-muted-foreground")}>{m.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// --- Metrics View ---

function MetricsViewTab({ projects }: { projects: NpiProject[] }) {
  const stageDistribution = stages.map((s) => ({
    stage: s,
    count: projects.filter((p) => p.stage === s).length,
  }))
  const maxCount = Math.max(...stageDistribution.map((s) => s.count), 1)

  const avgChecklist = Math.round(projects.reduce((sum, p) => sum + getChecklistProgress(p), 0) / projects.length)
  const dfmIssueTotal = projects.reduce((sum, p) => sum + (((p as Record<string, unknown>).dfmIssues as number) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Stage distribution */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-4">Stage Distribution</h3>
          <div className="space-y-3">
            {stageDistribution.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-xs w-28 text-muted-foreground">{s.stage}</span>
                <div className="flex-1 h-6 bg-muted/50 rounded-md overflow-hidden">
                  <div
                    className={cn("h-full rounded-md transition-all flex items-center px-2", stageColorMap[s.stage as Stage]?.replace("/10", "/30"))}
                    style={{ width: `${(s.count / maxCount) * 100}%`, minWidth: s.count > 0 ? "32px" : "0" }}
                  >
                    <span className="text-xs font-semibold">{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cycle time analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">Cycle Time Analysis</h3>
            <div className="space-y-4">
              {[
                { label: "Intake to DFM", avg: "3.2 days", target: "2 days", status: "warning" },
                { label: "DFM to Prototype", avg: "5.1 days", target: "5 days", status: "ok" },
                { label: "Prototype to Validation", avg: "7.8 days", target: "7 days", status: "warning" },
                { label: "Validation to Release", avg: "2.4 days", target: "3 days", status: "ok" },
                { label: "Total NPI Cycle", avg: "18.5 days", target: "17 days", status: "warning" },
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

        {/* Summary stats */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold mb-4">NPI Health Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Avg Checklist Completion</span>
                <span className="text-lg font-bold">{avgChecklist}%</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Total DFM Issues Open</span>
                <span className="text-lg font-bold text-warning">{dfmIssueTotal}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">Projects In Progress</span>
                <span className="text-lg font-bold">{projects.filter((p) => p.stage !== "Done").length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm text-muted-foreground">First Article Pass Rate</span>
                <span className="text-lg font-bold text-success">92%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Main component ---

export function NPIPipeline() {
  const { data: apiProjects, refetch } = useApiData("/npi/projects", mockNpiProjects, (raw: any) =>
    transformList(raw?.projects ?? [], undefined) as typeof mockNpiProjects
  )
  const [projects, setProjects] = useState(apiProjects)
  useEffect(() => { setProjects(apiProjects) }, [apiProjects])
  const [activeTab, setActiveTab] = useState<PipelineTab>("pipeline")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)
  const [customerFilter, setCustomerFilter] = useState("")
  const [assigneeFilter, setAssigneeFilter] = useState("")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const customers = useMemo(() => [...new Set(projects.map((p) => p.customer))], [projects])
  const assignees = useMemo(() => [...new Set(projects.map((p) => p.assignee))], [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (customerFilter && p.customer !== customerFilter) return false
      if (assigneeFilter && p.assignee !== assigneeFilter) return false
      return true
    })
  }, [projects, customerFilter, assigneeFilter])

  const activeProject = useMemo(() => filteredProjects.find((p) => p.id === activeId) ?? null, [activeId, filteredProjects])
  const activeProjectStage = useMemo(() => (activeProject?.stage as Stage) ?? null, [activeProject])

  const grouped = useMemo(
    () =>
      stages.reduce(
        (acc, stage) => {
          acc[stage] = filteredProjects.filter((p) => p.stage === stage)
          return acc
        },
        {} as Record<Stage, typeof mockNpiProjects>
      ),
    [filteredProjects]
  )

  // KPI calculations
  const totalProjects = projects.length
  const dfmIssuesFound = projects.reduce((sum, p) => sum + (((p as Record<string, unknown>).dfmIssues as number) || 0), 0)

  function findColumn(id: string): Stage | null {
    if ((stages as readonly string[]).includes(id)) return id as Stage
    const project = projects.find((p) => p.id === id)
    return (project?.stage as Stage) ?? null
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const overId = event.over?.id as string | undefined
    if (!overId) {
      setOverColumnId(null)
      return
    }
    setOverColumnId(findColumn(overId))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)
    if (!over) return
    const activeProjectId = active.id as string
    const overId = over.id as string
    const targetColumn = findColumn(overId)
    if (!targetColumn) return
    setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? { ...p, stage: targetColumn } : p)))
    // Persist stage change to backend
    api.patch(`/npi/projects/${activeProjectId}/stage`, { stage: targetColumn }).catch(() => {
      refetch()
    })
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverColumnId(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="NPI Pipeline"
        description="New product introduction tracking from intake to production release."
        action={{ label: "New NPI", icon: Plus, onClick: () => {} }}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total NPI Projects" value={String(totalProjects)} subtitle="Across all stages" icon={Layers} color="blue" change={8} changePeriod="vs last month" />
        <KPICard title="Avg Time to Production" value="18.5 days" subtitle="Target: 17 days" icon={TrendingUp} color="purple" change={-5} changePeriod="vs last quarter" />
        <KPICard title="DFM Issues Found" value={String(dfmIssuesFound)} subtitle="Active issues to resolve" icon={AlertTriangle} color="orange" />
        <KPICard title="First Article Pass Rate" value="92%" subtitle="Last 30 days" icon={Target} color="green" change={3} changePeriod="vs last month" />
      </div>

      {/* Highlighted Tab Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border">
          {pipelineTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer",
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

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 rounded-md border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Assignees</option>
            {assignees.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "pipeline" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
              <DroppableColumn key={stage} stage={stage} projects={grouped[stage]} isOver={overColumnId === stage} />
            ))}
          </div>
          <DragOverlay>
            {activeProject && activeProjectStage ? (
              <Card className="w-[280px] shadow-xl rotate-2 opacity-90">
                <ProjectCardContent project={activeProject} stage={activeProjectStage} />
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {activeTab === "board" && <BoardViewTab projects={filteredProjects} />}
      {activeTab === "timeline" && <TimelineViewTab projects={filteredProjects} />}
      {activeTab === "metrics" && <MetricsViewTab projects={filteredProjects} />}
    </div>
  )
}
