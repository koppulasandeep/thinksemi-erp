import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn, getInitials } from "@/lib/utils"
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  X,
  MessageSquare,
  Briefcase,
  StickyNote,
  ChevronRight,
} from "lucide-react"

// ─── Contact mock data ───

interface Contact {
  id: string
  name: string
  company: string
  designation: string
  email: string
  phone: string
  location: string
  lastContacted: string
  avatar: null
  deals: { id: string; name: string; value: number; stage: string }[]
  communications: { date: string; type: string; subject: string; summary: string }[]
  notes: string[]
}

const contacts: Contact[] = [
  {
    id: "ct-001",
    name: "Rahul Menon",
    company: "Bosch India",
    designation: "Senior Procurement Manager",
    email: "rahul.menon@bosch.com",
    phone: "+91 98410 33210",
    location: "Chennai, Tamil Nadu",
    lastContacted: "2026-03-27",
    avatar: null,
    deals: [
      { id: "lead-003", name: "ECU-X500 PCB Assembly", value: 1200000, stage: "Qualified" },
      { id: "deal-010", name: "ABS Module Rev C", value: 850000, stage: "Won" },
    ],
    communications: [
      { date: "2026-03-27", type: "Call", subject: "ECU-X500 BOM finalization", summary: "Discussed alternate parts for U7. Rahul to share updated BOM by Friday." },
      { date: "2026-03-20", type: "Email", subject: "Revised quotation for ECU-X500", summary: "Sent updated pricing after component cost changes. Awaiting feedback." },
      { date: "2026-03-12", type: "Meeting", subject: "Quarterly review at Bosch campus", summary: "Reviewed quality metrics, discussed upcoming EV charger board project." },
    ],
    notes: ["Prefers email communication", "Key decision maker for all PCB procurement", "Annual contract renewal in June"],
  },
  {
    id: "ct-002",
    name: "Sunil Krishnamurthy",
    company: "L&T",
    designation: "Head of Electronics Sourcing",
    email: "sunil.k@larsentoubro.com",
    phone: "+91 98840 55120",
    location: "Chennai, Tamil Nadu",
    lastContacted: "2026-03-25",
    avatar: null,
    deals: [
      { id: "lead-006", name: "Relay Board Assembly", value: 1100000, stage: "Quoted" },
    ],
    communications: [
      { date: "2026-03-25", type: "Call", subject: "Relay Board delivery timeline", summary: "Needs 10,000 units by April end. Confirmed capacity availability." },
      { date: "2026-03-18", type: "Email", subject: "Quotation QTN-2026-030", summary: "Sent quotation for Relay Board. L&T reviewing internally." },
    ],
    notes: ["Very punctual, expects on-time delivery", "Budget approvals go through VP level for orders above 5L"],
  },
  {
    id: "ct-003",
    name: "Deepak Raghavan",
    company: "Continental",
    designation: "Director of Engineering",
    email: "deepak.raghavan@continental.com",
    phone: "+91 99520 44310",
    location: "Manesar, Haryana",
    lastContacted: "2026-03-22",
    avatar: null,
    deals: [
      { id: "lead-007", name: "ADAS Module Assembly", value: 700000, stage: "Negotiation" },
    ],
    communications: [
      { date: "2026-03-22", type: "Meeting", subject: "ADAS Module NPI review", summary: "Prototype build in progress. 5/10 units assembled. DFM changes approved." },
      { date: "2026-03-10", type: "Email", subject: "Quotation QTN-2026-028", summary: "Sent initial quotation for ADAS module. Price higher than expected." },
    ],
    notes: ["Requires IATF 16949 compliance documentation", "Decision cycle is 2-3 weeks minimum"],
  },
  {
    id: "ct-004",
    name: "Meera Jayaraman",
    company: "Tata Elxsi",
    designation: "Program Manager",
    email: "meera.j@tataelxsi.co.in",
    phone: "+91 98411 77845",
    location: "Thiruvanmiyur, Chennai",
    lastContacted: "2026-03-20",
    avatar: null,
    deals: [
      { id: "lead-008", name: "IoT Gateway Board", value: 400000, stage: "Negotiation" },
    ],
    communications: [
      { date: "2026-03-20", type: "Call", subject: "IoT Gateway pricing discussion", summary: "Meera wants 15% volume discount for 5k+ order. Need to check with management." },
      { date: "2026-03-14", type: "Email", subject: "NPI timeline for IoT-200", summary: "Shared DFM review findings. 3 issues flagged for resolution." },
    ],
    notes: ["Reports to VP of embedded systems", "Fast decision maker when specs are clear"],
  },
  {
    id: "ct-005",
    name: "Vikram Subramanian",
    company: "ABB",
    designation: "Supply Chain Lead",
    email: "vikram.s@abb.com",
    phone: "+91 98402 66190",
    location: "Poonamallee, Chennai",
    lastContacted: "2026-03-18",
    avatar: null,
    deals: [
      { id: "lead-004", name: "VFD Control Board", value: 600000, stage: "Qualified" },
    ],
    communications: [
      { date: "2026-03-18", type: "Call", subject: "VFD Board specifications review", summary: "ABB shared final gerber files. Need to run DFM within this week." },
      { date: "2026-03-05", type: "Meeting", subject: "Initial meeting at ABB plant", summary: "Toured their facility. Discussed 3 potential PCB projects for FY27." },
    ],
    notes: ["Interested in long-term partnership", "Requires ISO 13485 for medical-grade boards"],
  },
  {
    id: "ct-006",
    name: "Klaus Mueller",
    company: "Siemens",
    designation: "Component Engineering Manager",
    email: "klaus.mueller@siemens.com",
    phone: "+91 96000 12344",
    location: "Siruseri, Chennai",
    lastContacted: "2026-03-26",
    avatar: null,
    deals: [
      { id: "lead-005", name: "Sensor Interface Board", value: 900000, stage: "Quoted" },
    ],
    communications: [
      { date: "2026-03-26", type: "Email", subject: "Sensor Interface stencil specs", summary: "Klaus confirmed stepped stencil requirement. Updated BOM shared." },
      { date: "2026-03-19", type: "Call", subject: "Follow-up on QTN-2026-031", summary: "Siemens comparing our quote with 2 other EMS providers. Decision by April 5." },
    ],
    notes: ["German expat, direct communication style", "Siemens has global preferred vendor list - trying to get on it"],
  },
  {
    id: "ct-007",
    name: "Anitha Balakrishnan",
    company: "Bosch India",
    designation: "Quality Engineer",
    email: "anitha.b@bosch.com",
    phone: "+91 98410 99012",
    location: "Chennai, Tamil Nadu",
    lastContacted: "2026-03-24",
    avatar: null,
    deals: [],
    communications: [
      { date: "2026-03-24", type: "Email", subject: "RMA-009 failure analysis report", summary: "Shared root cause analysis for 2 failed ECU-X500 units. Awaiting acceptance." },
      { date: "2026-03-15", type: "Meeting", subject: "IPC-A-610 audit preparation", summary: "Anitha will conduct supplier audit next month. Shared checklist." },
    ],
    notes: ["Quality gatekeeper at Bosch", "Works closely with Rahul Menon on vendor approvals"],
  },
  {
    id: "ct-008",
    name: "Amit Shah",
    company: "TechCorp",
    designation: "CTO",
    email: "amit.shah@techcorp.in",
    phone: "+91 90030 55678",
    location: "Guindy, Chennai",
    lastContacted: "2026-03-15",
    avatar: null,
    deals: [
      { id: "lead-001", name: "EV Charger Board", value: 800000, stage: "New Lead" },
    ],
    communications: [
      { date: "2026-03-15", type: "Call", subject: "EV Charger Board initial discussion", summary: "Amit exploring PCB assembly partners for new EV charger product line." },
    ],
    notes: ["Startup, may need flexible payment terms", "Prototype first, then volume production"],
  },
  {
    id: "ct-009",
    name: "Dr. Priya Ravichandran",
    company: "MedTech Solutions",
    designation: "VP Engineering",
    email: "priya.r@medtechsol.com",
    phone: "+91 98414 33567",
    location: "OMR, Chennai",
    lastContacted: "2026-03-12",
    avatar: null,
    deals: [
      { id: "lead-002", name: "Patient Monitor PCB", value: 500000, stage: "New Lead" },
    ],
    communications: [
      { date: "2026-03-12", type: "Meeting", subject: "Medical device PCB requirements", summary: "Discussed IPC Class 3 requirements and ISO 13485 compliance needs." },
    ],
    notes: ["Medical device requires full traceability", "Long qualification cycle (3-6 months)"],
  },
]

