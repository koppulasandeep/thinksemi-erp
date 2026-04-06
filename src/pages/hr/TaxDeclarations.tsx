import { useState, useEffect } from "react"
import {
  FileText,
  Calculator,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn, formatCurrency } from "@/lib/utils"
import { useApiData } from "@/lib/useApi"
import { api } from "@/lib/api"

interface Employee {
  id: string
  name: string
  employee_id: string
}

interface TaxDeclaration {
  id: string
  regime: "old" | "new"
  section_80c: number
  section_80d: number
  hra_exemption: number
  home_loan_interest: number
  other_deductions: number
  status: "draft" | "submitted" | "verified"
}

interface RegimeComparison {
  new_regime_tax: number
  old_regime_tax: number
  recommended: "old" | "new"
  annual_savings: number
}

const emptyForm = {
  regime: "new" as "old" | "new",
  section_80c: "",
  section_80d: "",
  hra_exemption: "",
  home_loan_interest: "",
  other_deductions: "",
}

export function TaxDeclarations() {
  const { data: employees } = useApiData<Employee[]>("/hr/employees", [])
  const [selectedEmpId, setSelectedEmpId] = useState("")
  const [_declaration, setDeclaration] = useState<TaxDeclaration | null>(null)
  const [declLoading, setDeclLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [comparison, setComparison] = useState<RegimeComparison | null>(null)
  const [comparing, setComparing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!selectedEmpId) {
      setDeclaration(null)
      setComparison(null)
      return
    }
    setDeclLoading(true)
    api.get<TaxDeclaration>(`/hr/tax-declarations/${selectedEmpId}`)
      .then((data) => {
        setDeclaration(data)
        if (data) {
          setForm({
            regime: data.regime,
            section_80c: String(data.section_80c || ""),
            section_80d: String(data.section_80d || ""),
            hra_exemption: String(data.hra_exemption || ""),
            home_loan_interest: String(data.home_loan_interest || ""),
            other_deductions: String(data.other_deductions || ""),
          })
        }
      })
      .catch(() => setDeclaration(null))
      .finally(() => setDeclLoading(false))
  }, [selectedEmpId])

  async function handleCompare() {
    if (!selectedEmpId) return
    setComparing(true)
    try {
      const result = await api.post<RegimeComparison>(
        `/hr/tax-declarations/${selectedEmpId}/compare`,
        {
          section_80c: Number(form.section_80c) || 0,
          section_80d: Number(form.section_80d) || 0,
          hra_exemption: Number(form.hra_exemption) || 0,
          home_loan_interest: Number(form.home_loan_interest) || 0,
          other_deductions: Number(form.other_deductions) || 0,
        }
      )
      setComparison(result)
    } catch {
      // handled by api layer
    } finally {
      setComparing(false)
    }
  }

  async function handleSubmit() {
    if (!selectedEmpId) return
    setSubmitting(true)
    try {
      await api.post("/hr/tax-declarations", {
        employee_id: selectedEmpId,
        regime: form.regime,
        section_80c: Number(form.section_80c) || 0,
        section_80d: Number(form.section_80d) || 0,
        hra_exemption: Number(form.hra_exemption) || 0,
        home_loan_interest: Number(form.home_loan_interest) || 0,
        other_deductions: Number(form.other_deductions) || 0,
      })
      // refetch
      const data = await api.get<TaxDeclaration>(`/hr/tax-declarations/${selectedEmpId}`)
      setDeclaration(data)
    } catch {
      // handled by api layer
    } finally {
      setSubmitting(false)
    }
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tax Declarations" description="Manage employee tax regime and deduction declarations" />

      {/* Employee Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium whitespace-nowrap">Select Employee</label>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background w-full sm:w-80"
          value={selectedEmpId}
          onChange={(e) => { setSelectedEmpId(e.target.value); setComparison(null) }}
        >
          <option value="">-- Choose employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.employee_id})
            </option>
          ))}
        </select>
      </div>

      {!selectedEmpId && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select an employee to manage tax declarations</CardContent></Card>
      )}

      {selectedEmpId && declLoading && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Loading...</CardContent></Card>
      )}

      {selectedEmpId && !declLoading && (
        <>
          {/* Regime Selector */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Tax Regime</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                {(["old", "new"] as const).map((regime) => (
                  <button
                    key={regime}
                    className={cn(
                      "flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-colors",
                      form.regime === regime ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
                    )}
                    onClick={() => updateField("regime", regime)}
                  >
                    {regime === "new" ? "New Regime" : "Old Regime"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {form.regime === "new"
                  ? "New regime offers lower tax rates but no deductions under 80C, 80D, HRA etc. Suitable if total deductions are low."
                  : "Old regime allows deductions under 80C, 80D, HRA exemption, home loan interest etc. Suitable if you have significant investments."}
              </p>
            </CardContent>
          </Card>

          {/* Declaration Form */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Deduction Details</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Section 80C (Life Insurance, PPF, ELSS)</label>
                  <Input type="number" placeholder="Max 1,50,000" value={form.section_80c} onChange={(e) => updateField("section_80c", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Section 80D (Medical Insurance)</label>
                  <Input type="number" placeholder="Max 25,000 / 50,000" value={form.section_80d} onChange={(e) => updateField("section_80d", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">HRA Exemption</label>
                  <Input type="number" placeholder="Annual HRA exemption" value={form.hra_exemption} onChange={(e) => updateField("hra_exemption", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Home Loan Interest (Sec 24)</label>
                  <Input type="number" placeholder="Max 2,00,000" value={form.home_loan_interest} onChange={(e) => updateField("home_loan_interest", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Other Deductions</label>
                  <Input type="number" placeholder="NPS, 80E, 80G etc." value={form.other_deductions} onChange={(e) => updateField("other_deductions", e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={handleCompare} disabled={comparing}>
                  <ArrowRightLeft className="h-4 w-4 mr-1" />
                  {comparing ? "Comparing..." : "Compare Regimes"}
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Declaration"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Result */}
          {comparison && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5" /> Regime Comparison</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border text-center">
                    <p className="text-xs text-muted-foreground mb-1">New Regime Tax</p>
                    <p className="text-lg font-bold">{formatCurrency(comparison.new_regime_tax)}</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <p className="text-xs text-muted-foreground mb-1">Old Regime Tax</p>
                    <p className="text-lg font-bold">{formatCurrency(comparison.old_regime_tax)}</p>
                  </div>
                  <div className="p-4 rounded-lg border text-center bg-primary/5">
                    <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-lg font-bold capitalize">{comparison.recommended} Regime</span>
                    </div>
                    <p className="text-xs text-emerald-600 mt-1">Save {formatCurrency(comparison.annual_savings)}/year</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
