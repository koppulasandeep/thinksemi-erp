import { useState } from "react"
import {
  FileWarning,
  Search,
  Filter,
  ChevronRight,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { cn } from "@/lib/utils"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { useApiData, transformList } from "@/lib/useApi"

interface NCR {
  id: string
  board: string
  detectedAt: string
  wo: string
  severity: "critical" | "major" | "minor"
  defectType: string
  status: string
  dateOpened: string
  assignee: string
}

const ncrData: NCR[] = [
  {
    id: "NCR-2026-041",
    board: "ECU-X500",
    detectedAt: "AOI",
    wo: "WO-2026-0341",
    severity: "major",
    defectType: "Solder Bridge",
    status: "pending",
    dateOpened: "2026-03-29",
    assignee: "Priya S",
  },
  {
    id: "NCR-2026-040",
    board: "ECU-X500",
    detectedAt: "AOI",
    wo: "WO-2026-0341",
    severity: "minor",
    defectType: "Tombstone",
    status: "in_progress",
    dateOpened: "2026-03-29",
    assignee: "Priya S",
  },
  {
    id: "NCR-2026-039",
    board: "PS-220",
    detectedAt: "ICT",
    wo: "WO-2026-0338",
    severity: "critical",
    defectType: "Open Circuit",
    status: "pending",
    dateOpened: "2026-03-28",
    assignee: "Deepa N",
  },
  {
    id: "NCR-2026-038",
    board: "ADAS-M1",
    detectedAt: "FCT",
    wo: "WO-2026-0335",
    severity: "major",
    defectType: "Wrong Polarity",
    status: "in_progress",
    dateOpened: "2026-03-27",
    assignee: "Arun K",
  },
  {
    id: "NCR-2026-037",
    board: "IoT-200",
    detectedAt: "Visual",
    wo: "WO-2026-0330",
    severity: "minor",
    defectType: "Missing Part",
    status: "completed",
    dateOpened: "2026-03-25",
    assignee: "Priya S",
  },
  {
    id: "NCR-2026-036",
    board: "VFD-CTRL",
    detectedAt: "AOI",
    wo: "WO-2026-0328",
    severity: "major",
    defectType: "Insufficient Solder",
    status: "completed",
    dateOpened: "2026-03-24",
    assignee: "Deepa N",
  },
  {
    id: "NCR-2026-035",
    board: "ECU-X500",
    detectedAt: "Incoming QC",
    wo: "N/A",
    severity: "critical",
    defectType: "Damaged Component",
    status: "completed",
    dateOpened: "2026-03-22",
    assignee: "Mohan R",
  },
]

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-600 border-red-200",
  major: "bg-amber-500/10 text-amber-600 border-amber-200",
  minor: "bg-blue-500/10 text-blue-600 border-blue-200",
}

export function NCRList() {
  const { data: ncrs, loading } = useApiData<NCR[]>("/quality/ncr", ncrData, (raw: any) =>
    transformList<NCR>(raw?.ncrs ?? [], (item: any) => ({
      id: item.id,
      board: item.board,
      detectedAt: item.detected_at ?? item.detectedAt,
      wo: item.wo,
      severity: item.severity,
      defectType: item.defect_type ?? item.defectType,
      status: item.status,
      dateOpened: item.date_opened ?? item.dateOpened,
      assignee: item.assignee,
    }))
  )
  const [search, setSearch] = useState("")

  const filtered = ncrs.filter(
    (ncr) =>
      ncr.id.toLowerCase().includes(search.toLowerCase()) ||
      ncr.board.toLowerCase().includes(search.toLowerCase()) ||
      ncr.defectType.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = ncrs.filter((n) => n.status !== "completed").length
  const criticalCount = ncrs.filter(
    (n) => n.severity === "critical" && n.status !== "completed"
  ).length

  if (loading) return <LoadingSpinner text="Loading NCRs..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Non-Conformance Reports"
        description="Track, investigate, and resolve quality non-conformances."
        action={{ label: "New NCR", icon: Plus }}
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total NCRs"
          value={String(ncrs.length)}
          subtitle="This month"
        />
        <KPICard
          title="Open"
          value={String(openCount)}
          iconColor="text-amber-500"
          icon={FileWarning}
        />
        <KPICard
          title="Critical Open"
          value={String(criticalCount)}
          iconColor="text-red-500"
        />
        <KPICard
          title="Avg Resolution"
          value="3.2 days"
          subtitle="Target: 5 days"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              All NCRs
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search NCR, board, defect..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-[240px] text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
              <ExportButtons
                data={filtered.map((ncr) => ({
                  id: ncr.id,
                  board: ncr.board,
                  detectedAt: ncr.detectedAt,
                  wo: ncr.wo,
                  severity: ncr.severity,
                  defectType: ncr.defectType,
                  assignee: ncr.assignee,
                  status: ncr.status,
                  dateOpened: ncr.dateOpened,
                }))}
                columns={[
                  { key: "id", label: "NCR #" },
                  { key: "board", label: "Board" },
                  { key: "detectedAt", label: "Detected At" },
                  { key: "wo", label: "WO #" },
                  { key: "severity", label: "Severity" },
                  { key: "defectType", label: "Defect Type" },
                  { key: "assignee", label: "Assignee" },
                  { key: "status", label: "Status" },
                  { key: "dateOpened", label: "Date Opened" },
                ]}
                filename="ncr-list"
                title="Non-Conformance Reports"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "NCR #",
                    "Board",
                    "Detected At",
                    "WO #",
                    "Severity",
                    "Defect Type",
                    "Assignee",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ncr) => (
                  <tr
                    key={ncr.id}
                    className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-primary">
                      {ncr.id}
                    </td>
                    <td className="py-3 px-3 font-medium">{ncr.board}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {ncr.detectedAt}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground text-xs">
                      {ncr.wo}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize",
                          severityColors[ncr.severity]
                        )}
                      >
                        {ncr.severity}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">{ncr.defectType}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {ncr.assignee}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={ncr.status} />
                    </td>
                    <td className="py-3 px-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No NCRs found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
