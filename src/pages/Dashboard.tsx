import {
  IndianRupee,
  ShoppingCart,
  Clock,
  Gauge,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/shared/KPICard"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency } from "@/lib/utils"
import {
  dashboardKPIs,
  revenueChartData,
  ordersByStatus,
  topCustomers,
  alerts,
  productionLines,
} from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"
import {
  AreaChart,
  Area,
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
} from "recharts"

export function Dashboard() {
  const { data: kpis } = useApiData(
    "/dashboard/kpis",
    dashboardKPIs,
    (raw: any) => {
      const d = snakeToCamel(raw)
      return {
        revenue: { value: d.revenue ?? dashboardKPIs.revenue.value, change: dashboardKPIs.revenue.change },
        activeOrders: { value: d.activeOrders ?? dashboardKPIs.activeOrders.value, late: dashboardKPIs.activeOrders.late },
        onTimeDelivery: { value: d.onTimeDelivery ?? dashboardKPIs.onTimeDelivery.value },
        oee: { value: d.oee ?? dashboardKPIs.oee.value, change: dashboardKPIs.oee.change },
        firstPassYield: { value: d.fpy ?? dashboardKPIs.firstPassYield.value },
      }
    }
  )

  const { data: alertsData } = useApiData(
    "/dashboard/alerts",
    alerts,
    (raw: any) => {
      const arr = raw?.alerts ?? raw
      if (!Array.isArray(arr)) return alerts
      return arr.map((a: any) => snakeToCamel(a)) as typeof alerts
    }
  )

  const { data: linesData } = useApiData(
    "/dashboard/production-lines",
    productionLines,
    (raw: any) => {
      const arr = raw?.lines ?? raw
      if (!Array.isArray(arr)) return productionLines
      return arr.map((l: any) => snakeToCamel(l)) as typeof productionLines
    }
  )

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-4">
        <img
          src="/thinksemi-logo.png"
          alt="Thinksemi Infotech"
          className="h-10 object-contain hidden lg:block"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back. Here's what's happening at the factory today.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Revenue"
          value={formatCurrency(kpis.revenue.value)}
          change={kpis.revenue.change}
          changePeriod="MoM"
          icon={IndianRupee}
          color="green"
        />
        <KPICard
          title="Active Orders"
          value={String(kpis.activeOrders.value)}
          subtitle={`${kpis.activeOrders.late} late`}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="On-Time Delivery"
          value={`${kpis.onTimeDelivery.value}%`}
          icon={Clock}
          color="purple"
        />
        <KPICard
          title="OEE"
          value={`${kpis.oee.value}%`}
          change={kpis.oee.change}
          changePeriod="vs last week"
          icon={Gauge}
          color="orange"
        />
        <KPICard
          title="First Pass Yield"
          value={`${kpis.firstPassYield.value}%`}
          icon={CheckCircle}
          color="teal"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Revenue Trend */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatCurrency(value), ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#a3a3a3"
                    fill="transparent"
                    strokeDasharray="5 5"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {ordersByStatus.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {ordersByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Production Floor Status */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Production Floor</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {linesData.map((line) => {
              const isRunning = line.status === "running"
              const isChangeover = line.status === "changeover"
              return (
                <div
                  key={line.id}
                  className={cn(
                    "rounded-lg border p-3 space-y-2",
                    isRunning && "border-l-4 border-l-emerald-500",
                    isChangeover && "border-l-4 border-l-amber-500",
                    !isRunning && !isChangeover && "border-l-4 border-l-slate-300 dark:border-l-slate-600"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{line.name}</span>
                    <Badge
                      variant={
                        isRunning
                          ? "success"
                          : isChangeover
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {isRunning ? "Running" : "Changeover"}
                    </Badge>
                  </div>
                  {isRunning ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{line.workOrder} • {line.board}</span>
                        <span>{line.completed}/{line.total}</span>
                      </div>
                      <Progress
                        value={(line.completed / line.total) * 100}
                        className="h-1.5"
                        indicatorClassName={
                          line.oee >= line.oeeTarget ? "bg-emerald-500" : "bg-amber-500"
                        }
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          OEE: <span className="font-semibold text-foreground">{line.oee}%</span>
                          <span className="text-muted-foreground"> / {line.oeeTarget}%</span>
                        </span>
                        <span className="text-muted-foreground">
                          Defects: <span className="text-red-600 dark:text-red-400 font-semibold">{line.defects}</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Setup: {(line as any).setupMinutes}min remaining • Next: {(line as any).nextWorkOrder}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomers} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis
                    type="number"
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "var(--muted-foreground)" }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {topCustomers.map((_entry, idx) => (
                      <Cell
                        key={idx}
                        fill={["#4f46e5", "#7c3aed", "#06b6d4", "#10b981", "#f97316"][idx % 5]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <span className="text-xs text-muted-foreground">{alertsData.length} items</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {alertsData.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors",
                  alert.type === "error" && "border-red-200 bg-red-50 hover:bg-red-100/80 dark:border-red-900/40 dark:bg-red-950/30 dark:hover:bg-red-950/50",
                  alert.type === "warning" && "border-amber-200 bg-amber-50 hover:bg-amber-100/80 dark:border-amber-900/40 dark:bg-amber-950/30 dark:hover:bg-amber-950/50",
                  alert.type !== "error" && alert.type !== "warning" && "border-blue-200 bg-blue-50 hover:bg-blue-100/80 dark:border-blue-900/40 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                )}
              >
                {alert.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">
                    {alert.module}
                  </p>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
