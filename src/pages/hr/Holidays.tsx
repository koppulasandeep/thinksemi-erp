import { useState } from "react"
import {
  Calendar,
  Plus,
  Trash2,
  Flag,
  MapPin,
  Star,
  Building2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn, formatNumber } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/components/shared/Toast"
import { useApiData } from "@/lib/useApi"
import { api } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

interface Holiday {
  id: string
  date: string
  name: string
  type: "national" | "state" | "optional" | "company"
}

const HOLIDAY_TYPES = ["national", "state", "optional", "company"] as const

const typeColors: Record<string, string> = {
  national: "bg-red-100 text-red-700",
  state: "bg-blue-100 text-blue-700",
  optional: "bg-amber-100 text-amber-700",
  company: "bg-violet-100 text-violet-700",
}

const typeIcons: Record<string, typeof Flag> = {
  national: Flag,
  state: MapPin,
  optional: Star,
  company: Building2,
}

const emptyForm = { date: "", name: "", type: "national" as Holiday["type"] }

export function Holidays() {
  const [year, setYear] = useState(2026)
  const { data: holidays, loading, refetch } = useApiData<Holiday[]>(`/hr/holidays?year=${year}`, [])

  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const user = getCurrentUser()
  const isAdmin = user?.role && ["super_admin", "admin", "hr_manager"].includes(user.role)
  const canDelete = user?.role && ["super_admin", "admin"].includes(user.role)

  const totalHolidays = holidays.length
  const nationalCount = holidays.filter((h) => h.type === "national").length
  const stateCount = holidays.filter((h) => h.type === "state").length
  const optionalCount = holidays.filter((h) => h.type === "optional").length

  async function handleCreate() {
    if (!form.date || !form.name) return
    setSubmitting(true)
    try {
      await api.post("/hr/holidays", { ...form, year })
      setShowDialog(false)
      setForm(emptyForm)
      refetch()
      toast("success", "Holiday added")
    } catch {
      toast("error", "Failed to add holiday")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this holiday?")) return
    try {
      await api.delete(`/hr/holidays/${id}`)
      refetch()
      toast("success", "Holiday deleted")
    } catch {
      toast("error", "Failed to delete holiday")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holiday Calendar"
        description="Manage company holidays and observances"
        action={isAdmin ? { label: "Add Holiday", onClick: () => setShowDialog(true), icon: Plus } : undefined}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard title="Total Holidays" value={formatNumber(totalHolidays)} icon={Calendar} iconColor="text-blue-600" />
        <KPICard title="National" value={formatNumber(nationalCount)} icon={Flag} iconColor="text-red-600" />
        <KPICard title="State" value={formatNumber(stateCount)} icon={MapPin} iconColor="text-blue-600" />
        <KPICard title="Optional" value={formatNumber(optionalCount)} icon={Star} iconColor="text-amber-600" />
      </div>

      {/* Year Selector */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Year</label>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading holidays..." /> : <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Holiday Name</th>
                <th className="text-left p-3 font-medium">Type</th>
                {canDelete && <th className="text-right p-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {holidays.length === 0 ? (
                <tr><td colSpan={canDelete ? 4 : 3} className="p-6 text-center text-muted-foreground">No holidays found for {year}</td></tr>
              ) : (
                holidays.map((holiday) => {
                  const TypeIcon = typeIcons[holiday.type] || Calendar
                  return (
                    <tr key={holiday.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs">{holiday.date}</td>
                      <td className="p-3 flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        {holiday.name}
                      </td>
                      <td className="p-3">
                        <Badge className={cn("text-xs capitalize", typeColors[holiday.type] || "")}>{holiday.type}</Badge>
                      </td>
                      {canDelete && (
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(holiday.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>}

      {/* Add Holiday Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDialog(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Add Holiday</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Holiday Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Republic Day" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Holiday["type"] })}
                >
                  {HOLIDAY_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !form.date || !form.name}>
                {submitting ? "Adding..." : "Add Holiday"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
