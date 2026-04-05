import { useState } from "react"
import {
  Truck,
  Package,
  CheckCircle,
  ExternalLink,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Check,
  Clock,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { KPICard } from "@/components/shared/KPICard"
import { ExportButtons } from "@/components/shared/ExportButtons"
import { cn, formatNumber } from "@/lib/utils"
import { useApiData, transformList } from "@/lib/useApi"

// ─── Tabs ───
const tabs = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "shipments", label: "Shipments", icon: Truck },
  { id: "packing", label: "Packing", icon: Package },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "carrier-performance", label: "Carrier Performance", icon: BarChart3 },
] as const

type TabId = (typeof tabs)[number]["id"]

// ─── Mock Data: Shipments ───
const allShipments = [
  { id: "SH-2026-022", customer: "L&T", soId: "SO-087", boards: 10000, boxes: 20, weight: 85, carrier: "FedEx", tracking: "FX-123456", status: "in_transit" as const, eta: "2026-04-02",
    packingDetails: "20 boxes, ESD bags, desiccant packs", documents: ["Packing List", "CoC", "Delivery Note"] },
  { id: "SH-2026-021", customer: "Bosch", soId: "SO-089", boards: 1200, boxes: 3, weight: 12, carrier: "DHL", tracking: null, status: "ready" as const, eta: null,
    packingDetails: "3 boxes, anti-static trays", documents: [] },
  { id: "SH-2026-020", customer: "ABB", soId: "SO-086", boards: 500, boxes: 2, weight: 5, carrier: "BlueDart", tracking: "BD-789012", status: "delivered" as const, eta: "2026-03-27",
    packingDetails: "2 boxes, ESD bags", documents: ["Packing List", "CoC", "Delivery Note", "Invoice"] },
  { id: "SH-2026-019", customer: "Continental", soId: "SO-085", boards: 200, boxes: 1, weight: 2.5, carrier: "DHL", tracking: "DHL-345678", status: "delivered" as const, eta: "2026-03-25",
    packingDetails: "1 box, anti-static tray", documents: ["Packing List", "CoC", "Invoice"] },
  { id: "SH-2026-018", customer: "Tata Elxsi", soId: "SO-084", boards: 100, boxes: 1, weight: 1.2, carrier: "FedEx", tracking: "FX-901234", status: "delivered" as const, eta: "2026-03-22",
    packingDetails: "1 box, ESD bag, bubble wrap", documents: ["Packing List", "CoC", "Invoice", "Test Report"] },
  { id: "SH-2026-017", customer: "Bosch", soId: "SO-083", boards: 5000, boxes: 10, weight: 42, carrier: "FedEx", tracking: "FX-567890", status: "delivered" as const, eta: "2026-03-20",
    packingDetails: "10 boxes, ESD bags, desiccant", documents: ["Packing List", "CoC", "Delivery Note", "Invoice"] },
  { id: "SH-2026-016", customer: "L&T", soId: "SO-082", boards: 3000, boxes: 6, weight: 28, carrier: "DHL", tracking: "DHL-112233", status: "delivered" as const, eta: "2026-03-18",
    packingDetails: "6 boxes, anti-static trays", documents: ["Packing List", "CoC", "Invoice"] },
  { id: "SH-2026-015", customer: "Continental", soId: "SO-081", boards: 800, boxes: 2, weight: 8, carrier: "DTDC", tracking: "DT-445566", status: "delivered" as const, eta: "2026-03-15",
    packingDetails: "2 boxes, ESD bags", documents: ["Packing List", "CoC", "Invoice"] },
]

// ─── Mock Data: Packing Queue ───
const packingQueue = [
  { id: "PK-001", soId: "SO-089", customer: "Bosch", board: "ECU-X500", qty: 1200, packagingSpec: "ESD bags, anti-static trays, box type B",
    specialHandling: ["MSL-3", "Fragile"],
    checklist: { esdBags: true, desiccant: true, humidityIndicator: true, packingList: false, coc: false } },
  { id: "PK-002", soId: "SO-090", customer: "ABB", board: "VFD-CTRL", qty: 500, packagingSpec: "ESD bags, bubble wrap, box type A",
    specialHandling: ["MSL-4"],
    checklist: { esdBags: false, desiccant: false, humidityIndicator: false, packingList: false, coc: false } },
  { id: "PK-003", soId: "SO-091", customer: "Tata Elxsi", board: "IoT-200", qty: 250, packagingSpec: "Anti-static trays, box type A",
    specialHandling: [],
    checklist: { esdBags: false, desiccant: false, humidityIndicator: false, packingList: false, coc: false } },
]

