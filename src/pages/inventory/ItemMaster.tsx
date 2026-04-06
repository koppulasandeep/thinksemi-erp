import { useState } from "react"
import {
  Package,
  Search,
  Plus,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/PageHeader"
import { KPICard } from "@/components/shared/KPICard"
import { cn, formatNumber } from "@/lib/utils"
import { useApiData } from "@/lib/useApi"
import { api } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"

interface Item {
  id: string
  part_number: string
  description: string
  manufacturer: string
  package: string
  uom: string
  hsn_code: string
  status: "active" | "obsolete" | "draft"
  item_group_id: string
}

interface ItemGroup {
  id: string
  name: string
}

const UOM_OPTIONS = ["pcs", "meters", "kg", "liters", "sets"]

const emptyForm = {
  part_number: "",
  description: "",
  item_group_id: "",
  manufacturer: "",
  package: "",
  uom: "pcs",
  hsn_code: "",
}

export function ItemMaster() {
  const { data: items, loading, refetch } = useApiData<Item[]>("/item-master/items", [])
  const { data: groups } = useApiData<ItemGroup[]>("/item-master/groups", [])

  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const user = getCurrentUser()
  const isAdmin = user?.role && ["super_admin", "admin", "hr_manager"].includes(user.role)

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.part_number.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = !groupFilter || item.item_group_id === groupFilter
    return matchesSearch && matchesGroup
  })

  const totalItems = items.length
  const activeItems = items.filter((i) => i.status === "active").length
  const obsoleteItems = items.filter((i) => i.status === "obsolete").length
  const groupCount = groups.length

  async function handleCreate() {
    setSubmitting(true)
    try {
      await api.post("/item-master/items", form)
      setShowDialog(false)
      setForm(emptyForm)
      refetch()
    } catch {
      // error handled by api layer
    } finally {
      setSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    obsolete: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-600",
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Item Master"
        description="Manage parts, components and raw materials"
        action={isAdmin ? { label: "Add Item", onClick: () => setShowDialog(true), icon: Plus } : undefined}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Items" value={formatNumber(totalItems)} icon={Package} iconColor="text-blue-600" />
        <KPICard title="Active Items" value={formatNumber(activeItems)} icon={CheckCircle} iconColor="text-emerald-600" />
        <KPICard title="Obsolete Items" value={formatNumber(obsoleteItems)} icon={XCircle} iconColor="text-red-600" />
        <KPICard title="Item Groups" value={formatNumber(groupCount)} icon={Layers} iconColor="text-violet-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part number or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Part Number</th>
                <th className="text-left p-3 font-medium">Description</th>
                <th className="text-left p-3 font-medium">Manufacturer</th>
                <th className="text-left p-3 font-medium">Package</th>
                <th className="text-left p-3 font-medium">UOM</th>
                <th className="text-left p-3 font-medium">HSN Code</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No items found</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{item.part_number}</td>
                    <td className="p-3">{item.description}</td>
                    <td className="p-3">{item.manufacturer}</td>
                    <td className="p-3">{item.package}</td>
                    <td className="p-3">{item.uom}</td>
                    <td className="p-3 font-mono text-xs">{item.hsn_code}</td>
                    <td className="p-3">
                      <Badge className={cn("text-xs", statusColors[item.status] || "")}>{item.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Item Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDialog(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold">Add New Item</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Part Number</label>
                <Input value={form.part_number} onChange={(e) => setForm({ ...form, part_number: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Manufacturer</label>
                <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Item Group</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.item_group_id}
                  onChange={(e) => setForm({ ...form, item_group_id: e.target.value })}
                >
                  <option value="">Select group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Package</label>
                <Input value={form.package} onChange={(e) => setForm({ ...form, package: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">UOM</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={form.uom}
                  onChange={(e) => setForm({ ...form, uom: e.target.value })}
                >
                  {UOM_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">HSN Code</label>
                <Input value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !form.part_number}>
                {submitting ? "Creating..." : "Create Item"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
