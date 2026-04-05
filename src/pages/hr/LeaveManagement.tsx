import { useState } from "react"
import {
  Check,
  X,
  CalendarDays,
  Clock,
  Filter,
  Calendar,
  Info,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { cn, getInitials } from "@/lib/utils"
import { useApiData, snakeToCamel } from "@/lib/useApi"
import { api } from "@/lib/api"

// ── Indian Leave Types ──

interface LeaveType {
  code: string
  name: string
  entitled: number
  unit: string
  carryForward: string
  rules: string
}

const indianLeaveTypes: LeaveType[] = [
  {
    code: "EL",
    name: "Earned Leave / Privilege Leave",
    entitled: 15,
    unit: "days/year",
    carryForward: "Yes, max 30 days",
    rules: "Accrued at 1.25 days/month. Can be encashed on separation. Min 3 days at a time.",
  },
  {
    code: "CL",
    name: "Casual Leave",
    entitled: 12,
    unit: "days/year",
    carryForward: "No",
    rules: "Cannot be combined with other leave. Max 3 consecutive days. Lapses at year end.",
  },
  {
    code: "SL",
    name: "Sick Leave",
    entitled: 10,
    unit: "days/year",
    carryForward: "Yes, max 20 days",
    rules: "Medical certificate required for > 2 consecutive days. Can be availed in half-day.",
  },
  {
    code: "ML",
    name: "Maternity Leave",
    entitled: 26,
    unit: "weeks",
    carryForward: "N/A",
    rules: "As per Maternity Benefit Act 2017. 26 weeks for first 2 children, 12 weeks thereafter. Paid leave.",
  },
  {
    code: "PL",
    name: "Paternity Leave",
    entitled: 15,
    unit: "days",
    carryForward: "No",
    rules: "Within 6 months of child birth. Continuous days only.",
  },
  {
    code: "CO",
    name: "Compensatory Off",
    entitled: 0,
    unit: "auto-generated",
    carryForward: "Expires in 90 days",
    rules: "Auto-generated when employee works on weekly off / holiday. Must be availed within 90 days.",
  },
  {
    code: "LOP",
    name: "Loss of Pay",
    entitled: 0,
    unit: "as needed",
    carryForward: "N/A",
    rules: "When all leave balances exhausted. Deducted from salary at per-day rate (monthly/26).",
  },
]

// ── Leave Balances per employee (FY 2025-26) ──

interface EmployeeLeaveBalance {
  empId: string
  name: string
  dept: string
  el: { entitled: number; used: number; balance: number; cf: number }
  cl: { entitled: number; used: number; balance: number }
  sl: { entitled: number; used: number; balance: number; cf: number }
  co: { entitled: number; used: number; balance: number }
  lop: number
}

const employeeLeaves: EmployeeLeaveBalance[] = [
  { empId: "EMP-001", name: "Ravi Kumar", dept: "SMT Production", el: { entitled: 15, used: 3, balance: 12, cf: 5 }, cl: { entitled: 12, used: 4, balance: 8 }, sl: { entitled: 10, used: 1, balance: 9, cf: 3 }, co: { entitled: 2, used: 0, balance: 2 }, lop: 0 },
  { empId: "EMP-002", name: "Priya Sharma", dept: "Quality", el: { entitled: 15, used: 5, balance: 10, cf: 8 }, cl: { entitled: 12, used: 6, balance: 6 }, sl: { entitled: 10, used: 3, balance: 7, cf: 2 }, co: { entitled: 0, used: 0, balance: 0 }, lop: 0 },
  { empId: "EMP-003", name: "Mohan Rajan", dept: "Store", el: { entitled: 15, used: 2, balance: 13, cf: 4 }, cl: { entitled: 12, used: 3, balance: 9 }, sl: { entitled: 10, used: 0, balance: 10, cf: 0 }, co: { entitled: 1, used: 1, balance: 0 }, lop: 1 },
  { empId: "EMP-004", name: "Arun Krishnan", dept: "Engineering", el: { entitled: 15, used: 8, balance: 7, cf: 10 }, cl: { entitled: 12, used: 5, balance: 7 }, sl: { entitled: 10, used: 2, balance: 8, cf: 5 }, co: { entitled: 0, used: 0, balance: 0 }, lop: 0 },
  { empId: "EMP-005", name: "Lakshmi Venkat", dept: "HR", el: { entitled: 15, used: 1, balance: 14, cf: 6 }, cl: { entitled: 12, used: 2, balance: 10 }, sl: { entitled: 10, used: 0, balance: 10, cf: 4 }, co: { entitled: 0, used: 0, balance: 0 }, lop: 0 },
  { empId: "EMP-006", name: "Suresh Babu", dept: "SMT Production", el: { entitled: 15, used: 4, balance: 11, cf: 3 }, cl: { entitled: 12, used: 7, balance: 5 }, sl: { entitled: 10, used: 4, balance: 6, cf: 1 }, co: { entitled: 3, used: 1, balance: 2 }, lop: 0 },
  { empId: "EMP-007", name: "Deepa Nair", dept: "Testing", el: { entitled: 15, used: 6, balance: 9, cf: 7 }, cl: { entitled: 12, used: 3, balance: 9 }, sl: { entitled: 10, used: 1, balance: 9, cf: 2 }, co: { entitled: 0, used: 0, balance: 0 }, lop: 0 },
  { empId: "EMP-008", name: "Karthik Raja", dept: "SMT Production", el: { entitled: 15, used: 2, balance: 13, cf: 4 }, cl: { entitled: 12, used: 4, balance: 8 }, sl: { entitled: 10, used: 0, balance: 10, cf: 0 }, co: { entitled: 1, used: 0, balance: 1 }, lop: 0 },
]

// ── Leave Requests ──

interface LeaveRequest {
  id: string
  employee: string
  type: string
  from: string
  to: string
  days: number
  status: "pending" | "approved" | "rejected"
  reason: string
  medCert?: boolean
}

const initialRequests: LeaveRequest[] = [
  { id: "lr-001", employee: "Ravi Kumar", type: "CL", from: "2026-04-02", to: "2026-04-04", days: 3, status: "pending", reason: "Family function" },
  { id: "lr-002", employee: "Priya Sharma", type: "SL", from: "2026-03-28", to: "2026-03-28", days: 1, status: "pending", reason: "Unwell - fever" },
  { id: "lr-003", employee: "Mohan Rajan", type: "CO", from: "2026-04-07", to: "2026-04-07", days: 1, status: "approved", reason: "Worked on Sunday Mar 22" },
  { id: "lr-004", employee: "Arun Krishnan", type: "EL", from: "2026-04-10", to: "2026-04-14", days: 3, status: "pending", reason: "Vacation to Ooty" },
  { id: "lr-005", employee: "Suresh Babu", type: "SL", from: "2026-03-25", to: "2026-03-27", days: 3, status: "approved", reason: "Dental surgery", medCert: true },
  { id: "lr-006", employee: "Deepa Nair", type: "CL", from: "2026-04-14", to: "2026-04-14", days: 1, status: "approved", reason: "Personal work" },
]

// ── Holiday Calendar (National + TN State) ──

interface Holiday {
  date: string
  name: string
  type: "national" | "state" | "restricted"
}

const holidays2026: Holiday[] = [
  { date: "2026-01-14", name: "Pongal", type: "state" },
  { date: "2026-01-15", name: "Thiruvalluvar Day", type: "state" },
  { date: "2026-01-26", name: "Republic Day", type: "national" },
  { date: "2026-03-17", name: "Holi", type: "restricted" },
  { date: "2026-03-30", name: "Ramadan (Eid-ul-Fitr)", type: "national" },
  { date: "2026-04-06", name: "Mahavir Jayanti", type: "restricted" },
  { date: "2026-04-10", name: "Good Friday", type: "national" },
  { date: "2026-04-14", name: "Dr. Ambedkar Jayanti / Tamil New Year", type: "national" },
  { date: "2026-05-01", name: "May Day / Labour Day", type: "national" },
  { date: "2026-05-25", name: "Buddha Purnima", type: "national" },
  { date: "2026-06-06", name: "Eid-ul-Adha (Bakrid)", type: "national" },
  { date: "2026-07-06", name: "Muharram", type: "national" },
  { date: "2026-08-15", name: "Independence Day", type: "national" },
  { date: "2026-08-26", name: "Janmashtami", type: "national" },
  { date: "2026-09-04", name: "Milad-un-Nabi", type: "restricted" },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "national" },
  { date: "2026-10-20", name: "Dussehra (Vijayadashami)", type: "national" },
  { date: "2026-10-29", name: "Ayudha Pooja", type: "state" },
  { date: "2026-11-08", name: "Diwali (Deepavali)", type: "national" },
  { date: "2026-11-10", name: "Diwali Holiday", type: "state" },
  { date: "2026-12-25", name: "Christmas", type: "national" },
]

