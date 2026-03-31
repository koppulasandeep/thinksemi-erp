import { useState } from "react"
import {
  Bell,
  Clock,
  Pencil,
  MessageSquare,
  Mail,
  CheckCheck,
  X,
  Wrench,
  ShieldAlert,
  Calendar,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// ─── Notification types ───
interface Notification {
  id: string
  type: "msl" | "quality" | "maintenance" | "eco" | "leave" | "po" | "complaint" | "general"
  message: string
  detail?: string
  time: Date
  read: boolean
  channels: ("email" | "whatsapp" | "inApp")[]
  mentioned?: boolean
}

const now = new Date(2026, 2, 29, 10, 30) // Mar 29, 2026 10:30 AM

function hoursAgo(h: number): Date {
  return new Date(now.getTime() - h * 60 * 60 * 1000)
}
function minutesAgo(m: number): Date {
  return new Date(now.getTime() - m * 60 * 1000)
}

const initialNotifications: Notification[] = [
  {
    id: "n-01",
    type: "msl",
    message: "3 MSL-3 components expiring in 4 hours",
    detail: "IC-7805 (Reel #R-4421), CAP-100uF (Reel #R-3318), RES-10K (Reel #R-2209)",
    time: minutesAgo(12),
    read: false,
    channels: ["email", "whatsapp", "inApp"],
  },
  {
    id: "n-02",
    type: "quality",
    message: "SMT Line 2 AOI yield dropped to 87.2%",
    detail: "Threshold: 94%. Board: ECU-X500. Defect: solder bridge on U3",
    time: minutesAgo(25),
    read: false,
    channels: ["email", "inApp"],
    mentioned: true,
  },
  {
    id: "n-03",
    type: "eco",
    message: "ECO-2026-0034 pending your approval",
    detail: "BOM change for PSU-200W: replace C12 (10uF → 22uF ceramic)",
    time: minutesAgo(48),
    read: false,
    channels: ["email", "inApp"],
    mentioned: true,
  },
  {
    id: "n-04",
    type: "maintenance",
    message: "Reflow Oven 1 PM due tomorrow",
    detail: "Scheduled preventive maintenance: zone calibration + thermocouple check",
    time: hoursAgo(1.5),
    read: false,
    channels: ["email", "inApp"],
  },
  {
    id: "n-05",
    type: "po",
    message: "PO-2026-53 from Arrow delayed by 3 days",
    detail: "Components: STM32F407VGT6 x 500 pcs. New ETA: Apr 2",
    time: hoursAgo(2),
    read: false,
    channels: ["email"],
  },
  {
    id: "n-06",
    type: "msl",
    message: "MSL-4 component bag opened: BGA-IC U7",
    detail: "Floor life: 72 hours. Expires: Mar 31, 2026 08:15 AM",
    time: hoursAgo(3),
    read: false,
    channels: ["inApp"],
  },
  {
    id: "n-07",
    type: "leave",
    message: "Leave request from Arjun Reddy",
    detail: "Casual leave: Apr 1-2 (2 days). Reason: Personal",
    time: hoursAgo(4),
    read: true,
    channels: ["inApp"],
  },
  {
    id: "n-08",
    type: "quality",
    message: "NCR-2026-0021 updated: rework completed",
    detail: "Karthik Iyer closed the rework. 12 boards reworked, 0 scrap",
    time: hoursAgo(5),
    read: true,
    channels: ["email", "inApp"],
    mentioned: true,
  },
  {
    id: "n-09",
    type: "complaint",
    message: "Customer complaint from Bosch India",
    detail: "RMA-2026-008: 3 boards with missing component R42. Batch: WO-2026-0298",
    time: hoursAgo(18),
    read: true,
    channels: ["email", "whatsapp", "inApp"],
  },
  {
    id: "n-10",
    type: "eco",
    message: "ECO-2026-0033 approved by Rajesh Menon",
    detail: "LED driver board BOM v3.2 finalized",
    time: hoursAgo(22),
    read: true,
    channels: ["email", "inApp"],
  },
  {
    id: "n-11",
    type: "maintenance",
    message: "Pick & Place M2 feeder jam cleared",
    detail: "Operator Arjun resolved feeder 14 jam. Downtime: 8 min",
    time: hoursAgo(26),
    read: true,
    channels: ["inApp"],
  },
  {
    id: "n-12",
    type: "po",
    message: "PO-2026-51 delivered: Mouser shipment received",
    detail: "47 line items received. GRN-2026-0112 created",
    time: hoursAgo(28),
    read: true,
    channels: ["email", "inApp"],
  },
  {
    id: "n-13",
    type: "msl",
    message: "MSL audit completed: 2 expired reels found",
    detail: "Reels sent to bake oven. Est. recovery: 24 hours",
    time: hoursAgo(42),
    read: true,
    channels: ["email", "whatsapp", "inApp"],
  },
  {
    id: "n-14",
    type: "quality",
    message: "Monthly quality report generated",
    detail: "FPY: 97.8%, DPMO: 342, 0 customer escapes in March",
    time: hoursAgo(46),
    read: true,
    channels: ["email", "inApp"],
  },
  {
    id: "n-15",
    type: "general",
    message: "System backup completed successfully",
    detail: "Daily backup: 2.4 GB. Duration: 4m 12s",
    time: hoursAgo(56),
    read: true,
    channels: ["inApp"],
  },
]

// ─── Helpers ───
const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  msl: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
  quality: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/30" },
  maintenance: { icon: Wrench, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/30" },
  eco: { icon: Pencil, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/30" },
  leave: { icon: Calendar, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/30" },
  po: { icon: Truck, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/30" },
  complaint: { icon: MessageSquare, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
  general: { icon: Bell, color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-800" },
}

function timeAgo(date: Date): string {
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getGroup(date: Date): string {
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  if (diffHours < 24) return "Today"
  if (diffHours < 48) return "Yesterday"
  return "Earlier"
}

type FilterTab = "all" | "unread" | "mentions"

// ─── Component ───
interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all")

  const unreadCount = notifications.filter(n => !n.read).length
  const mentionCount = notifications.filter(n => n.mentioned && !n.read).length

  const filtered = notifications.filter(n => {
    if (activeFilter === "unread") return !n.read
    if (activeFilter === "mentions") return n.mentioned === true
    return true
  })

  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    const group = getGroup(n.time)
    if (!acc[group]) acc[group] = []
    acc[group].push(n)
    return acc
  }, {})

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filterTabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
    { id: "mentions", label: "Mentions", count: mentionCount },
  ]

  return (
    <div className="absolute right-0 top-full mt-2 w-[420px] rounded-xl border bg-background shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-teal-600 hover:text-teal-700 h-7 px-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 pb-2">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              activeFilter === tab.id
                ? "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn(
                "h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center",
                activeFilter === tab.id
                  ? "bg-teal-500 text-white"
                  : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <Separator />

      {/* Notification list */}
      <ScrollArea className="h-[460px]">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="py-1">
            {["Today", "Yesterday", "Earlier"].map(group => {
              const items = grouped[group]
              if (!items || items.length === 0) return null
              return (
                <div key={group}>
                  <div className="px-4 py-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </span>
                  </div>
                  {items.map(notif => {
                    const config = typeConfig[notif.type]
                    const NotifIcon = config.icon
                    return (
                      <button
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors relative",
                          !notif.read && "bg-teal-50/40 dark:bg-teal-900/10"
                        )}
                      >
                        {/* Unread dot */}
                        {!notif.read && (
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-teal-500" />
                        )}

                        {/* Icon */}
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                          <NotifIcon className={cn("h-4 w-4", config.color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm leading-snug", !notif.read && "font-medium")}>
                            {notif.message}
                          </p>
                          {notif.detail && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.detail}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">{timeAgo(notif.time)}</span>
                            {/* Channel badges */}
                            <div className="flex items-center gap-1">
                              {notif.channels.includes("email") && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-muted-foreground/60 bg-muted rounded px-1 py-0.5">
                                  <Mail className="h-2.5 w-2.5" />
                                </span>
                              )}
                              {notif.channels.includes("whatsapp") && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600/60 bg-emerald-50 dark:bg-emerald-900/20 rounded px-1 py-0.5">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                </span>
                              )}
                              {notif.channels.includes("inApp") && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-teal-600/60 bg-teal-50 dark:bg-teal-900/20 rounded px-1 py-0.5">
                                  <Bell className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <Separator />
      <div className="px-4 py-2.5 flex justify-center">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          View all notifications
        </Button>
      </div>
    </div>
  )
}
