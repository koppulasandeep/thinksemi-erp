import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  Users,
  Receipt,
  Banknote,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ExportButtons, type ExportColumn } from "@/components/shared/ExportButtons"
import { cn, formatCurrency } from "@/lib/utils"
import { customerInvoices, vendorBills, payrollBatches } from "@/lib/mock-data"
import { useApiData, transformList } from "@/lib/useApi"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// ─── Tab definitions ───
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "customer", label: "Customer Payments" },
  { id: "vendor", label: "Vendor Payments" },
  { id: "payroll", label: "Payroll Approval" },
  { id: "reports", label: "Reports" },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Cash flow chart data (6 months) ───
const cashFlowData = [
  { month: "Oct", inflow: 2350000, outflow: 1820000 },
  { month: "Nov", inflow: 2780000, outflow: 2050000 },
  { month: "Dec", inflow: 2100000, outflow: 1950000 },
  { month: "Jan", inflow: 2650000, outflow: 2200000 },
  { month: "Feb", inflow: 2480000, outflow: 2100000 },
  { month: "Mar", inflow: 2920000, outflow: 2350000 },
]

// ─── Upcoming payments (next 7 days) ───
const upcomingPayments = [
  { id: 1, type: "Receivable", party: "Bosch India", amount: 425000, dueDate: "2026-03-30", status: "due_tomorrow" },
  { id: 2, type: "Payable", party: "Mouser Electronics", amount: 185000, dueDate: "2026-03-31", status: "due_soon" },
  { id: 3, type: "Receivable", party: "L&T", amount: 240000, dueDate: "2026-04-01", status: "due_soon" },
  { id: 4, type: "Payable", party: "PCB Power", amount: 92000, dueDate: "2026-04-02", status: "due_soon" },
  { id: 5, type: "Payroll", party: "March 2026 Salaries", amount: 685000, dueDate: "2026-04-01", status: "pending_approval" },
  { id: 6, type: "Receivable", party: "Continental", amount: 180000, dueDate: "2026-04-03", status: "due_soon" },
  { id: 7, type: "Payable", party: "Arrow Electronics", amount: 310000, dueDate: "2026-04-05", status: "due_soon" },
]

// ─── Payment modes ───
const paymentModes = ["NEFT", "RTGS", "Cheque", "UPI"] as const

// ─── Reports data ───
const gstSummary = {
  outputGST: 442800,
  inputGST: 318500,
  netLiability: 124300,
}

const tdsSummary = [
  { section: "194C - Contractor", deducted: 45000, deposited: 38000, pending: 7000 },
  { section: "194J - Professional", deducted: 22000, deposited: 22000, pending: 0 },
  { section: "194H - Commission", deducted: 8500, deposited: 8500, pending: 0 },
]

// ─── Monthly cash flow statement ───
const monthlyCashFlow = [
  { month: "Oct 2025", openingBalance: 1850000, inflow: 2350000, outflow: 1820000, closingBalance: 2380000 },
  { month: "Nov 2025", openingBalance: 2380000, inflow: 2780000, outflow: 2050000, closingBalance: 3110000 },
  { month: "Dec 2025", openingBalance: 3110000, inflow: 2100000, outflow: 1950000, closingBalance: 3260000 },
  { month: "Jan 2026", openingBalance: 3260000, inflow: 2650000, outflow: 2200000, closingBalance: 3710000 },
  { month: "Feb 2026", openingBalance: 3710000, inflow: 2480000, outflow: 2100000, closingBalance: 4090000 },
  { month: "Mar 2026", openingBalance: 4090000, inflow: 2920000, outflow: 2350000, closingBalance: 4660000 },
]

