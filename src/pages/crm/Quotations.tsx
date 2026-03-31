import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn, formatCurrency } from "@/lib/utils"
import {
  FileText,
  ChevronRight,
  Send,
  Download,
  Printer,
  ShoppingCart,
  Clock,
  History,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ─── Mock quotation data ───

interface QuotationLineItem {
  description: string
  unitPrice: number
  qty: number
  amount: number
}

interface VersionEntry {
  rev: string
  date: string
  author: string
  changes: string
  status: string
}

interface ApprovalStep {
  role: string
  name: string
  status: "approved" | "pending" | "waiting"
  date?: string
}

interface Quotation {
  id: string
  customer: string
  board: string
  qty: number
  date: string
  validUntil: string
  status: "draft" | "sent" | "accepted" | "expired"
  lineItems: QuotationLineItem[]
  gstRate: number
  versions: VersionEntry[]
  approvals: ApprovalStep[]
  terms: string[]
}

const quotations: Quotation[] = [
  {
    id: "QTN-2026-031",
    customer: "Siemens",
    board: "Sensor Interface",
    qty: 5000,
    date: "2026-03-25",
    validUntil: "2026-04-25",
    status: "sent",
    gstRate: 18,
    lineItems: [
      { description: "Bare PCB (4-layer, 1.6mm, ENIG)", unitPrice: 28, qty: 5000, amount: 140000 },
      { description: "Components (BOM - 124 unique parts)", unitPrice: 85, qty: 5000, amount: 425000 },
      { description: "SMT Assembly (Top + Bottom)", unitPrice: 18, qty: 5000, amount: 90000 },
      { description: "THT Assembly (12 through-hole parts)", unitPrice: 6, qty: 5000, amount: 30000 },
      { description: "Testing (ICT + FCT)", unitPrice: 12, qty: 5000, amount: 60000 },
      { description: "Stencil (Top + Bottom)", unitPrice: 0, qty: 1, amount: 15000 },
    ],
    versions: [
      { rev: "Rev B", date: "2026-03-25", author: "Sandeep K", changes: "Updated stencil to stepped stencil per Klaus feedback. Reduced component cost by 3%.", status: "Current" },
      { rev: "Rev A", date: "2026-03-18", author: "Sandeep K", changes: "Initial quotation based on preliminary BOM.", status: "Superseded" },
    ],
    approvals: [
      { role: "Sales Engineer", name: "Sandeep K", status: "approved", date: "2026-03-25" },
      { role: "Engineering Lead", name: "Arun K", status: "approved", date: "2026-03-25" },
      { role: "Finance Manager", name: "Lakshmi V", status: "approved", date: "2026-03-25" },
    ],
    terms: [
      "Payment: 50% advance, 50% before dispatch",
      "Delivery: 4-6 weeks from PO confirmation",
      "Quotation valid for 30 days from date of issue",
      "Prices inclusive of packaging; freight extra at actuals",
      "Tooling (stencil) is one-time; reusable for repeat orders",
    ],
  },
  {
    id: "QTN-2026-030",
    customer: "L&T",
    board: "Relay Board",
    qty: 10000,
    date: "2026-03-22",
    validUntil: "2026-04-22",
    status: "accepted",
    gstRate: 18,
    lineItems: [
      { description: "Bare PCB (2-layer, 1.6mm, HASL)", unitPrice: 12, qty: 10000, amount: 120000 },
      { description: "Components (BOM - 68 unique parts)", unitPrice: 42, qty: 10000, amount: 420000 },
      { description: "SMT Assembly (Top only)", unitPrice: 10, qty: 10000, amount: 100000 },
      { description: "THT Assembly (24 through-hole parts)", unitPrice: 14, qty: 10000, amount: 140000 },
      { description: "Testing (ICT + FCT)", unitPrice: 8, qty: 10000, amount: 80000 },
      { description: "Stencil (Top)", unitPrice: 0, qty: 1, amount: 8000 },
    ],
    versions: [
      { rev: "Rev C", date: "2026-03-22", author: "Sandeep K", changes: "Final pricing after negotiation. 5% discount on assembly. Accepted by L&T.", status: "Current" },
      { rev: "Rev B", date: "2026-03-15", author: "Sandeep K", changes: "Revised THT pricing based on updated labor rates.", status: "Superseded" },
      { rev: "Rev A", date: "2026-03-08", author: "Sandeep K", changes: "Initial quotation.", status: "Superseded" },
    ],
    approvals: [
      { role: "Sales Engineer", name: "Sandeep K", status: "approved", date: "2026-03-22" },
      { role: "Engineering Lead", name: "Arun K", status: "approved", date: "2026-03-22" },
      { role: "Finance Manager", name: "Lakshmi V", status: "approved", date: "2026-03-22" },
    ],
    terms: [
      "Payment: 50% advance, 30% on delivery, 20% net 30",
      "Delivery: 3-4 weeks from PO confirmation",
      "Quotation valid for 30 days from date of issue",
      "Prices inclusive of packaging; freight extra at actuals",
      "Tooling (stencil) is one-time; reusable for repeat orders",
      "Volume discount of 5% applied on assembly charges",
    ],
  },
  {
    id: "QTN-2026-029",
    customer: "Bosch India",
    board: "ECU-X500",
    qty: 5000,
    date: "2026-03-18",
    validUntil: "2026-04-18",
    status: "draft",
    gstRate: 18,
    lineItems: [
      { description: "Bare PCB (6-layer, 1.6mm, ENIG)", unitPrice: 52, qty: 5000, amount: 260000 },
      { description: "Components (BOM - 248 unique parts)", unitPrice: 195, qty: 5000, amount: 975000 },
      { description: "SMT Assembly (Top + Bottom)", unitPrice: 24, qty: 5000, amount: 120000 },
      { description: "THT Assembly (8 through-hole parts)", unitPrice: 4, qty: 5000, amount: 20000 },
      { description: "Testing (ICT + FCT + Burn-in)", unitPrice: 18, qty: 5000, amount: 90000 },
      { description: "Stencil (Top + Bottom)", unitPrice: 0, qty: 1, amount: 18000 },
    ],
    versions: [
      { rev: "Rev A", date: "2026-03-18", author: "Sandeep K", changes: "Initial draft. Pending BOM finalization from Rahul.", status: "Current" },
    ],
    approvals: [
      { role: "Sales Engineer", name: "Sandeep K", status: "approved", date: "2026-03-18" },
      { role: "Engineering Lead", name: "Arun K", status: "pending" },
      { role: "Finance Manager", name: "Lakshmi V", status: "waiting" },
    ],
    terms: [
      "Payment: 50% advance, 50% before dispatch",
      "Delivery: 4-6 weeks from PO confirmation",
      "Quotation valid for 30 days from date of issue",
      "Prices inclusive of packaging; freight extra at actuals",
      "Tooling (stencil) is one-time; reusable for repeat orders",
    ],
  },
  {
    id: "QTN-2026-028",
    customer: "Continental",
    board: "ADAS Module",
    qty: 1000,
    date: "2026-03-10",
    validUntil: "2026-04-10",
    status: "expired",
    gstRate: 18,
    lineItems: [
      { description: "Bare PCB (8-layer, 2.0mm, ENIG)", unitPrice: 110, qty: 1000, amount: 110000 },
      { description: "Components (BOM - 312 unique parts)", unitPrice: 320, qty: 1000, amount: 320000 },
      { description: "SMT Assembly (Top + Bottom)", unitPrice: 32, qty: 1000, amount: 32000 },
      { description: "THT Assembly (6 through-hole parts)", unitPrice: 4, qty: 1000, amount: 4000 },
      { description: "Testing (ICT + FCT + Burn-in)", unitPrice: 22, qty: 1000, amount: 22000 },
      { description: "Stencil (Top + Bottom)", unitPrice: 0, qty: 1, amount: 22000 },
    ],
    versions: [
      { rev: "Rev B", date: "2026-03-10", author: "Sandeep K", changes: "Added burn-in testing per Continental requirement. Expired without response.", status: "Current" },
      { rev: "Rev A", date: "2026-03-02", author: "Sandeep K", changes: "Initial quotation.", status: "Superseded" },
    ],
    approvals: [
      { role: "Sales Engineer", name: "Sandeep K", status: "approved", date: "2026-03-10" },
      { role: "Engineering Lead", name: "Arun K", status: "approved", date: "2026-03-10" },
      { role: "Finance Manager", name: "Lakshmi V", status: "approved", date: "2026-03-10" },
    ],
    terms: [
      "Payment: 50% advance, 50% before dispatch",
      "Delivery: 4-6 weeks from PO confirmation",
      "Quotation valid for 30 days from date of issue",
      "Prices inclusive of packaging; freight extra at actuals",
      "Tooling (stencil) is one-time; reusable for repeat orders",
    ],
  },
]

const statusVariant: Record<string, "info" | "warning" | "success" | "destructive"> = {
  draft: "warning",
  sent: "info",
  accepted: "success",
  expired: "destructive",
}

const statusLabel: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  expired: "Expired",
}

