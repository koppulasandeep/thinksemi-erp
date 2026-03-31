import { useState } from "react"
import {
  Building2,
  Users,
  Bell,
  Plug,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Server,
  Database,
  HardDrive,
  Clock,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Package,
  Truck,
  Calculator,
  Cpu,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn, getInitials } from "@/lib/utils"

// ─── Tab definitions ───
const tabs = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "system", label: "System", icon: Settings },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Company data ───
const companyData = {
  name: "Thinksemi Electronics Pvt. Ltd.",
  logo: null,
  address: "Plot 42, Phase 2, Electronics City, Bengaluru, Karnataka 560100",
  gstin: "29AABCT1234F1Z5",
  pan: "AABCT1234F",
  cin: "U31909KA2020PTC138456",
  phone: "+91 80 4567 8900",
  email: "info@thinksemi.com",
  website: "www.thinksemi.com",
  currency: "INR",
  financialYear: "Apr 2025 - Mar 2026",
}

// ─── Users data ───
const mockUsers = [
  { id: "usr-001", name: "Sandeep Koppula", email: "sandeep@thinksemi.com", role: "Super Admin", department: "Management", status: "active", lastLogin: "2026-03-29 09:15" },
  { id: "usr-002", name: "Priya Sharma", email: "priya@thinksemi.com", role: "Admin", department: "Operations", status: "active", lastLogin: "2026-03-29 08:42" },
  { id: "usr-003", name: "Rajesh Menon", email: "rajesh.m@thinksemi.com", role: "Engineering Manager", department: "Engineering", status: "active", lastLogin: "2026-03-29 10:05" },
  { id: "usr-004", name: "Anita Desai", email: "anita.d@thinksemi.com", role: "Production Manager", department: "Manufacturing", status: "active", lastLogin: "2026-03-28 17:30" },
  { id: "usr-005", name: "Vikram Patel", email: "vikram.p@thinksemi.com", role: "Supply Chain Manager", department: "Supply Chain", status: "active", lastLogin: "2026-03-29 07:55" },
  { id: "usr-006", name: "Deepa Nair", email: "deepa.n@thinksemi.com", role: "HR Manager", department: "Human Resources", status: "active", lastLogin: "2026-03-28 16:20" },
  { id: "usr-007", name: "Karthik Iyer", email: "karthik.i@thinksemi.com", role: "Quality Engineer", department: "Quality", status: "active", lastLogin: "2026-03-29 09:45" },
  { id: "usr-008", name: "Meera Joshi", email: "meera.j@thinksemi.com", role: "Sales", department: "Sales", status: "active", lastLogin: "2026-03-27 14:10" },
  { id: "usr-009", name: "Arjun Reddy", email: "arjun.r@thinksemi.com", role: "Operator", department: "Manufacturing", status: "active", lastLogin: "2026-03-29 06:00" },
  { id: "usr-010", name: "Shalini Gupta", email: "shalini.g@bosch.com", role: "Customer", department: "External", status: "inactive", lastLogin: "2026-03-15 11:00" },
]

// ─── Roles & permissions matrix ───
const modules = [
  "Dashboard", "NPI", "BOM", "ECO", "Work Instructions", "Manufacturing",
  "Schedule", "Quality", "Traceability", "NCR/CAPA", "Inventory", "MSL",
  "Sales Orders", "PO", "Delivery", "CRM", "Quotations", "Finance", "HR",
  "Maintenance", "Settings", "Payroll Config", "Portal",
]

interface RoleDef {
  name: string
  description: string
  color: string
  permissions: Record<string, "full" | "read" | "none">
}

