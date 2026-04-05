import { useState } from "react"
import {
  Search,
  Filter,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Archive,
  Flame,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { mslReels } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"
import { api } from "@/lib/api"

function formatHours(h: number): string {
  if (!isFinite(h)) return "\u221e"
  if (h < 1) return `${Math.round(h * 60)}m`
  if (h < 24) return `${h.toFixed(1)}h`
  const days = Math.floor(h / 24)
  const remaining = h % 24
  return `${days}d ${Math.round(remaining)}h`
}

function getRemainingPercent(item: (typeof mslReels)[0]): number {
  if (!isFinite(item.floorLifeHours) || !isFinite(item.remainingHours)) return 100
  return Math.max(0, (item.remainingHours / item.floorLifeHours) * 100)
}

function getProgressColor(percent: number): string {
  if (percent < 10) return "bg-destructive"
  if (percent < 25) return "bg-warning"
  return "bg-success"
}

export function MSLDashboard() {
  const { data: reelsData, refetch } = useApiData(
    "/inventory/msl",
    mslReels,
    (raw: any) => {
      const arr = raw?.reels ?? raw
      if (!Array.isArray(arr)) return mslReels
      return arr.map((r: any) => snakeToCamel(r)) as typeof mslReels
    }
  )

  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleSendToBake = async () => {
    for (const reelId of selected) {
      await api.post(`/inventory/msl/${reelId}/bake`, { bake_hours: 24 }).catch(() => {})
    }
    setSelected(new Set())
    refetch()
  }

  const filtered = reelsData.filter(
    (reel) =>
      reel.reelId.toLowerCase().includes(search.toLowerCase()) ||
      reel.partNumber.toLowerCase().includes(search.toLowerCase())
  )

  // KPI calculations
  const exposedReels = reelsData.filter(
    (r) => r.msl > 1 && isFinite(r.remainingHours) && r.remainingHours < r.floorLifeHours
  ).length
  const expiringWithin4h = reelsData.filter(
    (r) => isFinite(r.remainingHours) && r.remainingHours > 0 && r.remainingHours <= 4
  ).length
  const expiredReels = reelsData.filter(
    (r) => isFinite(r.remainingHours) && r.remainingHours <= 0
  ).length
  const inDryStorage = reelsData.filter((r) => r.msl === 1 || !isFinite(r.remainingHours)).length

  function toggleSelect(reelId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(reelId)) next.delete(reelId)
      else next.add(reelId)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="MSL Control"
        description="Moisture Sensitivity Level tracking. Monitor floor life exposure and manage bake-out schedules."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Exposed Reels"
          value={String(exposedReels)}
          subtitle="On floor now"
          icon={Clock}
          iconColor="text-info"
        />
        <KPICard
          title="Expiring <4hr"
          value={String(expiringWithin4h)}
          subtitle="Needs attention"
          icon={AlertTriangle}
          iconColor="text-warning"
        />
        <KPICard
          title="Expired"
          value={String(expiredReels)}
          subtitle="Requires bake-out"
          icon={ShieldAlert}
          iconColor="text-destructive"
        />
        <KPICard
          title="In Dry Storage"
          value={String(inDryStorage)}
          subtitle="Safe"
          icon={Archive}
          iconColor="text-success"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reel ID or part number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-1.5" />
          Filter
        </Button>

        {/* Action buttons */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={selected.size === 0}
            className="text-warning border-warning/30 hover:bg-warning/10"
            onClick={handleSendToBake}
          >
            <Flame className="h-4 w-4 mr-1.5" />
            Send to Bake
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected.size === 0}
            className="text-info border-info/30 hover:bg-info/10"
          >
            <Archive className="h-4 w-4 mr-1.5" />
            Return to Dry Storage
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected.size === 0}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            Quarantine
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-muted-foreground/30"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(new Set(filtered.map((r) => r.reelId)))
                      } else {
                        setSelected(new Set())
                      }
                    }}
                  />
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Reel ID</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Part Number</th>
                <th className="text-center font-medium text-muted-foreground px-4 py-3">MSL</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Floor Life</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 min-w-[200px]">
                  Remaining
                </th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reel) => {
                const percent = getRemainingPercent(reel)
                const progressColor = getProgressColor(percent)
                const isInfinite = !isFinite(reel.remainingHours)

                return (
                  <tr
                    key={reel.reelId}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30 transition-colors",
                      reel.status === "critical" && "bg-destructive/5",
                      reel.status === "warning" && "bg-warning/5",
                      selected.has(reel.reelId) && "bg-primary/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-muted-foreground/30"
                        checked={selected.has(reel.reelId)}
                        onChange={() => toggleSelect(reel.reelId)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{reel.reelId}</td>
                    <td className="px-4 py-3 font-mono">{reel.partNumber}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={reel.msl >= 4 ? "destructive" : reel.msl >= 3 ? "warning" : "secondary"}
                        className="text-xs px-1.5 py-0"
                      >
                        MSL {reel.msl}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {formatHours(reel.floorLifeHours)}
                    </td>
                    <td className="px-4 py-3">
                      {isInfinite ? (
                        <span className="text-xs text-muted-foreground">N/A (MSL 1)</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <Progress
                            value={percent}
                            className="flex-1 h-2"
                            indicatorClassName={progressColor}
                          />
                          <span
                            className={cn(
                              "text-xs font-mono font-medium min-w-[48px] text-right",
                              percent < 10 && "text-destructive",
                              percent >= 10 && percent < 25 && "text-warning",
                              percent >= 25 && "text-muted-foreground"
                            )}
                          >
                            {formatHours(reel.remainingHours)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reel.status} />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No reels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground">
            {filtered.length} reel{filtered.length !== 1 ? "s" : ""} tracked
            {selected.size > 0 && (
              <span className="ml-2 text-foreground font-medium">
                &middot; {selected.size} selected
              </span>
            )}
          </p>
        </div>
      </Card>
    </div>
  )
}
