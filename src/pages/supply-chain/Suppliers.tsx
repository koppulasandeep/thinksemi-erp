import { useState } from "react"
import {
  Search,
  Plus,
  Star,
  Building2,
  Mail,
  Phone,
  Award,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { cn, formatCurrency } from "@/lib/utils"
import { suppliers } from "@/lib/mock-data"
import { useApiData, snakeToCamel } from "@/lib/useApi"

const categoryColors: Record<string, string> = {
  Components: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  PCB: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-400",
  Packaging: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating - fullStars >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < fullStars
              ? "fill-amber-400 text-amber-400"
              : i === fullStars && hasHalf
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

function ScoreBar({ label, value, threshold = 90 }: { label: string; value: number; threshold?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", value >= threshold ? "text-emerald-600" : value >= 80 ? "text-amber-600" : "text-red-600")}>
          {value}%
        </span>
      </div>
      <Progress
        value={value}
        className="h-1.5"
        indicatorClassName={cn(
          value >= threshold ? "bg-emerald-500" : value >= 80 ? "bg-amber-500" : "bg-red-500"
        )}
      />
    </div>
  )
}

export function Suppliers() {
  const { data: suppliersData } = useApiData(
    "/supply-chain/suppliers",
    suppliers,
    (raw: any) => {
      const arr = raw?.suppliers ?? raw
      if (!Array.isArray(arr)) return suppliers
      return arr.map((s: any) => snakeToCamel(s)) as typeof suppliers
    }
  )

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null)

  const filtered = suppliersData.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ["all", "Components", "PCB", "Packaging"]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Management"
        description="Manage supplier relationships, performance, and procurement."
        action={{ label: "Add Supplier", icon: Plus }}
      />

      {/* Category Filter */}
      <div className="flex items-center gap-1 border-b">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              categoryFilter === cat
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {cat === "all" ? "All Suppliers" : cat}
            <span
              className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                categoryFilter === cat
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {cat === "all"
                ? suppliersData.length
                : suppliersData.filter((s) => s.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search supplier, location, or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Supplier Cards */}
      <div className="space-y-3">
        {filtered.map((supplier) => {
          const isExpanded = expandedSupplier === supplier.id
          return (
            <Card key={supplier.id} className="overflow-hidden">
              {/* Summary Row */}
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedSupplier(isExpanded ? null : supplier.id)}
              >
                <div className="text-muted-foreground">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>

                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{supplier.name}</div>
                    <div className="text-xs text-muted-foreground">{supplier.location}</div>
                  </div>
                </div>

                <Badge variant="outline" className={cn("border-0 font-semibold text-xs shrink-0", categoryColors[supplier.category])}>
                  {supplier.category}
                </Badge>

                <div className="shrink-0">
                  <StarRating rating={supplier.rating} />
                </div>

                <div className="text-right shrink-0 w-24">
                  <div className="text-xs text-muted-foreground">Active POs</div>
                  <div className="font-medium text-sm">{supplier.activePOs}</div>
                </div>

                <div className="text-right shrink-0 w-32">
                  <div className="text-xs text-muted-foreground">Total Business</div>
                  <div className="font-mono font-medium text-sm">{formatCurrency(supplier.totalBusiness)}</div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="border-t px-6 py-4 bg-muted/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact Info */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Contact Information</h4>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{supplier.contact}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-primary">{supplier.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span>{supplier.phone}</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="text-sm">
                          <span className="text-muted-foreground">Payment Terms: </span>
                          <span className="font-medium">{supplier.paymentTerms}</span>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1.5">Certifications</div>
                          <div className="flex flex-wrap gap-1">
                            {supplier.certifications.map((cert) => (
                              <Badge key={cert} variant="secondary" className="text-[10px] px-1.5 py-0">
                                <Award className="h-2.5 w-2.5 mr-0.5" />
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scorecard */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Supplier Scorecard</h4>
                      <div className="space-y-3">
                        <ScoreBar label="On-Time Delivery" value={supplier.onTimeDelivery} />
                        <ScoreBar label="Quality Score" value={supplier.qualityScore} threshold={95} />
                        <ScoreBar label="Price Competitiveness" value={supplier.priceCompetitiveness} threshold={85} />
                        <ScoreBar label="Responsiveness" value={supplier.responsiveness} />
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Overall Score</span>
                        <span className="text-lg font-bold">
                          {((supplier.onTimeDelivery + supplier.qualityScore + supplier.priceCompetitiveness + supplier.responsiveness) / 4).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Business Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background rounded border p-3">
                          <div className="text-xs text-muted-foreground">Total Business</div>
                          <div className="font-mono font-bold text-lg">{formatCurrency(supplier.totalBusiness)}</div>
                        </div>
                        <div className="bg-background rounded border p-3">
                          <div className="text-xs text-muted-foreground">Active POs</div>
                          <div className="font-bold text-lg">{supplier.activePOs}</div>
                        </div>
                        <div className="bg-background rounded border p-3">
                          <div className="text-xs text-muted-foreground">Rating</div>
                          <div className="font-bold text-lg">{supplier.rating}/5.0</div>
                        </div>
                        <div className="bg-background rounded border p-3">
                          <div className="text-xs text-muted-foreground">Category</div>
                          <div className="font-bold text-sm mt-1">{supplier.category}</div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          View History
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          <Mail className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">No suppliers found.</Card>
        )}
      </div>
    </div>
  )
}
