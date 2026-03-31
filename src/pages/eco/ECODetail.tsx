import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Trash2,
  Wrench,
  User,
  Eye,
  GitCompare,
  Shield,
  ListChecks,
  History,
  MessageSquare,
  XCircle,
  Zap,
} from "lucide-react"

// --- Mock data ---

const eco = {
  id: "ECO-042",
  product: "ECU-X500",
  type: "Component Swap",
  status: "pending",
  urgency: "high",
  requestedBy: "Arun K",
  date: "2026-03-28",
  reason:
    "U7 (LM358BDR) has been declared EOL by TI with last-buy date of 2026-06-30. Replacing with pin-compatible MCP6002 from Microchip which is in active production and offers better spec margins for this application.",
  revision: "Rev B",
  affectedBOMRevision: "Rev A.3",
}

const bomDiff = [
  { ref: "U7", oldPart: "LM358BDR", newPart: "MCP6002-I/SN", changeType: "Replaced", oldCost: 13.8, newCost: 11.2 },
  { ref: "R12", oldPart: "RC0402FR-0710K", newPart: "RC0402FR-0712K", changeType: "Modified", oldCost: 0.15, newCost: 0.15 },
  { ref: "C15", oldPart: "GRM155R71C104K", newPart: "-", changeType: "Removed", oldCost: 0.45, newCost: 0 },
  { ref: "C16", oldPart: "-", newPart: "GRM155R71E103K", changeType: "Added", oldCost: 0, newCost: 0.38 },
]

const changeTypeColors: Record<string, string> = {
  Replaced: "bg-info/10 text-info",
  Modified: "bg-warning/10 text-warning",
  Removed: "bg-destructive/10 text-destructive",
  Added: "bg-success/10 text-success",
}

const impactAnalysis = {
  affectedWorkOrders: [
    { id: "WO-2026-0341", board: "ECU-X500", qty: 1200, status: "active", impact: "Must pause before U7 placement, swap reel", costDelta: 3120 },
    { id: "WO-2026-0343", board: "ECU-X500", qty: 1200, status: "scheduled", impact: "Update PnP program before start", costDelta: 3120 },
  ],
  inventoryImpact: [
    { part: "LM358BDR", stock: 180, action: "Dispose / return to supplier", dispositionCost: 2484 },
    { part: "GRM155R71C104K", stock: 8200, action: "Retain (used elsewhere)", dispositionCost: 0 },
  ],
  costSummary: {
    oldCostPerUnit: 14.4,
    newCostPerUnit: 11.73,
    unitDelta: -2.67,
    totalDelta: -6408,
    dispositionCost: 2484,
    netImpact: -3924,
  },
  stencilChanges: false,
  gerberChanges: false,
}

const approvalChain = [
  {
    name: "Arun K",
    role: "Process Engineer",
    status: "approved" as const,
    date: "2026-03-28",
    comment: "Verified pin compatibility. MCP6002 is a drop-in replacement. No stencil or gerber changes needed.",
  },
  {
    name: "Priya S",
    role: "Quality Engineer",
    status: "approved" as const,
    date: "2026-03-29",
    comment: "Reviewed datasheet comparison. MCP6002 meets all spec requirements with better noise performance.",
  },
  {
    name: "Sandeep K",
    role: "Engineering Manager",
    status: "pending" as const,
    date: null,
    comment: null,
  },
]

const ccbMembers = [
  { name: "Sandeep K", role: "Engineering Manager", required: true },
  { name: "Arun K", role: "Process Engineer", required: true },
  { name: "Priya S", role: "Quality Engineer", required: true },
  { name: "Mohan R", role: "Procurement", required: false },
  { name: "Karthik R", role: "Production Lead", required: false },
]

const implementationChecklist = [
  { id: "impl-1", task: "Update BOM in ERP", assignee: "Arun K", status: "completed" as const },
  { id: "impl-2", task: "Update Pick & Place program", assignee: "Karthik R", status: "in_progress" as const },
  { id: "impl-3", task: "Update stencil (if needed)", assignee: "N/A", status: "not_applicable" as const },
  { id: "impl-4", task: "Update work instructions", assignee: "Arun K", status: "pending" as const },
  { id: "impl-5", task: "Notify procurement of new part", assignee: "Mohan R", status: "completed" as const },
  { id: "impl-6", task: "Update test fixtures / ICT program", assignee: "Deepa N", status: "pending" as const },
  { id: "impl-7", task: "Disposition existing inventory", assignee: "Mohan R", status: "pending" as const },
  { id: "impl-8", task: "First article verification", assignee: "Priya S", status: "pending" as const },
]

