import { useState } from "react"
import { Users, UserCheck, CalendarOff, Clock, Building2, TrendingUp, Shield, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import { employees, leaveRequests } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"
import { Attendance } from "./Attendance"
import { LeaveManagement } from "./LeaveManagement"
import { Payroll } from "./Payroll"
import { Performance } from "./Performance"
import { Compliance } from "./Compliance"
import { SalaryStructure } from "./SalaryStructure"
import { TaxDeclarations } from "./TaxDeclarations"
import { Holidays } from "./Holidays"

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "attendance", label: "Attendance" },
  { id: "leave", label: "Leave" },
  { id: "payroll", label: "Payroll" },
  { id: "salary", label: "Salary" },
  { id: "tax", label: "Tax Declarations" },
  { id: "holidays", label: "Holidays" },
  { id: "compliance", label: "Compliance" },
  { id: "performance", label: "Performance" },
] as const

type TabId = (typeof tabs)[number]["id"]

const departmentBreakdown = [
  { dept: "SMT Production", count: 3, color: "#3b82f6" },
  { dept: "Quality", count: 1, color: "#22c55e" },
  { dept: "Store", count: 1, color: "#f59e0b" },
  { dept: "Engineering", count: 1, color: "#8b5cf6" },
  { dept: "HR", count: 1, color: "#ec4899" },
  { dept: "Testing", count: 1, color: "#06b6d4" },
]

const recentActivity = [
  { id: 1, text: "Ravi Kumar clocked in at 08:55", time: "2 min ago", type: "clock-in" },
  { id: 2, text: "Priya Sharma submitted sick leave request", time: "1 hr ago", type: "leave" },
  { id: 3, text: "March payroll draft generated", time: "3 hrs ago", type: "payroll" },
  { id: 4, text: "Mohan Rajan comp-off approved by Manager", time: "Yesterday", type: "approval" },
  { id: 5, text: "Quarterly performance review cycle started", time: "2 days ago", type: "pms" },
]

const pendingCountFallback = leaveRequests.filter((r) => r.status === "pending").length

export function HRDashboard() {
  const { data: emps } = useApiData(
    "/hr/employees",
    employees,
    (raw: any) => {
      const arr = raw?.employees ?? raw
      if (!Array.isArray(arr)) return employees
      return arr.map((e: any) => ({
        ...snakeToCamel(e),
        dept: e.department || e.dept || "",
        role: e.designation || e.role || "",
        shift: e.shift || "General",
      })) as typeof employees
    }
  )

  const pendingCount = pendingCountFallback
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resources"
        description="Employee management, attendance, payroll and performance."
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer",
              "hover:text-foreground",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            {tab.label}
            {tab.id === "leave" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {pendingCount}
              </span>
            )}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab employees={emps} />}
      {activeTab === "attendance" && <Attendance />}
      {activeTab === "leave" && <LeaveManagement />}
      {activeTab === "payroll" && <Payroll />}
      {activeTab === "salary" && <SalaryStructure />}
      {activeTab === "tax" && <TaxDeclarations />}
      {activeTab === "holidays" && <Holidays />}
      {activeTab === "compliance" && <Compliance />}
      {activeTab === "performance" && <Performance />}
    </div>
  )
}

function OverviewTab({ employees: emps }: { employees: typeof employees }) {
  const presentToday = 6
  const onLeave = 1
  const totalEmployees = emps.length

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Employees"
          value={String(totalEmployees)}
          subtitle="Across 6 departments"
          icon={Users}
        />
        <KPICard
          title="Present Today"
          value={String(presentToday)}
          subtitle={`${((presentToday / totalEmployees) * 100).toFixed(0)}% attendance`}
          icon={UserCheck}
          iconColor="text-success"
        />
        <KPICard
          title="On Leave"
          value={String(onLeave)}
          subtitle="1 sick, 0 casual"
          icon={CalendarOff}
          iconColor="text-warning"
        />
        <KPICard
          title="Pending Requests"
          value={String(pendingCountFallback)}
          subtitle="Awaiting approval"
          icon={Clock}
          iconColor="text-info"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Department Breakdown */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Department Headcount</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentBreakdown.map((d) => (
              <div key={d.dept} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm">{d.dept}</span>
                </div>
                <span className="text-sm font-semibold">{d.count}</span>
              </div>
            ))}
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold">{totalEmployees}</span>
            </div>
          </CardContent>
        </Card>

        {/* Employee Directory */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employee Directory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {emps.slice(0, 6).map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(emp.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{emp.name}</p>
                  <p className="text-[11px] text-muted-foreground">{emp.role}</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {(emp.dept || "").split(" ")[0]}
                </Badge>
              </div>
            ))}
            {emps.length > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{emps.length - 6} more
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{item.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compliance KPIs */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PF Filed (March)</p>
              <p className="text-xl font-bold mt-1 text-warning">Pending</p>
              <p className="text-xs text-muted-foreground">Due: 15th Apr</p>
            </div>
            <Shield className="h-5 w-5 text-warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ESI Filed (March)</p>
              <p className="text-xl font-bold mt-1 text-warning">Pending</p>
              <p className="text-xs text-muted-foreground">Due: 15th Apr</p>
            </div>
            <Building2 className="h-5 w-5 text-warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">TDS Deposited</p>
              <p className="text-xl font-bold mt-1 text-success">Done</p>
              <p className="text-xs text-muted-foreground">Feb 2026 - 7th Mar</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance Rate</p>
              <p className="text-xl font-bold mt-1">87%</p>
              <p className="text-xs text-muted-foreground">FY 2025-26</p>
            </div>
            <Badge variant="success" className="text-[10px]">On Track</Badge>
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Tenure</p>
              <p className="text-xl font-bold mt-1">2.4 yrs</p>
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attrition Rate</p>
              <p className="text-xl font-bold mt-1">4.2%</p>
            </div>
            <Badge variant="success" className="text-[10px]">Low</Badge>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Training Compliance</p>
              <p className="text-xl font-bold mt-1">91%</p>
            </div>
            <Badge variant="warning" className="text-[10px]">3 overdue</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
