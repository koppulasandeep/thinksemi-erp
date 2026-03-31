import { useState } from "react"
import {
  Target,
  Trophy,
  TrendingUp,
  Star,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, getInitials } from "@/lib/utils"

interface Goal {
  id: string
  title: string
  weight: number
  target: string
  actual: string
  score: number
  status: "exceeded" | "on_track" | "at_risk" | "missed"
}

interface EmployeePerformance {
  empId: string
  name: string
  dept: string
  role: string
  overallScore: number
  rating: string
  goals: Goal[]
}

const performanceData: EmployeePerformance[] = [
  {
    empId: "emp-001",
    name: "Ravi Kumar",
    dept: "SMT Production",
    role: "Operator",
    overallScore: 82,
    rating: "Meets Expectations",
    goals: [
      { id: "g1", title: "Daily production output", weight: 30, target: "400 units/shift", actual: "420 units/shift", score: 95, status: "exceeded" },
      { id: "g2", title: "Defect rate reduction", weight: 25, target: "<0.5%", actual: "0.3%", score: 90, status: "exceeded" },
      { id: "g3", title: "Machine changeover time", weight: 20, target: "<15 min", actual: "18 min", score: 65, status: "at_risk" },
      { id: "g4", title: "Safety compliance", weight: 15, target: "100%", actual: "100%", score: 100, status: "exceeded" },
      { id: "g5", title: "Cross-training completion", weight: 10, target: "2 modules", actual: "1 module", score: 50, status: "at_risk" },
    ],
  },
  {
    empId: "emp-002",
    name: "Priya Sharma",
    dept: "Quality",
    role: "QC Engineer",
    overallScore: 91,
    rating: "Exceeds Expectations",
    goals: [
      { id: "g1", title: "First Pass Yield improvement", weight: 30, target: "98%", actual: "97.8%", score: 92, status: "on_track" },
      { id: "g2", title: "CAPA closure rate", weight: 25, target: "100% within SLA", actual: "95%", score: 85, status: "on_track" },
      { id: "g3", title: "Customer complaint reduction", weight: 20, target: "<2/quarter", actual: "1/quarter", score: 100, status: "exceeded" },
      { id: "g4", title: "IPC-A-610 audit score", weight: 15, target: ">95%", actual: "97%", score: 95, status: "exceeded" },
      { id: "g5", title: "Process documentation", weight: 10, target: "5 SOPs", actual: "5 SOPs", score: 100, status: "exceeded" },
    ],
  },
  {
    empId: "emp-004",
    name: "Arun Krishnan",
    dept: "Engineering",
    role: "Process Engineer",
    overallScore: 88,
    rating: "Exceeds Expectations",
    goals: [
      { id: "g1", title: "OEE improvement projects", weight: 30, target: "+5% OEE", actual: "+3.2% OEE", score: 75, status: "on_track" },
      { id: "g2", title: "NPI cycle time reduction", weight: 25, target: "<5 days", actual: "4 days", score: 95, status: "exceeded" },
      { id: "g3", title: "Stencil design optimization", weight: 20, target: "3 designs", actual: "4 designs", score: 100, status: "exceeded" },
      { id: "g4", title: "Reflow profile development", weight: 15, target: "6 profiles", actual: "5 profiles", score: 80, status: "on_track" },
      { id: "g5", title: "Team mentoring hours", weight: 10, target: "20 hrs/qtr", actual: "22 hrs", score: 100, status: "exceeded" },
    ],
  },
  {
    empId: "emp-008",
    name: "Karthik Raja",
    dept: "SMT Production",
    role: "Line Supervisor",
    overallScore: 75,
    rating: "Meets Expectations",
    goals: [
      { id: "g1", title: "Line utilization rate", weight: 30, target: ">85%", actual: "82%", score: 70, status: "at_risk" },
      { id: "g2", title: "On-time delivery", weight: 25, target: ">95%", actual: "94.2%", score: 80, status: "on_track" },
      { id: "g3", title: "Team attendance management", weight: 20, target: ">96%", actual: "93%", score: 60, status: "at_risk" },
      { id: "g4", title: "Shift handover compliance", weight: 15, target: "100%", actual: "100%", score: 100, status: "exceeded" },
      { id: "g5", title: "Cost savings initiatives", weight: 10, target: "2 initiatives", actual: "1 initiative", score: 50, status: "missed" },
    ],
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  exceeded: { label: "Exceeded", color: "bg-success/10 text-success" },
  on_track: { label: "On Track", color: "bg-info/10 text-info" },
  at_risk: { label: "At Risk", color: "bg-warning/10 text-warning" },
  missed: { label: "Missed", color: "bg-destructive/10 text-destructive" },
}

function getRatingColor(score: number): string {
  if (score >= 90) return "text-success"
  if (score >= 75) return "text-info"
  if (score >= 60) return "text-warning"
  return "text-destructive"
}

function getProgressColor(score: number): string {
  if (score >= 90) return "bg-success"
  if (score >= 75) return "bg-info"
  if (score >= 60) return "bg-warning"
  return "bg-destructive"
}

export function Performance() {
  const [expandedEmp, setExpandedEmp] = useState<string | null>(performanceData[0].empId)

  const avgScore = Math.round(performanceData.reduce((s, e) => s + e.overallScore, 0) / performanceData.length)
  const topPerformer = performanceData.reduce((a, b) => (a.overallScore > b.overallScore ? a : b))
  const atRiskGoals = performanceData.reduce(
    (sum, e) => sum + e.goals.filter((g) => g.status === "at_risk" || g.status === "missed").length,
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Performance Management</h2>
          <p className="text-sm text-muted-foreground">Q4 FY2025-26 (Jan-Mar 2026)</p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Avg Score"
          value={`${avgScore}/100`}
          subtitle="Across all employees"
          icon={Target}
        />
        <KPICard
          title="Top Performer"
          value={topPerformer.name.split(" ")[0]}
          subtitle={`${topPerformer.overallScore}/100`}
          icon={Trophy}
          iconColor="text-warning"
        />
        <KPICard
          title="Goals At Risk"
          value={String(atRiskGoals)}
          subtitle="Need attention"
          icon={TrendingUp}
          iconColor="text-destructive"
        />
        <KPICard
          title="Review Cycle"
          value="Active"
          subtitle="Ends Mar 31"
          icon={Star}
          iconColor="text-success"
        />
      </div>

      {/* Employee Cards */}
      <div className="space-y-3">
        {performanceData.map((emp) => {
          const isExpanded = expandedEmp === emp.empId

          return (
            <Card key={emp.empId} className={cn(isExpanded && "ring-1 ring-primary/20")}>
              {/* Summary Row */}
              <button
                className="w-full cursor-pointer"
                onClick={() => setExpandedEmp(isExpanded ? null : emp.empId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                      {getInitials(emp.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{emp.name}</p>
                        <Badge variant="outline" className="text-[10px]">{emp.dept}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className={cn("text-xl font-bold tabular-nums", getRatingColor(emp.overallScore))}>
                          {emp.overallScore}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{emp.rating}</p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <Progress
                          value={emp.overallScore}
                          className="h-2"
                          indicatorClassName={getProgressColor(emp.overallScore)}
                        />
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>

              {/* Goals Table */}
              {isExpanded && (
                <div className="border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Goal</th>
                          <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground w-20">Weight</th>
                          <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Target</th>
                          <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">Actual</th>
                          <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground w-20">Score</th>
                          <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.goals.map((goal) => {
                          const cfg = statusConfig[goal.status]
                          return (
                            <tr key={goal.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                              <td className="px-4 py-2.5 font-medium">{goal.title}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="text-xs text-muted-foreground">{goal.weight}%</span>
                              </td>
                              <td className="px-3 py-2.5 text-center text-muted-foreground text-xs">{goal.target}</td>
                              <td className="px-3 py-2.5 text-center font-medium text-xs">{goal.actual}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={cn("text-sm font-bold tabular-nums", getRatingColor(goal.score))}>
                                  {goal.score}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <Badge variant="outline" className={cn("text-[10px] border-0", cfg.color)}>
                                  {cfg.label}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-muted/30">
                          <td className="px-4 py-2.5 font-semibold">Weighted Score</td>
                          <td className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">100%</td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-center">
                            <span className={cn("text-base font-bold tabular-nums", getRatingColor(emp.overallScore))}>
                              {emp.overallScore}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] border-0 font-semibold",
                                emp.overallScore >= 90
                                  ? "bg-success/10 text-success"
                                  : emp.overallScore >= 75
                                  ? "bg-info/10 text-info"
                                  : "bg-warning/10 text-warning"
                              )}
                            >
                              {emp.rating}
                            </Badge>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Outstanding (90-100)", count: 1, pct: 25, color: "bg-success" },
              { label: "Exceeds Expectations (75-89)", count: 2, pct: 50, color: "bg-info" },
              { label: "Meets Expectations (60-74)", count: 1, pct: 25, color: "bg-warning" },
              { label: "Needs Improvement (<60)", count: 0, pct: 0, color: "bg-destructive" },
            ].map((tier) => (
              <div key={tier.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-48 shrink-0">{tier.label}</span>
                <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                  {tier.pct > 0 && (
                    <div
                      className={cn("h-full rounded-full flex items-center justify-end pr-2", tier.color)}
                      style={{ width: `${tier.pct}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white">{tier.count}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{tier.pct}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
