import { useState, useRef } from "react"
import {
  Play,
  Download,
  IndianRupee,
  Users,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  Eye,
  Calculator,
  Building2,
  Shield,
  ToggleLeft,
  ToggleRight,
  Printer,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, getInitials, cn } from "@/lib/utils"

// ── Types ──

interface CTCBreakdown {
  basic: number
  hra: number
  specialAllowance: number
  conveyance: number
  medical: number
}

interface StatutoryDeductions {
  pfEmployee: number
  pfEmployer: number
  esiEmployee: number
  esiEmployer: number
  professionalTax: number
  tds: number
}

interface PayrollEmployee {
  empId: string
  name: string
  dept: string
  designation: string
  ctcAnnual: number
  ctc: CTCBreakdown
  otHours: number
  otRate: number
  otPay: number
  grossPay: number
  deductions: StatutoryDeductions
  totalDeductions: number
  netPay: number
  taxRegime: "old" | "new"
  lop: number
}

// ── Indian Tax & Statutory Calculations ──

function calculatePF(basic: number): { employee: number; employer: number } {
  // PF: 12% of Basic, capped at Basic of 15,000
  const pfBase = Math.min(basic, 15000)
  return {
    employee: Math.round(pfBase * 0.12),
    employer: Math.round(pfBase * 0.12),
  }
}

function calculateESI(gross: number): { employee: number; employer: number } {
  // ESI applicable if gross < 21,000
  if (gross >= 21000) return { employee: 0, employer: 0 }
  return {
    employee: Math.round(gross * 0.0075),
    employer: Math.round(gross * 0.0325),
  }
}

function calculatePT(monthlyGross: number): number {
  // Tamil Nadu Professional Tax slabs
  if (monthlyGross <= 3500) return 0
  if (monthlyGross <= 5000) return 16
  if (monthlyGross <= 7500) return 39
  if (monthlyGross <= 10000) return 75
  if (monthlyGross <= 12500) return 100
  if (monthlyGross <= 15000) return 150
  if (monthlyGross <= 20000) return 175
  return 208 // > 20,000
}

function calculateTDSNewRegime(annualTaxableIncome: number): number {
  // New Tax Regime FY 2025-26 (AY 2026-27)
  // Standard deduction of 75,000
  const taxable = Math.max(0, annualTaxableIncome - 75000)
  let tax = 0
  if (taxable <= 300000) {
    tax = 0
  } else if (taxable <= 700000) {
    tax = (taxable - 300000) * 0.05
  } else if (taxable <= 1000000) {
    tax = 20000 + (taxable - 700000) * 0.10
  } else if (taxable <= 1200000) {
    tax = 50000 + (taxable - 1000000) * 0.15
  } else if (taxable <= 1500000) {
    tax = 80000 + (taxable - 1200000) * 0.20
  } else {
    tax = 140000 + (taxable - 1500000) * 0.30
  }
  // Rebate u/s 87A: No tax if taxable income <= 7,00,000
  if (taxable <= 700000) tax = 0
  // 4% Health & Education Cess
  tax = tax * 1.04
  return Math.round(tax / 12) // Monthly TDS
}

function buildCTC(annualCTC: number): CTCBreakdown {
  // Standard Indian CTC split
  const basic = Math.round(annualCTC * 0.40 / 12)
  const hra = Math.round(basic * 0.50)
  const conveyance = 1600
  const medical = 1250
  const specialAllowance = Math.round(annualCTC / 12) - basic - hra - conveyance - medical
  return { basic, hra, specialAllowance: Math.max(specialAllowance, 0), conveyance, medical }
}

