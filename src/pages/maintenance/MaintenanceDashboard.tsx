import { useState } from "react"
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  Gauge,
  ChevronDown,
  ChevronRight,
  Settings,
  Activity,
  Package,
  History,
  Shield,
  Timer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { cn } from "@/lib/utils"
import { useApiData, transformList } from "@/lib/useApi"

// ─── Tabs ───
const tabs = [
  { id: "equipment", label: "Equipment", icon: Settings },
  { id: "pm-schedule", label: "PM Schedule", icon: Calendar },
  { id: "calibration", label: "Calibration", icon: Shield },
  { id: "spare-parts", label: "Spare Parts", icon: Package },
  { id: "history", label: "History", icon: History },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Mock Data: Equipment ───
const equipmentList = [
  { id: "EQ-001", name: "Reflow Oven 1", type: "Reflow" as const, serial: "RO-2022-0041", manufacturer: "Heller", installDate: "2022-03-15", status: "operational" as const, location: "Line 1", usageHours: 12400, history: [
    { date: "2026-03-15", type: "PM", desc: "Monthly belt tension check", tech: "Ravi K" },
    { date: "2026-02-10", type: "Breakdown", desc: "Heater zone 3 element replaced", tech: "Suresh M" },
  ]},
  { id: "EQ-002", name: "Pick & Place 1", type: "SMT" as const, serial: "PP-2021-1187", manufacturer: "Fuji", installDate: "2021-06-20", status: "operational" as const, location: "Line 1", usageHours: 8900, history: [
    { date: "2026-03-20", type: "PM", desc: "Nozzle inspection & cleaning", tech: "Amit P" },
  ]},
  { id: "EQ-003", name: "AOI-1", type: "AOI" as const, serial: "AOI-2023-0056", manufacturer: "Koh Young", installDate: "2023-01-10", status: "maintenance" as const, location: "Line 1", usageHours: 4500, history: [
    { date: "2026-03-28", type: "Calibration", desc: "Camera recalibration in progress", tech: "Deepak S" },
  ]},
  { id: "EQ-004", name: "SPI-1", type: "SPI" as const, serial: "SPI-2023-0112", manufacturer: "Koh Young", installDate: "2023-02-05", status: "operational" as const, location: "Line 1", usageHours: 2000, history: [] },
  { id: "EQ-005", name: "ICT-1", type: "ICT" as const, serial: "ICT-2022-0078", manufacturer: "Keysight", installDate: "2022-08-12", status: "operational" as const, location: "Test Bay", usageHours: 1200, history: [] },
  { id: "EQ-006", name: "Reflow Oven 2", type: "Reflow" as const, serial: "RO-2023-0089", manufacturer: "Heller", installDate: "2023-05-01", status: "operational" as const, location: "Line 2", usageHours: 9800, history: [] },
  { id: "EQ-007", name: "Wave Solder 1", type: "Wave" as const, serial: "WS-2021-0033", manufacturer: "ERSA", installDate: "2021-09-10", status: "down" as const, location: "Line 2", usageHours: 6700, history: [
    { date: "2026-03-27", type: "Breakdown", desc: "Solder pot pump failure - awaiting parts", tech: "Ravi K" },
  ]},
  { id: "EQ-008", name: "Pick & Place 2", type: "SMT" as const, serial: "PP-2023-0201", manufacturer: "Fuji", installDate: "2023-07-15", status: "operational" as const, location: "Line 2", usageHours: 5200, history: [] },
]

// ─── Mock Data: PM Schedule ───
const pmSchedule = [
  { id: "PM-101", equipment: "Reflow Oven 1", pmType: "Daily" as const, lastDone: "2026-03-28", nextDue: "2026-03-29", assignedTo: "Ravi K", status: "due" as const },
  { id: "PM-102", equipment: "Pick & Place 1", pmType: "Weekly" as const, lastDone: "2026-03-22", nextDue: "2026-03-29", assignedTo: "Amit P", status: "due" as const },
  { id: "PM-103", equipment: "AOI-1", pmType: "Monthly" as const, lastDone: "2026-02-28", nextDue: "2026-03-28", assignedTo: "Deepak S", status: "overdue" as const },
  { id: "PM-104", equipment: "SPI-1", pmType: "Monthly" as const, lastDone: "2026-03-10", nextDue: "2026-04-10", assignedTo: "Suresh M", status: "ok" as const },
  { id: "PM-105", equipment: "ICT-1", pmType: "Weekly" as const, lastDone: "2026-03-25", nextDue: "2026-04-01", assignedTo: "Deepak S", status: "ok" as const },
  { id: "PM-106", equipment: "Reflow Oven 2", pmType: "Daily" as const, lastDone: "2026-03-28", nextDue: "2026-03-29", assignedTo: "Ravi K", status: "due" as const },
  { id: "PM-107", equipment: "Wave Solder 1", pmType: "Annual" as const, lastDone: "2025-09-15", nextDue: "2026-03-15", assignedTo: "Ravi K", status: "overdue" as const },
  { id: "PM-108", equipment: "Pick & Place 2", pmType: "Monthly" as const, lastDone: "2026-03-01", nextDue: "2026-04-01", assignedTo: "Amit P", status: "ok" as const },
  { id: "PM-109", equipment: "Reflow Oven 1", pmType: "Annual" as const, lastDone: "2025-06-15", nextDue: "2026-06-15", assignedTo: "Ravi K", status: "ok" as const },
]

// ─── Mock Data: Calibration ───
const calibrationItems = [
  { id: "CAL-001", name: "AOI-1 Camera System", type: "Camera Calibration", range: "0.01mm - 50mm", accuracy: "0.005mm", lastCal: "2026-01-02", nextDue: "2026-04-02", certificate: "CAL-CERT-2026-0041", status: "due" as const },
  { id: "CAL-002", name: "SPI-1 Height Sensor", type: "Height Sensor", range: "0 - 2mm", accuracy: "0.001mm", lastCal: "2026-01-10", nextDue: "2026-04-10", certificate: "CAL-CERT-2026-0042", status: "ok" as const },
  { id: "CAL-003", name: "ICT-1 Probe Fixture", type: "Probe Verification", range: "0.1ohm - 10Mohm", accuracy: "0.1%", lastCal: "2025-12-28", nextDue: "2026-03-28", certificate: "CAL-CERT-2025-0198", status: "overdue" as const },
  { id: "CAL-004", name: "Reflow Oven 1 Thermocouple", type: "Thermocouple Cal", range: "0 - 350C", accuracy: "0.5C", lastCal: "2026-01-15", nextDue: "2026-04-15", certificate: "CAL-CERT-2026-0045", status: "ok" as const },
  { id: "CAL-005", name: "Pick & Place 1 Nozzles", type: "Nozzle Alignment", range: "0.01mm placement", accuracy: "0.025mm", lastCal: "2026-03-01", nextDue: "2026-04-01", certificate: "CAL-CERT-2026-0060", status: "due" as const },
  { id: "CAL-006", name: "Multimeter Fluke 87V", type: "Electrical Cal", range: "0-1000V / 0-10A", accuracy: "0.05%", lastCal: "2026-02-15", nextDue: "2026-08-15", certificate: "CAL-CERT-2026-0055", status: "ok" as const },
  { id: "CAL-007", name: "Oscilloscope Keysight", type: "Signal Verification", range: "DC - 200MHz", accuracy: "1.5%", lastCal: "2025-11-10", nextDue: "2026-05-10", certificate: "CAL-CERT-2025-0180", status: "ok" as const },
]

// ─── Mock Data: Spare Parts ───
const spareParts = [
  { id: "SP-001", name: "Reflow Heater Element", compatibleEquipment: "Reflow Oven 1, 2", stock: 3, reorderPoint: 2, lastUsed: "2026-02-10", supplier: "Heller Spares", unitCost: 12500 },
  { id: "SP-002", name: "Nozzle Set 0402", compatibleEquipment: "Pick & Place 1, 2", stock: 8, reorderPoint: 5, lastUsed: "2026-03-20", supplier: "Fuji Parts", unitCost: 3200 },
  { id: "SP-003", name: "Nozzle Set 0805", compatibleEquipment: "Pick & Place 1, 2", stock: 6, reorderPoint: 5, lastUsed: "2026-03-18", supplier: "Fuji Parts", unitCost: 2800 },
  { id: "SP-004", name: "Conveyor Belt", compatibleEquipment: "Reflow Oven 1, 2", stock: 1, reorderPoint: 2, lastUsed: "2025-12-05", supplier: "Heller Spares", unitCost: 45000 },
  { id: "SP-005", name: "Solder Pot Pump", compatibleEquipment: "Wave Solder 1", stock: 0, reorderPoint: 1, lastUsed: "2026-03-27", supplier: "ERSA Service", unitCost: 28000 },
  { id: "SP-006", name: "AOI Camera Module", compatibleEquipment: "AOI-1", stock: 1, reorderPoint: 1, lastUsed: "2025-08-15", supplier: "Koh Young", unitCost: 85000 },
  { id: "SP-007", name: "ICT Probe Pin Set", compatibleEquipment: "ICT-1", stock: 12, reorderPoint: 10, lastUsed: "2026-03-15", supplier: "Keysight Parts", unitCost: 450 },
  { id: "SP-008", name: "Flux Spray Nozzle", compatibleEquipment: "Wave Solder 1", stock: 4, reorderPoint: 3, lastUsed: "2026-01-20", supplier: "ERSA Service", unitCost: 6500 },
]

// ─── Mock Data: History ───
const maintenanceHistory = [
  { id: "MH-001", date: "2026-03-28", equipment: "AOI-1", type: "Calibration" as const, duration: "2h", technician: "Deepak S", partsUsed: "None", cost: 0, notes: "Camera recalibration - in progress" },
  { id: "MH-002", date: "2026-03-27", equipment: "Wave Solder 1", type: "Breakdown" as const, duration: "4h", technician: "Ravi K", partsUsed: "Solder Pot Pump", cost: 28000, notes: "Pump seized, replacement ordered" },
  { id: "MH-003", date: "2026-03-25", equipment: "Pick & Place 1", type: "PM" as const, duration: "1h", technician: "Amit P", partsUsed: "None", cost: 0, notes: "Weekly nozzle inspection - all OK" },
  { id: "MH-004", date: "2026-03-22", equipment: "Reflow Oven 1", type: "PM" as const, duration: "30m", technician: "Ravi K", partsUsed: "None", cost: 0, notes: "Daily profile check completed" },
  { id: "MH-005", date: "2026-03-20", equipment: "Pick & Place 1", type: "PM" as const, duration: "45m", technician: "Amit P", partsUsed: "Nozzle Set 0402 x2", cost: 6400, notes: "Replaced worn 0402 nozzles" },
  { id: "MH-006", date: "2026-03-15", equipment: "Reflow Oven 1", type: "PM" as const, duration: "2h", technician: "Ravi K", partsUsed: "None", cost: 0, notes: "Monthly belt tension and zone calibration" },
  { id: "MH-007", date: "2026-03-15", equipment: "ICT-1", type: "PM" as const, duration: "1.5h", technician: "Deepak S", partsUsed: "ICT Probe Pin Set x1", cost: 450, notes: "Replaced 8 worn probe pins" },
  { id: "MH-008", date: "2026-03-10", equipment: "SPI-1", type: "Calibration" as const, duration: "1h", technician: "Suresh M", partsUsed: "None", cost: 0, notes: "Quarterly calibration - passed" },
  { id: "MH-009", date: "2026-02-28", equipment: "AOI-1", type: "PM" as const, duration: "1.5h", technician: "Deepak S", partsUsed: "None", cost: 0, notes: "Monthly camera alignment check" },
  { id: "MH-010", date: "2026-02-10", equipment: "Reflow Oven 1", type: "Breakdown" as const, duration: "6h", technician: "Suresh M", partsUsed: "Reflow Heater Element x1", cost: 12500, notes: "Zone 3 heater element failed, replaced" },
]

const statusEquipmentBg: Record<string, string> = {
  operational: "",
  maintenance: "border-amber-200 bg-amber-500/5",
  down: "border-red-200 bg-red-500/5",
}

const statusEquipmentIcon: Record<string, React.ReactNode> = {
  operational: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  maintenance: <Clock className="h-4 w-4 text-amber-500" />,
  down: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

const typeColorMap: Record<string, string> = {
  PM: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Breakdown: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  Calibration: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
}

export function MaintenanceDashboard() {
  const { data: equipment } = useApiData("/maintenance/equipment", equipmentList, (raw: any) =>
    transformList(raw?.equipment ?? [], undefined) as typeof equipmentList
  )
  const [activeTab, setActiveTab] = useState<TabId>("equipment")
  const [expandedEquipment, setExpandedEquipment] = useState<string | null>(null)

  // KPI calculations
  const operationalCount = equipment.filter((e) => e.status === "operational").length
  const downCount = equipment.filter((e) => e.status === "down").length
  const overduePMs = pmSchedule.filter((p) => p.status === "overdue").length
  const calDue = calibrationItems.filter((c) => c.status === "due" || c.status === "overdue").length
  const uptimePct = ((operationalCount / equipment.length) * 100).toFixed(1)
  const mtbfHours = 720 // mock: avg hours between failures

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Preventive maintenance schedules, equipment status, calibration tracking, and spare parts."
        action={{ label: "Schedule PM", icon: Wrench }}
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard title="Equipment Count" value={String(equipment.length)} subtitle={`${downCount} down`} icon={Gauge} color="teal" />
        <KPICard title="Overdue PMs" value={String(overduePMs)} subtitle="Requires attention" icon={AlertTriangle} iconColor="text-red-500" color="orange" />
        <KPICard title="Calibration Due" value={String(calDue)} subtitle="Due or overdue" icon={Shield} iconColor="text-amber-500" color="purple" />
        <KPICard title="MTBF" value={`${mtbfHours} hrs`} subtitle="Mean time between failures" icon={Timer} color="blue" />
        <KPICard title="Equipment Uptime" value={`${uptimePct}%`} subtitle={`${operationalCount}/${equipment.length} operational`} icon={Activity} color="green" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-slate-600 border hover:bg-teal-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "equipment" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Equipment Master List</CardTitle>
              <div className="flex items-center gap-2">
                <ExportButtons
                  data={equipment.map((eq) => ({ id: eq.id, name: eq.name, type: eq.type, serial: eq.serial, manufacturer: eq.manufacturer, installDate: eq.installDate, status: eq.status, location: eq.location, usageHours: `${eq.usageHours.toLocaleString()} hrs` }))}
                  columns={[
                    { key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "type", label: "Type" },
                    { key: "serial", label: "Serial #" }, { key: "manufacturer", label: "Manufacturer" },
                    { key: "installDate", label: "Install Date" }, { key: "status", label: "Status" },
                    { key: "location", label: "Location" }, { key: "usageHours", label: "Usage" },
                  ]}
                  filename="equipment-master"
                  title="Equipment Master List"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Operational</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Maintenance</div>
                  <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Down</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {equipment.map((eq) => (
                <div key={eq.id}>
                  <div
                    onClick={() => setExpandedEquipment(expandedEquipment === eq.id ? null : eq.id)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50 cursor-pointer",
                      statusEquipmentBg[eq.status]
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {expandedEquipment === eq.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      {statusEquipmentIcon[eq.status]}
                      <div>
                        <p className="text-sm font-medium">{eq.name}</p>
                        <p className="text-xs text-muted-foreground">{eq.type} &middot; {eq.serial} &middot; {eq.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-xs font-medium">{eq.location}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Install Date</p>
                        <p className="text-xs font-medium tabular-nums">{eq.installDate}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Usage</p>
                        <p className="text-xs font-medium tabular-nums">{eq.usageHours.toLocaleString()} hrs</p>
                      </div>
                      <StatusBadge status={eq.status} />
                    </div>
                  </div>
                  {expandedEquipment === eq.id && (
                    <div className="ml-12 mr-4 mt-1 mb-2 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Maintenance History</p>
                      {eq.history.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No recent maintenance records.</p>
                      ) : (
                        <div className="space-y-2">
                          {eq.history.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs">
                              <span className="font-mono tabular-nums text-muted-foreground w-20">{h.date}</span>
                              <Badge variant="outline" className={cn("text-xs", typeColorMap[h.type])}>{h.type}</Badge>
                              <span className="flex-1">{h.desc}</span>
                              <span className="text-muted-foreground">{h.tech}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "pm-schedule" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">Preventive Maintenance Schedule</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Auto-block production when PM is overdue</p>
              </div>
              <ExportButtons
                data={pmSchedule.map((p) => ({ id: p.id, equipment: p.equipment, pmType: p.pmType, lastDone: p.lastDone, nextDue: p.nextDue, assignedTo: p.assignedTo, status: p.status }))}
                columns={[
                  { key: "id", label: "PM #" }, { key: "equipment", label: "Equipment" }, { key: "pmType", label: "PM Type" },
                  { key: "lastDone", label: "Last Done" }, { key: "nextDue", label: "Next Due" },
                  { key: "assignedTo", label: "Assigned To" }, { key: "status", label: "Status" },
                ]}
                filename="pm-schedule"
                title="PM Schedule"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar-like month view header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {/* Simple week view around current date */}
              {[24, 25, 26, 27, 28, 29, 30].map((day) => {
                const dayPMs = pmSchedule.filter((p) => p.nextDue === `2026-03-${String(day).padStart(2, "0")}`)
                const hasOverdue = dayPMs.some((p) => p.status === "overdue")
                const hasDue = dayPMs.some((p) => p.status === "due")
                return (
                  <div
                    key={day}
                    className={cn(
                      "rounded-lg border p-2 text-center min-h-[60px]",
                      day === 29 ? "border-teal-500 bg-teal-50 dark:bg-teal-950" : "",
                      hasOverdue ? "border-red-300" : hasDue ? "border-amber-300" : ""
                    )}
                  >
                    <span className={cn("text-xs font-medium", day === 29 ? "text-teal-700 dark:text-teal-400" : "")}>{day}</span>
                    {dayPMs.map((pm) => (
                      <div key={pm.id} className={cn("text-[10px] mt-1 rounded px-1 truncate",
                        pm.status === "overdue" ? "bg-red-100 text-red-700" : pm.status === "due" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {pm.equipment.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <Separator className="my-4" />

            {/* PM Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Equipment", "PM Type", "Last Done", "Next Due", "Assigned To", "Status", "Block"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pmSchedule.map((pm) => (
                    <tr key={pm.id} className={cn("border-b border-border/50 hover:bg-accent/50 transition-colors",
                      pm.status === "overdue" ? "bg-red-500/5" : ""
                    )}>
                      <td className="py-3 px-3 font-medium">{pm.equipment}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs">{pm.pmType}</Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{pm.lastDone}</td>
                      <td className={cn("py-3 px-3 font-mono text-xs font-medium",
                        pm.status === "overdue" ? "text-red-600" : pm.status === "due" ? "text-amber-600" : "text-foreground"
                      )}>{pm.nextDue}</td>
                      <td className="py-3 px-3 text-muted-foreground">{pm.assignedTo}</td>
                      <td className="py-3 px-3"><StatusBadge status={pm.status} /></td>
                      <td className="py-3 px-3">
                        {pm.status === "overdue" && (
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Production Blocked
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "calibration" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Calibration Instruments</CardTitle>
              <div className="flex items-center gap-2">
                <ExportButtons
                  data={calibrationItems.map((c) => ({ id: c.id, name: c.name, type: c.type, range: c.range, accuracy: c.accuracy, lastCal: c.lastCal, nextDue: c.nextDue, certificate: c.certificate, status: c.status }))}
                  columns={[
                    { key: "name", label: "Instrument" }, { key: "type", label: "Cal Type" }, { key: "range", label: "Range" },
                    { key: "accuracy", label: "Accuracy" }, { key: "lastCal", label: "Last Cal" },
                    { key: "nextDue", label: "Next Due" }, { key: "certificate", label: "Certificate #" }, { key: "status", label: "Status" },
                  ]}
                  filename="calibration"
                  title="Calibration Schedule"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Instrument", "Cal Type", "Range", "Accuracy", "Last Cal", "Next Due", "Certificate #", "Status", "Upload"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calibrationItems.map((item) => (
                    <tr key={item.id} className={cn("border-b border-border/50 hover:bg-accent/50 transition-colors",
                      item.status === "overdue" ? "bg-red-500/5" : item.status === "due" ? "bg-amber-500/5" : ""
                    )}>
                      <td className="py-3 px-3 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-muted-foreground">{item.type}</td>
                      <td className="py-3 px-3 font-mono text-xs">{item.range}</td>
                      <td className="py-3 px-3 font-mono text-xs">{item.accuracy}</td>
                      <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{item.lastCal}</td>
                      <td className={cn("py-3 px-3 font-mono text-xs font-medium",
                        item.status === "overdue" ? "text-red-600" : item.status === "due" ? "text-amber-600" : "text-foreground"
                      )}>{item.nextDue}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs text-muted-foreground">{item.certificate}</span>
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={item.status} /></td>
                      <td className="py-3 px-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Upload Cert
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "spare-parts" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Spare Parts Inventory</CardTitle>
              <ExportButtons
                data={spareParts.map((sp) => ({ id: sp.id, name: sp.name, compatibleEquipment: sp.compatibleEquipment, stock: sp.stock, reorderPoint: sp.reorderPoint, lastUsed: sp.lastUsed, supplier: sp.supplier, unitCost: sp.unitCost }))}
                columns={[
                  { key: "name", label: "Part Name" }, { key: "compatibleEquipment", label: "Compatible Equipment" },
                  { key: "stock", label: "Stock" }, { key: "reorderPoint", label: "Reorder Point" },
                  { key: "lastUsed", label: "Last Used" }, { key: "supplier", label: "Supplier" }, { key: "unitCost", label: "Unit Cost" },
                ]}
                filename="spare-parts"
                title="Spare Parts Inventory"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Low stock alert */}
            {spareParts.filter((sp) => sp.stock <= sp.reorderPoint).length > 0 && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock Alert: {spareParts.filter((sp) => sp.stock <= sp.reorderPoint).length} parts at or below reorder point
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {spareParts.filter((sp) => sp.stock <= sp.reorderPoint).map((sp) => (
                    <Badge key={sp.id} variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                      {sp.name} ({sp.stock}/{sp.reorderPoint})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Part Name", "Compatible Equipment", "Stock", "Reorder Pt", "Last Used", "Supplier", "Unit Cost"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spareParts.map((sp) => {
                    const isLow = sp.stock <= sp.reorderPoint
                    return (
                      <tr key={sp.id} className={cn("border-b border-border/50 hover:bg-accent/50 transition-colors",
                        isLow ? "bg-red-500/5" : ""
                      )}>
                        <td className="py-3 px-3 font-medium">{sp.name}</td>
                        <td className="py-3 px-3 text-xs text-muted-foreground max-w-[200px]">{sp.compatibleEquipment}</td>
                        <td className="py-3 px-3">
                          <span className={cn("font-mono text-sm font-semibold tabular-nums",
                            sp.stock === 0 ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"
                          )}>{sp.stock}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{sp.reorderPoint}</td>
                        <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{sp.lastUsed}</td>
                        <td className="py-3 px-3 text-muted-foreground">{sp.supplier}</td>
                        <td className="py-3 px-3 font-mono text-xs tabular-nums">&#8377;{sp.unitCost.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Maintenance Activity Log</CardTitle>
              <ExportButtons
                data={maintenanceHistory.map((h) => ({ date: h.date, equipment: h.equipment, type: h.type, duration: h.duration, technician: h.technician, partsUsed: h.partsUsed, cost: h.cost > 0 ? `Rs ${h.cost.toLocaleString()}` : "--", notes: h.notes }))}
                columns={[
                  { key: "date", label: "Date" }, { key: "equipment", label: "Equipment" }, { key: "type", label: "Type" },
                  { key: "duration", label: "Duration" }, { key: "technician", label: "Technician" },
                  { key: "partsUsed", label: "Parts Used" }, { key: "cost", label: "Cost" }, { key: "notes", label: "Notes" },
                ]}
                filename="maintenance-history"
                title="Maintenance History"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Date", "Equipment", "Type", "Duration", "Technician", "Parts Used", "Cost", "Notes"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maintenanceHistory.map((h) => (
                    <tr key={h.id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs tabular-nums">{h.date}</td>
                      <td className="py-3 px-3 font-medium">{h.equipment}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={cn("text-xs", typeColorMap[h.type])}>{h.type}</Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs">{h.duration}</td>
                      <td className="py-3 px-3 text-muted-foreground">{h.technician}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{h.partsUsed}</td>
                      <td className="py-3 px-3 font-mono text-xs tabular-nums">
                        {h.cost > 0 ? <span className="text-red-600">&#8377;{h.cost.toLocaleString()}</span> : <span className="text-muted-foreground">--</span>}
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground max-w-[250px] truncate">{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
