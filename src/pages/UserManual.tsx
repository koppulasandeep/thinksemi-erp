import {
  Printer,
  BookOpen,
  Monitor,
  Ban,
  Rocket,
  Key,
  LayoutGrid,
  ChevronUp,
  Shield,
  Package,
  Factory,
  BarChart3,
  Wrench,
  Truck,
  RotateCcw,
  Users,
  Cpu,
  FlaskConical,
  Layers,
  Thermometer,
  FileText,
  ClipboardList,
  UserCircle,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  { id: "overview", title: "1. System Overview", icon: Monitor },
  { id: "available", title: "2. Features & Capabilities", icon: Package },
  { id: "out-of-scope", title: "3. What's Not Needed (Out of Scope)", icon: Ban },
  { id: "roadmap", title: "4. Enhancement Roadmap", icon: Rocket },
  { id: "credentials", title: "5. Login Credentials", icon: Key },
  { id: "screens", title: "6. Module-wise Screen Reference", icon: LayoutGrid },
];

const screenReference = [
  { module: "Dashboard", path: "/", screen: "Main Dashboard", description: "Live KPIs, production floor status, alert feed" },
  { module: "HR", path: "/hr", screen: "HR Dashboard", description: "Employee overview, headcount analytics, quick stats" },
  { module: "HR", path: "/hr/attendance", screen: "Attendance", description: "Daily attendance log, biometric integration, shift tracking" },
  { module: "HR", path: "/hr/leave", screen: "Leave Management", description: "Indian leave types (CL/SL/EL/ML), approval workflow, balance tracker" },
  { module: "HR", path: "/hr/payroll", screen: "Payroll", description: "Salary processing with PF/ESI/TDS/PT, Thinksemi-branded payslips" },
  { module: "HR", path: "/hr/performance", screen: "Performance", description: "PMS with KPIs, review cycles, rating distribution" },
  { module: "HR", path: "/hr/compliance", screen: "Compliance", description: "Statutory compliance tracking for Indian labor laws" },
  { module: "CRM", path: "/crm", screen: "CRM Dashboard", description: "Pipeline value, win rate, lead source analytics" },
  { module: "CRM", path: "/crm/pipeline", screen: "Pipeline", description: "Drag-and-drop deal pipeline (New Lead → Won/Lost)" },
  { module: "CRM", path: "/crm/contacts", screen: "Contacts", description: "Customer and prospect contact management" },
  { module: "CRM", path: "/crm/activities", screen: "Activities", description: "Task, call, meeting logging with timeline view" },
  { module: "CRM", path: "/crm/quotations", screen: "Quotations", description: "Quotation builder with cost breakdown, approval workflow" },
  { module: "CRM", path: "/crm/analytics", screen: "Analytics", description: "CRM performance charts, conversion funnels, forecasting" },
  { module: "Finance", path: "/finance", screen: "Finance Dashboard", description: "Customer payments, vendor payments, payroll approval, reports" },
  { module: "NPI", path: "/npi", screen: "NPI Pipeline", description: "Kanban with drag-and-drop, board view, timeline, metrics" },
  { module: "NPI", path: "/npi/:id", screen: "NPI Detail", description: "Gerber viewer, BOM analysis, test plan, FAI tracking" },
  { module: "ECO", path: "/eco", screen: "ECO List", description: "Engineering change orders with impact analysis" },
  { module: "ECO", path: "/eco/:id", screen: "ECO Detail", description: "BOM diff viewer, approvals, implementation tracking" },
  { module: "Supply Chain", path: "/supply-chain", screen: "Supply Chain Dashboard", description: "Order pipeline, material status, supplier performance" },
  { module: "Supply Chain", path: "/supply-chain/sales-orders", screen: "Sales Orders", description: "Order management with payment milestones (50/30/20)" },
  { module: "Supply Chain", path: "/supply-chain/bom", screen: "BOM Manager", description: "Bill of materials with cost analysis, alternate parts, revisions" },
  { module: "Supply Chain", path: "/supply-chain/purchase-orders", screen: "Purchase Orders", description: "PO creation, GRN tracking, supplier performance" },
  { module: "Supply Chain", path: "/supply-chain/suppliers", screen: "Suppliers", description: "Supplier master, scorecards, certifications" },
  { module: "Inventory", path: "/inventory", screen: "Inventory Dashboard", description: "Stock levels, reorder alerts, receiving station, location tracking" },
  { module: "MSL", path: "/msl", screen: "MSL Dashboard", description: "Real-time moisture floor life tracking, bake queue, line interlock" },
  { module: "Manufacturing", path: "/manufacturing", screen: "Manufacturing Dashboard", description: "Floor status, work orders, Gantt scheduling, work instructions" },
  { module: "Manufacturing", path: "/manufacturing/:id", screen: "Work Order Detail", description: "Route tracking, Gerber/setup, material consumption, operator log" },
  { module: "Quality", path: "/quality", screen: "Quality Dashboard", description: "FPY/DPMO dashboards, defect Pareto, SPC charts" },
  { module: "Quality", path: "/quality/ncr", screen: "NCR List", description: "Non-conformance reports, CAPA tracking" },
  { module: "Traceability", path: "/traceability", screen: "Trace Search", description: "Bi-directional: board-to-components and component-to-boards" },
  { module: "Maintenance", path: "/maintenance", screen: "Maintenance Dashboard", description: "Equipment PM schedules, calibration, auto-block overdue" },
  { module: "Delivery", path: "/delivery", screen: "Delivery Dashboard", description: "Shipment tracking, packing lists, carrier integration" },
  { module: "RMA", path: "/rma", screen: "RMA Dashboard", description: "Returns processing with trace-link to production data" },
  { module: "Customer Portal", path: "/portal", screen: "Customer Portal", description: "Read-only order, NPI, and RMA tracking for customers" },
  { module: "Settings", path: "/settings", screen: "Settings", description: "Roles, notifications, integrations, payroll configuration" },
  { module: "Settings", path: "/settings/payroll-config", screen: "Payroll Config", description: "PF/ESI/TDS/PT rates, salary structure, bank details" },
];