// ─── Mock Data: Documents ───
const shipmentDocuments = [
  { shipmentId: "SH-2026-022", customer: "L&T", packingList: "generated" as const, deliveryNote: "generated" as const, coc: "generated" as const, testReport: "pending" as const, invoice: "pending" as const },
  { shipmentId: "SH-2026-021", customer: "Bosch", packingList: "pending" as const, deliveryNote: "pending" as const, coc: "pending" as const, testReport: "pending" as const, invoice: "pending" as const },
  { shipmentId: "SH-2026-020", customer: "ABB", packingList: "generated" as const, deliveryNote: "generated" as const, coc: "generated" as const, testReport: "generated" as const, invoice: "generated" as const },
  { shipmentId: "SH-2026-019", customer: "Continental", packingList: "generated" as const, deliveryNote: "generated" as const, coc: "generated" as const, testReport: "generated" as const, invoice: "generated" as const },
]

// ─── Mock Data: Carrier Performance ───
const carrierPerformance = [
  { carrier: "FedEx", onTimeRate: 98.2, avgTransitDays: 2.1, damageRate: 0.1, costPerKg: 85, deliveries: 22, color: "text-purple-600" },
  { carrier: "DHL", onTimeRate: 93.5, avgTransitDays: 2.8, damageRate: 0.3, costPerKg: 72, deliveries: 18, color: "text-amber-600" },
  { carrier: "DTDC", onTimeRate: 85.0, avgTransitDays: 4.2, damageRate: 0.8, costPerKg: 35, deliveries: 8, color: "text-orange-600" },
  { carrier: "BlueDart", onTimeRate: 88.7, avgTransitDays: 3.5, damageRate: 0.5, costPerKg: 48, deliveries: 12, color: "text-blue-600" },
]

const carrierColorMap: Record<string, string> = {
  FedEx: "text-purple-600",
  DHL: "text-amber-600",
  DTDC: "text-orange-600",
  BlueDart: "text-blue-600",
}

const docStatusClass: Record<string, string> = {
  generated: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
}