const roles: RoleDef[] = [
  {
    name: "Super Admin",
    description: "Full access to all modules and system settings",
    color: "bg-red-500",
    permissions: Object.fromEntries(modules.map(m => [m, "full"])) as Record<string, "full">,
  },
  {
    name: "Admin",
    description: "All modules except system settings",
    color: "bg-orange-500",
    permissions: Object.fromEntries(modules.map(m => [m, m === "Settings" ? "none" : "full"])) as Record<string, "full" | "none">,
  },
  {
    name: "HR Manager",
    description: "HR module, read-only access to others",
    color: "bg-pink-500",
    permissions: Object.fromEntries(modules.map(m => [m, m === "HR" ? "full" : m === "Settings" || m === "Portal" ? "none" : "read"])) as Record<string, "full" | "read" | "none">,
  },
  {
    name: "Finance Manager",
    description: "Finance, payroll approval, PO payment visibility",
    color: "bg-teal-500",
    permissions: Object.fromEntries(modules.map(m => {
      if (m === "Finance") return [m, "full"]
      if (m === "HR") return [m, "read"]
      if (m === "PO") return [m, "read"]
      if (m === "Payroll Config") return [m, "read"]
      if (m === "Dashboard") return [m, "read"]
      return [m, "none"]
    })) as Record<string, "full" | "read" | "none">,
  },
  {
    name: "Engineering Manager",
    description: "NPI, ECO, BOM, Work Instructions, Quality",
    color: "bg-violet-500",
    permissions: Object.fromEntries(modules.map(m => {
      const eng = ["NPI", "ECO", "BOM", "Work Instructions", "Quality", "Traceability", "NCR/CAPA", "Dashboard"]
      return [m, eng.includes(m) ? "full" : "none"]
    })) as Record<string, "full" | "none">,
  },
  {
    name: "Production Manager",
    description: "Manufacturing, Schedule, Quality, Maintenance",
    color: "bg-blue-500",
    permissions: Object.fromEntries(modules.map(m => {
      const prod = ["Manufacturing", "Schedule", "Quality", "Maintenance", "Traceability", "Dashboard"]
      return [m, prod.includes(m) ? "full" : "none"]
    })) as Record<string, "full" | "none">,
  },
  {
    name: "Supply Chain Manager",
    description: "Sales Orders, PO, Inventory, MSL, Delivery",
    color: "bg-sky-500",
    permissions: Object.fromEntries(modules.map(m => {
      const sc = ["Sales Orders", "PO", "Inventory", "MSL", "Delivery", "Dashboard"]
      return [m, sc.includes(m) ? "full" : "none"]
    })) as Record<string, "full" | "none">,
  },
  {
    name: "Sales",
    description: "CRM and Quotations",
    color: "bg-emerald-500",
    permissions: Object.fromEntries(modules.map(m => {
      const sales = ["CRM", "Quotations", "Dashboard"]
      return [m, sales.includes(m) ? "full" : "none"]
    })) as Record<string, "full" | "none">,
  },
  {
    name: "Quality Engineer",
    description: "Quality, Traceability, NCR, CAPA",
    color: "bg-cyan-500",
    permissions: Object.fromEntries(modules.map(m => {
      const qa = ["Quality", "Traceability", "NCR/CAPA", "Dashboard"]
      return [m, qa.includes(m) ? "full" : "none"]
    })) as Record<string, "full" | "none">,
  },
  {
    name: "Operator",
    description: "Shop floor view, scan, defect log, work instructions",
    color: "bg-amber-500",
    permissions: Object.fromEntries(modules.map(m => {
      const op = ["Manufacturing", "Work Instructions", "Quality", "Dashboard"]
      return [m, op.includes(m) ? "read" : "none"]
    })) as Record<string, "read" | "none">,
  },
  {
    name: "Customer",
    description: "Portal only",
    color: "bg-slate-400",
    permissions: Object.fromEntries(modules.map(m => [m, m === "Portal" ? "full" : "none"])) as Record<string, "full" | "none">,
  },
]

// ─── Notification rules ───
type Channel = "email" | "whatsapp" | "inApp"

interface NotifRule {
  id: string
  trigger: string
  description: string
  channels: Record<Channel, boolean>
  icon: React.ElementType
  color: string
}

