import { useState } from "react"
import { Save, Building2, IndianRupee, Percent, Landmark, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn } from "@/lib/utils"

// ── Types ──

interface CompanyDetails {
  companyName: string
  cin: string
  pan: string
  tan: string
  pfRegistrationNo: string
  esiRegistrationNo: string
  ptRegistrationNo: string
  lwfRegistrationNo: string
}

interface SalaryComponent {
  name: string
  key: string
  type: "percentage" | "fixed"
  value: number
  of?: string
}

interface StatutoryRates {
  pfRate: number
  esiEmployeeRate: number
  esiEmployerRate: number
  ptSlab: string
  pfCeiling: number
}

interface BankDetails {
  bankName: string
  accountNo: string
  ifsc: string
}

interface PayrollSettings {
  company: CompanyDetails
  salaryComponents: SalaryComponent[]
  statutory: StatutoryRates
  taxRegimeDefault: "old" | "new"
  bank: BankDetails
  payCycle: "monthly"
  payDay: string
}

// ── Default Config (Thinksemi Infotech) ──

const defaultConfig: PayrollSettings = {
  company: {
    companyName: "Thinksemi Infotech Pvt Ltd",
    cin: "U72200TN2020PTC136789",
    pan: "AADCT1234A",
    tan: "CHTD01234E",
    pfRegistrationNo: "TNCHN0012345",
    esiRegistrationNo: "3300012345600001",
    ptRegistrationNo: "TNPT2020001234",
    lwfRegistrationNo: "LWF/TN/2020/001234",
  },
  salaryComponents: [
    { name: "Basic", key: "basic", type: "percentage", value: 40, of: "CTC" },
    { name: "HRA", key: "hra", type: "percentage", value: 50, of: "Basic" },
    { name: "Special Allowance", key: "specialAllowance", type: "percentage", value: 0, of: "Balance" },
    { name: "Conveyance Allowance", key: "conveyance", type: "fixed", value: 1600 },
    { name: "Medical Allowance", key: "medical", type: "fixed", value: 1250 },
  ],
  statutory: {
    pfRate: 12,
    esiEmployeeRate: 0.75,
    esiEmployerRate: 3.25,
    ptSlab: "Tamil Nadu",
    pfCeiling: 15000,
  },
  taxRegimeDefault: "new",
  bank: {
    bankName: "ICICI Bank",
    accountNo: "012345678901",
    ifsc: "ICIC0001234",
  },
  payCycle: "monthly",
  payDay: "Last working day",
}

// ── Component ──

