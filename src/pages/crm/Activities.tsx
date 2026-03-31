import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Phone,
  Mail,
  Calendar,
  StickyNote,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Clock,
  Building2,
  User,
} from "lucide-react"

// ─── Activity types & data ───

type ActivityType = "call" | "email" | "meeting" | "note" | "task"

interface Activity {
  id: string
  type: ActivityType
  subject: string
  contact: string
  company: string
  date: string
  time: string
  assignee: string
  description: string
  duration?: string
  completed?: boolean
}

const activities: Activity[] = [
  {
    id: "act-001",
    type: "call",
    subject: "ECU-X500 BOM finalization call",
    contact: "Rahul Menon",
    company: "Bosch India",
    date: "2026-03-29",
    time: "10:30 AM",
    assignee: "Sandeep K",
    description: "Discussed alternate parts for U7 op-amp. Rahul to share updated BOM by Friday. Also confirmed 5,000 unit order quantity.",
    duration: "22 min",
  },
  {
    id: "act-002",
    type: "email",
    subject: "Sent revised quotation QTN-2026-031",
    contact: "Klaus Mueller",
    company: "Siemens",
    date: "2026-03-29",
    time: "09:15 AM",
    assignee: "Sandeep K",
    description: "Updated pricing for Sensor Interface board after component cost reduction. Included stepped stencil in quotation.",
  },
  {
    id: "act-003",
    type: "task",
    subject: "Prepare DFM report for VFD Control Board",
    contact: "Vikram Subramanian",
    company: "ABB",
    date: "2026-03-28",
    time: "04:00 PM",
    assignee: "Arun K",
    description: "Run DFM analysis on gerber files shared by ABB. Flag any manufacturing concerns before quotation.",
    completed: false,
  },
  {
    id: "act-004",
    type: "meeting",
    subject: "Quarterly business review",
    contact: "Rahul Menon",
    company: "Bosch India",
    date: "2026-03-28",
    time: "02:00 PM",
    assignee: "Sandeep K",
    description: "On-site meeting at Bosch Adyar campus. Reviewed Q1 delivery performance, discussed FY27 forecast and new EV charger project.",
    duration: "1h 30min",
  },
  {
    id: "act-005",
    type: "note",
    subject: "Competitor pricing intelligence",
    contact: "Sunil Krishnamurthy",
    company: "L&T",
    date: "2026-03-27",
    time: "11:00 AM",
    assignee: "Sandeep K",
    description: "Sunil mentioned that Kaynes Technology quoted 8% lower for similar relay board. Need to review our cost structure.",
  },
  {
    id: "act-006",
    type: "call",
    subject: "IoT Gateway volume discount discussion",
    contact: "Meera Jayaraman",
    company: "Tata Elxsi",
    date: "2026-03-27",
    time: "03:30 PM",
    assignee: "Sandeep K",
    description: "Meera requesting 15% discount for 5k+ orders. Explained our cost structure. Offered 8% on components, 5% on assembly.",
    duration: "18 min",
  },
  {
    id: "act-007",
    type: "email",
    subject: "RMA failure analysis report",
    contact: "Anitha Balakrishnan",
    company: "Bosch India",
    date: "2026-03-26",
    time: "10:00 AM",
    assignee: "Priya S",
    description: "Sent root cause analysis for RMA-009 (2 failed ECU-X500 units). Root cause: solder void under BGA U1.",
  },
  {
    id: "act-008",
    type: "meeting",
    subject: "ADAS Module NPI progress review",
    contact: "Deepak Raghavan",
    company: "Continental",
    date: "2026-03-25",
    time: "11:00 AM",
    assignee: "Sandeep K",
    description: "Reviewed prototype build progress (5/10 units). Discussed DFM changes for thermal pad optimization.",
    duration: "45 min",
  },
  {
    id: "act-009",
    type: "task",
    subject: "Update component pricing from Mouser",
    contact: "",
    company: "",
    date: "2026-03-25",
    time: "09:00 AM",
    assignee: "Mohan R",
    description: "Refresh pricing for top 50 components from Mouser catalog. Update BOM costing sheets.",
    completed: true,
  },
  {
    id: "act-010",
    type: "call",
    subject: "EV Charger Board initial requirements",
    contact: "Amit Shah",
    company: "TechCorp",
    date: "2026-03-24",
    time: "04:15 PM",
    assignee: "Sandeep K",
    description: "Amit exploring PCB assembly partners for new EV charger. 6-layer board, BGA packages. Wants prototype in 3 weeks.",
    duration: "35 min",
  },
  {
    id: "act-011",
    type: "email",
    subject: "Relay Board delivery confirmation",
    contact: "Sunil Krishnamurthy",
    company: "L&T",
    date: "2026-03-24",
    time: "02:00 PM",
    assignee: "Sandeep K",
    description: "Confirmed first batch of 10,000 relay boards shipped via FedEx. Tracking number shared.",
  },
  {
    id: "act-012",
    type: "note",
    subject: "ISO 13485 certification planning",
    contact: "Dr. Priya Ravichandran",
    company: "MedTech Solutions",
    date: "2026-03-23",
    time: "10:00 AM",
    assignee: "Sandeep K",
    description: "MedTech requires ISO 13485 for patient monitor PCB. Need to evaluate certification timeline and cost. Estimated 4-6 months.",
  },
  {
    id: "act-013",
    type: "meeting",
    subject: "ABB plant visit and project scoping",
    contact: "Vikram Subramanian",
    company: "ABB",
    date: "2026-03-22",
    time: "10:00 AM",
    assignee: "Sandeep K",
    description: "Visited ABB Poonamallee plant. Toured their assembly area. Discussed 3 potential PCB projects for FY27.",
    duration: "2h",
  },
]