const notificationRules: NotifRule[] = [
  { id: "msl-expiry", trigger: "MSL Expiry Warning", description: "Component moisture sensitivity level nearing expiry", channels: { email: true, whatsapp: true, inApp: true }, icon: Clock, color: "text-amber-500" },
  { id: "quality-escape", trigger: "Quality Escape (Yield Drop)", description: "AOI/ICT yield drops below threshold", channels: { email: true, whatsapp: false, inApp: true }, icon: AlertTriangle, color: "text-red-500" },
  { id: "maintenance-overdue", trigger: "Maintenance Overdue", description: "Scheduled maintenance past due date", channels: { email: true, whatsapp: false, inApp: true }, icon: Settings, color: "text-orange-500" },
  { id: "po-delayed", trigger: "PO Delayed", description: "Purchase order delivery date exceeded", channels: { email: true, whatsapp: false, inApp: false }, icon: Package, color: "text-sky-500" },
  { id: "eco-approval", trigger: "ECO Pending Approval", description: "Engineering change order awaiting sign-off", channels: { email: true, whatsapp: false, inApp: true }, icon: Pencil, color: "text-violet-500" },
  { id: "leave-request", trigger: "Leave Request", description: "New leave application submitted", channels: { email: false, whatsapp: false, inApp: true }, icon: Users, color: "text-pink-500" },
  { id: "payment-due", trigger: "Payment Due", description: "Customer invoice payment approaching due date", channels: { email: true, whatsapp: false, inApp: false }, icon: Calculator, color: "text-teal-500" },
  { id: "customer-complaint", trigger: "Customer Complaint", description: "New complaint or RMA received", channels: { email: true, whatsapp: true, inApp: true }, icon: MessageSquare, color: "text-red-500" },
]

// ─── Integration data ───
interface Integration {
  name: string
  description: string
  category: string
  status: "connected" | "not_configured" | "error"
  icon: React.ElementType
  fields: { label: string; value: string; type?: string }[]
}

const integrations: Integration[] = [
  {
    name: "ZKTeco Biometric",
    description: "Biometric attendance device integration",
    category: "Biometric Devices",
    status: "connected",
    icon: Smartphone,
    fields: [
      { label: "Device IP", value: "192.168.1.201" },
      { label: "Port", value: "4370" },
      { label: "Device ID", value: "ZK-001" },
    ],
  },
  {
    name: "Tally Prime",
    description: "Accounting software data export",
    category: "Accounting",
    status: "connected",
    icon: Calculator,
    fields: [
      { label: "Host", value: "localhost" },
      { label: "Port", value: "9000" },
      { label: "Company", value: "Thinksemi Electronics" },
    ],
  },
  {
    name: "Zoho Books",
    description: "Cloud accounting integration",
    category: "Accounting",
    status: "not_configured",
    icon: Globe,
    fields: [
      { label: "Organization ID", value: "" },
      { label: "API Token", value: "", type: "password" },
    ],
  },
  {
    name: "FedEx",
    description: "International shipping carrier",
    category: "Shipping Carriers",
    status: "connected",
    icon: Truck,
    fields: [
      { label: "Account Number", value: "2834****91" },
      { label: "API Key", value: "fedx_****_k8m2", type: "password" },
    ],
  },
  {
    name: "DHL Express",
    description: "International express delivery",
    category: "Shipping Carriers",
    status: "connected",
    icon: Truck,
    fields: [
      { label: "Site ID", value: "DHL****TS" },
      { label: "Password", value: "********", type: "password" },
    ],
  },
  {
    name: "DTDC",
    description: "Domestic courier service",
    category: "Shipping Carriers",
    status: "not_configured",
    icon: Truck,
    fields: [
      { label: "Customer Code", value: "" },
      { label: "API Key", value: "", type: "password" },
    ],
  },
  {
    name: "Octopart",
    description: "Electronic component search and pricing",
    category: "Component Databases",
    status: "connected",
    icon: Cpu,
    fields: [
      { label: "API Key", value: "octo_****_3fn9", type: "password" },
      { label: "Queries/month", value: "8,420 / 10,000" },
    ],
  },
  {
    name: "Mouser Electronics",
    description: "Component distributor API",
    category: "Component Databases",
    status: "not_configured",
    icon: Cpu,
    fields: [
      { label: "API Key", value: "", type: "password" },
      { label: "Partner ID", value: "" },
    ],
  },
]