const auditLog = [
  { date: "2026-03-29 11:30", user: "Priya S", action: "Approved ECO", detail: "Quality review passed" },
  { date: "2026-03-29 10:15", user: "Mohan R", action: "PO raised for MCP6002", detail: "PO-2026-058 submitted to Mouser" },
  { date: "2026-03-28 16:00", user: "Arun K", action: "BOM updated", detail: "BOM Rev A.3 -> Rev A.4 (draft)" },
  { date: "2026-03-28 14:45", user: "Arun K", action: "Approved ECO", detail: "Process engineering review complete" },
  { date: "2026-03-28 14:00", user: "Arun K", action: "Impact analysis completed", detail: "2 WOs affected, no stencil/gerber changes" },
  { date: "2026-03-28 10:30", user: "Arun K", action: "ECO submitted", detail: "ECO-042 created for U7 component swap" },
  { date: "2026-03-27 17:00", user: "System", action: "EOL Alert triggered", detail: "TI LM358BDR EOL notice detected" },
]

// --- Tab definitions ---

const detailTabs = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "bom_changes", label: "BOM Changes", icon: GitCompare },
  { id: "impact", label: "Impact", icon: AlertTriangle },
  { id: "approvals", label: "Approvals", icon: Shield },
  { id: "implementation", label: "Implementation", icon: ListChecks },
  { id: "history", label: "History", icon: History },
] as const

type DetailTab = (typeof detailTabs)[number]["id"]

// --- Tab content components ---