const typeConfig: Record<
  ActivityType,
  { icon: typeof Phone; label: string; color: string; bgColor: string }
> = {
  call: { icon: Phone, label: "Call", color: "text-green-500", bgColor: "bg-green-500" },
  email: { icon: Mail, label: "Email", color: "text-blue-500", bgColor: "bg-blue-500" },
  meeting: { icon: Calendar, label: "Meeting", color: "text-purple-500", bgColor: "bg-purple-500" },
  note: { icon: StickyNote, label: "Note", color: "text-amber-500", bgColor: "bg-amber-500" },
  task: { icon: CheckSquare, label: "Task", color: "text-rose-500", bgColor: "bg-rose-500" },
}

const allTypes: ActivityType[] = ["call", "email", "meeting", "note", "task"]

export function Activities() {
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = activities.filter((a) => {
    const matchesType = typeFilter === "all" || a.type === typeFilter
    const matchesSearch =
      search === "" ||
      a.subject.toLowerCase().includes(search.toLowerCase()) ||
      a.contact.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesSearch
  })

  // Group by date
  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = []
    acc[a.date].push(a)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function formatDateLabel(dateStr: string): string {
    const d = new Date(dateStr)
    const today = new Date("2026-03-29")
    const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return d.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
              typeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {allTypes.map((type) => {
            const cfg = typeConfig[type]
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
                  typeFilter === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <cfg.icon className="h-3 w-3" />
                {cfg.label}
              </button>
            )
          })}
        </div>
        <Button size="sm" className="ml-auto">
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </div>

      {/* Activity counts */}
      <div className="grid grid-cols-5 gap-3">
        {allTypes.map((type) => {
          const cfg = typeConfig[type]
          const count = activities.filter((a) => a.type === type).length
          return (
            <Card key={type} className="p-3 flex items-center gap-3">
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", cfg.bgColor + "/10")}>
                <cfg.icon className={cn("h-4 w-4", cfg.color)} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{count}</p>
                <p className="text-[11px] text-muted-foreground">{cfg.label}s</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold">{formatDateLabel(date)}</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{grouped[date].length} activities</span>
            </div>
            <div className="relative ml-4 border-l-2 border-border/60 pl-6 space-y-4">
              {grouped[date].map((activity) => {
                const cfg = typeConfig[activity.type]
                const TypeIcon = cfg.icon
                return (
                  <div key={activity.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center",
                        cfg.bgColor
                      )}
                    >
                      <TypeIcon className="h-2 w-2 text-white" />
                    </div>

                    <Card className="p-4 transition-all hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className={cn("text-[10px] gap-1", cfg.color)}>
                              <TypeIcon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </Badge>
                            {activity.duration && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {activity.duration}
                              </span>
                            )}
                            {activity.type === "task" && (
                              <Badge
                                variant={activity.completed ? "success" : "warning"}
                                className="text-[10px]"
                              >
                                {activity.completed ? "Done" : "Pending"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{activity.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            {activity.contact && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {activity.contact}
                              </span>
                            )}
                            {activity.company && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {activity.company}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{activity.assignee}</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No activities match your filters.</p>
        </div>
      )}
    </div>
  )
}