// ─── Audit log data ───
const auditEntries = [
  { time: "2026-03-29 10:15", user: "Sandeep K", action: "Updated", target: "System backup schedule", ip: "192.168.1.10" },
  { time: "2026-03-29 09:42", user: "Priya Sharma", action: "Created", target: "PO-2026-0089", ip: "192.168.1.22" },
  { time: "2026-03-29 09:15", user: "Rajesh Menon", action: "Approved", target: "ECO-2026-0034", ip: "192.168.1.15" },
  { time: "2026-03-29 08:50", user: "Karthik Iyer", action: "Rejected", target: "NCR-2026-0021 (rework required)", ip: "192.168.1.31" },
  { time: "2026-03-28 17:30", user: "Anita Desai", action: "Completed", target: "WO-2026-0341 (SMT Line 1)", ip: "192.168.1.18" },
  { time: "2026-03-28 16:20", user: "Deepa Nair", action: "Approved", target: "Leave request - Arjun Reddy", ip: "192.168.1.44" },
  { time: "2026-03-28 14:05", user: "Vikram Patel", action: "Updated", target: "Inventory reorder levels (12 items)", ip: "192.168.1.27" },
  { time: "2026-03-28 11:30", user: "System", action: "Backup", target: "Daily backup completed (2.4 GB)", ip: "127.0.0.1" },
]

