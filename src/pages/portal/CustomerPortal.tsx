import {
  Package,
  FileText,
  RotateCcw,
  Download,
  CheckCircle,
  ChevronRight,
  Cpu,
  Truck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const customerName = "Bosch India"

const orders = [
  {
    id: "SO-2026-089",
    board: "ECU-X500",
    qty: 5000,
    status: "production",
    progress: 71,
    dueDate: "2026-04-20",
    shipped: 0,
  },
  {
    id: "SO-2026-082",
    board: "ECU-X500",
    qty: 3000,
    status: "shipped",
    progress: 100,
    dueDate: "2026-03-15",
    shipped: 3000,
    tracking: "FX-112233",
  },
  {
    id: "SO-2026-075",
    board: "ECU-X400",
    qty: 2000,
    status: "delivered",
    progress: 100,
    dueDate: "2026-02-28",
    shipped: 2000,
  },
]

const npiStatus = [
  {
    board: "ECU-X600 (Next Gen)",
    stage: "DFM Review",
    progress: 40,
    eta: "2026-05-15",
    notes: "3 DFM issues identified, awaiting your approval on redesign",
  },
]

const rmas = [
  {
    id: "RMA-009",
    board: "ECU-X500",
    qty: 2,
    status: "analysis",
    submitted: "2026-03-26",
    issue: "No power output on 2 units from SO-082 batch",
  },
]

const documents = [
  { name: "ECU-X500 CoC (SO-082)", type: "Certificate", date: "2026-03-15", size: "245 KB" },
  { name: "ECU-X500 Test Report (SO-082)", type: "Test Report", date: "2026-03-15", size: "1.2 MB" },
  { name: "ECU-X500 IPC Class 3 Report", type: "Inspection", date: "2026-03-14", size: "890 KB" },
  { name: "Q1 2026 Quality Summary", type: "Quality Report", date: "2026-03-01", size: "3.4 MB" },
  { name: "ECU-X600 DFM Report", type: "DFM Review", date: "2026-03-28", size: "2.1 MB" },
]

const statusColors: Record<string, string> = {
  production: "bg-blue-500/10 text-blue-600",
  shipped: "bg-amber-500/10 text-amber-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  analysis: "bg-amber-500/10 text-amber-600",
}

const statusLabels: Record<string, string> = {
  production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  analysis: "Under Analysis",
}

export function CustomerPortal() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/thinksemi-logo.png"
            alt="Thinksemi Infotech"
            className="h-10 object-contain"
          />
          <div className="border-l pl-4">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {customerName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customer Portal &middot; Last login: Mar 29, 2026 at 09:14 AM
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Request Quote
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Cpu className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-xs text-muted-foreground">NPI in Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-xs text-muted-foreground">Open RMA</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Your Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Your Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-sm text-primary">
                    {order.id}
                  </span>
                  <span className="text-sm font-medium">{order.board}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs border-0",
                      statusColors[order.status]
                    )}
                  >
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Due: {order.dueDate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Progress
                  value={order.progress}
                  className="h-2 flex-1"
                  indicatorClassName={
                    order.progress === 100 ? "bg-emerald-500" : "bg-blue-500"
                  }
                />
                <span className="text-xs tabular-nums text-muted-foreground w-[32px] text-right">
                  {order.progress}%
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {order.shipped.toLocaleString()} / {order.qty.toLocaleString()} boards
                </span>
                {order.status === "shipped" && order.tracking && (
                  <span className="flex items-center gap-1 text-primary">
                    <Truck className="h-3 w-3" />
                    Track: {order.tracking}
                  </span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* NPI Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">NPI Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {npiStatus.map((npi) => (
              <div key={npi.board} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{npi.board}</p>
                    <p className="text-xs text-muted-foreground">
                      Stage: {npi.stage}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-0">
                    {npi.stage}
                  </Badge>
                </div>
                <Progress
                  value={npi.progress}
                  className="h-1.5"
                  indicatorClassName="bg-blue-500"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Est. completion: {npi.eta}</span>
                  <span>{npi.progress}% complete</span>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                  {npi.notes}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* RMA Tracking */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">RMA Tracking</CardTitle>
              <Button variant="outline" size="sm" className="text-xs h-7">
                <RotateCcw className="h-3 w-3 mr-1" />
                New RMA
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {rmas.map((rma) => (
              <div key={rma.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-primary">
                      {rma.id}
                    </span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {rma.board}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs border-0",
                      statusColors[rma.status]
                    )}
                  >
                    {statusLabels[rma.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rma.issue}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Qty: {rma.qty}</span>
                  <span>Submitted: {rma.submitted}</span>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-0 mt-2 text-[10px]">
                  {[
                    { label: "Received", done: true },
                    { label: "Analysis", done: true, active: true },
                    { label: "Rework", done: false },
                    { label: "Ship Back", done: false },
                  ].map((s, i) => (
                    <div key={s.label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center",
                            s.done
                              ? s.active
                                ? "bg-blue-500 text-white"
                                : "bg-emerald-500 text-white"
                              : "bg-muted border border-border"
                          )}
                        >
                          {s.done && !s.active ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <span className="text-[8px] font-bold">
                              {i + 1}
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "mt-1",
                            s.active
                              ? "text-blue-600 font-medium"
                              : "text-muted-foreground"
                          )}
                        >
                          {s.label}
                        </span>
                      </div>
                      {i < 3 && (
                        <div
                          className={cn(
                            "h-px w-6 mx-0.5",
                            s.done && !s.active
                              ? "bg-emerald-500"
                              : "bg-border"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type} &middot; {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {doc.size}
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
