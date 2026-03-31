import { useState } from "react"
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  IndianRupee,
  Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, cn } from "@/lib/utils"

// ── Types ──

type FilingStatus = "filed" | "pending" | "overdue" | "not_due"

interface ComplianceItem {
  id: string
  name: string
  category: string
  period: string
  dueDate: string
  dueDateObj: Date
  status: FilingStatus
  filedDate?: string
  amount?: number
  remarks?: string
}

// ── Helper ──

function getDaysUntil(dateStr: string): number {
  const today = new Date(2026, 2, 29) // March 29, 2026
  const parts = dateStr.split(" ")
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }
  const day = parseInt(parts[0])
  const month = months[parts[1]] ?? 0
  const year = parseInt(parts[2])
  const due = new Date(year, month, day)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getStatusBadge(status: FilingStatus): React.ReactNode {
  const styles: Record<FilingStatus, { bg: string; text: string; label: string }> = {
    filed: { bg: "bg-success/10", text: "text-success", label: "Filed" },
    pending: { bg: "bg-warning/10", text: "text-warning", label: "Pending" },
    overdue: { bg: "bg-destructive/10", text: "text-destructive", label: "Overdue" },
    not_due: { bg: "bg-muted", text: "text-muted-foreground", label: "Not Due" },
  }
  const s = styles[status]
  return (
    <Badge variant="outline" className={cn(s.bg, s.text, "border-0 font-medium")}>
      {s.label}
    </Badge>
  )
}

// ── Mock Data ──