// ─── Component ───
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("company")
  const [notifRules, setNotifRules] = useState(notificationRules)

  const toggleChannel = (ruleId: string, channel: Channel) => {
    setNotifRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? { ...r, channels: { ...r.channels, [channel]: !r.channels[channel] } }
          : r
      )
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization, users, integrations, and system configuration."
      />

      {/* Tab navigation */}
      <div className="flex gap-1 border-b">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                activeTab === tab.id
                  ? "border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-slate-300"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════ COMPANY TAB ═══════════════════════ */}
      {activeTab === "company" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                  <Input defaultValue={companyData.name} className="mt-1.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Registered Address</label>
                  <Input defaultValue={companyData.address} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">GSTIN</label>
                  <Input defaultValue={companyData.gstin} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">PAN</label>
                  <Input defaultValue={companyData.pan} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">CIN</label>
                  <Input defaultValue={companyData.cin} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Phone</label>
                  <Input defaultValue={companyData.phone} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <Input defaultValue={companyData.email} className="mt-1.5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Website</label>
                  <Input defaultValue={companyData.website} className="mt-1.5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  TS
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Upload company logo (PNG, SVG, max 2MB)</p>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Financial Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Default Currency</label>
                  <Input defaultValue={companyData.currency} className="mt-1.5" readOnly />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Financial Year</label>
                  <Input defaultValue={companyData.financialYear} className="mt-1.5" readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-teal-600 hover:bg-teal-700">Save Changes</Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ USERS & ROLES TAB ═══════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User list */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">User Accounts</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">10 of 25 seats</Badge>
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left font-medium text-muted-foreground px-6 py-3">User</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Role</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Department</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Last Login</th>
                      <th className="text-right font-medium text-muted-foreground px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map(user => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white",
                              user.status === "active"
                                ? "bg-gradient-to-br from-teal-500 to-violet-600"
                                : "bg-slate-400"
                            )}>
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs font-medium">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.department}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{user.lastLogin}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Role definitions & permission matrix */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Roles & Permission Matrix</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1.5 mr-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Full Access
                </span>
                <span className="inline-flex items-center gap-1.5 mr-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Read Only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" /> No Access
                </span>
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left font-medium text-muted-foreground px-4 py-2.5 sticky left-0 bg-muted/40 min-w-[160px]">
                          Role
                        </th>
                        {modules.map(mod => (
                          <th key={mod} className="text-center font-medium text-muted-foreground px-1.5 py-2.5 min-w-[48px]">
                            <span className="writing-mode-vertical" title={mod}>
                              {mod.length > 8 ? mod.slice(0, 7) + ".." : mod}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.name} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-4 py-2.5 sticky left-0 bg-background">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-2.5 w-2.5 rounded-full", role.color)} />
                              <div>
                                <p className="font-medium text-sm">{role.name}</p>
                                <p className="text-muted-foreground">{role.description}</p>
                              </div>
                            </div>
                          </td>
                          {modules.map(mod => {
                            const perm = role.permissions[mod]
                            return (
                              <td key={mod} className="text-center px-1.5 py-2.5">
                                <div className="flex justify-center">
                                  <span
                                    className={cn(
                                      "h-3 w-3 rounded-full",
                                      perm === "full" && "bg-emerald-500",
                                      perm === "read" && "bg-blue-500",
                                      perm === "none" && "bg-slate-200 dark:bg-slate-700"
                                    )}
                                    title={`${role.name}: ${mod} - ${perm}`}
                                  />
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══════════════════════ NOTIFICATIONS TAB ═══════════════════════ */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Notification channels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-500" />
                  <CardTitle className="text-sm font-medium">Email (SMTP)</CardTitle>
                </div>
                <Badge variant="success" className="w-fit text-xs mt-1">Active</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">SMTP Host</label>
                  <Input defaultValue="smtp.gmail.com" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Port</label>
                  <Input defaultValue="587" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Username</label>
                  <Input defaultValue="noreply@thinksemi.com" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <Input type="password" defaultValue="••••••••" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">From Email</label>
                  <Input defaultValue="noreply@thinksemi.com" className="mt-1 text-xs h-8" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-sm font-medium">WhatsApp Business</CardTitle>
                </div>
                <Badge variant="success" className="w-fit text-xs mt-1">Connected</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Business Phone</label>
                  <Input defaultValue="+91 80 4567 8900" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">API Key</label>
                  <Input type="password" defaultValue="whatsapp_****_bk29" className="mt-1 text-xs h-8" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Business Account ID</label>
                  <Input defaultValue="10483****2917" className="mt-1 text-xs h-8" />
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs mt-2">Test Connection</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm font-medium">In-App Notifications</CardTitle>
                </div>
                <Badge variant="success" className="w-fit text-xs mt-1">Enabled</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs">Desktop notifications</span>
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs">Sound alerts</span>
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs">Badge count</span>
                  <Badge variant="secondary" className="text-xs">Enabled</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs">Quiet hours</span>
                  <span className="text-xs text-muted-foreground">10 PM - 7 AM</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notification rules */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Notification Rules</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> WhatsApp
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bell className="h-3 w-3" /> In-App
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifRules.map(rule => {
                  const RuleIcon = rule.icon
                  return (
                    <div key={rule.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <RuleIcon className={cn("h-4 w-4", rule.color)} />
                        <div>
                          <p className="text-sm font-medium">{rule.trigger}</p>
                          <p className="text-xs text-muted-foreground">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {(["email", "whatsapp", "inApp"] as Channel[]).map(ch => (
                          <button
                            key={ch}
                            onClick={() => toggleChannel(rule.id, ch)}
                            className={cn(
                              "h-7 w-7 rounded-md flex items-center justify-center transition-colors border",
                              rule.channels[ch]
                                ? "bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-400"
                                : "bg-muted/30 border-transparent text-muted-foreground/40 hover:bg-muted"
                            )}
                            title={`${ch === "inApp" ? "In-App" : ch.charAt(0).toUpperCase() + ch.slice(1)}: ${rule.channels[ch] ? "On" : "Off"}`}
                          >
                            {ch === "email" && <Mail className="h-3.5 w-3.5" />}
                            {ch === "whatsapp" && <MessageSquare className="h-3.5 w-3.5" />}
                            {ch === "inApp" && <Bell className="h-3.5 w-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="bg-teal-600 hover:bg-teal-700">Save Notification Settings</Button>
          </div>
        </div>
      )}

      {/* ═══════════════════════ INTEGRATIONS TAB ═══════════════════════ */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {Object.entries(
            integrations.reduce<Record<string, Integration[]>>((acc, intg) => {
              if (!acc[intg.category]) acc[intg.category] = []
              acc[intg.category].push(intg)
              return acc
            }, {})
          ).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">{category}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map(intg => {
                  const IntgIcon = intg.icon
                  return (
                    <Card key={intg.name}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                              <IntgIcon className="h-4.5 w-4.5 text-muted-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-medium">{intg.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{intg.description}</p>
                            </div>
                          </div>
                          <Badge
                            variant={intg.status === "connected" ? "success" : intg.status === "error" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {intg.status === "connected" ? "Connected" : intg.status === "error" ? "Error" : "Not Configured"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2.5">
                          {intg.fields.map(field => (
                            <div key={field.label} className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{field.label}</span>
                              <span className="text-xs font-mono">
                                {field.value || <span className="text-muted-foreground/50 italic">Not set</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-3" />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs flex-1">
                            {intg.status === "connected" ? "Reconfigure" : "Configure"}
                          </Button>
                          {intg.status === "connected" && (
                            <Button variant="outline" size="sm" className="text-xs">
                              Test
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════ SYSTEM TAB ═══════════════════════ */}
      {activeTab === "system" && (
        <div className="space-y-6">
          {/* System health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Database className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-xs text-muted-foreground">PostgreSQL 16</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage used</span>
                    <span className="font-medium">2.4 GB / 50 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-medium">12 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status="active" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application Server</p>
                    <p className="text-xs text-muted-foreground">Node.js v20 LTS</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory usage</span>
                    <span className="font-medium">1.2 GB / 8 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-medium">18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">14d 6h 23m</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <HardDrive className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">File Storage</p>
                    <p className="text-xs text-muted-foreground">Local + S3 Backup</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local storage</span>
                    <span className="font-medium">18.2 GB / 200 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">S3 bucket</span>
                    <span className="font-medium">42.6 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status="active" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup schedule */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium">Backup Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Daily backup</span>
                    <Badge variant="success" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Schedule</span>
                    <span className="text-xs font-medium">02:00 AM IST</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last backup</span>
                    <span className="text-xs font-medium">Mar 29, 2026 02:00 AM</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Weekly full backup</span>
                    <Badge variant="success" className="text-xs">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Schedule</span>
                    <span className="text-xs font-medium">Sunday 01:00 AM IST</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last backup</span>
                    <span className="text-xs font-medium">Mar 23, 2026 01:00 AM</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Retention policy</span>
                    <span className="text-xs font-medium">90 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Backup destination</span>
                    <span className="text-xs font-medium">AWS S3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Encryption</span>
                    <Badge variant="success" className="text-xs">AES-256</Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <Button variant="outline" size="sm" className="text-xs">Run Manual Backup Now</Button>
            </CardContent>
          </Card>

          {/* Audit log */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Audit Log</CardTitle>
                <Badge variant="secondary" className="text-xs">90-day retention</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left font-medium text-muted-foreground px-6 py-2.5 text-xs">Timestamp</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">User</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">Action</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">Target</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-xs">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((entry, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-2.5 text-xs text-muted-foreground font-mono">{entry.time}</td>
                        <td className="px-4 py-2.5 text-xs font-medium">{entry.user}</td>
                        <td className="px-4 py-2.5">
                          <Badge
                            variant={
                              entry.action === "Created" ? "info"
                                : entry.action === "Approved" || entry.action === "Completed" ? "success"
                                : entry.action === "Rejected" ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {entry.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-xs">{entry.target}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{entry.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Reset Demo Data</p>
                  <p className="text-xs text-muted-foreground">
                    Clear all mock data and start fresh. This cannot be undone.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Reset Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