export function DeliveryDashboard() {
  const { data: shipments } = useApiData("/delivery/shipments", allShipments, (raw: any) =>
    transformList(raw?.shipments ?? [], undefined) as typeof allShipments
  )
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [expandedShipment, setExpandedShipment] = useState<string | null>(null)

  const deliveredCount = shipments.filter((s) => s.status === "delivered").length
  const inTransitCount = shipments.filter((s) => s.status === "in_transit").length
  const pendingPacking = packingQueue.length
  const onTimeRate = 94.2

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery & Shipping"
        description="Manage shipments, packing, documents, and carrier logistics."
        action={{ label: "New Shipment", icon: Truck }}
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <KPICard title="Shipments This Month" value={String(shipments.length)} subtitle="Total shipments" icon={Truck} color="teal" />
        <KPICard title="On-Time Rate" value={`${onTimeRate}%`} subtitle="Target: 95%" icon={CheckCircle} color="green" />
        <KPICard title="Pending Packing" value={String(pendingPacking)} subtitle="Orders ready to pack" icon={Package} iconColor="text-amber-500" color="orange" />
        <KPICard title="In Transit" value={String(inTransitCount)} subtitle="Active shipments" icon={Truck} iconColor="text-blue-500" color="blue" />
        <KPICard title="Delivered" value={String(deliveredCount)} subtitle="This month" icon={CheckCircle} iconColor="text-emerald-500" color="green" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-slate-600 border hover:bg-teal-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Overview Tab ─── */}
      {activeTab === "overview" && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Current Shipments</CardTitle>
                <span className="text-xs text-muted-foreground">{shipments.filter((s) => s.status !== "delivered").length} active</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shipments.filter((s) => s.status !== "delivered").map((ship) => (
                  <div key={ship.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Truck className={cn("h-5 w-5", ship.status === "in_transit" ? "text-blue-500" : "text-amber-500")} />
                      <div>
                        <p className="text-sm font-medium">{ship.id} &middot; {ship.customer}</p>
                        <p className="text-xs text-muted-foreground">{ship.soId} &middot; {formatNumber(ship.boards)} boards &middot; {ship.carrier}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ship.tracking && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-mono">{ship.tracking}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <StatusBadge status={ship.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery performance cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative h-28 w-28">
                    <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#14b8a6" strokeWidth="8" strokeDasharray={`${94.2 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold tabular-nums">94.2%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-6"><span className="text-muted-foreground">On time</span><span className="font-semibold">49 / 52</span></div>
                    <div className="flex items-center justify-between gap-6"><span className="text-muted-foreground">Late</span><span className="font-semibold text-red-500">3</span></div>
                    <div className="flex items-center justify-between gap-6"><span className="text-muted-foreground">Target</span><span className="font-semibold">95%</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Packing Queue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {packingQueue.map((pk) => {
                    const done = Object.values(pk.checklist).filter(Boolean).length
                    const total = Object.values(pk.checklist).length
                    return (
                      <div key={pk.id} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                        <div>
                          <span className="text-sm font-medium">{pk.customer}</span>
                          <span className="text-xs text-muted-foreground ml-2">{pk.board} &middot; {formatNumber(pk.qty)} pcs</span>
                        </div>
                        <Badge variant="outline" className={cn("text-xs", done === total ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                          {done}/{total} checks
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ─── Shipments Tab ─── */}
      {activeTab === "shipments" && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">All Shipments</CardTitle>
              <div className="flex items-center gap-2">
                <ExportButtons
                  data={shipments.map((s) => ({ id: s.id, customer: s.customer, soId: s.soId, boards: formatNumber(s.boards), boxes: s.boxes, weight: `${s.weight} kg`, carrier: s.carrier, tracking: s.tracking ?? "Pending", status: s.status, eta: s.eta ?? "--" }))}
                  columns={[
                    { key: "id", label: "Ship #" }, { key: "customer", label: "Customer" }, { key: "soId", label: "SO #" },
                    { key: "boards", label: "Boards" }, { key: "boxes", label: "Boxes" }, { key: "weight", label: "Weight" },
                    { key: "carrier", label: "Carrier" }, { key: "tracking", label: "Tracking #" },
                    { key: "status", label: "Status" }, { key: "eta", label: "ETA" },
                  ]}
                  filename="shipments"
                  title="Shipments"
                />
                <span className="text-xs text-muted-foreground">{shipments.length} shipments</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shipments.map((ship) => (
                <div key={ship.id}>
                  <div
                    onClick={() => setExpandedShipment(expandedShipment === ship.id ? null : ship.id)}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {expandedShipment === ship.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium">
                          <span className="font-mono text-teal-600">{ship.id}</span>
                          <span className="mx-2 text-muted-foreground">&middot;</span>
                          {ship.customer}
                        </p>
                        <p className="text-xs text-muted-foreground">{ship.soId} &middot; {formatNumber(ship.boards)} boards &middot; {ship.boxes} boxes &middot; {ship.weight} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={cn("text-xs font-medium", carrierColorMap[ship.carrier] ?? "text-foreground")}>{ship.carrier}</span>
                      {ship.tracking ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">{ship.tracking}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No tracking</span>
                      )}
                      {ship.eta && <span className="text-xs font-mono tabular-nums hidden sm:block">{ship.eta}</span>}
                      <StatusBadge status={ship.status} />
                    </div>
                  </div>
                  {expandedShipment === ship.id && (
                    <div className="ml-12 mr-4 mt-1 mb-2 rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Packing Details</p>
                        <p className="text-sm">{ship.packingDetails}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documents</p>
                        {ship.documents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {ship.documents.map((doc) => (
                              <Badge key={doc} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                <Check className="h-3 w-3 mr-1" />{doc}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No documents generated yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Packing Tab ─── */}
      {activeTab === "packing" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Packing Station - Orders Ready to Pack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packingQueue.map((pk) => (
                  <div key={pk.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium">{pk.customer} &middot; <span className="font-mono text-teal-600">{pk.soId}</span></p>
                        <p className="text-xs text-muted-foreground">Board: {pk.board} &middot; Qty: {formatNumber(pk.qty)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pk.specialHandling.map((sh) => (
                          <Badge key={sh} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />{sh}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Packaging Spec:</span> {pk.packagingSpec}
                    </div>

                    <Separator className="my-3" />

                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Packing Checklist</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { key: "esdBags", label: "ESD Bags" },
                        { key: "desiccant", label: "Desiccant" },
                        { key: "humidityIndicator", label: "Humidity Indicator" },
                        { key: "packingList", label: "Packing List" },
                        { key: "coc", label: "CoC" },
                      ].map((item) => {
                        const checked = pk.checklist[item.key as keyof typeof pk.checklist]
                        return (
                          <div
                            key={item.key}
                            className={cn(
                              "flex items-center gap-2 rounded-md border p-2 text-xs transition-colors",
                              checked ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500"
                            )}
                          >
                            {checked ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5 text-slate-400" />}
                            {item.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Documents Tab ─── */}
      {activeTab === "documents" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Document Generation Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Shipment #", "Customer", "Packing List", "Delivery Note", "CoC", "Test Report", "Invoice"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shipmentDocuments.map((doc) => (
                    <tr key={doc.shipmentId} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-teal-600">{doc.shipmentId}</td>
                      <td className="py-3 px-3 font-medium">{doc.customer}</td>
                      {(["packingList", "deliveryNote", "coc", "testReport", "invoice"] as const).map((field) => (
                        <td key={field} className="py-3 px-3">
                          <Badge variant="outline" className={cn("text-xs border-0", docStatusClass[doc[field]])}>
                            {doc[field] === "generated" ? <Check className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {doc[field] === "generated" ? "Generated" : "Pending"}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Separator className="my-4" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              Document types: Packing List, Delivery Note, Certificate of Conformance (CoC), Test Report Summary, Commercial Invoice
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Carrier Performance Tab ─── */}
      {activeTab === "carrier-performance" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {carrierPerformance.map((c) => (
              <Card key={c.carrier}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn("text-sm font-medium", c.color)}>{c.carrier}</CardTitle>
                    <Badge variant="outline" className="text-xs">{c.deliveries} deliveries</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">On-Time Rate</p>
                      <p className={cn("text-lg font-bold tabular-nums", c.onTimeRate >= 95 ? "text-emerald-600" : c.onTimeRate >= 90 ? "text-amber-600" : "text-red-600")}>
                        {c.onTimeRate}%
                      </p>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                        <div className={cn("h-full rounded-full",
                          c.onTimeRate >= 95 ? "bg-emerald-500" : c.onTimeRate >= 90 ? "bg-amber-500" : "bg-red-500"
                        )} style={{ width: `${c.onTimeRate}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg Transit Time</p>
                      <p className="text-lg font-bold tabular-nums">{c.avgTransitDays} days</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Damage Rate</p>
                      <p className={cn("text-lg font-bold tabular-nums", c.damageRate > 0.5 ? "text-red-600" : "text-emerald-600")}>
                        {c.damageRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost per kg</p>
                      <p className="text-lg font-bold tabular-nums">&#8377;{c.costPerKg}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Carrier Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Carrier", "On-Time %", "Avg Transit", "Damage %", "Cost/kg", "Deliveries"].map((h) => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carrierPerformance.sort((a, b) => b.onTimeRate - a.onTimeRate).map((c) => (
                      <tr key={c.carrier} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className={cn("py-3 px-3 font-medium", c.color)}>{c.carrier}</td>
                        <td className="py-3 px-3">
                          <span className={cn("font-mono font-semibold tabular-nums",
                            c.onTimeRate >= 95 ? "text-emerald-600" : c.onTimeRate >= 90 ? "text-amber-600" : "text-red-600"
                          )}>{c.onTimeRate}%</span>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">{c.avgTransitDays} days</td>
                        <td className="py-3 px-3">
                          <span className={cn("font-mono tabular-nums", c.damageRate > 0.5 ? "text-red-600" : "text-emerald-600")}>{c.damageRate}%</span>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">&#8377;{c.costPerKg}</td>
                        <td className="py-3 px-3 tabular-nums">{c.deliveries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