function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg hover:bg-blue-700 print:hidden"
      title="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

export function UserManual() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:break-before { page-break-before: always; }
          .print\\:break-after { page-break-after: always; }
          .print\\:break-inside-avoid { page-break-inside: avoid; }
          body { font-size: 11pt; line-height: 1.5; }
          h1 { font-size: 22pt; }
          h2 { font-size: 16pt; }
          h3 { font-size: 13pt; }
          table { font-size: 9pt; }
          @page { margin: 2cm; }
        }
      `}</style>

      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur print:hidden">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to ERP
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Printer className="h-4 w-4" />
          Print Manual
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* ============ COVER ============ */}
        <section className="mb-16 flex flex-col items-center text-center print:break-after">
          <img src="/thinksemi-logo.png" alt="Thinksemi Logo" className="mb-8 h-24 w-auto" />
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Thinksemi ERP</h1>
          <p className="mb-1 text-2xl font-light text-gray-500">User Manual</p>
          <p className="mb-8 text-lg text-blue-600">PCB Assembly Management System</p>
          <div className="mb-10 space-y-1 text-sm text-gray-400">
            <p>Version 1.0 &mdash; March 2026</p>
            <p>Confidential &mdash; For Authorized Users Only</p>
          </div>
          <div className="h-px w-48 bg-gray-200" />
        </section>

        {/* ============ TABLE OF CONTENTS ============ */}
        <section className="mb-16 print:break-after">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Table of Contents
          </h2>
          <nav className="space-y-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-gray-700 transition hover:bg-gray-50 hover:text-blue-600">
                <s.icon className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{s.title}</span>
              </a>
            ))}
          </nav>
        </section>

        {/* ============ SECTION 1: OVERVIEW ============ */}
        <section id="overview" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <Monitor className="h-6 w-6 text-blue-600" />
            1. System Overview
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Thinksemi ERP is a purpose-built enterprise resource planning system designed specifically for{" "}
              <strong>PCB Assembly and Electronic Manufacturing Services (EMS)</strong> companies.
              It covers the full lifecycle from customer inquiry through manufacturing, quality, delivery, and after-sales support.
            </p>

            <h3>Modules (16)</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: BarChart3, name: "Dashboard", desc: "Live KPIs and production floor overview" },
                { icon: Users, name: "HR & Payroll", desc: "Attendance, leave, payroll, PMS, compliance" },
                { icon: UserCircle, name: "CRM", desc: "Pipeline, contacts, quotations, analytics" },
                { icon: IndianRupee, name: "Finance", desc: "Customer & vendor payments, payroll approval" },
                { icon: FlaskConical, name: "NPI", desc: "New product introduction pipeline" },
                { icon: FileText, name: "ECO", desc: "Engineering change orders & revision control" },
                { icon: Package, name: "Supply Chain", desc: "Sales orders, BOM, POs, suppliers" },
                { icon: Layers, name: "Inventory", desc: "Stock tracking, reorder, receiving" },
                { icon: Thermometer, name: "MSL Control", desc: "Moisture sensitivity level tracking" },
                { icon: Factory, name: "Manufacturing", desc: "Work orders, scheduling, routing" },
                { icon: ClipboardList, name: "Work Instructions", desc: "Step-by-step with Gerber overlay" },
                { icon: Shield, name: "Quality (QMS)", desc: "FPY, DPMO, SPC, NCR, CAPA" },
                { icon: Cpu, name: "Traceability", desc: "Bi-directional component tracking" },
                { icon: Wrench, name: "Maintenance", desc: "PM schedules, calibration" },
                { icon: Truck, name: "Delivery", desc: "Shipment tracking, documents" },
                { icon: RotateCcw, name: "RMA", desc: "Returns with production trace-link" },
              ].map((m) => (
                <div key={m.name} className="flex items-start gap-3 rounded-lg border p-3 print:break-inside-avoid">
                  <m.icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3>Additional System Features</h3>
            <ul>
              <li><strong>Customer Portal</strong> &mdash; Read-only access for customers to track orders, NPI, and RMA</li>
              <li><strong>Role-based Access Control</strong> &mdash; 11 predefined roles with configurable permissions</li>
              <li><strong>Notification Center</strong> &mdash; Email, WhatsApp, and in-app notifications</li>
              <li><strong>CSV & PDF Export</strong> &mdash; Available on all data tables across the system</li>
              <li><strong>State Transitions</strong> &mdash; Defined workflows for all modules (CRM, NPI, ECO, Manufacturing, etc.)</li>
            </ul>

            <h3>Target Users</h3>
            <p>
              PCB assembly houses, EMS providers, contract electronics manufacturers, and any company performing SMT/THT assembly,
              box-build, or electro-mechanical integration.
            </p>

            <h3>Technology Stack</h3>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Layer</th>
                  <th className="text-left">Technology</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Frontend</td><td>React 18, TypeScript, Tailwind CSS, Vite</td></tr>
                <tr><td>UI Components</td><td>shadcn/ui, Recharts, Lucide Icons, dnd-kit</td></tr>
                <tr><td>Backend</td><td>Python FastAPI, SQLAlchemy, Alembic</td></tr>
                <tr><td>Database</td><td>PostgreSQL 15+</td></tr>
                <tr><td>Authentication</td><td>JWT with RBAC (Role-Based Access Control)</td></tr>
                <tr><td>Deployment</td><td>AWS (ECS, RDS, S3, CloudFront) or Netlify + Cloud</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ SECTION 2: FEATURES ============ */}
        <section id="available" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <Package className="h-6 w-6 text-green-600" />
            2. Features & Capabilities
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Thinksemi ERP v1.0 provides a <strong>complete management system</strong> across 16 modules with 60+ screens,
              covering every aspect of PCB assembly operations.
            </p>

            <h3>Dashboard</h3>
            <ul>
              <li>Live KPIs: revenue, active orders, on-time delivery, OEE, first pass yield</li>
              <li>Production floor status with line utilization and OEE per line</li>
              <li>Alert feed for critical items (MSL expiry, overdue maintenance, quality escapes)</li>
              <li>Top customers revenue chart, orders by status breakdown</li>
            </ul>

            <h3>HR & Payroll</h3>
            <ul>
              <li><strong>Attendance</strong> &mdash; Daily log with biometric device integration (ZKTeco), shift tracking, sync status</li>
              <li><strong>Leave Management</strong> &mdash; Indian leave types (CL, SL, EL/PL, Maternity 26 weeks, Paternity 15 days, Comp Off), holiday calendar (21 TN holidays), approval workflow</li>
              <li><strong>Payroll</strong> &mdash; Full CTC breakdown (Basic 40%, HRA, Special Allowance, Conveyance, Medical), PF 12% (employee + employer), ESI, Professional Tax (TN slabs), TDS (New Regime 2026), Thinksemi-branded payslips with company logo</li>
              <li><strong>Performance (PMS)</strong> &mdash; KPI-based goals, self-assessment, manager review, rating distribution</li>
              <li><strong>Compliance</strong> &mdash; PF/ESI/PT monthly filing tracker, Form 24Q quarterly, Form 16, LWF, Minimum Wages (TN), Payment of Bonus Act</li>
            </ul>

            <h3>CRM</h3>
            <ul>
              <li><strong>Pipeline</strong> &mdash; Drag-and-drop kanban (New Lead → Qualified → Quoted → Negotiation → Won / Lost)</li>
              <li><strong>Contacts</strong> &mdash; Contact management with communication history and associated deals</li>
              <li><strong>Activities</strong> &mdash; Call, email, meeting, note, task logging with timeline view</li>
              <li><strong>Analytics</strong> &mdash; Pipeline funnel, revenue forecast, won/lost analysis, lead sources, sales cycle</li>
              <li><strong>Quotation Builder</strong> &mdash; Line-item pricing (PCB + components + assembly + testing), GST 18%, approval workflow, version history, Convert to Sales Order</li>
            </ul>

            <h3>Finance</h3>
            <ul>
              <li><strong>Customer Payments</strong> &mdash; Invoice tracking, payment recording (NEFT/RTGS/Cheque/UPI), milestone tracking (50/30/20), receivables aging</li>
              <li><strong>Vendor Payments</strong> &mdash; Bill approval, batch payment scheduling, payables aging, supplier payment terms</li>
              <li><strong>Payroll Approval</strong> &mdash; HR submits → Finance reviews → Finance approves → Payment processed</li>
              <li><strong>Reports</strong> &mdash; Cash flow statement, receivables/payables aging, payment history, GST summary, TDS deductions</li>
            </ul>

            <h3>NPI (New Product Introduction)</h3>
            <ul>
              <li>Drag-and-drop kanban pipeline (Incoming → DFM Review → Prototype Build → Validation → Done)</li>
              <li>Gerber viewer for PCB layout review with layer controls</li>
              <li>BOM analysis with component availability, lead times, cost breakdown</li>
              <li>Test plan definition (ICT/FCT test points, criteria, thresholds)</li>
              <li>First Article Inspection (FAI) workflow with measurement tracking</li>
              <li>Board view, timeline view, and NPI metrics dashboard</li>
            </ul>

            <h3>ECO (Engineering Change Orders)</h3>
            <ul>
              <li>BOM diff viewer showing side-by-side before/after changes with cost delta</li>
              <li>Impact analysis: affected work orders, inventory disposition, cost impact</li>
              <li>CCB (Change Control Board) multi-level approval workflow with comments</li>
              <li>Implementation tracking with assignable checklist steps</li>
              <li>Full audit trail and history</li>
            </ul>

            <h3>Supply Chain</h3>
            <ul>
              <li><strong>Sales Orders</strong> &mdash; Order management with payment milestones (50% advance, 30% mid-production, 20% pre-delivery), priority, Create WO/Invoice actions</li>
              <li><strong>BOM Manager</strong> &mdash; Dense data grid with stock status, cost analysis charts, revision history with diff, alternate components, where-used analysis</li>
              <li><strong>Purchase Orders</strong> &mdash; PO lifecycle, goods receipt note (GRN) tracking, supplier performance metrics</li>
              <li><strong>Supplier Management</strong> &mdash; Scorecards (delivery, quality, price, responsiveness), certifications, approved component lists</li>
            </ul>

            <h3>Inventory & MSL</h3>
            <ul>
              <li>Real-time stock level tracking by location (rack/bin)</li>
              <li>Reorder alerts when stock falls below minimum threshold</li>
              <li>Incoming goods receiving station with barcode scanning</li>
              <li><strong>MSL Control</strong> &mdash; Real-time floor life countdown per reel (IPC/JEDEC J-STD-033), bake queue, line interlock to prevent expired components from entering production</li>
            </ul>

            <h3>Manufacturing</h3>
            <ul>
              <li>Work order creation, scheduling, and route tracking through assembly steps</li>
              <li>Gantt-based production scheduling with drag-and-drop and line load visualization</li>
              <li>Gerber overlay and machine setup parameters on work order detail</li>
              <li>Material consumption tracking linked to specific reels for traceability</li>
              <li>Operator log with shift handover notes</li>
              <li><strong>Work Instructions</strong> &mdash; Step-by-step with Gerber overlay, component highlighting, feeder loading sequence, reflow profile, setup guide</li>
            </ul>

            <h3>Quality (QMS)</h3>
            <ul>
              <li>FPY (First Pass Yield) and DPMO dashboards with trend analysis</li>
              <li>Defect Pareto analysis and SPC (Statistical Process Control) charts</li>
              <li>NCR (Non-Conformance Report) management with severity levels</li>
              <li>CAPA (Corrective and Preventive Action) tracking</li>
            </ul>

            <h3>Traceability</h3>
            <ul>
              <li>Forward trace: board serial → all component reels used, machines, operators, test results</li>
              <li>Reverse trace: component reel → all boards it was placed on</li>
              <li>Full production history timeline per serial number</li>
            </ul>

            <h3>Maintenance & Calibration</h3>
            <ul>
              <li>Equipment PM scheduling (time-based and usage-based)</li>
              <li>Calibration tracking with due-date alerts and certificate management</li>
              <li>Auto-block: overdue equipment cannot be assigned to work orders</li>
            </ul>

            <h3>Delivery & RMA</h3>
            <ul>
              <li>Shipment tracking with carrier integration (FedEx, DHL, DTDC)</li>
              <li>Packing list and shipping document generation</li>
              <li><strong>RMA</strong> &mdash; Returns processing with direct trace-link to original production data for root cause analysis</li>
            </ul>

            <h3>Customer Portal</h3>
            <ul>
              <li>Read-only tracking for orders, NPI status, and RMA status</li>
              <li>Document download (CoC, test reports, invoices, shipping docs)</li>
              <li>Secured with row-level access &mdash; customers see only their data</li>
            </ul>

            <h3>Settings & Administration</h3>
            <ul>
              <li><strong>Roles</strong> &mdash; 11 predefined roles (Super Admin, Admin, HR Manager, Finance Manager, Engineering Manager, Production Manager, Supply Chain Manager, Sales, Quality Engineer, Operator, Customer) with full permission matrix</li>
              <li><strong>Notifications</strong> &mdash; 8 configurable notification rules with per-channel toggles (Email SMTP, WhatsApp Business API, In-App)</li>
              <li><strong>Integrations</strong> &mdash; Biometric devices, accounting software, shipping carriers, component databases</li>
              <li><strong>Payroll Config</strong> &mdash; Org-level salary structure, statutory rates, bank details, tax regime</li>
            </ul>

            <h3>Cross-cutting Features</h3>
            <ul>
              <li>CSV and PDF export on all data tables</li>
              <li>State transitions defined for all 12 workflows (CRM, NPI, ECO, SO, PO, WO, NCR, CAPA, RMA, Leave, Maintenance, Shipment, Invoice, Vendor Bill, Payroll)</li>
              <li>Thinksemi branded throughout &mdash; logo, company details, payslips</li>
              <li>Dark mode support</li>
              <li>Print-optimized layouts for all reports and payslips</li>
            </ul>
          </div>
        </section>

        {/* ============ SECTION 3: OUT OF SCOPE ============ */}
        <section id="out-of-scope" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <Ban className="h-6 w-6 text-red-500" />
            3. What's Not Needed (Out of Scope)
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              The following capabilities are intentionally excluded because they are outside Thinksemi's business model
              or are better handled by dedicated external tools.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "PCB Fabrication Modules",
                  desc: "Chemical processing, etching, plating, drilling, and lamination modules are not included. Thinksemi is an assembly-only facility and does not fabricate bare PCBs. The system architecture is fab-ready and can be extended for fabrication customers in the future.",
                },
                {
                  title: "Full Accounting / General Ledger",
                  desc: "This ERP does not include double-entry bookkeeping, chart of accounts, or financial statements. Use Tally, Zoho Books, or similar accounting software. The Finance module handles payments, invoicing, and GST/TDS tracking, with export capability for your accounting tool.",
                },
                {
                  title: "CNC Machine Programming",
                  desc: "Pick-and-place machine programming is done in external vendor software (Yamaha, Fuji, Panasonic). The ERP consumes Gerber and placement data but does not generate machine programs.",
                },
                {
                  title: "PCB Design / CAD Tools",
                  desc: "Schematic capture and PCB layout are done in KiCad, Altium, or similar. The ERP imports Gerber files for visualization and work instructions but does not provide design capability.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border-l-4 border-red-300 bg-red-50 p-4 print:break-inside-avoid">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SECTION 4: ROADMAP ============ */}
        <section id="roadmap" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <Rocket className="h-6 w-6 text-purple-600" />
            4. Enhancement Roadmap
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              The following enhancements are planned to further extend the system's capabilities.
            </p>
            <div className="space-y-6">
              {[
                {
                  phase: "Phase 2",
                  title: "IoT / Machine Integration",
                  timeline: "4 weeks",
                  items: [
                    "Real-time pick-and-place machine data feed (Yamaha, Fuji, Panasonic)",
                    "Reflow oven temperature profile logging and monitoring",
                    "AOI defect image capture and automatic classification",
                    "SPI (Solder Paste Inspection) data integration",
                    "Live OEE calculation from machine data",
                  ],
                },
                {
                  phase: "Phase 3",
                  title: "Mobile App + Customer Portal Deployment",
                  timeline: "3 weeks",
                  items: [
                    "Progressive Web App (PWA) for offline shop floor use",
                    "Mobile-optimized operator interface for barcode scanning and defect logging",
                    "Customer portal deployment with secure, branded access",
                    "Push notifications for critical alerts on mobile",
                  ],
                },
                {
                  phase: "Phase 4",
                  title: "Advanced Analytics + AI",
                  timeline: "Ongoing",
                  items: [
                    "AI-powered defect prediction and yield optimization",
                    "Automated production scheduling optimization",
                    "Predictive maintenance based on equipment usage patterns",
                    "Natural language query interface for reports",
                    "Advanced business intelligence dashboards",
                  ],
                },
                {
                  phase: "Phase 5",
                  title: "Multi-tenant SaaS",
                  timeline: "Ongoing",
                  items: [
                    "Multi-tenant architecture for serving multiple PCB assembly factories",
                    "White-label deployment with custom branding per tenant",
                    "Usage-based pricing and subscription management",
                    "Multi-factory consolidated reporting",
                  ],
                },
              ].map((phase) => (
                <div key={phase.phase} className="rounded-lg border p-5 print:break-inside-avoid">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="m-0 text-lg font-bold text-gray-900">
                      {phase.phase}: {phase.title}
                    </h3>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700">
                      {phase.timeline}
                    </span>
                  </div>
                  <ul className="m-0 space-y-1">
                    {phase.items.map((item) => (
                      <li key={item} className="text-sm text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ SECTION 5: CREDENTIALS ============ */}
        <section id="credentials" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <Key className="h-6 w-6 text-amber-600" />
            5. Login Credentials
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              The following credentials are configured for system access. Contact your administrator to create additional users or modify roles.
            </p>

            <div className="overflow-hidden rounded-lg border">
              <table className="m-0 w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-900">Role</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-900">Password</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-900">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { role: "Super Admin", email: "superadmin@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Full access — all modules, settings, user management" },
                    { role: "Admin", email: "admin@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "All modules except system settings" },
                    { role: "HR Manager", email: "hr@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "HR, Payroll, Compliance, Attendance, Leave, PMS" },
                    { role: "Finance Manager", email: "finance@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Finance, Customer/Vendor Payments, Payroll Approval" },
                    { role: "Engineering Manager", email: "engineering@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "NPI, ECO, BOM, Work Instructions, Quality" },
                    { role: "Production Manager", email: "production@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Manufacturing, Schedule, Quality, Maintenance" },
                    { role: "Supply Chain Manager", email: "scm@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Sales Orders, POs, Inventory, MSL, Delivery, Suppliers" },
                    { role: "Sales / CRM", email: "sales@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "CRM Pipeline, Contacts, Quotations, Analytics" },
                    { role: "Quality Engineer", email: "quality@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Quality, Traceability, NCR, CAPA, SPC, Audit" },
                    { role: "Floor Operator", email: "operator@thinksemi.com", password: "ThinkSemi@ERP2026!", access: "Manufacturing (shop floor view), Work Instructions, Attendance" },
                    { role: "Customer (Bosch)", email: "customer@bosch.com", password: "Bosch@Portal2026!", access: "Customer Portal — order tracking, NPI, RMA, documents" },
                  ].map((cred) => (
                    <tr key={cred.email} className="print:break-inside-avoid">
                      <td className="px-3 py-2 font-medium text-gray-900">{cred.role}</td>
                      <td className="px-3 py-2"><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{cred.email}</code></td>
                      <td className="px-3 py-2"><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{cred.password}</code></td>
                      <td className="px-3 py-2 text-gray-600">{cred.access}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ SECTION 6: SCREEN REFERENCE ============ */}
        <section id="screens" className="mb-16 print:break-before">
          <h2 className="mb-6 flex items-center gap-3 border-b pb-3 text-2xl font-bold text-gray-900">
            <LayoutGrid className="h-6 w-6 text-teal-600" />
            6. Module-wise Screen Reference
          </h2>
          <div className="prose prose-gray max-w-none">
            <p>
              Complete listing of all screens available in Thinksemi ERP v1.0.
            </p>

            <div className="overflow-x-auto">
              <table className="m-0 w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">#</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Module</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Screen</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Path</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {screenReference.map((row, idx) => (
                    <tr key={`${row.path}-${idx}`} className="print:break-inside-avoid">
                      <td className="px-3 py-2 text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 font-medium text-gray-700">{row.module}</td>
                      <td className="px-3 py-2 text-gray-900">{row.screen}</td>
                      <td className="px-3 py-2">
                        {row.path.includes(":") ? (
                          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{row.path}</code>
                        ) : (
                          <a href={row.path} className="text-blue-600 hover:underline print:text-gray-900 print:no-underline">
                            <code className="rounded bg-blue-50 px-1.5 py-0.5 text-xs print:bg-gray-100">{row.path}</code>
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="border-t pt-8 text-center text-sm text-gray-400">
          <p>Thinksemi ERP &mdash; User Manual v1.0</p>
          <p>March 2026 &mdash; Confidential</p>
          <p className="mt-2">Generated for internal use only. Do not distribute without authorization.</p>
        </footer>
      </div>

      <ScrollToTop />
    </div>
  );
}