export function PayrollConfig() {
  const [config, setConfig] = useState<PayrollSettings>(defaultConfig)
  const [saved, setSaved] = useState(false)

  const updateCompany = (field: keyof CompanyDetails, value: string) => {
    setConfig((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: value },
    }))
    setSaved(false)
  }

  const updateSalaryComponent = (index: number, value: number) => {
    setConfig((prev) => {
      const components = [...prev.salaryComponents]
      components[index] = { ...components[index], value }
      return { ...prev, salaryComponents: components }
    })
    setSaved(false)
  }

  const updateStatutory = (field: keyof StatutoryRates, value: number | string) => {
    setConfig((prev) => ({
      ...prev,
      statutory: { ...prev.statutory, [field]: value },
    }))
    setSaved(false)
  }

  const updateBank = (field: keyof BankDetails, value: string) => {
    setConfig((prev) => ({
      ...prev,
      bank: { ...prev.bank, [field]: value },
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    // In production, this would persist to backend
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Configuration"
        description="Organization-level payroll settings, salary structure, and statutory rates"
      />

      {/* Company Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Company Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Company Name">
              <Input
                value={config.company.companyName}
                onChange={(e) => updateCompany("companyName", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="CIN (Corporate Identity Number)">
              <Input
                value={config.company.cin}
                onChange={(e) => updateCompany("cin", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="PAN">
              <Input
                value={config.company.pan}
                onChange={(e) => updateCompany("pan", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="TAN">
              <Input
                value={config.company.tan}
                onChange={(e) => updateCompany("tan", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="PF Registration No">
              <Input
                value={config.company.pfRegistrationNo}
                onChange={(e) => updateCompany("pfRegistrationNo", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="ESI Registration No">
              <Input
                value={config.company.esiRegistrationNo}
                onChange={(e) => updateCompany("esiRegistrationNo", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="PT Registration No">
              <Input
                value={config.company.ptRegistrationNo}
                onChange={(e) => updateCompany("ptRegistrationNo", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="LWF Registration No">
              <Input
                value={config.company.lwfRegistrationNo}
                onChange={(e) => updateCompany("lwfRegistrationNo", e.target.value)}
              />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Salary Structure Template */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            Salary Structure Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Component</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Basis</th>
                </tr>
              </thead>
              <tbody>
                {config.salaryComponents.map((comp, i) => (
                  <tr key={comp.key} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{comp.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-[10px]">
                        {comp.type === "percentage" ? "%" : "Fixed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Input
                        type="number"
                        className="w-24 text-right ml-auto h-8"
                        value={comp.value}
                        onChange={(e) => updateSalaryComponent(i, Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {comp.type === "percentage" ? `of ${comp.of}` : "per month"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Special Allowance is auto-calculated as the balance after Basic, HRA, and fixed components.
          </p>
        </CardContent>
      </Card>

      {/* Statutory Rates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            Statutory Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FieldGroup label="PF Rate (Employee & Employer)">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  value={config.statutory.pfRate}
                  onChange={(e) => updateStatutory("pfRate", Number(e.target.value))}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
            </FieldGroup>
            <FieldGroup label="ESI Employee Rate">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.25"
                  value={config.statutory.esiEmployeeRate}
                  onChange={(e) => updateStatutory("esiEmployeeRate", Number(e.target.value))}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
            </FieldGroup>
            <FieldGroup label="ESI Employer Rate">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.25"
                  value={config.statutory.esiEmployerRate}
                  onChange={(e) => updateStatutory("esiEmployerRate", Number(e.target.value))}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Professional Tax Slab">
              <Input
                value={config.statutory.ptSlab}
                onChange={(e) => updateStatutory("ptSlab", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="PF Wage Ceiling">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">Rs.</span>
                <Input
                  type="number"
                  value={config.statutory.pfCeiling}
                  onChange={(e) => updateStatutory("pfCeiling", Number(e.target.value))}
                />
              </div>
            </FieldGroup>
            <FieldGroup label="Default Tax Regime">
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer",
                    config.taxRegimeDefault === "new"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, taxRegimeDefault: "new" }))
                    setSaved(false)
                  }}
                >
                  New Regime
                </button>
                <button
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm transition-colors cursor-pointer",
                    config.taxRegimeDefault === "old"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, taxRegimeDefault: "old" }))
                    setSaved(false)
                  }}
                >
                  Old Regime
                </button>
              </div>
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            Bank Details for Salary Disbursement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FieldGroup label="Bank Name">
              <Input
                value={config.bank.bankName}
                onChange={(e) => updateBank("bankName", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Account Number">
              <Input
                value={config.bank.accountNo}
                onChange={(e) => updateBank("accountNo", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="IFSC Code">
              <Input
                value={config.bank.ifsc}
                onChange={(e) => updateBank("ifsc", e.target.value)}
              />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Pay Cycle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Pay Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Pay Cycle">
              <Input value="Monthly" disabled />
            </FieldGroup>
            <FieldGroup label="Pay Day">
              <Input
                value={config.payDay}
                onChange={(e) => {
                  setConfig((prev) => ({ ...prev, payDay: e.target.value }))
                  setSaved(false)
                }}
              />
            </FieldGroup>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Separator />
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <Badge variant="success" className="text-xs">
            Configuration saved successfully
          </Badge>
        )}
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  )
}

// ── Helper Component ──

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
