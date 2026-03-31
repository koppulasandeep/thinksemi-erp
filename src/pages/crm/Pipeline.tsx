import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency } from "@/lib/utils"
import { crmLeads } from "@/lib/mock-data"
import { GripVertical, Building2, CircuitBoard } from "lucide-react"
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

const kanbanStages = ["New Lead", "Qualified", "Quoted", "Negotiation", "Won", "Lost"] as const
type KanbanStage = (typeof kanbanStages)[number]

type Lead = (typeof crmLeads)[number]

const stageColors: Record<string, string> = {
  "New Lead": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  Qualified: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
  Quoted: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
  Negotiation: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  Won: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
  Lost: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400",
}

const stageAccent: Record<string, string> = {
  "New Lead": "bg-blue-500",
  Qualified: "bg-amber-500",
  Quoted: "bg-teal-500",
  Negotiation: "bg-purple-500",
  Won: "bg-emerald-500",
  Lost: "bg-red-500",
}

function LeadCardContent({ lead }: { lead: Lead }) {
  return (
    <>
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 shrink-0 mt-0.5 transition-colors" />
        <div className="flex-1 min-w-0 space-y-2">
          {/* Company */}
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-semibold truncate">
              {lead.company}
            </span>
          </div>

          {/* Product */}
          <div className="flex items-center gap-1.5">
            <CircuitBoard className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {lead.product}
            </span>
          </div>

          {/* Value + Probability */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <span className="text-sm font-bold">
              {formatCurrency(lead.value)}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold border-0",
                stageColors[lead.stage]
              )}
            >
              {lead.probability}%
            </Badge>
          </div>

          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[9px] font-medium text-muted-foreground">
                {lead.assignee
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {lead.assignee}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all hover:border-border/80 group",
        isDragging && "opacity-30"
      )}
    >
      <LeadCardContent lead={lead} />
    </Card>
  )
}

function DroppableColumn({
  stage,
  leads,
  totalValue,
  isOver,
}: {
  stage: KanbanStage
  leads: Lead[]
  totalValue: number
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({ id: stage })

  return (
    <div className="flex flex-col gap-3">
      {/* Column Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn("h-2 w-2 rounded-full", stageAccent[stage])}
          />
          <h3 className="text-sm font-semibold">{stage}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            {leads.length}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {formatCurrency(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 min-h-[80px] rounded-lg p-1 transition-colors",
          isOver && "bg-accent/50 ring-2 ring-primary/20"
        )}
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-xs text-muted-foreground">
              No leads in this stage
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>(crmLeads.filter(l => kanbanStages.includes(l.stage as KanbanStage)))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeLead = useMemo(
    () => leads.find((l) => l.id === activeId) ?? null,
    [activeId, leads]
  )

  const grouped = useMemo(
    () =>
      kanbanStages.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage)
        const totalValue = stageLeads.reduce((sum, l) => sum + l.value, 0)
        return { stage, leads: stageLeads, totalValue }
      }),
    [leads]
  )

  function findColumn(id: string): KanbanStage | null {
    // Check if it's a column id
    if (kanbanStages.includes(id as KanbanStage)) return id as KanbanStage
    // Otherwise find the lead's column
    const lead = leads.find((l) => l.id === id)
    return (lead?.stage as KanbanStage) ?? null
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
    const col = findColumn(overId)
    setOverColumnId(col)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverColumnId(null)

    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string
    const targetColumn = findColumn(overId)

    if (!targetColumn) return

    setLeads((prev) =>
      prev.map((l) =>
        l.id === activeLeadId ? { ...l, stage: targetColumn } : l
      )
    )
  }

  function handleDragCancel() {
    setActiveId(null)
    setOverColumnId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <DroppableColumn
            key={col.stage}
            stage={col.stage}
            leads={col.leads}
            totalValue={col.totalValue}
            isOver={overColumnId === col.stage}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <Card className="p-3 shadow-xl rotate-2 opacity-90 group">
            <LeadCardContent lead={activeLead} />
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
