import { NavLink, useLocation } from "react-router-dom"
import { getCurrentUser } from "@/lib/auth"
import { canAccess } from "@/lib/permissions"
import {
  LayoutDashboard,
  Users,
  Target,
  Rocket,
  GitBranch,
  ShoppingCart,
  Package,
  Droplets,
  Factory,
  CheckCircle,
  Search as SearchIcon,
  Wrench,
  Truck,
  RotateCcw,
  IndianRupee,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/hr", icon: Users, label: "HR & Payroll" },
      { to: "/hr/salary", icon: Users, label: "Salary Structure" },
      { to: "/hr/holidays", icon: Users, label: "Holidays" },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/crm", icon: Target, label: "Sales CRM" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/finance", icon: IndianRupee, label: "Finance" },
    ],
  },
  {
    label: "Engineering",
    items: [
      { to: "/npi", icon: Rocket, label: "NPI Pipeline" },
      { to: "/eco", icon: GitBranch, label: "ECO / Revisions" },
    ],
  },
  {
    label: "Supply Chain",
    items: [
      { to: "/supply-chain", icon: ShoppingCart, label: "Supply Chain" },
      { to: "/inventory", icon: Package, label: "Inventory" },
      { to: "/inventory/item-master", icon: Package, label: "Item Master" },
      { to: "/msl", icon: Droplets, label: "MSL Control" },
    ],
  },
  {
    label: "Production",
    items: [
      { to: "/manufacturing", icon: Factory, label: "Manufacturing" },
    ],
  },
  {
    label: "Quality",
    items: [
      { to: "/quality", icon: CheckCircle, label: "Quality (QMS)" },
      { to: "/traceability", icon: SearchIcon, label: "Traceability" },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/maintenance", icon: Wrench, label: "Maintenance" },
      { to: "/delivery", icon: Truck, label: "Delivery" },
      { to: "/rma", icon: RotateCcw, label: "RMA & Warranty" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/settings", icon: Settings, label: "Settings" },
    ],
  },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const currentUser = getCurrentUser()
  const userRole = currentUser?.role

  // Filter nav groups based on user role
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccess(userRole, item.to)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white transition-all duration-300 flex flex-col dark:from-[#0e1225] dark:to-[#141827] dark:border-[#1e293b]",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-[var(--header-height)] items-center border-b border-slate-200 dark:border-[#1e293b] gap-3",
        collapsed ? "px-2 justify-center" : "px-4"
      )}>
        {collapsed ? (
          <img
            src="/thinksemi-logo.png"
            alt="Thinksemi"
            className="h-8 w-8 object-contain"
          />
        ) : (
          <img
            src="/thinksemi-logo.png"
            alt="Thinksemi Infotech"
            className="h-9 object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-2">
          {filteredGroups.map((group) => (
            <div key={group.label} className="py-1">
              {!collapsed && (
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-600">
                  {group.label}
                </div>
              )}
              {collapsed && group.label !== "Overview" && (
                <div className="mx-2 my-1 h-px bg-cyan-100 dark:bg-cyan-950/40" />
              )}
              {group.items.map((item) => {
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to)

                const link = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-200 dark:shadow-cyan-950/40"
                        : "text-slate-600 dark:text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-950/40 dark:hover:text-slate-400",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-white")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )

                if (collapsed) {
                  return (
                    <Tooltip key={item.to} delayDuration={0}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  )
                }

                return link
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Collapse toggle */}
      <div className="border-t border-slate-200 dark:border-[#1e293b] p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-cyan-50 hover:text-cyan-700 dark:hover:bg-slate-950/40 dark:hover:text-slate-500 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