export function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Payments, receivables, payables, payroll and financial reports."
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
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "customer" && <CustomerPaymentsTab />}
      {activeTab === "vendor" && <VendorPaymentsTab />}
      {activeTab === "payroll" && <PayrollApprovalTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════════════════════════
function OverviewTab() {
  const { data: invoices } = useApiData("/finance/invoices", customerInvoices, (raw: any) => transformList(raw?.invoices ?? [], undefined) as typeof customerInvoices)
  const { data: bills } = useApiData("/finance/vendor-bills", vendorBills, (raw: any) => transformList(raw?.vendor_bills ?? [], undefined) as typeof vendorBills)
  const { data: payroll } = useApiData("/finance/payroll-approval", payrollBatches, (raw: any) => transformList(raw?.pending_batches ?? [], undefined) as typeof payrollBatches)

  const totalReceivables = invoices.reduce((s, i) => s + i.balance, 0)
  const totalPayables = bills.reduce((s, b) => s + b.balance, 0)
  const pendingPayroll = payroll.find((p) => p.status === "pending_approval")

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Cash Inflow (Mar)"
          value={formatCurrency(2920000)}
          change={17.7}
          changePeriod="vs Feb"
          icon={ArrowUpRight}
          color="green"
        />
        <KPICard
          title="Cash Outflow (Mar)"
          value={formatCurrency(2350000)}
          change={11.9}
          changePeriod="vs Feb"
          icon={ArrowDownRight}
          color="pink"
        />
        <KPICard
          title="Outstanding Receivables"
          value={formatCurrency(totalReceivables)}
          subtitle={`${invoices.filter((i) => i.status === "overdue").length} overdue`}
          icon={Receipt}
          color="blue"
        />
        <KPICard
          title="Outstanding Payables"
          value={formatCurrency(totalPayables)}
          subtitle={`${bills.filter((b) => b.status === "overdue").length} overdue`}
          icon={Banknote}
          color="orange"
        />
        <KPICard
          title="Payroll Pending"
          value={pendingPayroll ? formatCurrency(pendingPayroll.netPay) : "None"}
          subtitle={pendingPayroll ? `${pendingPayroll.month} - Awaiting approval` : "All clear"}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cash Flow (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis
                  className="text-xs"
                  tickFormatter={(v: number) => `${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend />
                <Bar dataKey="inflow" name="Inflow" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Payments Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Payments (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] border-0 font-semibold",
                        p.type === "Receivable"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : p.type === "Payable"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                          : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400"
                      )}
                    >
                      {p.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{p.dueDate}</span>
                  </div>
                  <p className="text-sm font-medium">{p.party}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(p.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER PAYMENTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function CustomerPaymentsTab() {
  const { data: invoiceData } = useApiData("/finance/invoices", customerInvoices, (raw: any) => transformList(raw?.invoices ?? [], undefined) as typeof customerInvoices)
  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    mode: "NEFT" as (typeof paymentModes)[number],
    reference: "",
  })

  const aging = {
    "0-30": invoiceData.filter((i) => i.agingDays >= 0 && i.agingDays <= 30).reduce((s, i) => s + i.balance, 0),
    "30-60": invoiceData.filter((i) => i.agingDays > 30 && i.agingDays <= 60).reduce((s, i) => s + i.balance, 0),
    "60-90": invoiceData.filter((i) => i.agingDays > 60 && i.agingDays <= 90).reduce((s, i) => s + i.balance, 0),
    "90+": invoiceData.filter((i) => i.agingDays > 90).reduce((s, i) => s + i.balance, 0),
  }

  const exportColumns: ExportColumn[] = [
    { key: "invoiceNo", label: "Invoice #" },
    { key: "customer", label: "Customer" },
    { key: "soNo", label: "SO #" },
    { key: "amount", label: "Amount" },
    { key: "dueDate", label: "Due Date" },
    { key: "status", label: "Status" },
    { key: "amountReceived", label: "Received" },
    { key: "balance", label: "Balance" },
  ]

  return (
    <div className="space-y-6">
      {/* Aging Analysis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground font-medium">0-30 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["0-30"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground font-medium">30-60 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["30-60"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <p className="text-xs text-muted-foreground font-medium">60-90 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["60-90"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-muted-foreground font-medium">90+ Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["90+"])}</p>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Customer Invoices</CardTitle>
          <ExportButtons
            data={invoiceData as unknown as Record<string, unknown>[]}
            columns={exportColumns}
            filename="customer-invoices"
            title="Customer Invoices"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3 font-medium">Invoice #</th>
                  <th className="text-left py-2 px-3 font-medium">Customer</th>
                  <th className="text-left py-2 px-3 font-medium">SO #</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 font-medium">Due Date</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Milestones</th>
                  <th className="text-right py-2 px-3 font-medium">Received</th>
                  <th className="text-right py-2 px-3 font-medium">Balance</th>
                  <th className="text-right py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.map((inv) => (
                  <tr key={inv.invoiceNo} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-mono text-xs">{inv.invoiceNo}</td>
                    <td className="py-2.5 px-3 font-medium">{inv.customer}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{inv.soNo}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(inv.amount)}</td>
                    <td className="py-2.5 px-3">{inv.dueDate}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        {inv.milestones.map((m, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={cn(
                              "text-[9px] px-1.5",
                              m.paid
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                            )}
                          >
                            {m.label} {m.percent}%
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(inv.amountReceived)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatCurrency(inv.balance)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {inv.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setRecordingId(recordingId === inv.invoiceNo ? null : inv.invoiceNo)
                          }
                        >
                          <CreditCard className="h-3 w-3" />
                          Record Payment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Payment Recording Form */}
          {recordingId && (
            <>
              <Separator className="my-4" />
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium">
                  Record Payment for{" "}
                  <span className="font-mono">{recordingId}</span>
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Amount</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={paymentForm.amount}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, amount: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Payment Date</label>
                    <Input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Mode</label>
                    <select
                      value={paymentForm.mode}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          mode: e.target.value as (typeof paymentModes)[number],
                        }))
                      }
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {paymentModes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Reference #</label>
                    <Input
                      placeholder="UTR / Cheque No."
                      value={paymentForm.reference}
                      onChange={(e) =>
                        setPaymentForm((f) => ({ ...f, reference: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button size="sm" className="h-9">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9"
                      onClick={() => setRecordingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// VENDOR PAYMENTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function VendorPaymentsTab() {
  const { data: billsData } = useApiData("/finance/vendor-bills", vendorBills, (raw: any) => transformList(raw?.vendor_bills ?? [], undefined) as typeof vendorBills)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [schedulingId, setSchedulingId] = useState<string | null>(null)
  const [scheduleDate, setScheduleDate] = useState("")

  const aging = {
    "0-30": billsData.filter((b) => b.agingDays >= 0 && b.agingDays <= 30).reduce((s, b) => s + b.balance, 0),
    "30-60": billsData.filter((b) => b.agingDays > 30 && b.agingDays <= 60).reduce((s, b) => s + b.balance, 0),
    "60-90": billsData.filter((b) => b.agingDays > 60 && b.agingDays <= 90).reduce((s, b) => s + b.balance, 0),
    "90+": billsData.filter((b) => b.agingDays > 90).reduce((s, b) => s + b.balance, 0),
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const unpaid = billsData.filter((b) => b.status !== "paid")
    if (selected.size === unpaid.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(unpaid.map((b) => b.billNo)))
    }
  }

  const exportColumns: ExportColumn[] = [
    { key: "billNo", label: "Bill #" },
    { key: "supplier", label: "Supplier" },
    { key: "poNo", label: "PO #" },
    { key: "amount", label: "Amount" },
    { key: "dueDate", label: "Due Date" },
    { key: "status", label: "Status" },
    { key: "paymentTerms", label: "Terms" },
    { key: "amountPaid", label: "Paid" },
    { key: "balance", label: "Balance" },
  ]

  return (
    <div className="space-y-6">
      {/* Aging Analysis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground font-medium">0-30 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["0-30"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground font-medium">30-60 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["30-60"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <p className="text-xs text-muted-foreground font-medium">60-90 Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["60-90"])}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs text-muted-foreground font-medium">90+ Days</p>
          <p className="text-xl font-bold mt-1">{formatCurrency(aging["90+"])}</p>
        </Card>
      </div>

      {/* Batch Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg">
          <span className="text-sm font-medium">
            {selected.size} bill{selected.size > 1 ? "s" : ""} selected
          </span>
          <span className="text-sm text-muted-foreground">
            Total: {formatCurrency(
              billsData
                .filter((b) => selected.has(b.billNo))
                .reduce((s, b) => s + b.balance, 0)
            )}
          </span>
          <Button size="sm" className="ml-auto">
            <Banknote className="h-3.5 w-3.5" />
            Pay Selected
          </Button>
        </div>
      )}

      {/* Vendor Bills Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vendor Bills</CardTitle>
          <ExportButtons
            data={billsData as unknown as Record<string, unknown>[]}
            columns={exportColumns}
            filename="vendor-bills"
            title="Vendor Bills"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3 font-medium">
                    <input
                      type="checkbox"
                      checked={selected.size === billsData.filter((b) => b.status !== "paid").length && selected.size > 0}
                      onChange={toggleAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-2 px-3 font-medium">Bill #</th>
                  <th className="text-left py-2 px-3 font-medium">Supplier</th>
                  <th className="text-left py-2 px-3 font-medium">PO #</th>
                  <th className="text-right py-2 px-3 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 font-medium">Due Date</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Terms</th>
                  <th className="text-right py-2 px-3 font-medium">Paid</th>
                  <th className="text-right py-2 px-3 font-medium">Balance</th>
                  <th className="text-right py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billsData.map((bill) => (
                  <tr key={bill.billNo} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3">
                      {bill.status !== "paid" && (
                        <input
                          type="checkbox"
                          checked={selected.has(bill.billNo)}
                          onChange={() => toggleSelect(bill.billNo)}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs">{bill.billNo}</td>
                    <td className="py-2.5 px-3 font-medium">{bill.supplier}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{bill.poNo}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(bill.amount)}</td>
                    <td className="py-2.5 px-3">{bill.dueDate}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="py-2.5 px-3 text-xs">{bill.paymentTerms}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(bill.amountPaid)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatCurrency(bill.balance)}</td>
                    <td className="py-2.5 px-3 text-right">
                      {bill.status !== "paid" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSchedulingId(schedulingId === bill.billNo ? null : bill.billNo)
                            }}
                          >
                            <Calendar className="h-3 w-3" />
                            Schedule
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schedule Payment Inline */}
          {schedulingId && (
            <>
              <Separator className="my-4" />
              <div className="bg-muted/30 rounded-lg p-4 flex items-end gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Schedule Payment for <span className="font-mono">{schedulingId}</span>
                  </label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="mt-1 w-48"
                  />
                </div>
                <Button size="sm" className="h-9">
                  <Clock className="h-3.5 w-3.5" />
                  Confirm Schedule
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9"
                  onClick={() => setSchedulingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PAYROLL APPROVAL TAB
// ══════════════════════════════════════════════════════════════════════════════
function PayrollApprovalTab() {
  const { data: payrollData } = useApiData("/finance/payroll-approval", payrollBatches, (raw: any) => transformList(raw?.pending_batches ?? [], undefined) as typeof payrollBatches)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Payroll Batches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 px-3 font-medium">Month</th>
                  <th className="text-right py-2 px-3 font-medium">Employees</th>
                  <th className="text-right py-2 px-3 font-medium">Gross Pay</th>
                  <th className="text-right py-2 px-3 font-medium">Deductions</th>
                  <th className="text-right py-2 px-3 font-medium">Net Pay</th>
                  <th className="text-right py-2 px-3 font-medium">Employer PF</th>
                  <th className="text-right py-2 px-3 font-medium">Employer ESI</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-right py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((batch) => (
                  <tr key={batch.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-3 font-medium">{batch.month}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{batch.totalEmployees}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(batch.grossPay)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(batch.totalDeductions)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold">{formatCurrency(batch.netPay)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(batch.employerPF)}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(batch.employerESI)}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            setExpandedId(expandedId === batch.id ? null : batch.id)
                          }
                        >
                          <FileText className="h-3 w-3" />
                          Review
                        </Button>
                        {batch.status === "pending_approval" && (
                          <>
                            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() =>
                                setShowRejectForm(
                                  showRejectForm === batch.id ? null : batch.id
                                )
                              }
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reject Reason Form */}
          {showRejectForm && (
            <>
              <Separator className="my-4" />
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Reject Payroll - {payrollData.find((b) => b.id === showRejectForm)?.month}
                </p>
                <Input
                  placeholder="Reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="destructive" size="sm">
                    Confirm Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRejectForm(null)
                      setRejectReason("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Expanded Payroll Detail */}
          {expandedId && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Employee Breakdown -{" "}
                  {payrollData.find((b) => b.id === expandedId)?.month}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left py-1.5 px-2 font-medium">Employee</th>
                        <th className="text-left py-1.5 px-2 font-medium">Department</th>
                        <th className="text-right py-1.5 px-2 font-medium">Basic</th>
                        <th className="text-right py-1.5 px-2 font-medium">HRA</th>
                        <th className="text-right py-1.5 px-2 font-medium">Allowances</th>
                        <th className="text-right py-1.5 px-2 font-medium">Gross</th>
                        <th className="text-right py-1.5 px-2 font-medium">PF</th>
                        <th className="text-right py-1.5 px-2 font-medium">ESI</th>
                        <th className="text-right py-1.5 px-2 font-medium">TDS</th>
                        <th className="text-right py-1.5 px-2 font-medium">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData
                        .find((b) => b.id === expandedId)
                        ?.employees.map((emp, idx) => (
                          <tr
                            key={idx}
                            className="border-b last:border-0 hover:bg-muted/30"
                          >
                            <td className="py-1.5 px-2 font-medium">{emp.name}</td>
                            <td className="py-1.5 px-2">{emp.department}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.basic)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.hra)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.allowances)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.gross)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.pf)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.esi)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums">{formatCurrency(emp.tds)}</td>
                            <td className="py-1.5 px-2 text-right tabular-nums font-semibold">{formatCurrency(emp.netPay)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs">
            {["HR Submits", "Finance Reviews", "Finance Approves", "Payment Processed"].map(
              (step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "px-3 py-1.5 rounded-full font-medium",
                      idx <= 1
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {step}
                  </div>
                  {idx < 3 && (
                    <div className="w-6 h-px bg-slate-300 dark:bg-slate-600" />
                  )}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// REPORTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function ReportsTab() {
  const { data: reportInvoices } = useApiData("/finance/invoices", customerInvoices, (raw: any) => transformList(raw?.invoices ?? [], undefined) as typeof customerInvoices)
  const { data: reportBills } = useApiData("/finance/vendor-bills", vendorBills, (raw: any) => transformList(raw?.vendor_bills ?? [], undefined) as typeof vendorBills)
  const [activeReport, setActiveReport] = useState<string>("receivables_aging")

  const reports = [
    { id: "receivables_aging", label: "Receivables Aging", icon: TrendingUp },
    { id: "payables_aging", label: "Payables Aging", icon: TrendingDown },
    { id: "cash_flow", label: "Cash Flow Statement", icon: IndianRupee },
    { id: "payment_history", label: "Payment History", icon: Clock },
    { id: "gst_summary", label: "GST Summary", icon: FileText },
    { id: "tds_summary", label: "TDS Deductions", icon: Receipt },
  ]

  const receivablesAgingColumns: ExportColumn[] = [
    { key: "customer", label: "Customer" },
    { key: "bucket0_30", label: "0-30 Days" },
    { key: "bucket30_60", label: "30-60 Days" },
    { key: "bucket60_90", label: "60-90 Days" },
    { key: "bucket90plus", label: "90+ Days" },
    { key: "total", label: "Total" },
  ]

  // Aggregate receivables by customer
  const receivablesAging = Object.values(
    reportInvoices.reduce<
      Record<string, { customer: string; bucket0_30: number; bucket30_60: number; bucket60_90: number; bucket90plus: number; total: number }>
    >((acc, inv) => {
      if (!acc[inv.customer]) {
        acc[inv.customer] = { customer: inv.customer, bucket0_30: 0, bucket30_60: 0, bucket60_90: 0, bucket90plus: 0, total: 0 }
      }
      const row = acc[inv.customer]
      if (inv.agingDays <= 30) row.bucket0_30 += inv.balance
      else if (inv.agingDays <= 60) row.bucket30_60 += inv.balance
      else if (inv.agingDays <= 90) row.bucket60_90 += inv.balance
      else row.bucket90plus += inv.balance
      row.total += inv.balance
      return acc
    }, {})
  )

  const payablesAgingColumns: ExportColumn[] = [
    { key: "supplier", label: "Supplier" },
    { key: "bucket0_30", label: "0-30 Days" },
    { key: "bucket30_60", label: "30-60 Days" },
    { key: "bucket60_90", label: "60-90 Days" },
    { key: "bucket90plus", label: "90+ Days" },
    { key: "total", label: "Total" },
  ]

  const payablesAging = Object.values(
    reportBills.reduce<
      Record<string, { supplier: string; bucket0_30: number; bucket30_60: number; bucket60_90: number; bucket90plus: number; total: number }>
    >((acc, bill) => {
      if (!acc[bill.supplier]) {
        acc[bill.supplier] = { supplier: bill.supplier, bucket0_30: 0, bucket30_60: 0, bucket60_90: 0, bucket90plus: 0, total: 0 }
      }
      const row = acc[bill.supplier]
      if (bill.agingDays <= 30) row.bucket0_30 += bill.balance
      else if (bill.agingDays <= 60) row.bucket30_60 += bill.balance
      else if (bill.agingDays <= 90) row.bucket60_90 += bill.balance
      else row.bucket90plus += bill.balance
      row.total += bill.balance
      return acc
    }, {})
  )

  const cashFlowColumns: ExportColumn[] = [
    { key: "month", label: "Month" },
    { key: "openingBalance", label: "Opening Balance" },
    { key: "inflow", label: "Inflow" },
    { key: "outflow", label: "Outflow" },
    { key: "closingBalance", label: "Closing Balance" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveReport(r.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                  activeReport === r.id
                    ? "bg-teal-100 text-teal-700 font-medium dark:bg-teal-900/40 dark:text-teal-400"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <r.icon className="h-4 w-4" />
                {r.label}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {activeReport === "receivables_aging" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Receivables Aging Report</CardTitle>
                <ExportButtons
                  data={receivablesAging as unknown as Record<string, unknown>[]}
                  columns={receivablesAgingColumns}
                  filename="receivables-aging"
                  title="Receivables Aging Report"
                />
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 px-3 font-medium">Customer</th>
                      <th className="text-right py-2 px-3 font-medium">0-30 Days</th>
                      <th className="text-right py-2 px-3 font-medium">30-60 Days</th>
                      <th className="text-right py-2 px-3 font-medium">60-90 Days</th>
                      <th className="text-right py-2 px-3 font-medium">90+ Days</th>
                      <th className="text-right py-2 px-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receivablesAging.map((row) => (
                      <tr key={row.customer} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{row.customer}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket0_30)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket30_60)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket60_90)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket90plus)}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeReport === "payables_aging" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Payables Aging Report</CardTitle>
                <ExportButtons
                  data={payablesAging as unknown as Record<string, unknown>[]}
                  columns={payablesAgingColumns}
                  filename="payables-aging"
                  title="Payables Aging Report"
                />
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 px-3 font-medium">Supplier</th>
                      <th className="text-right py-2 px-3 font-medium">0-30 Days</th>
                      <th className="text-right py-2 px-3 font-medium">30-60 Days</th>
                      <th className="text-right py-2 px-3 font-medium">60-90 Days</th>
                      <th className="text-right py-2 px-3 font-medium">90+ Days</th>
                      <th className="text-right py-2 px-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payablesAging.map((row) => (
                      <tr key={row.supplier} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{row.supplier}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket0_30)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket30_60)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket60_90)}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.bucket90plus)}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeReport === "cash_flow" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Cash Flow Statement (Monthly)</CardTitle>
                <ExportButtons
                  data={monthlyCashFlow as unknown as Record<string, unknown>[]}
                  columns={cashFlowColumns}
                  filename="cash-flow-statement"
                  title="Cash Flow Statement"
                />
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 px-3 font-medium">Month</th>
                      <th className="text-right py-2 px-3 font-medium">Opening Balance</th>
                      <th className="text-right py-2 px-3 font-medium">Inflow</th>
                      <th className="text-right py-2 px-3 font-medium">Outflow</th>
                      <th className="text-right py-2 px-3 font-medium">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyCashFlow.map((row) => (
                      <tr key={row.month} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{row.month}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.openingBalance)}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(row.inflow)}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-red-600 dark:text-red-400">{formatCurrency(row.outflow)}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatCurrency(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeReport === "payment_history" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Payment History</CardTitle>
                <div className="flex items-center gap-2">
                  <Input type="date" className="w-36 h-8 text-xs" />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input type="date" className="w-36 h-8 text-xs" />
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 px-3 font-medium">Date</th>
                      <th className="text-left py-2 px-3 font-medium">Type</th>
                      <th className="text-left py-2 px-3 font-medium">Party</th>
                      <th className="text-left py-2 px-3 font-medium">Reference</th>
                      <th className="text-left py-2 px-3 font-medium">Mode</th>
                      <th className="text-right py-2 px-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "2026-03-28", type: "Received", party: "Bosch India", ref: "INV-2026-042", mode: "NEFT", amount: 425000 },
                      { date: "2026-03-27", type: "Paid", party: "Mouser Electronics", ref: "BILL-2026-018", mode: "RTGS", amount: 185000 },
                      { date: "2026-03-25", type: "Received", party: "Continental", ref: "INV-2026-039", mode: "NEFT", amount: 360000 },
                      { date: "2026-03-22", type: "Paid", party: "Digi-Key", ref: "BILL-2026-016", mode: "Wire", amount: 125000 },
                      { date: "2026-03-20", type: "Received", party: "Tata Elxsi", ref: "INV-2026-037", mode: "RTGS", amount: 195000 },
                      { date: "2026-03-18", type: "Paid", party: "PCB Power", ref: "BILL-2026-015", mode: "NEFT", amount: 92000 },
                      { date: "2026-03-15", type: "Payroll", party: "Feb 2026 Salaries", ref: "PAY-2026-02", mode: "NEFT", amount: 672000 },
                    ].map((p, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3">{p.date}</td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] border-0 font-semibold",
                              p.type === "Received"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                                : p.type === "Paid"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                                : "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400"
                            )}
                          >
                            {p.type}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 font-medium">{p.party}</td>
                        <td className="py-2 px-3 font-mono text-xs">{p.ref}</td>
                        <td className="py-2 px-3 text-xs">{p.mode}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">{formatCurrency(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeReport === "gst_summary" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">GST Summary (March 2026)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 border-l-4 border-l-emerald-500">
                    <p className="text-xs text-muted-foreground font-medium">Output GST Collected</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(gstSummary.outputGST)}</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <p className="text-xs text-muted-foreground font-medium">Input GST Paid</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(gstSummary.inputGST)}</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-orange-500">
                    <p className="text-xs text-muted-foreground font-medium">Net GST Liability</p>
                    <p className="text-xl font-bold mt-1">{formatCurrency(gstSummary.netLiability)}</p>
                  </Card>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Output GST ({formatCurrency(gstSummary.outputGST)}) - Input GST ({formatCurrency(gstSummary.inputGST)}) = Net Liability ({formatCurrency(gstSummary.netLiability)})
                </p>
              </CardContent>
            </Card>
          )}

          {activeReport === "tds_summary" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">TDS Deduction Summary (FY 2025-26)</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs">
                      <th className="text-left py-2 px-3 font-medium">Section</th>
                      <th className="text-right py-2 px-3 font-medium">Total Deducted</th>
                      <th className="text-right py-2 px-3 font-medium">Deposited</th>
                      <th className="text-right py-2 px-3 font-medium">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsSummary.map((row) => (
                      <tr key={row.section} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{row.section}</td>
                        <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(row.deducted)}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">{formatCurrency(row.deposited)}</td>
                        <td className="py-2 px-3 text-right tabular-nums font-semibold">
                          {row.pending > 0 ? (
                            <span className="text-red-600 dark:text-red-400">{formatCurrency(row.pending)}</span>
                          ) : (
                            <span className="text-muted-foreground">{formatCurrency(0)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-semibold">
                      <td className="py-2 px-3">Total</td>
                      <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(tdsSummary.reduce((s, r) => s + r.deducted, 0))}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{formatCurrency(tdsSummary.reduce((s, r) => s + r.deposited, 0))}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-red-600 dark:text-red-400">{formatCurrency(tdsSummary.reduce((s, r) => s + r.pending, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