const complianceData: ComplianceItem[] = [
  // PF Monthly
  { id: "pf-oct", name: "PF Return (ECR)", category: "PF", period: "October 2025", dueDate: "15 Nov 2025", dueDateObj: new Date(2025, 10, 15), status: "filed", filedDate: "12 Nov 2025", amount: 28800 },
  { id: "pf-nov", name: "PF Return (ECR)", category: "PF", period: "November 2025", dueDate: "15 Dec 2025", dueDateObj: new Date(2025, 11, 15), status: "filed", filedDate: "14 Dec 2025", amount: 28800 },
  { id: "pf-dec", name: "PF Return (ECR)", category: "PF", period: "December 2025", dueDate: "15 Jan 2026", dueDateObj: new Date(2026, 0, 15), status: "filed", filedDate: "13 Jan 2026", amount: 28800 },
  { id: "pf-jan", name: "PF Return (ECR)", category: "PF", period: "January 2026", dueDate: "15 Feb 2026", dueDateObj: new Date(2026, 1, 15), status: "filed", filedDate: "14 Feb 2026", amount: 28800 },
  { id: "pf-feb", name: "PF Return (ECR)", category: "PF", period: "February 2026", dueDate: "15 Mar 2026", dueDateObj: new Date(2026, 2, 15), status: "filed", filedDate: "12 Mar 2026", amount: 28800 },
  { id: "pf-mar", name: "PF Return (ECR)", category: "PF", period: "March 2026", dueDate: "15 Apr 2026", dueDateObj: new Date(2026, 3, 15), status: "pending", amount: 28800 },

  // ESI
  { id: "esi-oct", name: "ESI Monthly", category: "ESI", period: "Oct 2025", dueDate: "15 Nov 2025", dueDateObj: new Date(2025, 10, 15), status: "filed", filedDate: "12 Nov 2025", amount: 2984 },
  { id: "esi-nov", name: "ESI Monthly", category: "ESI", period: "Nov 2025", dueDate: "15 Dec 2025", dueDateObj: new Date(2025, 11, 15), status: "filed", filedDate: "14 Dec 2025", amount: 2984 },
  { id: "esi-dec", name: "ESI Monthly", category: "ESI", period: "Dec 2025", dueDate: "15 Jan 2026", dueDateObj: new Date(2026, 0, 15), status: "filed", filedDate: "13 Jan 2026", amount: 2984 },
  { id: "esi-jan", name: "ESI Monthly", category: "ESI", period: "Jan 2026", dueDate: "15 Feb 2026", dueDateObj: new Date(2026, 1, 15), status: "filed", filedDate: "14 Feb 2026", amount: 2984 },
  { id: "esi-feb", name: "ESI Monthly", category: "ESI", period: "Feb 2026", dueDate: "15 Mar 2026", dueDateObj: new Date(2026, 2, 15), status: "filed", filedDate: "12 Mar 2026", amount: 2984 },
  { id: "esi-mar", name: "ESI Monthly", category: "ESI", period: "Mar 2026", dueDate: "15 Apr 2026", dueDateObj: new Date(2026, 3, 15), status: "pending", amount: 2984 },

  // PT
  { id: "pt-q3", name: "Professional Tax (TN)", category: "PT", period: "Oct-Dec 2025", dueDate: "31 Jan 2026", dueDateObj: new Date(2026, 0, 31), status: "filed", filedDate: "28 Jan 2026", amount: 4368 },
  { id: "pt-q4", name: "Professional Tax (TN)", category: "PT", period: "Jan-Mar 2026", dueDate: "30 Apr 2026", dueDateObj: new Date(2026, 3, 30), status: "pending", amount: 4368 },

  // TDS
  { id: "tds-q2", name: "TDS - Form 24Q", category: "TDS", period: "Q2 (Jul-Sep 2025)", dueDate: "31 Oct 2025", dueDateObj: new Date(2025, 9, 31), status: "filed", filedDate: "28 Oct 2025", amount: 23400 },
  { id: "tds-q3", name: "TDS - Form 24Q", category: "TDS", period: "Q3 (Oct-Dec 2025)", dueDate: "31 Jan 2026", dueDateObj: new Date(2026, 0, 31), status: "filed", filedDate: "29 Jan 2026", amount: 23400 },
  { id: "tds-q4", name: "TDS - Form 24Q", category: "TDS", period: "Q4 (Jan-Mar 2026)", dueDate: "31 May 2026", dueDateObj: new Date(2026, 4, 31), status: "pending", amount: 23400 },

  // Form 16
  { id: "form16", name: "Form 16 Generation", category: "Form 16", period: "FY 2025-26", dueDate: "15 Jun 2026", dueDateObj: new Date(2026, 5, 15), status: "not_due", remarks: "Generate after FY close" },

  // LWF
  { id: "lwf-h2", name: "Labour Welfare Fund", category: "LWF", period: "H2 (Jul-Dec 2025)", dueDate: "15 Jan 2026", dueDateObj: new Date(2026, 0, 15), status: "filed", filedDate: "10 Jan 2026", amount: 240 },
  { id: "lwf-h1", name: "Labour Welfare Fund", category: "LWF", period: "H1 (Jan-Jun 2026)", dueDate: "15 Jul 2026", dueDateObj: new Date(2026, 6, 15), status: "not_due", amount: 240 },

  // Bonus
  { id: "bonus", name: "Payment of Bonus (Annual)", category: "Bonus", period: "FY 2025-26", dueDate: "30 Apr 2026", dueDateObj: new Date(2026, 3, 30), status: "pending", remarks: "8.33% of Basic, min Rs. 7,000" },

  // Minimum Wages
  { id: "minwage", name: "Minimum Wages Compliance", category: "Min Wages", period: "March 2026", dueDate: "31 Mar 2026", dueDateObj: new Date(2026, 2, 31), status: "filed", remarks: "All employees above TN min wage Rs. 556/day" },
]

const upcomingDeadlines = complianceData
  .filter((c) => c.status === "pending" || c.status === "not_due")
  .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime())

// ── Component ──