function getDaysRemaining(validUntil: string): number {
  const today = new Date("2026-03-29")
  const expiry = new Date(validUntil)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function Quotations() {
  const [selectedId, setSelectedId] = useState<string>(quotations[0].id)
  const [showVersions, setShowVersions] = useState(false)
  const [editingTerms, setEditingTerms] = useState(false)
  const [termsText, setTermsText] = useState("")
  const selected = quotations.find((q) => q.id === selectedId)!

  const subtotal = selected.lineItems.reduce((s, li) => s + li.amount, 0)
  const gst = Math.round(subtotal * (selected.gstRate / 100))
  const grandTotal = subtotal + gst
  const daysRemaining = getDaysRemaining(selected.validUntil)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Quotation List */}
      <div className="lg:col-span-4 space-y-2">
        {quotations.map((q) => {
          const qSubtotal = q.lineItems.reduce((s, li) => s + li.amount, 0)
          const qTotal = qSubtotal + Math.round(qSubtotal * (q.gstRate / 100))
          const qDays = getDaysRemaining(q.validUntil)
          return (
            <Card
              key={q.id}
              onClick={() => {
                setSelectedId(q.id)
                setShowVersions(false)
                setEditingTerms(false)
              }}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                selectedId === q.id && "ring-2 ring-primary/20 border-primary/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">
                      {q.id}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{q.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {q.board} -- {q.qty.toLocaleString("en-IN")} pcs
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant={statusVariant[q.status]} className="text-[10px]">
                    {statusLabel[q.status]}
                  </Badge>
                  <span className="text-sm font-bold">
                    {formatCurrency(qTotal)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {q.date}
                  </span>
                  {q.status !== "expired" && q.status !== "accepted" && (
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1",
                        qDays <= 7
                          ? "text-red-600 bg-red-500/10"
                          : qDays <= 14
                            ? "text-amber-600 bg-amber-500/10"
                            : "text-green-600 bg-green-500/10"
                      )}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      {qDays}d left
                    </span>
                  )}
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quotation Detail */}
      <Card className="lg:col-span-8">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{selected.id}</CardTitle>
                <Badge
                  variant={statusVariant[selected.status]}
                  className="text-[10px]"
                >
                  {statusLabel[selected.status]}
                </Badge>
                {selected.versions.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {selected.versions[0].rev}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selected.customer} -- {selected.board} --{" "}
                {selected.qty.toLocaleString("en-IN")} pcs
              </p>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-muted-foreground">
                  Issued {selected.date} -- Valid until {selected.validUntil}
                </p>
                {selected.status !== "expired" && selected.status !== "accepted" && (
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                      daysRemaining <= 7
                        ? "text-red-600 bg-red-500/10"
                        : daysRemaining <= 14
                          ? "text-amber-600 bg-amber-500/10"
                          : "text-green-600 bg-green-500/10"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {daysRemaining} days remaining
                  </span>
                )}
                {selected.status === "expired" && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full text-red-600 bg-red-500/10 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Expired
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
              {selected.status === "draft" && (
                <Button size="sm">
                  <Send className="h-3.5 w-3.5" />
                  Send
                </Button>
              )}
              {selected.status === "accepted" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Convert to Sales Order
                </Button>
              )}
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Approval Workflow
            </p>
            <div className="flex items-center gap-0">
              {selected.approvals.map((step, idx) => (
                <div key={step.role} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                        step.status === "approved" && "bg-green-500/10",
                        step.status === "pending" && "bg-amber-500/10",
                        step.status === "waiting" && "bg-muted"
                      )}
                    >
                      {step.status === "approved" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {step.status === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                      {step.status === "waiting" && <Circle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-medium">{step.name}</p>
                      <p className="text-[10px] text-muted-foreground">{step.role}</p>
                      {step.date && (
                        <p className="text-[10px] text-muted-foreground">{step.date}</p>
                      )}
                    </div>
                  </div>
                  {idx < selected.approvals.length - 1 && (
                    <div
                      className={cn(
                        "h-px w-8 mx-3",
                        step.status === "approved" ? "bg-green-500/40" : "bg-border"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Cost Breakdown Table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">
                    Description
                  </th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">
                    Unit Price
                  </th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">
                    Qty
                  </th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.lineItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                      {item.unitPrice > 0
                        ? formatCurrency(item.unitPrice)
                        : "--"}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                      {item.qty.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium font-mono">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium font-mono">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  GST ({selected.gstRate}%)
                </span>
                <span className="font-medium font-mono">
                  {formatCurrency(gst)}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Grand Total</span>
                <span className="font-bold font-mono text-lg">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Version History */}
          <div>
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors w-full"
            >
              <History className="h-3.5 w-3.5" />
              Version History ({selected.versions.length} revisions)
              {showVersions ? (
                <ChevronUp className="h-3.5 w-3.5 ml-auto" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 ml-auto" />
              )}
            </button>
            {showVersions && (
              <div className="mt-3 space-y-2">
                {selected.versions.map((ver, idx) => (
                  <div
                    key={ver.rev}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      idx === 0 ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/50"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{ver.rev}</span>
                        {idx === 0 && (
                          <Badge variant="success" className="text-[10px]">Current</Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {ver.date} -- {ver.author}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ver.changes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator className="my-5" />

          {/* Terms & Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Terms & Conditions
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  if (!editingTerms) {
                    setTermsText(selected.terms.join("\n"))
                  }
                  setEditingTerms(!editingTerms)
                }}
              >
                <Edit3 className="h-3 w-3" />
                {editingTerms ? "Cancel" : "Edit"}
              </Button>
            </div>
            {editingTerms ? (
              <div className="space-y-2">
                <textarea
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs leading-relaxed ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  placeholder="Enter terms, one per line..."
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingTerms(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-7 text-xs" onClick={() => setEditingTerms(false)}>
                    Save Terms
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/30 p-4">
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {selected.terms.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
