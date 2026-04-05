import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { employees, attendanceData, type AttendanceStatus } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"

const statusConfig: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  P: { label: "Present", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-500/15" },
  A: { label: "Absent", color: "text-red-700 dark:text-red-400", bg: "bg-red-500/15" },
  L: { label: "Leave", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-500/15" },
  WO: { label: "Week Off", color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-500/10" },
  H: { label: "Holiday", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-500/15" },
  CO: { label: "Comp Off", color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-500/15" },
  OT: { label: "Overtime", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-500/15" },
}

const days = Array.from({ length: 31 }, (_, i) => i + 1)

// Fill attendance for employees not in attendanceData
const fullAttendance: Record<string, AttendanceStatus[]> = {
  ...attendanceData,
  "emp-006": ["P","P","P","P","OT","P","WO","P","P","P","P","P","P","WO","P","P","P","P","P","A","WO","P","P","P","P","P","P","WO","P","P","P"],
  "emp-007": ["P","P","P","P","P","P","WO","P","P","P","P","P","L","WO","P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P"],
  "emp-008": ["P","P","P","P","P","OT","WO","P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","A","P","P","P","WO","P","P","P"],
}

export function Attendance() {
  const { data: emps } = useApiData(
    "/hr/employees",
    employees,
    (raw: any) => {
      const arr = raw?.employees ?? raw
      if (!Array.isArray(arr)) return employees
      return arr.map((e: any) => snakeToCamel(e)) as typeof employees
    }
  )

  const { data: attData } = useApiData(
    "/hr/attendance",
    fullAttendance,
    (raw: any) => {
      const arr = raw?.attendance ?? raw
      if (!Array.isArray(arr) && typeof raw === "object") return fullAttendance
      // If the API returns per-employee attendance data, merge it
      if (typeof raw === "object" && !Array.isArray(raw)) {
        const merged: Record<string, AttendanceStatus[]> = { ...fullAttendance }
        for (const [key, val] of Object.entries(raw)) {
          if (Array.isArray(val)) merged[key] = val as AttendanceStatus[]
        }
        return merged
      }
      return fullAttendance
    }
  )

  const [month] = useState("March 2026")

  // Summary counts
  const todayIdx = 28 // day 29 (0-indexed 28)
  let presentToday = 0
  let absentToday = 0
  let onLeaveToday = 0
  emps.forEach((emp) => {
    const status = attData[emp.id]?.[todayIdx]
    if (status === "P" || status === "OT") presentToday++
    else if (status === "A") absentToday++
    else if (status === "L" || status === "CO") onLeaveToday++
  })

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{month}</h2>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            data={emps.map((emp) => {
              const data = attData[emp.id] ?? []
              const presentDays = data.filter((s) => s === "P" || s === "OT").length
              const absentDays = data.filter((s) => s === "A").length
              const leaveDays = data.filter((s) => s === "L" || s === "CO").length
              return { name: emp.name, dept: emp.dept, present: presentDays, absent: absentDays, leave: leaveDays, total: 31 }
            })}
            columns={[
              { key: "name", label: "Employee" },
              { key: "dept", label: "Department" },
              { key: "present", label: "Present" },
              { key: "absent", label: "Absent" },
              { key: "leave", label: "Leave" },
              { key: "total", label: "Total Days" },
            ]}
            filename="attendance"
            title={`Attendance - ${month}`}
          />
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Today:</span>
          <Badge variant="success" className="text-[11px]">{presentToday} Present</Badge>
          <Badge variant="destructive" className="text-[11px]">{absentToday} Absent</Badge>
          <Badge variant="info" className="text-[11px]">{onLeaveToday} Leave</Badge>
        </div>
        <div className="h-4 w-px bg-border" />
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.entries(statusConfig) as [AttendanceStatus, typeof statusConfig["P"]][]).map(
            ([code, cfg]) => (
              <div key={code} className="flex items-center gap-1">
                <div className={cn("h-4 w-6 rounded text-[10px] font-semibold flex items-center justify-center", cfg.bg, cfg.color)}>
                  {code}
                </div>
                <span className="text-[11px] text-muted-foreground">{cfg.label}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 z-10 bg-card px-3 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[180px]">
                    Employee
                  </th>
                  {days.map((d) => (
                    <th
                      key={d}
                      className={cn(
                        "px-0.5 py-2.5 text-center text-xs font-medium text-muted-foreground min-w-[32px]",
                        d === 29 && "bg-primary/5"
                      )}
                    >
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground min-w-[48px]">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody>
                {emps.map((emp) => {
                  const data = attData[emp.id] ?? []
                  const presentDays = data.filter((s) => s === "P" || s === "OT").length

                  return (
                    <tr key={emp.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-card px-3 py-2">
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
                      {days.map((d) => {
                        const idx = d - 1
                        const status = data[idx] as AttendanceStatus | undefined
                        const cfg = status ? statusConfig[status] : null

                        return (
                          <td
                            key={d}
                            className={cn(
                              "px-0.5 py-2 text-center",
                              d === 29 && "bg-primary/5"
                            )}
                          >
                            {cfg ? (
                              <div
                                className={cn(
                                  "mx-auto h-6 w-7 rounded text-[10px] font-semibold flex items-center justify-center",
                                  cfg.bg,
                                  cfg.color
                                )}
                              >
                                {status}
                              </div>
                            ) : (
                              <div className="mx-auto h-6 w-7 rounded bg-muted/30 text-[10px] flex items-center justify-center text-muted-foreground">
                                --
                              </div>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center">
                        <span className="text-sm font-semibold">{presentDays}</span>
                        <span className="text-xs text-muted-foreground">/31</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Biometric Sync Status */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
              Biometric Sync Status
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7">
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium">Gate Biometric</p>
                <p className="text-[11px] text-muted-foreground">Last sync: 5 min ago</p>
              </div>
              <Badge variant="success" className="ml-auto text-[10px]">Online</Badge>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <div>
                <p className="text-sm font-medium">Factory Floor</p>
                <p className="text-[11px] text-muted-foreground">Last sync: 5 min ago</p>
              </div>
              <Badge variant="success" className="ml-auto text-[10px]">Online</Badge>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
              <AlertCircle className="h-4 w-4 text-warning shrink-0" />
              <div>
                <p className="text-sm font-medium">Canteen</p>
                <p className="text-[11px] text-muted-foreground">Last sync: 2 hrs ago</p>
              </div>
              <Badge variant="warning" className="ml-auto text-[10px]">Delayed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
