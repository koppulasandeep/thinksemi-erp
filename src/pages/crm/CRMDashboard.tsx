import { useState } from "react"
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
} from "lucide-react"
import { KPICard } from "@/components/shared/KPICard"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn, formatCurrency } from "@/lib/utils"
import { crmLeads } from "@/lib/mock-data"
import { Pipeline } from "./Pipeline"
import { Quotations } from "./Quotations"
import { Contacts } from "./Contacts"
import { Activities } from "./Activities"
import { Analytics } from "./Analytics"

const tabs = [
  { id: "pipeline", label: "Pipeline" },
  { id: "leads", label: "Leads" },
  { id: "contacts", label: "Contacts" },
  { id: "activities", label: "Activities" },
  { id: "quotations", label: "Quotations" },
  { id: "analytics", label: "Analytics" },
] as const

type TabId = (typeof tabs)[number]["id"]

export function CRMDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("pipeline")

  const totalPipeline = crmLeads.reduce((sum, l) => sum + l.value, 0)
  const weightedValue = crmLeads.reduce(
    (sum, l) => sum + l.value * (l.probability / 100),
    0
  )
  const leadsCount = crmLeads.length
  const wonLeads = crmLeads.filter((l) => l.stage === "Won").length
  const closableLeads = crmLeads.filter(
    (l) => l.stage !== "New Lead" && l.stage !== "Lost"
  ).length
  const conversionRate =
    closableLeads > 0 ? ((wonLeads / closableLeads) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Sales pipeline, leads, and quotation management."
        action={{ label: "New Lead", onClick: () => {} }}
      />

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Pipeline"
          value={formatCurrency(totalPipeline)}
          subtitle={`${leadsCount} active leads`}
          icon={DollarSign}
        />
        <KPICard
          title="Weighted Value"
          value={formatCurrency(Math.round(weightedValue))}
          subtitle="Probability-adjusted"
          icon={TrendingUp}
          change={8}
          changePeriod="vs last month"
        />
        <KPICard
          title="Active Leads"
          value={String(leadsCount)}
          subtitle="Across all stages"
          icon={Users}
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Qualified to Won"
          icon={Target}
        />
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "pipeline" && <Pipeline />}
      {activeTab === "leads" && <LeadsTable />}
      {activeTab === "contacts" && <Contacts />}
      {activeTab === "activities" && <Activities />}
      {activeTab === "quotations" && <Quotations />}
      {activeTab === "analytics" && <Analytics />}
    </div>
  )
}

// ─── Leads Table (inline, simple) ───

function LeadsTable() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">
                Company
              </th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">
                Contact
              </th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">
                Product
              </th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">
                Stage
              </th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">
                Value
              </th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">
                Probability
              </th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody>
            {crmLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{lead.company}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lead.contact}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lead.product}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                      lead.stage === "New Lead" &&
                        "bg-info/10 text-info",
                      lead.stage === "Qualified" &&
                        "bg-warning/10 text-warning",
                      lead.stage === "Quoted" &&
                        "bg-primary/10 text-primary",
                      lead.stage === "Negotiation" &&
                        "bg-success/10 text-success"
                    )}
                  >
                    {lead.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatCurrency(lead.value)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {lead.probability}%
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {lead.assignee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