function buildEmployee(
  empId: string,
  name: string,
  dept: string,
  designation: string,
  annualCTC: number,
  otHours: number,
  lop: number,
  regime: "old" | "new" = "new"
): PayrollEmployee {
  const ctc = buildCTC(annualCTC)
  const monthlyGross = ctc.basic + ctc.hra + ctc.specialAllowance + ctc.conveyance + ctc.medical
  const otRate = Math.round((ctc.basic / 26 / 8) * 2) // Double rate for OT
  const otPay = otHours * otRate

  // LOP deduction
  const perDaySalary = Math.round(monthlyGross / 26)
  const lopDeduction = lop * perDaySalary
  const effectiveGross = monthlyGross - lopDeduction + otPay

  const pf = calculatePF(ctc.basic)
  const esi = calculateESI(effectiveGross)
  const pt = calculatePT(effectiveGross)
  const tds = calculateTDSNewRegime(annualCTC)

  const deductions: StatutoryDeductions = {
    pfEmployee: pf.employee,
    pfEmployer: pf.employer,
    esiEmployee: esi.employee,
    esiEmployer: esi.employer,
    professionalTax: pt,
    tds,
  }

  const totalDeductions = deductions.pfEmployee + deductions.esiEmployee + deductions.professionalTax + deductions.tds
  const netPay = effectiveGross - totalDeductions

  return {
    empId,
    name,
    dept,
    designation,
    ctcAnnual: annualCTC,
    ctc,
    otHours,
    otRate,
    otPay,
    grossPay: effectiveGross,
    deductions,
    totalDeductions,
    netPay,
    taxRegime: regime,
    lop,
  }
}

// ── Mock Data: 8 employees with realistic Chennai factory salaries ──

function generatePayroll(): PayrollEmployee[] {
  return [
    buildEmployee("EMP-001", "Ravi Kumar", "SMT Production", "SMT Operator", 240000, 12, 0),
    buildEmployee("EMP-002", "Priya Sharma", "Quality", "QC Engineer", 420000, 0, 0),
    buildEmployee("EMP-003", "Mohan Rajan", "Store", "Store Keeper", 216000, 4, 1),
    buildEmployee("EMP-004", "Arun Krishnan", "Engineering", "Process Engineer", 600000, 0, 0),
    buildEmployee("EMP-005", "Lakshmi Venkat", "HR", "HR Manager", 780000, 0, 0),
    buildEmployee("EMP-006", "Suresh Babu", "SMT Production", "SMT Operator", 228000, 8, 0),
    buildEmployee("EMP-007", "Deepa Nair", "Testing", "Test Engineer", 480000, 0, 0),
    buildEmployee("EMP-008", "Karthik Raja", "SMT Production", "Line Supervisor", 540000, 6, 0),
  ]
}

// ── Tax Slab Table ──

const newRegimeSlabs = [
  { range: "Up to 3,00,000", rate: "Nil" },
  { range: "3,00,001 - 7,00,000", rate: "5%" },
  { range: "7,00,001 - 10,00,000", rate: "10%" },
  { range: "10,00,001 - 12,00,000", rate: "15%" },
  { range: "12,00,001 - 15,00,000", rate: "20%" },
  { range: "Above 15,00,000", rate: "30%" },
]

const statutoryReports = [
  { name: "PF Monthly Return (ECR)", dueDate: "15th April 2026", status: "pending", period: "March 2026" },
  { name: "ESI Monthly Contribution", dueDate: "15th April 2026", status: "pending", period: "March 2026" },
  { name: "Professional Tax (TN)", dueDate: "30th April 2026", status: "pending", period: "March 2026" },
  { name: "TDS - Form 24Q (Q4)", dueDate: "31st May 2026", status: "pending", period: "Jan-Mar 2026" },
  { name: "Form 16", dueDate: "15th June 2026", status: "pending", period: "FY 2025-26" },
  { name: "PF Annual Return", dueDate: "25th April 2026", status: "draft", period: "FY 2025-26" },
]

// ── Component ──