export function Compliance() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = ["all", "PF", "ESI", "PT", "TDS", "Form 16", "LWF", "Bonus", "Min Wages"]

  const filteredData = selectedCategory === "all"
    ? complianceData
    : complianceData.filter((c) => c.category === selectedCategory)

  const filedCount = complianceData.filter((c) => c.status === "filed").length
  const pendingCount = complianceData.filter((c) => c.status === "pending").length
  const overdueCount = complianceData.filter((c) => c.status === "overdue").length
  const totalCompliance = complianceData.filter((c) => c.status !== "not_due").length
  const complianceRate = totalCompliance > 0 ? Math.round((filedCount / totalCompliance) * 100) : 100

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Compliance Rate"
          value={`${complianceRate}%`}
          subtitle={`${filedCount} of ${totalCompliance} filings done`}
          icon={Shield}
          iconColor="text-success"
        />
        <KPICard
          title="Filed on Time"
          value={String(filedCount)}
          subtitle="This financial year"
          icon={CheckCircle2}
          iconColor="text-success"
        />
        <KPICard
          title="Pending"
          value={String(pendingCount)}
          subtitle="Action required"
          icon={Clock}
          iconColor="text-warning"
        />
        <KPICard
          title="Overdue"
          value={String(overdueCount)}
          subtitle={overdueCount > 0 ? "Immediate action needed" : "All clear"}
          icon={AlertTriangle}
          iconColor={overdueCount > 0 ? "text-destructive" : "text-success"}
        />
        <KPICard
          title="Next Deadline"
          value={upcomingDeadlines.length > 0 ? `${getDaysUntil(upcomingDeadlines[0].dueDate)}d` : "N/A"}
          subtitle={upcomingDeadlines.length > 0 ? upcomingDeadlines[0].name : ""}
          icon={Calendar}
          iconColor="text-info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Return / Filing</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Period</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Due Date</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Countdown</th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Filed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => {
                      const daysLeft = getDaysUntil(item.dueDate)
                      return (
                        <tr key={item.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.category}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">{item.period}</td>
                          <td className="px-3 py-3">{item.dueDate}</td>
                          <td className="px-3 py-3 text-center">
                            {item.status === "filed" ? (
                              <span className="text-xs text-success">Done</span>
                            ) : item.status === "not_due" ? (
                              <span className="text-xs text-muted-foreground">{daysLeft}d away</span>
                            ) : daysLeft < 0 ? (
                              <Badge variant="destructive" className="text-[10px]">{Math.abs(daysLeft)}d overdue</Badge>
                            ) : daysLeft <= 7 ? (
                              <Badge variant="warning" className="text-[10px]">{daysLeft}d left</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">{daysLeft}d left</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {getStatusBadge(item.status)}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {item.amount ? formatCurrency(item.amount) : "-"}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground text-xs">
                            {item.filedDate || (item.remarks ? item.remarks : "-")}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.slice(0, 6).map((item) => {
                const daysLeft = getDaysUntil(item.dueDate)
                return (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className={cn(
                      "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      daysLeft <= 7 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {daysLeft}d
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.period}</p>
                      <p className="text-[10px] text-muted-foreground">Due: {item.dueDate}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Minimum Wages Check */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                Minimum Wages - Tamil Nadu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-success/5 border border-success/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <p className="text-sm font-medium text-success">All Compliant</p>
                </div>
                <p className="text-xs text-muted-foreground">Minimum daily wage (skilled): Rs. 556/day</p>
                <p className="text-xs text-muted-foreground">Lowest monthly salary: Rs. 18,000</p>
                <p className="text-xs text-muted-foreground">Equivalent daily: Rs. 692/day (above minimum)</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Unskilled: Rs. 456/day</p>
                <p>Semi-skilled: Rs. 506/day</p>
                <p>Skilled: Rs. 556/day</p>
                <p>Highly Skilled: Rs. 616/day</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment of Bonus */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Payment of Bonus Act
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Bonus</span>
                <span className="font-medium">8.33% of Basic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maximum Bonus</span>
                <span className="font-medium">20% of Basic</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salary Ceiling</span>
                <span className="font-medium">Rs. 21,000/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Eligible Employees</span>
                <span className="font-medium">5 of 8</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Estimated Bonus (8.33%)</span>
                <span>{formatCurrency(52800)}</span>
              </div>
              <Badge variant="warning" className="text-[10px]">Due: 30th April 2026</Badge>
            </CardContent>
          </Card>

          {/* Form 16 Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Form 16 Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Due: 15th June 2026 (after FY close)</p>
              <div className="space-y-2">
                {[
                  { name: "Part A (TDS Certificate)", status: "Not started" },
                  { name: "Part B (Salary Details)", status: "Not started" },
                  { name: "Annexure (Investment Proofs)", status: "Collection pending" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-2.5">
                    <span className="text-sm">{item.name}</span>
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                8 employees eligible for Form 16
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