function OverviewTab() {
  const urgencyColors: Record<string, string> = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Reason for Change</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{eco.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Change Type</p>
                  <Badge variant="outline" className="text-[10px] border-0 font-medium bg-info/10 text-info mt-1">{eco.type}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Urgency</p>
                  <Badge variant="outline" className={cn("text-[10px] border-0 font-medium capitalize mt-1", urgencyColors[eco.urgency])}>{eco.urgency}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revision</p>
                  <p className="text-sm font-medium mt-1">{eco.revision}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Affected BOM</p>
                  <p className="text-sm font-medium mt-1">{eco.affectedBOMRevision}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{bomDiff.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">BOM Changes</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{impactAnalysis.affectedWorkOrders.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">WOs Affected</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-success">{formatCurrency(Math.abs(impactAnalysis.costSummary.netImpact))}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net Savings</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{approvalChain.filter((a) => a.status === "approved").length}/{approvalChain.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Approvals</p>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Implementation Progress</p>
                <Progress
                  value={Math.round((implementationChecklist.filter((i) => i.status === "completed").length / implementationChecklist.filter((i) => i.status !== "not_applicable").length) * 100)}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {implementationChecklist.filter((i) => i.status === "completed").length} of {implementationChecklist.filter((i) => i.status !== "not_applicable").length} steps complete
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function BOMChangesTab() {
  const oldTotal = bomDiff.reduce((sum, r) => sum + r.oldCost, 0)
  const newTotal = bomDiff.reduce((sum, r) => sum + r.newCost, 0)

  return (
    <div className="space-y-4">
      {/* Side by side view */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">BOM Diff - Side by Side</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-muted">Rev A.3</Badge>
              <span className="text-xs text-muted-foreground">vs</span>
              <Badge variant="outline" className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400">Rev A.4 (Draft)</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Ref</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Change</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground bg-red-50/50 dark:bg-red-950/10">Old Part (Rev A.3)</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground bg-red-50/50 dark:bg-red-950/10">Old Cost</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground bg-emerald-50/50 dark:bg-emerald-950/10">New Part (Rev A.4)</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground bg-emerald-50/50 dark:bg-emerald-950/10">New Cost</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Delta</th>
                </tr>
              </thead>
              <tbody>
                {bomDiff.map((row) => {
                  const delta = row.newCost - row.oldCost
                  return (
                    <tr key={row.ref} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium">{row.ref}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[10px] border-0 font-medium", changeTypeColors[row.changeType])}>{row.changeType}</Badge>
                      </td>
                      <td className={cn("px-4 py-3 font-mono text-xs bg-red-50/30 dark:bg-red-950/5", row.oldPart === "-" ? "text-muted-foreground" : row.changeType === "Removed" ? "text-destructive line-through" : "text-muted-foreground")}>
                        {row.oldPart}
                      </td>
                      <td className="px-4 py-3 text-right text-xs bg-red-50/30 dark:bg-red-950/5">{row.oldCost > 0 ? formatCurrency(row.oldCost) : "-"}</td>
                      <td className={cn("px-4 py-3 font-mono text-xs bg-emerald-50/30 dark:bg-emerald-950/5", row.newPart === "-" ? "text-muted-foreground" : "text-foreground font-medium")}>
                        {row.newPart}
                      </td>
                      <td className="px-4 py-3 text-right text-xs bg-emerald-50/30 dark:bg-emerald-950/5">{row.newCost > 0 ? formatCurrency(row.newCost) : "-"}</td>
                      <td className={cn("px-4 py-3 text-right text-xs font-medium", delta < 0 ? "text-success" : delta > 0 ? "text-destructive" : "text-muted-foreground")}>
                        {delta !== 0 ? `${delta > 0 ? "+" : ""}${formatCurrency(delta)}` : "-"}
                      </td>
                    </tr>
                  )
                })}
                {/* Totals row */}
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-3" colSpan={3}>Total per board</td>
                  <td className="px-4 py-3 text-right text-xs">{formatCurrency(oldTotal)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right text-xs">{formatCurrency(newTotal)}</td>
                  <td className={cn("px-4 py-3 text-right text-xs", newTotal - oldTotal < 0 ? "text-success" : "text-destructive")}>
                    {formatCurrency(newTotal - oldTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ImpactTab() {
  return (
    <div className="space-y-4">
      {/* Cost Impact Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cost Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Old Cost/Unit</p>
              <p className="text-lg font-bold">{formatCurrency(impactAnalysis.costSummary.oldCostPerUnit)}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">New Cost/Unit</p>
              <p className="text-lg font-bold text-success">{formatCurrency(impactAnalysis.costSummary.newCostPerUnit)}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Delta (2400 units)</p>
              <p className="text-lg font-bold text-success">{formatCurrency(impactAnalysis.costSummary.totalDelta)}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Net Impact (incl. disposition)</p>
              <p className="text-lg font-bold text-success">{formatCurrency(impactAnalysis.costSummary.netImpact)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affected Work Orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Affected Work Orders</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Work Order</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Board</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Qty</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Status</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Impact Description</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Cost Delta</th>
                </tr>
              </thead>
              <tbody>
                {impactAnalysis.affectedWorkOrders.map((wo) => (
                  <tr key={wo.id} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono font-medium">{wo.id}</td>
                    <td className="px-4 py-3">{wo.board}</td>
                    <td className="px-4 py-3 text-right">{wo.qty.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={wo.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{wo.impact}</td>
                    <td className="px-4 py-3 text-right text-success font-medium">{formatCurrency(-wo.costDelta)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Disposition */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Inventory Disposition Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Part</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Current Stock</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Disposition Action</th>
                  <th className="text-right font-medium px-4 py-3 text-xs text-muted-foreground">Disposition Cost</th>
                </tr>
              </thead>
              <tbody>
                {impactAnalysis.inventoryImpact.map((item) => (
                  <tr key={item.part} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-4 py-3 font-mono">{item.part}</td>
                    <td className="px-4 py-3 text-right">{item.stock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.action}</td>
                    <td className={cn("px-4 py-3 text-right font-medium", item.dispositionCost > 0 ? "text-destructive" : "text-muted-foreground")}>
                      {item.dispositionCost > 0 ? formatCurrency(item.dispositionCost) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tooling impact */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Tooling Impact</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border px-3 py-2 flex items-center justify-between">
              <span className="text-xs">Stencil changes</span>
              <Badge variant="outline" className="text-[10px] border-0 bg-success/10 text-success font-medium">None</Badge>
            </div>
            <div className="rounded-md border px-3 py-2 flex items-center justify-between">
              <span className="text-xs">Gerber changes</span>
              <Badge variant="outline" className="text-[10px] border-0 bg-success/10 text-success font-medium">None</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ApprovalsTab() {
  return (
    <div className="space-y-4">
      {/* CCB Members */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Change Control Board (CCB)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ccbMembers.map((member) => {
              const approval = approvalChain.find((a) => a.name === member.name)
              return (
                <div key={member.name} className="rounded-lg border p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.required && <Badge variant="outline" className="text-[9px]">Required</Badge>}
                    {approval ? (
                      approval.status === "approved" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Optional</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Approval Chain Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Approval Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[15px] top-6 bottom-6 w-px bg-border" />
            <div className="space-y-6">
              {approvalChain.map((approver) => (
                <div key={approver.name} className="relative flex items-start gap-4">
                  <div
                    className={cn(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                      approver.status === "approved" ? "border-success bg-success/10" : "border-muted-foreground/30 bg-background"
                    )}
                  >
                    {approver.status === "approved" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{approver.name}</p>
                        <p className="text-xs text-muted-foreground">{approver.role}</p>
                        {approver.comment && (
                          <div className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3 inline mr-1.5" />
                            {approver.comment}
                          </div>
                        )}
                      </div>
                      {approver.status === "approved" ? (
                        <div className="text-right">
                          <Badge variant="outline" className="text-[10px] border-0 bg-success/10 text-success font-medium">Approved</Badge>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{approver.date}</p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-0 bg-warning/10 text-warning font-medium">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg border border-dashed p-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Approvals:</span>
            </div>
            <span className="text-sm font-medium">
              {approvalChain.filter((a) => a.status === "approved").length}/{approvalChain.length}
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-warning ml-auto" />
            <span className="text-xs text-warning">1 approval remaining</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ImplementationTab() {
  const applicable = implementationChecklist.filter((i) => i.status !== "not_applicable")
  const completed = applicable.filter((i) => i.status === "completed").length
  const progressPct = Math.round((completed / applicable.length) * 100)

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-success" />
    if (status === "in_progress") return <Clock className="h-4 w-4 text-info" />
    if (status === "not_applicable") return <XCircle className="h-4 w-4 text-muted-foreground/40" />
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Implementation Progress</h3>
            <span className="text-sm font-medium">{completed}/{applicable.length} steps complete</span>
          </div>
          <Progress value={progressPct} className="h-2.5" indicatorClassName={progressPct === 100 ? "bg-success" : "bg-teal-600"} />
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Implementation Checklist</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-center font-medium px-4 py-3 text-xs text-muted-foreground w-12">Status</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Task</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Assignee</th>
                  <th className="text-left font-medium px-4 py-3 text-xs text-muted-foreground">Progress</th>
                </tr>
              </thead>
              <tbody>
                {implementationChecklist.map((item) => (
                  <tr key={item.id} className={cn("border-b last:border-0 hover:bg-accent/30 transition-colors", item.status === "not_applicable" && "opacity-50")}>
                    <td className="px-4 py-3 text-center">{statusIcon(item.status)}</td>
                    <td className={cn("px-4 py-3 font-medium", item.status === "completed" && "line-through text-muted-foreground")}>{item.task}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.assignee}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={
                        item.status === "completed" ? "completed" :
                        item.status === "in_progress" ? "in_progress" :
                        item.status === "not_applicable" ? "idle" :
                        "pending"
                      } />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HistoryTab() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Full Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
          <div className="space-y-6">
            {auditLog.map((entry, idx) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/20 bg-background">
                  {entry.user === "System" ? <Zap className="h-3.5 w-3.5 text-muted-foreground" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">{entry.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{entry.user}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---

export function ECODetail() {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">{eco.id}</h1>
            <StatusBadge status={eco.status} />
            <Badge variant="outline" className="text-[10px] border-0 font-medium bg-info/10 text-info">{eco.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {eco.product} -- Requested by {eco.requestedBy} on {eco.date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Reject</Button>
          <Button size="sm">Approve</Button>
        </div>
      </div>

      {/* Highlighted Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border overflow-x-auto">
        {detailTabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "bom_changes" && <BOMChangesTab />}
      {activeTab === "impact" && <ImpactTab />}
      {activeTab === "approvals" && <ApprovalsTab />}
      {activeTab === "implementation" && <ImplementationTab />}
      {activeTab === "history" && <HistoryTab />}
    </div>
  )
}