export function Payroll() {
  const [status, setStatus] = useState<"draft" | "processing" | "approved">("draft")
  const [viewMode, setViewMode] = useState<"monthly" | "annual">("monthly")
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"register" | "payslip" | "statutory" | "slabs">("register")
  const payroll = generatePayroll()

  const totalGross = payroll.reduce((s, r) => s + r.grossPay, 0)
  const totalNet = payroll.reduce((s, r) => s + r.netPay, 0)
  const totalOT = payroll.reduce((s, r) => s + r.otPay, 0)
  const totalDeductions = payroll.reduce((s, r) => s + r.totalDeductions, 0)
  const totalPF = payroll.reduce((s, r) => s + r.deductions.pfEmployee + r.deductions.pfEmployer, 0)
  const totalESI = payroll.reduce((s, r) => s + r.deductions.esiEmployee + r.deductions.esiEmployer, 0)
  const multiplier = viewMode === "annual" ? 12 : 1

  const handleRunPayroll = () => {
    setStatus("processing")
    setTimeout(() => setStatus("approved"), 1500)
  }

  const selectedEmp = payroll.find((e) => e.empId === selectedEmployee)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">March 2026 Payroll</h2>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-2">
          {/* Monthly / Annual Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "monthly" ? "annual" : "monthly")}
            className="gap-1.5"
          >
            {viewMode === "monthly" ? (
              <ToggleLeft className="h-3.5 w-3.5" />
            ) : (
              <ToggleRight className="h-3.5 w-3.5" />
            )}
            {viewMode === "monthly" ? "Monthly" : "Annual"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-3.5 w-3.5" />
            Payslips
          </Button>
          {status === "draft" && (
            <Button size="sm" onClick={handleRunPayroll}>
              <Play className="h-3.5 w-3.5" />
              Run Payroll
            </Button>
          )}
          {status === "approved" && (
            <Button size="sm">
              <Send className="h-3.5 w-3.5" />
              Submit to Bank
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total Net Pay"
          value={formatCurrency(totalNet * multiplier)}
          subtitle={`${payroll.length} employees`}
          icon={IndianRupee}
        />
        <KPICard
          title="Gross Salary"
          value={formatCurrency(totalGross * multiplier)}
          icon={Users}
        />
        <KPICard
          title="PF (Employee + Employer)"
          value={formatCurrency(totalPF * multiplier)}
          subtitle="12% + 12% of Basic"
          icon={Shield}
          iconColor="text-info"
        />
        <KPICard
          title="ESI (Total)"
          value={formatCurrency(totalESI * multiplier)}
          subtitle={`${payroll.filter((r) => r.deductions.esiEmployee > 0).length} eligible employees`}
          icon={Building2}
          iconColor="text-warning"
        />
        <KPICard
          title="Overtime"
          value={formatCurrency(totalOT * multiplier)}
          subtitle={`${payroll.filter((r) => r.otHours > 0).length} employees with OT`}
          icon={Clock}
          iconColor="text-warning"
        />
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 border-b">
        {[
          { id: "register" as const, label: "Salary Register", icon: FileText },
          { id: "payslip" as const, label: "Payslip Preview", icon: Eye },
          { id: "statutory" as const, label: "Statutory Reports", icon: Shield },
          { id: "slabs" as const, label: "Tax Slabs", icon: Calculator },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer",
              "hover:text-foreground",
              activeSection === tab.id ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
            {activeSection === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Salary Register */}
      {activeSection === "register" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left text-xs font-medium text-muted-foreground">Employee</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">CTC (Ann.)</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Basic</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">HRA</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Special All.</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">OT</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Gross</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">PF (Emp)</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">ESI</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">PT</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">TDS</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">LOP</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Deductions</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground font-semibold">Net Pay</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((row) => (
                    <tr
                      key={row.empId}
                      className={cn(
                        "border-b last:border-0 hover:bg-accent/30 transition-colors cursor-pointer",
                        selectedEmployee === row.empId && "bg-accent/50"
                      )}
                      onClick={() => {
                        setSelectedEmployee(row.empId)
                        setActiveSection("payslip")
                      }}
                    >
                      <td className="sticky left-0 z-10 bg-card px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
                            {getInitials(row.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{row.name}</p>
                            <p className="text-[10px] text-muted-foreground">{row.dept} - {row.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground text-xs">
                        {formatCurrency(row.ctcAnnual)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(row.ctc.basic * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(row.ctc.hra * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(row.ctc.specialAllowance * multiplier)}</td>
                      <td className="px-3 py-3 text-center tabular-nums">
                        {row.otHours > 0 ? (
                          <Badge variant="warning" className="text-[10px] tabular-nums">{row.otHours}h</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums font-medium">{formatCurrency(row.grossPay * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(row.deductions.pfEmployee * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {row.deductions.esiEmployee > 0 ? formatCurrency(row.deductions.esiEmployee * multiplier) : "-"}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatCurrency(row.deductions.professionalTax * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {row.deductions.tds > 0 ? formatCurrency(row.deductions.tds * multiplier) : "-"}
                      </td>
                      <td className="px-3 py-3 text-center tabular-nums">
                        {row.lop > 0 ? (
                          <Badge variant="destructive" className="text-[10px]">{row.lop}d</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-destructive">{formatCurrency(row.totalDeductions * multiplier)}</td>
                      <td className="px-3 py-3 text-right tabular-nums font-bold">{formatCurrency(row.netPay * multiplier)}</td>
                      <td className="px-3 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEmployee(row.empId)
                            setActiveSection("payslip")
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-muted/30">
                    <td className="sticky left-0 z-10 bg-muted/30 px-4 py-3 font-semibold">Total ({payroll.length} employees)</td>
                    <td className="px-3 py-3 text-right tabular-nums text-xs font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.ctcAnnual, 0))}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.ctc.basic, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.ctc.hra, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.ctc.specialAllowance, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums font-semibold">
                      {payroll.reduce((s, r) => s + r.otHours, 0)}h
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">{formatCurrency(totalGross * multiplier)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.pfEmployee, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.esiEmployee, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.professionalTax, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.tds, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-3 text-center">-</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-destructive">{formatCurrency(totalDeductions * multiplier)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-bold text-lg">{formatCurrency(totalNet * multiplier)}</td>
                    <td />
                  </tr>
                  {/* Employer contributions row */}
                  <tr className="bg-muted/20">
                    <td className="sticky left-0 z-10 bg-muted/20 px-4 py-2 text-xs text-muted-foreground font-medium" colSpan={7}>
                      Employer Contributions (not deducted from salary)
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs text-info font-medium">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.pfEmployer, 0) * multiplier)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-xs text-info font-medium">
                      {formatCurrency(payroll.reduce((s, r) => s + r.deductions.esiEmployer, 0) * multiplier)}
                    </td>
                    <td colSpan={6} className="px-3 py-2 text-right text-xs text-muted-foreground">
                      Total employer cost: {formatCurrency(
                        (payroll.reduce((s, r) => s + r.deductions.pfEmployer + r.deductions.esiEmployer, 0)) * multiplier
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payslip Preview */}
      {activeSection === "payslip" && (
        <div className="space-y-4">
          {!selectedEmp ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Select an employee to view payslip</p>
                <p className="text-xs text-muted-foreground mt-1">Click any row in the Salary Register or pick below</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {payroll.map((emp) => (
                    <Button
                      key={emp.empId}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmployee(emp.empId)}
                    >
                      {emp.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <PayslipCard employee={selectedEmp} />
          )}
        </div>
      )}

      {/* Statutory Reports */}
      {activeSection === "statutory" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Statutory Returns & Filing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Return / Report</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Period</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Due Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {statutoryReports.map((report, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{report.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{report.period}</td>
                      <td className="px-3 py-3">{report.dueDate}</td>
                      <td className="px-3 py-3 text-center">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Download className="h-3 w-3" />
                          Generate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Statutory Summary */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">PF Monthly (March)</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(totalPF)}</p>
              <p className="text-xs text-muted-foreground">Employee: {formatCurrency(payroll.reduce((s, r) => s + r.deductions.pfEmployee, 0))} + Employer: {formatCurrency(payroll.reduce((s, r) => s + r.deductions.pfEmployer, 0))}</p>
              <Badge variant="warning" className="mt-2 text-[10px]">Due: 15th Apr</Badge>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ESI Monthly (March)</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(totalESI)}</p>
              <p className="text-xs text-muted-foreground">Employee: {formatCurrency(payroll.reduce((s, r) => s + r.deductions.esiEmployee, 0))} + Employer: {formatCurrency(payroll.reduce((s, r) => s + r.deductions.esiEmployer, 0))}</p>
              <Badge variant="warning" className="mt-2 text-[10px]">Due: 15th Apr</Badge>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">TDS Quarterly (Q4)</p>
              <p className="text-xl font-bold mt-1">
                {formatCurrency(payroll.reduce((s, r) => s + r.deductions.tds, 0) * 3)}
              </p>
              <p className="text-xs text-muted-foreground">Jan + Feb + Mar 2026</p>
              <Badge variant="outline" className="mt-2 text-[10px]">Due: 31st May</Badge>
            </Card>
          </div>
        </div>
      )}

      {/* Tax Slabs */}
      {activeSection === "slabs" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Tax Regime - FY 2025-26 (Default)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Income Slab</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {newRegimeSlabs.map((slab, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-4 py-3">{slab.range}</td>
                      <td className="px-3 py-3 text-right font-semibold">{slab.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <p>Standard Deduction: Rs. 75,000</p>
                <p>Rebate u/s 87A: No tax if taxable income up to Rs. 7,00,000</p>
                <p>Health & Education Cess: 4% on tax amount</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Statutory Contribution Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Provident Fund (PF)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="text-lg font-bold">12%</p>
                    <p className="text-[10px] text-muted-foreground">of Basic (max Rs. 15,000)</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Employer</p>
                    <p className="text-lg font-bold">12%</p>
                    <p className="text-[10px] text-muted-foreground">3.67% EPF + 8.33% EPS</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">ESI (if Gross &lt; Rs. 21,000)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Employee</p>
                    <p className="text-lg font-bold">0.75%</p>
                    <p className="text-[10px] text-muted-foreground">of Gross Salary</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Employer</p>
                    <p className="text-lg font-bold">3.25%</p>
                    <p className="text-[10px] text-muted-foreground">of Gross Salary</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Professional Tax (Tamil Nadu)</h4>
                <p className="text-sm">Monthly: Rs. 208 (if salary &gt; Rs. 21,000)</p>
                <p className="text-xs text-muted-foreground mt-1">Annual max: Rs. 2,500</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Processing status */}
      {status === "processing" && (
        <Card className="border-info/30 bg-info/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-4 w-4 border-2 border-info border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Processing payroll - calculating PF, ESI, PT, TDS...</p>
          </CardContent>
        </Card>
      )}

      {status === "approved" && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-medium">Payroll approved and ready for disbursement</p>
              <p className="text-xs text-muted-foreground">Click "Submit to Bank" to initiate NEFT/IMPS transfer</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Number to Words (Indian system) ──

function numberToWords(num: number): string {
  if (num === 0) return "Zero"
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
    "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function convert(n: number): string {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "")
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "")
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "")
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "")
  }

  return "Rupees " + convert(Math.round(num)) + " Only"
}

// ── Payslip Card Component ──

function PayslipCard({ employee }: { employee: PayrollEmployee }) {
  const e = employee
  const grossMonthly = e.ctc.basic + e.ctc.hra + e.ctc.specialAllowance + e.ctc.conveyance + e.ctc.medical
  const perDaySalary = Math.round(grossMonthly / 26)
  const payslipRef = useRef<HTMLDivElement>(null)

  const handleDownload = () => {
    if (payslipRef.current) {
      payslipRef.current.setAttribute("data-print-payslip", "true")
      window.print()
      payslipRef.current.removeAttribute("data-print-payslip")
    }
  }

  return (
    <div className="space-y-3">
      {/* Download button outside the printable area */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Printer className="h-3.5 w-3.5" />
          Download Payslip
        </Button>
      </div>

      <Card ref={payslipRef}>
        <CardContent className="p-6 space-y-5">
          {/* Company Header with Logo */}
          <div className="flex items-start gap-4">
            <img
              src="/thinksemi-logo.png"
              alt="Thinksemi Infotech"
              className="h-12 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-base font-bold">Thinksemi Infotech Pvt Ltd</h3>
              <p className="text-xs text-muted-foreground">
                Plot No. 7, SIDCO Industrial Estate, Ambattur, Chennai - 600058
              </p>
              <p className="text-xs text-muted-foreground">
                CIN: U72200TN2020PTC136789 | PF Reg No: TNCHN0012345
              </p>
            </div>
            <div className="text-right shrink-0">
              <Badge variant="outline" className="text-xs font-semibold">
                Payslip - March 2026
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Employee Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Employee Name</p>
              <p className="font-medium">{e.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="font-medium">{e.empId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Designation</p>
              <p className="font-medium">{e.designation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{e.dept}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">PAN</p>
              <p className="font-medium">ABCPD1234{e.empId.slice(-1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">UAN</p>
              <p className="font-medium">1012 3456 7{e.empId.slice(-3)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bank Account</p>
              <p className="font-medium">XXXX XXXX {1200 + parseInt(e.empId.slice(-3))}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tax Regime</p>
              <Badge variant="outline" className="text-[10px]">
                {e.taxRegime === "new" ? "New Regime" : "Old Regime"}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Earnings & Deductions Tables side by side */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Earnings Table */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-success flex items-center gap-1.5">
                Earnings
              </h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Component</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2">Basic Salary</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ctc.basic)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">House Rent Allowance</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ctc.hra)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Special Allowance</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ctc.specialAllowance)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Conveyance Allowance</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ctc.conveyance)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Medical Allowance</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.ctc.medical)}</td>
                    </tr>
                    {e.otPay > 0 && (
                      <tr className="border-b text-warning">
                        <td className="px-3 py-2">Overtime ({e.otHours}h)</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCurrency(e.otPay)}</td>
                      </tr>
                    )}
                    {e.lop > 0 && (
                      <tr className="border-b text-destructive">
                        <td className="px-3 py-2">LOP Deduction ({e.lop} days)</td>
                        <td className="px-3 py-2 text-right tabular-nums font-medium">-{formatCurrency(e.lop * perDaySalary)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-bold">
                      <td className="px-3 py-2">Gross Earnings</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.grossPay)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Deductions Table */}
            <div>
              <h4 className="text-sm font-semibold mb-2 text-destructive flex items-center gap-1.5">
                Deductions
              </h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Component</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2">Provident Fund (12%)</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.deductions.pfEmployee)}</td>
                    </tr>
                    {e.deductions.esiEmployee > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">ESI (0.75%)</td>
                        <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.deductions.esiEmployee)}</td>
                      </tr>
                    )}
                    <tr className="border-b">
                      <td className="px-3 py-2">Professional Tax (TN)</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.deductions.professionalTax)}</td>
                    </tr>
                    {e.deductions.tds > 0 && (
                      <tr className="border-b">
                        <td className="px-3 py-2">TDS (Income Tax)</td>
                        <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(e.deductions.tds)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-bold">
                      <td className="px-3 py-2">Total Deductions</td>
                      <td className="px-3 py-2 text-right tabular-nums text-destructive">{formatCurrency(e.totalDeductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Employer Contributions */}
          <div className="rounded-lg bg-muted/30 border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Employer Contributions (not deducted from salary)
            </p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">PF Employer (12%)</span>
                <span className="tabular-nums font-medium">{formatCurrency(e.deductions.pfEmployer)}</span>
              </div>
              {e.deductions.esiEmployer > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ESI Employer (3.25%)</span>
                  <span className="tabular-nums font-medium">{formatCurrency(e.deductions.esiEmployer)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Net Pay */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Pay (Take Home)</p>
                <p className="text-2xl font-bold">{formatCurrency(e.netPay)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">CTC (Annual)</p>
                <p className="text-sm font-semibold">{formatCurrency(e.ctcAnnual)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {numberToWords(e.netPay)}
            </p>
          </div>

          {/* YTD Summary */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">YTD Gross</p>
              <p className="text-sm font-bold">{formatCurrency(e.grossPay * 12)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">YTD PF</p>
              <p className="text-sm font-bold">{formatCurrency(e.deductions.pfEmployee * 12)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">YTD TDS</p>
              <p className="text-sm font-bold">{formatCurrency(e.deductions.tds * 12)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-[10px] text-muted-foreground uppercase">YTD Net</p>
              <p className="text-sm font-bold">{formatCurrency(e.netPay * 12)}</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
            This is a computer-generated payslip and does not require signature.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
