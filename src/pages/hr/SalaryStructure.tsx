import { useState, useEffect } from "react"
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CalendarDays,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn, formatCurrency } from "@/lib/utils"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useToast } from "@/components/shared/Toast"
import { useApiData } from "@/lib/useApi"
import { api } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

interface Employee {
  id: string
  name: string
  employee_id: string
  designation: string
}

interface SalaryRecord {
  id: string
  annual_ctc: number
  basic: number
  hra: number
  special_allowance: number
  conveyance: number
  medical: number
  other_allowances: number
  effective_from: string
  effective_to: string | null
  status: "active" | "revised" | "draft"
}

function calcBreakdown(annualCtc: number) {
  const basic = Math.round(annualCtc * 0.4)
  const hra = Math.round(basic * 0.5)
  const conveyance = 19200
  const medical = 15000
  const special = Math.max(0, annualCtc - basic - hra - conveyance - medical)
  return { basic, hra, conveyance, medical, special_allowance: special, other_allowances: 0 }
}

export function SalaryStructure() {
  const { data: employees, loading } = useApiData<Employee[]>("/hr/employees", [])
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [salary, setSalary] = useState<SalaryRecord[]>([])
  const [salaryLoading, setSalaryLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [ctcInput, setCtcInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const user = getCurrentUser()
  const isAdmin = user?.role && ["super_admin", "admin", "hr_manager"].includes(user.role)

  useEffect(() => {
    if (!selectedEmpId) {
      setSalary([])
      return
    }
    setSalaryLoading(true)
    api.get<SalaryRecord[]>(`/hr/salary/${selectedEmpId}`)
      .then((data) => setSalary(Array.isArray(data) ? data : []))
      .catch(() => setSalary([]))
      .finally(() => setSalaryLoading(false))
  }, [selectedEmpId])

  const current = salary.find((s) => s.status === "active")
  const annualCtc = Number(ctcInput) || 0
  const preview = calcBreakdown(annualCtc)

  async function handleSubmit() {
    if (!selectedEmpId || annualCtc <= 0) return
    setSubmitting(true)
    try {
      await api.post("/hr/salary", {
        employee_id: selectedEmpId,
        annual_ctc: annualCtc,
        ...preview,
        effective_from: new Date().toISOString().split("T")[0],
      })
      setShowForm(false)
      setCtcInput("")
      // refetch salary
      const data = await api.get<SalaryRecord[]>(`/hr/salary/${selectedEmpId}`)
      setSalary(Array.isArray(data) ? data : [])
      toast("success", "Salary revision saved")
    } catch {
      toast("error", "Failed to save salary revision")
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    revised: "bg-amber-100 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
  }

  if (loading) return <LoadingSpinner text="Loading employees..." />

  return (
    <div className="space-y-6">
      <PageHeader title="Salary Structure" description="Manage employee CTC breakdown and revision history" />

      {/* Employee Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium whitespace-nowrap">Select Employee</label>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background w-full sm:w-80"
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(e.target.value)}
        >
          <option value="">-- Choose employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>
        {isAdmin && selectedEmpId && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <TrendingUp className="h-4 w-4 mr-1" /> Set / Revise Salary
          </Button>
        )}
      </div>

      {!selectedEmpId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select an employee to view salary structure</CardContent></Card>
      )}

      {selectedEmpId && salaryLoading && (
        <LoadingSpinner text="Loading salary data..." />
      )}

      {/* Current CTC Breakdown */}
      {selectedEmpId && !salaryLoading && current && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><IndianRupee className="h-5 w-5" /> Current CTC Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Annual CTC", value: current.annual_ctc },
                { label: "Basic", value: current.basic },
                { label: "HRA", value: current.hra },
                { label: "Special Allowance", value: current.special_allowance },
                { label: "Conveyance", value: current.conveyance },
                { label: "Medical", value: current.medical },
                { label: "Other Allowances", value: current.other_allowances },
                { label: "Monthly Gross", value: Math.round(current.annual_ctc / 12) },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revision History */}
      {selectedEmpId && !salaryLoading && salary.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Revision History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {salary.map((record) => (
                <div key={record.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(record.annual_ctc)}</span>
                      <Badge className={cn("text-xs", statusColors[record.status] || "")}>{record.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {record.effective_from} {record.effective_to ? `to ${record.effective_to}` : "- Present"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revise Salary Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Set / Revise Salary</h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Annual CTC</label>
                <Input type="number" placeholder="e.g. 600000" value={ctcInput} onChange={(e) => setCtcInput(e.target.value)} />
              </div>
              {annualCtc > 0 && (
                <div className="bg-muted/50 rounded-md p-3 space-y-1 text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-2">Auto-calculated breakdown:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <span>Basic (40%)</span><span className="text-right">{formatCurrency(preview.basic)}</span>
                    <span>HRA (50% of Basic)</span><span className="text-right">{formatCurrency(preview.hra)}</span>
                    <span>Conveyance</span><span className="text-right">{formatCurrency(preview.conveyance)}</span>
                    <span>Medical</span><span className="text-right">{formatCurrency(preview.medical)}</span>
                    <span>Special Allowance</span><span className="text-right">{formatCurrency(preview.special_allowance)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || annualCtc <= 0}>
                {submitting ? "Saving..." : "Save Salary"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
