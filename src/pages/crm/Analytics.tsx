import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import {
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  Trophy,
} from "lucide-react"

// ─── Pipeline Funnel Data ───

const funnelData = [
  { stage: "New Leads", count: 42, value: 18500000, conversion: 100 },
  { stage: "Qualified", count: 28, value: 14200000, conversion: 67 },
  { stage: "Quoted", count: 18, value: 10800000, conversion: 64 },
  { stage: "Negotiation", count: 11, value: 7200000, conversion: 61 },
  { stage: "Won", count: 7, value: 4850000, conversion: 64 },
]

const funnelColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#10b981"]

// ─── Revenue Forecast ───

const revenueForecast = [
  { month: "Oct", expected: 1800000, actual: 1920000 },
  { month: "Nov", expected: 2100000, actual: 2250000 },
  { month: "Dec", expected: 2400000, actual: 2180000 },
  { month: "Jan", expected: 2200000, actual: 2450000 },
  { month: "Feb", expected: 2600000, actual: 2380000 },
  { month: "Mar", expected: 2800000, actual: 2650000 },
  { month: "Apr", expected: 3100000, actual: null },
  { month: "May", expected: 3400000, actual: null },
  { month: "Jun", expected: 3200000, actual: null },
]

// ─── Won/Lost ───

const wonLostData = [
  { name: "Won", value: 7, color: "#22c55e" },
  { name: "Lost", value: 3, color: "#ef4444" },
  { name: "In Progress", value: 12, color: "#3b82f6" },
]

// ─── Lead Source ───

const leadSourceData = [
  { source: "Referral", leads: 14, won: 5, revenue: 2800000, color: "#22c55e" },
  { source: "Trade Show", leads: 8, won: 2, revenue: 1200000, color: "#3b82f6" },
  { source: "Website", leads: 6, won: 0, revenue: 0, color: "#8b5cf6" },
  { source: "Cold Outreach", leads: 9, won: 0, revenue: 0, color: "#f59e0b" },
  { source: "LinkedIn", leads: 5, won: 0, revenue: 850000, color: "#06b6d4" },
]

// ─── Sales Cycle Duration ───

const salesCycleData = [
  { stage: "New Lead to Qualified", days: 8, color: "#3b82f6" },
  { stage: "Qualified to Quoted", days: 12, color: "#8b5cf6" },
  { stage: "Quoted to Negotiation", days: 18, color: "#f59e0b" },
  { stage: "Negotiation to Won", days: 14, color: "#22c55e" },
]

// ─── Top Performers ───

const topPerformers = [
  { name: "Sandeep K", deals: 5, value: 3200000, winRate: 71, activities: 28 },
  { name: "Priya S", deals: 3, value: 1850000, winRate: 60, activities: 22 },
  { name: "Arun K", deals: 2, value: 980000, winRate: 50, activities: 15 },
  { name: "Mohan R", deals: 1, value: 420000, winRate: 33, activities: 12 },
]

// ─── Activity Metrics ───

const activityMetrics = {
  callsThisWeek: 14,
  callsLastWeek: 11,
  emailsSent: 23,
  emailsLastWeek: 18,
  meetingsHeld: 6,
  meetingsLastWeek: 4,
  tasksCompleted: 9,
  tasksLastWeek: 7,
}

// Custom tooltip formatter
function currencyTooltipFormatter(value: any) {
  return formatCurrency(value)
}

