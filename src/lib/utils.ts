import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    running: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    pass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    production: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    in_transit: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    changeover: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    review: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    expired: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    on_hold: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    idle: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    scheduled: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  }
  return map[status.toLowerCase().replace(/\s+/g, "_")] ?? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
}
