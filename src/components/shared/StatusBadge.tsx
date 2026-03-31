import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusLabels: Record<string, string> = {
  active: "Active",
  running: "Running",
  completed: "Completed",
  delivered: "Delivered",
  approved: "Approved",
  pass: "Pass",
  in_progress: "In Progress",
  production: "In Production",
  in_transit: "In Transit",
  pending: "Pending",
  draft: "Draft",
  changeover: "Changeover",
  review: "Review",
  overdue: "Overdue",
  failed: "Failed",
  expired: "Expired",
  rejected: "Rejected",
  on_hold: "On Hold",
  idle: "Idle",
  scheduled: "Scheduled",
  material_pending: "Material Pending",
  shipped: "Shipped",
  confirmed: "Confirmed",
  delayed: "Delayed",
  done: "Done",
  critical: "Critical",
  warning: "Warning",
  ok: "OK",
  due: "Due",
  analysis: "Under Analysis",
  rework: "Rework",
  ready: "Ready to Ship",
  paid: "Paid",
  partial: "Partial",
  sent: "Sent",
  partially_paid: "Partially Paid",
  pending_approval: "Pending Approval",
  payment_initiated: "Payment Initiated",
  under_review: "Under Review",
  submitted: "Submitted",
  received: "Received",
}

const statusColors: Record<string, string> = {
  // Success / green states
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  running: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  pass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  shipped: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",

  // Blue / in-progress states
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  production: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  in_transit: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  analysis: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",

  // Amber / warning states
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  changeover: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  material_pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  due: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  rework: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",

  // Red / error states
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
  delayed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",

  // Finance states
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  partially_paid: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  pending_approval: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  payment_initiated: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  under_review: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  received: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",

  // Neutral states
  on_hold: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  idle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",

  // Purple / scheduled
  scheduled: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  ready: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/\s+/g, "_")
  const label = statusLabels[normalized] ?? status
  const colorClass = statusColors[normalized] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"

  return (
    <Badge variant="outline" className={cn(colorClass, "border-0 font-semibold", className)}>
      {label}
    </Badge>
  )
}