export function Analytics() {
  return (
    <div className="space-y-4">
      {/* Activity Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={Phone}
          iconColor="text-green-500"
          bgColor="bg-green-500/10"
          label="Calls This Week"
          value={activityMetrics.callsThisWeek}
          change={Math.round(((activityMetrics.callsThisWeek - activityMetrics.callsLastWeek) / activityMetrics.callsLastWeek) * 100)}
        />
        <MetricCard
          icon={Mail}
          iconColor="text-blue-500"
          bgColor="bg-blue-500/10"
          label="Emails Sent"
          value={activityMetrics.emailsSent}
          change={Math.round(((activityMetrics.emailsSent - activityMetrics.emailsLastWeek) / activityMetrics.emailsLastWeek) * 100)}
        />
        <MetricCard
          icon={Calendar}
          iconColor="text-purple-500"
          bgColor="bg-purple-500/10"
          label="Meetings Held"
          value={activityMetrics.meetingsHeld}
          change={Math.round(((activityMetrics.meetingsHeld - activityMetrics.meetingsLastWeek) / activityMetrics.meetingsLastWeek) * 100)}
        />
        <MetricCard
          icon={TrendingUp}
          iconColor="text-amber-500"
          bgColor="bg-amber-500/10"
          label="Tasks Completed"
          value={activityMetrics.tasksCompleted}
          change={Math.round(((activityMetrics.tasksCompleted - activityMetrics.tasksLastWeek) / activityMetrics.tasksLastWeek) * 100)}
        />
      </div>

      {/* Pipeline Funnel + Won/Lost */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel - custom horizontal bars */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pipeline Funnel</CardTitle>
            <p className="text-xs text-muted-foreground">Lead progression and conversion rates</p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3">
              {funnelData.map((item, idx) => {
                const maxCount = funnelData[0].count
                const widthPct = Math.max((item.count / maxCount) * 100, 15)
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{item.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{item.count} leads</span>
                        <span className="font-mono text-muted-foreground">{formatCurrency(item.value)}</span>
                        {idx > 0 && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {item.conversion}% conv.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative h-8 bg-muted/40 rounded-md overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-md transition-all duration-500 flex items-center justify-center"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: funnelColors[idx],
                          opacity: 0.85,
                        }}
                      >
                        <span className="text-[11px] font-bold text-white drop-shadow-sm">{item.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between pt-2 border-t text-xs">
                <span className="text-muted-foreground">Overall Conversion</span>
                <span className="font-bold text-success">
                  {Math.round((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Won/Lost Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Won / Lost Analysis</CardTitle>
            <p className="text-xs text-muted-foreground">Deal outcomes this quarter</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={wonLostData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {wonLostData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `${value} deals`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              {wonLostData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast + Lead Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Revenue Forecast</CardTitle>
            <p className="text-xs text-muted-foreground">Expected vs actual monthly revenue</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueForecast} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickFormatter={(v: number) => `${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={currencyTooltipFormatter}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="expected" name="Expected" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.7} />
                <Bar dataKey="actual" name="Actual" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Lead Source Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Which channels bring the most business</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadSourceData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis dataKey="source" type="category" tick={{ fontSize: 11 }} className="text-muted-foreground" width={90} />
                <Tooltip
                  formatter={(value: any, name: any) =>
                    name === "revenue" ? formatCurrency(value) : `${value}`
                  }
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="leads" name="Total Leads" fill="#3b82f6" radius={[0, 3, 3, 0]} />
                <Bar dataKey="won" name="Won" fill="#22c55e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Cycle + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Cycle Duration */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Sales Cycle Duration</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Average days per stage transition</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesCycleData.map((item) => {
                const maxDays = Math.max(...salesCycleData.map((d) => d.days))
                const widthPct = (item.days / maxDays) * 100
                return (
                  <div key={item.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">{item.stage}</span>
                      <span className="font-bold">{item.days} days</span>
                    </div>
                    <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between pt-3 border-t text-xs">
                <span className="text-muted-foreground">Total Average Cycle</span>
                <span className="font-bold text-lg">
                  {salesCycleData.reduce((sum, d) => sum + d.days, 0)} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold">Top Performers</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Sales team leaderboard this quarter</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((person, idx) => (
                <div
                  key={person.name}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    idx === 0 && "bg-amber-500/5 border-amber-500/20"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                      idx === 0 && "bg-amber-500 text-white",
                      idx === 1 && "bg-gray-400 text-white",
                      idx === 2 && "bg-amber-700 text-white",
                      idx > 2 && "bg-muted text-muted-foreground"
                    )}
                  >
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{person.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {person.deals} deals won -- {person.activities} activities
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{formatCurrency(person.value)}</p>
                    <p className="text-[11px] text-muted-foreground">{person.winRate}% win rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Area Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Pipeline Value Trend</CardTitle>
          <p className="text-xs text-muted-foreground">Weighted pipeline value over the last 6 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={[
                { month: "Oct", pipeline: 4200000, weighted: 1680000 },
                { month: "Nov", pipeline: 5100000, weighted: 2040000 },
                { month: "Dec", pipeline: 4800000, weighted: 1920000 },
                { month: "Jan", pipeline: 5600000, weighted: 2240000 },
                { month: "Feb", pipeline: 6200000, weighted: 2480000 },
                { month: "Mar", pipeline: 6700000, weighted: 2720000 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
                tickFormatter={(v: number) => `${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                formatter={currencyTooltipFormatter}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Area
                type="monotone"
                dataKey="pipeline"
                name="Total Pipeline"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="weighted"
                name="Weighted Value"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Small metric card component ───

function MetricCard({
  icon: Icon,
  iconColor,
  bgColor,
  label,
  value,
  change,
}: {
  icon: typeof Phone
  iconColor: string
  bgColor: string
  label: string
  value: number
  change: number
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", bgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        </div>
        <div className="ml-auto">
          <span
            className={cn(
              "text-[11px] font-medium px-1.5 py-0.5 rounded",
              change >= 0 ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
            )}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        </div>
      </div>
    </Card>
  )
}