const leaveTypeLabels: Record<string, string> = {
  EL: "Earned Leave",
  CL: "Casual Leave",
  SL: "Sick Leave",
  CO: "Comp Off",
  ML: "Maternity",
  PL: "Paternity",
  LOP: "Loss of Pay",
}

// ── Component ──

export function LeaveManagement() {
  const { data: requests, refetch } = useApiData<LeaveRequest[]>(
    "/hr/leave-requests",
    initialRequests,
    (raw: any) => {
      const arr = raw?.leave_requests ?? raw
      if (!Array.isArray(arr)) return initialRequests
      return arr.map((r: any) => {
        const c = snakeToCamel(r)
        return {
          id: c.id ?? "",
          employee: c.employee ?? c.employeeName ?? "",
          type: c.type ?? c.leaveType ?? "",
          from: c.from ?? c.fromDate ?? "",
          to: c.to ?? c.toDate ?? "",
          days: c.days ?? 1,
          status: c.status ?? "pending",
          reason: c.reason ?? "",
          medCert: c.medCert ?? false,
        } as LeaveRequest
      })
    }
  )
  const [activeView, setActiveView] = useState<"requests" | "balances" | "holidays" | "policy">("requests")

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  const handleApprove = async (id: string) => {
    await api.patch(`/hr/leave-requests/${id}/approve`).catch(() => {})
    refetch()
  }

  const handleReject = async (id: string) => {
    await api.patch(`/hr/leave-requests/${id}/reject`).catch(() => {})
    refetch()
  }

  const today = new Date(2026, 2, 29)
  const upcomingHolidays = holidays2026.filter((h) => new Date(h.date) >= today).slice(0, 5)


  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Requests</p>
          <p className="text-2xl font-bold mt-1">{pendingRequests.length}</p>
          <p className="text-xs text-muted-foreground">Awaiting action</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved (March)</p>
          <p className="text-2xl font-bold mt-1">
            {processedRequests.filter((r) => r.status === "approved").length + 4}
          </p>
          <p className="text-xs text-muted-foreground">This month</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">On Leave Today</p>
          <p className="text-2xl font-bold mt-1">1</p>
          <p className="text-xs text-muted-foreground">Priya Sharma (SL)</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Leave Usage</p>
          <p className="text-2xl font-bold mt-1">22%</p>
          <p className="text-xs text-muted-foreground">Of annual entitlement</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Holidays Left</p>
          <p className="text-2xl font-bold mt-1">{holidays2026.filter(h => new Date(h.date) >= today).length}</p>
          <p className="text-xs text-muted-foreground">FY 2025-26 remaining</p>
        </Card>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 border-b">
        {[
          { id: "requests" as const, label: "Leave Requests" },
          { id: "balances" as const, label: "Leave Balances" },
          { id: "holidays" as const, label: "Holiday Calendar" },
          { id: "policy" as const, label: "Leave Policy" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer",
              "hover:text-foreground",
              activeView === tab.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {tab.label}
            {tab.id === "requests" && pendingRequests.length > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {pendingRequests.length}
              </span>
            )}
            {activeView === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Leave Requests View */}
      {activeView === "requests" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Team Requests
              </h3>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <Card key={req.id} className="border-warning/30 bg-warning/[0.02]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold mt-0.5">
                            {getInitials(req.employee)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{req.employee}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {leaveTypeLabels[req.type] || req.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {req.days} day{req.days > 1 ? "s" : ""}
                              </span>
                              {req.medCert && (
                                <Badge variant="outline" className="text-[10px] bg-info/10 text-info border-0">
                                  Med. Cert
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                              <CalendarDays className="h-3 w-3" />
                              {req.from === req.to ? req.from : `${req.from} to ${req.to}`}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Reason: {req.reason}
                            </p>
                            {req.type === "SL" && req.days > 2 && !req.medCert && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-warning">
                                <AlertCircle className="h-3 w-3" />
                                Medical certificate required for &gt;2 days sick leave
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleReject(req.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-success hover:bg-success/90 text-white"
                            onClick={() => handleApprove(req.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Check className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending leave requests.</p>
                </CardContent>
              </Card>
            )}

            {/* Processed Requests */}
            {processedRequests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Recently Processed</h4>
                {processedRequests.map((req) => (
                  <Card key={req.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-semibold">
                            {getInitials(req.employee)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{req.employee}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {leaveTypeLabels[req.type] || req.type} - {req.days} day{req.days > 1 ? "s" : ""} ({req.from})
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Upcoming Absences & Holidays */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Absences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Ravi Kumar", dates: "Apr 2-4", type: "CL", days: 3 },
                  { name: "Arun Krishnan", dates: "Apr 10-14", type: "EL", days: 3 },
                  { name: "Deepa Nair", dates: "Apr 14", type: "CL", days: 1 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[9px] font-semibold">
                        {getInitials(item.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.dates}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {leaveTypeLabels[item.type]} ({item.days}d)
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Next Holidays
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingHolidays.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div>
                      <p className="text-sm font-medium">{h.name}</p>
                      <p className="text-[10px] text-muted-foreground">{h.date}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] border-0",
                        h.type === "national" && "bg-success/10 text-success",
                        h.type === "state" && "bg-info/10 text-info",
                        h.type === "restricted" && "bg-muted text-muted-foreground"
                      )}
                    >
                      {h.type === "national" ? "Gazetted" : h.type === "state" ? "TN State" : "Restricted"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Leave Balances View */}
      {activeView === "balances" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground" colSpan={3}>
                      <span className="text-info">Earned Leave (15)</span>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground" colSpan={2}>
                      <span className="text-warning">Casual Leave (12)</span>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground" colSpan={3}>
                      <span className="text-success">Sick Leave (10)</span>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground" colSpan={2}>
                      <span className="text-primary">Comp Off</span>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-muted-foreground">LOP</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground font-semibold">Total Bal.</th>
                  </tr>
                  <tr className="border-b bg-muted/30">
                    <th className="sticky left-0 z-10 bg-muted/30 px-4 py-1.5 text-left text-[10px] text-muted-foreground" />
                    {/* EL */}
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Used</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Bal</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">CF</th>
                    {/* CL */}
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Used</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Bal</th>
                    {/* SL */}
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Used</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Bal</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">CF</th>
                    {/* CO */}
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Earned</th>
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Bal</th>
                    {/* LOP */}
                    <th className="px-2 py-1.5 text-center text-[10px] text-muted-foreground">Days</th>
                    <th className="px-3 py-1.5 text-center text-[10px] text-muted-foreground" />
                  </tr>
                </thead>
                <tbody>
                  {employeeLeaves.map((emp) => {
                    const totalBalance = emp.el.balance + emp.cl.balance + emp.sl.balance + emp.co.balance
                    return (
                      <tr key={emp.empId} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-card px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
                              {getInitials(emp.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{emp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{emp.dept}</p>
                            </div>
                          </div>
                        </td>
                        {/* EL */}
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{emp.el.used}</td>
                        <td className="px-2 py-3 text-center tabular-nums">
                          <BalancePill value={emp.el.balance} max={15} />
                        </td>
                        <td className="px-2 py-3 text-center tabular-nums text-xs text-muted-foreground">{emp.el.cf}</td>
                        {/* CL */}
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{emp.cl.used}</td>
                        <td className="px-2 py-3 text-center tabular-nums">
                          <BalancePill value={emp.cl.balance} max={12} />
                        </td>
                        {/* SL */}
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{emp.sl.used}</td>
                        <td className="px-2 py-3 text-center tabular-nums">
                          <BalancePill value={emp.sl.balance} max={10} />
                        </td>
                        <td className="px-2 py-3 text-center tabular-nums text-xs text-muted-foreground">{emp.sl.cf}</td>
                        {/* CO */}
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{emp.co.entitled}</td>
                        <td className="px-2 py-3 text-center tabular-nums">
                          {emp.co.balance > 0 ? (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold px-2 bg-primary/10 text-primary">
                              {emp.co.balance}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        {/* LOP */}
                        <td className="px-2 py-3 text-center tabular-nums">
                          {emp.lop > 0 ? (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold px-2 bg-destructive/10 text-destructive">
                              {emp.lop}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center tabular-nums font-bold">{totalBalance}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Calendar View */}
      {activeView === "holidays" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">2026 Holiday Calendar - National + Tamil Nadu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Holiday</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays2026.map((h, i) => {
                    const isPast = new Date(h.date) < today
                    return (
                      <tr key={i} className={cn(
                        "border-b last:border-0 hover:bg-accent/30 transition-colors",
                        isPast && "opacity-50"
                      )}>
                        <td className="px-4 py-2.5 tabular-nums">{h.date}</td>
                        <td className="px-3 py-2.5 font-medium">{h.name}</td>
                        <td className="px-3 py-2.5 text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] border-0",
                              h.type === "national" && "bg-success/10 text-success",
                              h.type === "state" && "bg-info/10 text-info",
                              h.type === "restricted" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {h.type === "national" ? "Gazetted" : h.type === "state" ? "TN State" : "Restricted"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-3">Holiday Summary - 2026</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">National / Gazetted</span>
                  <span className="font-semibold">{holidays2026.filter(h => h.type === "national").length} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamil Nadu State</span>
                  <span className="font-semibold">{holidays2026.filter(h => h.type === "state").length} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Restricted</span>
                  <span className="font-semibold">{holidays2026.filter(h => h.type === "restricted").length} days</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Holidays</span>
                  <span>{holidays2026.length} days</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm font-semibold mb-2">Weekly Off</h4>
              <p className="text-sm text-muted-foreground">
                Sunday - All employees. Second Saturday - General shift employees only.
              </p>
              <Separator className="my-3" />
              <h4 className="text-sm font-semibold mb-2">Shift Timings</h4>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>General Shift: 09:00 AM - 06:00 PM</p>
                <p>Shift A: 06:00 AM - 02:00 PM</p>
                <p>Shift B: 02:00 PM - 10:00 PM</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Leave Policy View */}
      {activeView === "policy" && (
        <div className="space-y-4">
          {indianLeaveTypes.map((lt) => (
            <Card key={lt.code}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{lt.code}</Badge>
                      <h4 className="text-sm font-semibold">{lt.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{lt.rules}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-lg font-bold">{lt.entitled > 0 ? lt.entitled : "-"}</p>
                    <p className="text-[10px] text-muted-foreground">{lt.unit}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Carry Forward: {lt.carryForward}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-info/30 bg-info/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Leave Year</p>
                <p>Financial Year: 1st April to 31st March. Leave balances reset on 1st April except carry-forward eligible leaves.</p>
                <p>As per Tamil Nadu Shops & Establishments Act and Factories Act, 1948.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── Helper Component ──

function BalancePill({ value, max }: { value: number; max: number }) {
  const ratio = value / max
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold px-2",
        ratio <= 0.2
          ? "bg-destructive/10 text-destructive"
          : ratio <= 0.4
          ? "bg-warning/10 text-warning"
          : "bg-success/10 text-success"
      )}
    >
      {value}
    </span>
  )
}