const companyColors: Record<string, string> = {
  "Bosch India": "bg-blue-500",
  "L&T": "bg-emerald-500",
  Continental: "bg-amber-500",
  "Tata Elxsi": "bg-purple-500",
  ABB: "bg-red-500",
  Siemens: "bg-teal-500",
  TechCorp: "bg-orange-500",
  "MedTech Solutions": "bg-pink-500",
}

const stageColors: Record<string, "info" | "warning" | "success" | "default"> = {
  "New Lead": "info",
  Qualified: "warning",
  Quoted: "info",
  Negotiation: "success",
  Won: "success",
  Lost: "destructive" as "default",
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date("2026-03-29")
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return dateStr
}

export function Contacts() {
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState<string>("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const companies = [...new Set(contacts.map((c) => c.company))].sort()

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchesCompany = companyFilter === "all" || c.company === companyFilter
    return matchesSearch && matchesCompany
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Contact List */}
        <div className={cn("space-y-1", selectedContact ? "lg:col-span-5" : "lg:col-span-12")}>
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Contact</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Company</th>
                  {!selectedContact && (
                    <>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Email</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-3">Phone</th>
                    </>
                  )}
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Last Contacted</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                      selectedContact?.id === contact.id && "bg-primary/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0",
                            companyColors[contact.company] ?? "bg-gray-500"
                          )}
                        >
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {contact.company}
                      </div>
                    </td>
                    {!selectedContact && (
                      <>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{contact.email}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{contact.phone}</td>
                      </>
                    )}
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {formatRelativeDate(contact.lastContacted)}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No contacts found matching your criteria.
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground px-1">
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Detail Panel */}
        {selectedContact && (
          <Card className="lg:col-span-7 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-semibold",
                      companyColors[selectedContact.company] ?? "bg-gray-500"
                    )}
                  >
                    {getInitials(selectedContact.name)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedContact.designation} at {selectedContact.company}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedContact.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {selectedContact.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedContact.location}
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-5 max-h-[520px] overflow-y-auto">
              {/* Associated Deals */}
              {selectedContact.deals.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    Associated Deals ({selectedContact.deals.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedContact.deals.map((deal) => (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div>
                          <p className="text-sm font-medium">{deal.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              minimumFractionDigits: 0,
                            }).format(deal.value)}
                          </p>
                        </div>
                        <Badge variant={stageColors[deal.stage] ?? "default"} className="text-[10px]">
                          {deal.stage}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication History */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Communication History
                </h4>
                <div className="space-y-3">
                  {selectedContact.communications.map((comm, idx) => {
                    const typeIcons: Record<string, { icon: typeof Phone; color: string }> = {
                      Call: { icon: Phone, color: "text-green-500 bg-green-500/10" },
                      Email: { icon: Mail, color: "text-blue-500 bg-blue-500/10" },
                      Meeting: { icon: Calendar, color: "text-purple-500 bg-purple-500/10" },
                    }
                    const { icon: TypeIcon, color } = typeIcons[comm.type] ?? typeIcons.Call
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", color)}>
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comm.subject}</p>
                            <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{comm.date}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{comm.summary}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              {selectedContact.notes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <StickyNote className="h-3.5 w-3.5" />
                    Notes
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedContact.notes.map((note, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground flex items-start gap-2 p-2 rounded-md bg-muted/20"
                      >
                        <span className="text-muted-foreground/60 mt-0.5">--</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
