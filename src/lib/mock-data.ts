// Centralized mock data for all modules — will be replaced with API calls later

export const currentUser = {
  id: "usr-001",
  name: "Sandeep K",
  email: "sandeep@thinksemi.com",
  role: "admin" as const, // admin | manager | engineer | operator | customer
  avatar: null,
}

// ─── Dashboard KPIs ───
export const dashboardKPIs = {
  revenue: { value: 2450000, change: 12, period: "MoM" },
  activeOrders: { value: 47, late: 8 },
  onTimeDelivery: { value: 94.2 },
  oee: { value: 78.3, change: 2.1 },
  firstPassYield: { value: 97.8 },
  dpmo: { value: 342, change: -12 },
}

export const revenueChartData = [
  { month: "Oct", revenue: 1850000, target: 2000000 },
  { month: "Nov", revenue: 2100000, target: 2000000 },
  { month: "Dec", revenue: 1920000, target: 2200000 },
  { month: "Jan", revenue: 2300000, target: 2200000 },
  { month: "Feb", revenue: 2180000, target: 2400000 },
  { month: "Mar", revenue: 2450000, target: 2400000 },
]

export const ordersByStatus = [
  { status: "In Production", count: 23, color: "#22c55e" },
  { status: "Pending NPI", count: 8, color: "#f59e0b" },
  { status: "Quoted", count: 12, color: "#3b82f6" },
  { status: "On Hold", count: 4, color: "#ef4444" },
]

export const topCustomers = [
  { name: "Bosch India", revenue: 850000 },
  { name: "Continental", revenue: 620000 },
  { name: "L&T", revenue: 480000 },
  { name: "Tata Elxsi", revenue: 310000 },
  { name: "ABB", revenue: 190000 },
]

export const alerts = [
  { id: 1, type: "warning", message: "3 MSL components expiring within 4 hours", module: "msl" },
  { id: 2, type: "warning", message: "Line 2 AOI yield dropped 94% → 87%", module: "quality" },
  { id: 3, type: "info", message: "Reflow Oven 1 maintenance due tomorrow", module: "maintenance" },
  { id: 4, type: "info", message: "5 ECOs pending approval", module: "eco" },
  { id: 5, type: "error", message: "PO-2026-53 from Arrow delayed by 3 days", module: "supply" },
]

// ─── Production Floor ───
export const productionLines = [
  {
    id: "line-1",
    name: "SMT Line 1",
    status: "running" as const,
    workOrder: "WO-2026-0341",
    board: "ECU-X500",
    customer: "Bosch",
    oee: 82,
    oeeTarget: 85,
    completed: 847,
    total: 1200,
    defects: 3,
  },
  {
    id: "line-2",
    name: "SMT Line 2",
    status: "changeover" as const,
    workOrder: null,
    board: null,
    customer: null,
    oee: 0,
    oeeTarget: 85,
    completed: 0,
    total: 0,
    defects: 0,
    setupMinutes: 12,
    nextWorkOrder: "WO-2026-0343",
  },
  {
    id: "tht-1",
    name: "THT Line 1",
    status: "running" as const,
    workOrder: "WO-2026-0338",
    board: "PS-220",
    customer: "L&T",
    oee: 71,
    oeeTarget: 75,
    completed: 322,
    total: 500,
    defects: 1,
  },
]

// ─── HR ───
export const employees = [
  { id: "emp-001", name: "Ravi Kumar", dept: "SMT Production", role: "Operator", shift: "A" },
  { id: "emp-002", name: "Priya Sharma", dept: "Quality", role: "QC Engineer", shift: "General" },
  { id: "emp-003", name: "Mohan Rajan", dept: "Store", role: "Store Keeper", shift: "General" },
  { id: "emp-004", name: "Arun Krishnan", dept: "Engineering", role: "Process Engineer", shift: "General" },
  { id: "emp-005", name: "Lakshmi Venkat", dept: "HR", role: "HR Executive", shift: "General" },
  { id: "emp-006", name: "Suresh Babu", dept: "SMT Production", role: "Operator", shift: "B" },
  { id: "emp-007", name: "Deepa Nair", dept: "Testing", role: "Test Engineer", shift: "General" },
  { id: "emp-008", name: "Karthik Raja", dept: "SMT Production", role: "Line Supervisor", shift: "A" },
]

export type AttendanceStatus = "P" | "A" | "L" | "WO" | "H" | "CO" | "OT"

export const attendanceData: Record<string, AttendanceStatus[]> = {
  "emp-001": ["P","P","P","A","P","P","WO","P","P","P","P","P","P","WO","P","OT","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P"],
  "emp-002": ["P","P","L","L","P","P","WO","P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P","L","P","P","WO","P","P","P"],
  "emp-003": ["P","P","P","P","P","P","WO","CO","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P"],
  "emp-004": ["P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P","L","L","L","WO","P","P","P","P","P","P","WO","P","P","P"],
  "emp-005": ["P","P","P","P","P","P","WO","P","P","P","P","H","P","WO","P","P","P","P","P","P","WO","P","P","P","P","P","P","WO","P","P","P"],
}

export const leaveBalances = [
  { type: "Casual Leave", entitled: 12, used: 4, balance: 8, carryForward: "Max 5" },
  { type: "Sick Leave", entitled: 10, used: 2, balance: 8, carryForward: "No" },
  { type: "Earned Leave", entitled: 15, used: 0, balance: 15, carryForward: "Max 30" },
  { type: "Comp-Off", entitled: 3, used: 1, balance: 2, carryForward: "Exp 90d" },
]

export const leaveRequests = [
  { id: "lr-001", employee: "Ravi Kumar", type: "Casual Leave", from: "2026-04-02", to: "2026-04-04", days: 3, status: "pending", reason: "Family function" },
  { id: "lr-002", employee: "Priya Sharma", type: "Sick Leave", from: "2026-03-28", to: "2026-03-28", days: 1, status: "pending", reason: "Unwell" },
  { id: "lr-003", employee: "Mohan Rajan", type: "Comp-Off", from: "2026-04-07", to: "2026-04-07", days: 1, status: "approved", reason: "Worked on Sunday Mar 22" },
]

// ─── CRM ───
export const crmPipelineStages = ["New Lead", "Qualified", "Quoted", "Negotiation", "Won", "Lost"]

export const crmLeads = [
  { id: "lead-001", company: "TechCorp", contact: "Amit Shah", product: "EV Charger Board", value: 800000, probability: 10, stage: "New Lead", assignee: "Sandeep K" },
  { id: "lead-002", company: "MedTech Solutions", contact: "Dr. Priya R", product: "Patient Monitor PCB", value: 500000, probability: 10, stage: "New Lead", assignee: "Sandeep K" },
  { id: "lead-003", company: "Bosch India", contact: "Rahul Menon", product: "ECU-X500", value: 1200000, probability: 40, stage: "Qualified", assignee: "Sandeep K" },
  { id: "lead-004", company: "ABB", contact: "Vikram S", product: "VFD Control Board", value: 600000, probability: 40, stage: "Qualified", assignee: "Sandeep K" },
  { id: "lead-005", company: "Siemens", contact: "Klaus M", product: "Sensor Interface", value: 900000, probability: 60, stage: "Quoted", assignee: "Sandeep K" },
  { id: "lead-006", company: "L&T", contact: "Sunil K", product: "Relay Board", value: 1100000, probability: 60, stage: "Quoted", assignee: "Sandeep K" },
  { id: "lead-007", company: "Continental", contact: "Deepak R", product: "ADAS Module", value: 700000, probability: 75, stage: "Negotiation", assignee: "Sandeep K" },
  { id: "lead-008", company: "Tata Elxsi", contact: "Meera J", product: "IoT Gateway", value: 400000, probability: 75, stage: "Negotiation", assignee: "Sandeep K" },
  { id: "lead-009", company: "Honeywell", contact: "Rajesh P", product: "Thermostat Controller", value: 950000, probability: 100, stage: "Won", assignee: "Sandeep K" },
  { id: "lead-010", company: "Schneider", contact: "Anita V", product: "Power Meter Board", value: 680000, probability: 100, stage: "Won", assignee: "Sandeep K" },
  { id: "lead-011", company: "Havells", contact: "Suresh M", product: "MCB Controller", value: 320000, probability: 0, stage: "Lost", assignee: "Sandeep K" },
]

// ─── NPI ───
export const npiProjects = [
  { id: "npi-001", board: "ECU-X500", customer: "Bosch", stage: "Incoming", assignee: "Priya S", gerberUploaded: true, bomUploaded: true, pnpReady: false, stencilOrdered: false, dfmDone: false },
  { id: "npi-002", board: "IoT-200", customer: "Tata Elxsi", stage: "DFM Review", assignee: "Arun K", gerberUploaded: true, bomUploaded: true, pnpReady: true, stencilOrdered: true, dfmDone: false, dfmIssues: 3 },
  { id: "npi-003", board: "ADAS-M1", customer: "Continental", stage: "Prototype Build", assignee: "Line 1", gerberUploaded: true, bomUploaded: true, pnpReady: true, stencilOrdered: true, dfmDone: true, buildProgress: "5/10" },
  { id: "npi-004", board: "EV-CHG-3", customer: "TechCorp", stage: "Validation", assignee: "Deepa N", gerberUploaded: true, bomUploaded: true, pnpReady: true, stencilOrdered: true, dfmDone: true, ictPass: true, fctPass: true, yield: 96 },
]

// ─── ECO ───
export const ecoList = [
  { id: "ECO-042", product: "ECU-X500", type: "Component Swap", reason: "Obsolescence", status: "pending", requestedBy: "Arun K", date: "2026-03-28", approvalsNeeded: 3, approvalsGiven: 2 },
  { id: "ECO-041", product: "IoT-200", type: "BOM Revision", reason: "Cost Reduction", status: "completed", requestedBy: "Priya S", date: "2026-03-25", approvalsNeeded: 3, approvalsGiven: 3 },
  { id: "ECO-040", product: "ADAS-M1", type: "Gerber Revision", reason: "Design Fix", status: "in_progress", requestedBy: "Arun K", date: "2026-03-22", approvalsNeeded: 3, approvalsGiven: 3 },
  { id: "ECO-039", product: "PS-220", type: "Component Swap", reason: "Alternate Part", status: "pending", requestedBy: "Mohan R", date: "2026-03-20", approvalsNeeded: 3, approvalsGiven: 1 },
]

// ─── Supply Chain ───
export const salesOrders = [
  { id: "SO-2026-089", customer: "Bosch", board: "ECU-X500", qty: 5000, dueDate: "2026-04-20", status: "production", value: 2418000, priority: "high" as const, paymentStatus: "partial" as const, orderDate: "2026-03-01", woId: "WO-2026-0341", bomId: "BOM-ECU-X500-C", lineItems: [{ part: "ECU-X500 PCB Assembly", qty: 5000, unitPrice: 483.6 }], paymentMilestones: [{ label: "Advance (50%)", amount: 1209000, date: "2026-03-05", status: "paid" as const }, { label: "Mid-production (30%)", amount: 725400, date: "2026-04-10", status: "pending" as const }, { label: "Pre-delivery (20%)", amount: 483600, date: "2026-04-18", status: "pending" as const }], deliverySchedule: [{ batch: 1, qty: 2500, date: "2026-04-15", status: "scheduled" as const }, { batch: 2, qty: 2500, date: "2026-04-20", status: "scheduled" as const }] },
  { id: "SO-2026-088", customer: "Continental", board: "ADAS-M1", qty: 1000, dueDate: "2026-04-15", status: "material_pending", value: 980000, priority: "high" as const, paymentStatus: "partial" as const, orderDate: "2026-02-20", woId: null, bomId: "BOM-ADAS-M1-B", lineItems: [{ part: "ADAS-M1 PCB Assembly", qty: 1000, unitPrice: 980 }], paymentMilestones: [{ label: "Advance (50%)", amount: 490000, date: "2026-02-25", status: "paid" as const }, { label: "Mid-production (30%)", amount: 294000, date: "2026-04-01", status: "overdue" as const }, { label: "Pre-delivery (20%)", amount: 196000, date: "2026-04-13", status: "pending" as const }], deliverySchedule: [{ batch: 1, qty: 1000, date: "2026-04-15", status: "pending" as const }] },
  { id: "SO-2026-087", customer: "L&T", board: "Relay-BR", qty: 10000, dueDate: "2026-04-10", status: "shipped", value: 3200000, priority: "medium" as const, paymentStatus: "paid" as const, orderDate: "2026-01-15", woId: "WO-2026-0338", bomId: "BOM-RELAY-BR-A", lineItems: [{ part: "Relay-BR PCB Assembly", qty: 10000, unitPrice: 320 }], paymentMilestones: [{ label: "Advance (50%)", amount: 1600000, date: "2026-01-20", status: "paid" as const }, { label: "Mid-production (30%)", amount: 960000, date: "2026-03-15", status: "paid" as const }, { label: "Pre-delivery (20%)", amount: 640000, date: "2026-04-08", status: "paid" as const }], deliverySchedule: [{ batch: 1, qty: 5000, date: "2026-04-05", status: "shipped" as const }, { batch: 2, qty: 5000, date: "2026-04-10", status: "shipped" as const }] },
  { id: "SO-2026-086", customer: "ABB", board: "VFD-CTRL", qty: 2000, dueDate: "2026-04-25", status: "scheduled", value: 1540000, priority: "medium" as const, paymentStatus: "pending" as const, orderDate: "2026-03-10", woId: "WO-2026-0345", bomId: "BOM-VFD-CTRL-B", lineItems: [{ part: "VFD-CTRL PCB Assembly", qty: 2000, unitPrice: 770 }], paymentMilestones: [{ label: "Advance (50%)", amount: 770000, date: "2026-03-15", status: "pending" as const }, { label: "Mid-production (30%)", amount: 462000, date: "2026-04-15", status: "pending" as const }, { label: "Pre-delivery (20%)", amount: 308000, date: "2026-04-23", status: "pending" as const }], deliverySchedule: [{ batch: 1, qty: 2000, date: "2026-04-25", status: "scheduled" as const }] },
  { id: "SO-2026-085", customer: "Tata Elxsi", board: "IoT-200", qty: 3000, dueDate: "2026-04-30", status: "production", value: 1650000, priority: "low" as const, paymentStatus: "partial" as const, orderDate: "2026-02-28", woId: "WO-2026-0340", bomId: "BOM-IOT-200-B", lineItems: [{ part: "IoT-200 PCB Assembly", qty: 3000, unitPrice: 550 }], paymentMilestones: [{ label: "Advance (50%)", amount: 825000, date: "2026-03-05", status: "paid" as const }, { label: "Mid-production (30%)", amount: 495000, date: "2026-04-15", status: "pending" as const }, { label: "Pre-delivery (20%)", amount: 330000, date: "2026-04-28", status: "pending" as const }], deliverySchedule: [{ batch: 1, qty: 1500, date: "2026-04-25", status: "scheduled" as const }, { batch: 2, qty: 1500, date: "2026-04-30", status: "scheduled" as const }] },
  { id: "SO-2026-084", customer: "Siemens", board: "Sensor-IF", qty: 500, dueDate: "2026-03-28", status: "invoiced", value: 475000, priority: "low" as const, paymentStatus: "paid" as const, orderDate: "2026-01-10", woId: "WO-2026-0330", bomId: "BOM-SENSOR-IF-A", lineItems: [{ part: "Sensor-IF PCB Assembly", qty: 500, unitPrice: 950 }], paymentMilestones: [{ label: "Advance (50%)", amount: 237500, date: "2026-01-15", status: "paid" as const }, { label: "Mid-production (30%)", amount: 142500, date: "2026-02-28", status: "paid" as const }, { label: "Pre-delivery (20%)", amount: 95000, date: "2026-03-25", status: "paid" as const }], deliverySchedule: [{ batch: 1, qty: 500, date: "2026-03-25", status: "shipped" as const }] },
  { id: "SO-2026-083", customer: "Bosch", board: "PS-220", qty: 8000, dueDate: "2026-05-10", status: "production", value: 2800000, priority: "high" as const, paymentStatus: "partial" as const, orderDate: "2026-02-10", woId: "WO-2026-0335", bomId: "BOM-PS-220-C", lineItems: [{ part: "PS-220 Power Supply Board", qty: 8000, unitPrice: 350 }], paymentMilestones: [{ label: "Advance (50%)", amount: 1400000, date: "2026-02-15", status: "paid" as const }, { label: "Mid-production (30%)", amount: 840000, date: "2026-04-20", status: "pending" as const }, { label: "Pre-delivery (20%)", amount: 560000, date: "2026-05-08", status: "pending" as const }], deliverySchedule: [{ batch: 1, qty: 4000, date: "2026-05-05", status: "scheduled" as const }, { batch: 2, qty: 4000, date: "2026-05-10", status: "scheduled" as const }] },
]

export const bomItems = [
  { ref: "R1", partNumber: "RC0402FR-07100R", value: "100Ω", package: "0402", manufacturer: "Yageo", stock: 12500, price: 0.15, alternates: 2, msl: 1, category: "Passives" as const, qtyPerBoard: 4 },
  { ref: "R2", partNumber: "RC0402FR-07100R", value: "100Ω", package: "0402", manufacturer: "Yageo", stock: 12500, price: 0.15, alternates: 2, msl: 1, category: "Passives" as const, qtyPerBoard: 4 },
  { ref: "C1", partNumber: "GRM155R71C104K", value: "100nF", package: "0402", manufacturer: "Murata", stock: 8200, price: 0.45, alternates: 1, msl: 1, category: "Passives" as const, qtyPerBoard: 8 },
  { ref: "C2", partNumber: "GRM155R71C104K", value: "100nF", package: "0402", manufacturer: "Murata", stock: 8200, price: 0.45, alternates: 1, msl: 1, category: "Passives" as const, qtyPerBoard: 8 },
  { ref: "U1", partNumber: "STM32F407VGT6", value: "MCU", package: "LQFP-100", manufacturer: "ST", stock: 230, price: 485, alternates: 0, msl: 3, category: "ICs" as const, qtyPerBoard: 1 },
  { ref: "U7", partNumber: "LM358BDR", value: "Op-Amp", package: "SOIC-8", manufacturer: "TI", stock: 0, price: 13.8, alternates: 1, msl: 2, category: "ICs" as const, qtyPerBoard: 2 },
  { ref: "J1", partNumber: "105450-0101", value: "USB-C", package: "SMD", manufacturer: "Molex", stock: 450, price: 32, alternates: 0, msl: 1, category: "Connectors" as const, qtyPerBoard: 1 },
  { ref: "Q1", partNumber: "SI2301CDS", value: "P-MOSFET", package: "SOT-23", manufacturer: "Vishay", stock: 3200, price: 4.5, alternates: 2, msl: 1, category: "ICs" as const, qtyPerBoard: 2 },
  { ref: "L1", partNumber: "CDRH127", value: "10µH", package: "12x12", manufacturer: "Sumida", stock: 800, price: 12, alternates: 1, msl: 1, category: "Passives" as const, qtyPerBoard: 1 },
  { ref: "D1", partNumber: "SS34", value: "Schottky", package: "SMA", manufacturer: "ON Semi", stock: 5000, price: 2.8, alternates: 3, msl: 1, category: "ICs" as const, qtyPerBoard: 3 },
  { ref: "Y1", partNumber: "ABM8-8.000MHZ", value: "8MHz", package: "3225", manufacturer: "Abracon", stock: 1200, price: 8.5, alternates: 1, msl: 1, category: "Passives" as const, qtyPerBoard: 1 },
  { ref: "J2", partNumber: "B4B-PH-K-S", value: "4-pin Header", package: "THT", manufacturer: "JST", stock: 3400, price: 5.2, alternates: 2, msl: 1, category: "Connectors" as const, qtyPerBoard: 2 },
  { ref: "U3", partNumber: "TPS54360DDA", value: "Buck Conv", package: "SO-8EP", manufacturer: "TI", stock: 620, price: 65, alternates: 1, msl: 3, category: "ICs" as const, qtyPerBoard: 1 },
  { ref: "H1", partNumber: "HS-AL-20x20", value: "Heatsink", package: "20x20mm", manufacturer: "Aavid", stock: 950, price: 18, alternates: 0, msl: 1, category: "Mechanicals" as const, qtyPerBoard: 1 },
]

export const bomWhereUsed = [
  { partNumber: "STM32F407VGT6", usedIn: ["ECU-X500", "ADAS-M1", "IoT-200"] },
  { partNumber: "GRM155R71C104K", usedIn: ["ECU-X500", "ADAS-M1", "PS-220", "VFD-CTRL", "Relay-BR", "IoT-200", "Sensor-IF"] },
  { partNumber: "LM358BDR", usedIn: ["ECU-X500", "PS-220", "VFD-CTRL"] },
  { partNumber: "RC0402FR-07100R", usedIn: ["ECU-X500", "ADAS-M1", "PS-220", "VFD-CTRL", "Relay-BR"] },
  { partNumber: "105450-0101", usedIn: ["ECU-X500", "IoT-200"] },
  { partNumber: "TPS54360DDA", usedIn: ["ECU-X500", "PS-220"] },
  { partNumber: "SI2301CDS", usedIn: ["ECU-X500", "VFD-CTRL", "PS-220"] },
]

export const bomRevisions = [
  { rev: "Rev C", date: "2026-03-15", author: "Arun K", changes: "Replaced U7 LM358 with MCP6002 for lower offset voltage, updated BOM cost", totalCost: 548.10, partCount: 14 },
  { rev: "Rev B", date: "2026-01-20", author: "Priya S", changes: "Added ESD protection on USB-C, changed C5 value from 10nF to 100nF", totalCost: 542.50, partCount: 13 },
  { rev: "Rev A", date: "2025-11-05", author: "Arun K", changes: "Initial BOM release for ECU-X500 prototype", totalCost: 530.00, partCount: 12 },
]

export const bomAlternates = [
  { ref: "R1", primary: "RC0402FR-07100R", alternate: "CRCW0402100RFKED", supplier: "Digi-Key", price: 0.12, leadTime: "3 days", status: "approved" as const },
  { ref: "R1", primary: "RC0402FR-07100R", alternate: "ERJ-2RKF1000X", supplier: "Mouser", price: 0.18, leadTime: "5 days", status: "approved" as const },
  { ref: "C1", primary: "GRM155R71C104K", alternate: "CL05B104KO5NNNC", supplier: "Arrow", price: 0.40, leadTime: "7 days", status: "approved" as const },
  { ref: "U7", primary: "LM358BDR", alternate: "MCP6002-I/SN", supplier: "Digi-Key", price: 15.20, leadTime: "5 days", status: "approved" as const },
  { ref: "Q1", primary: "SI2301CDS", alternate: "AO3401A", supplier: "Mouser", price: 3.80, leadTime: "4 days", status: "approved" as const },
  { ref: "Q1", primary: "SI2301CDS", alternate: "DMG2301L", supplier: "Arrow", price: 5.10, leadTime: "10 days", status: "qualified" as const },
  { ref: "D1", primary: "SS34", alternate: "SK34A", supplier: "Element14", price: 2.50, leadTime: "5 days", status: "approved" as const },
  { ref: "D1", primary: "SS34", alternate: "B340A-13-F", supplier: "Digi-Key", price: 3.20, leadTime: "3 days", status: "approved" as const },
  { ref: "D1", primary: "SS34", alternate: "SS34FA", supplier: "Mouser", price: 2.90, leadTime: "6 days", status: "qualified" as const },
  { ref: "L1", primary: "CDRH127", alternate: "SRN8040-100M", supplier: "Arrow", price: 11.00, leadTime: "7 days", status: "approved" as const },
]

export const purchaseOrders = [
  { id: "PO-2026-055", supplier: "Mouser", items: 8, total: 485000, eta: "2026-04-05", status: "confirmed", receivedQty: 0, orderedQty: 8, leadTimeDays: 12, lineItems: [{ part: "STM32F407VGT6", qty: 500, unitPrice: 485, received: 0 }, { part: "GRM155R71C104K", qty: 50000, unitPrice: 0.45, received: 0 }, { part: "RC0402FR-07100R", qty: 100000, unitPrice: 0.15, received: 0 }] },
  { id: "PO-2026-054", supplier: "Digi-Key", items: 3, total: 120000, eta: "2026-04-08", status: "confirmed", receivedQty: 0, orderedQty: 3, leadTimeDays: 8, lineItems: [{ part: "LM358BDR", qty: 2000, unitPrice: 13.80, received: 0 }, { part: "105450-0101", qty: 1000, unitPrice: 32, received: 0 }] },
  { id: "PO-2026-053", supplier: "Arrow", items: 12, total: 890000, eta: "2026-04-12", status: "delayed", receivedQty: 5, orderedQty: 12, leadTimeDays: 18, lineItems: [{ part: "TPS54360DDA", qty: 1000, unitPrice: 65, received: 500 }, { part: "SI2301CDS", qty: 5000, unitPrice: 4.50, received: 2500 }] },
  { id: "PO-2026-052", supplier: "Element14", items: 5, total: 210000, eta: "2026-03-30", status: "partially_received", receivedQty: 3, orderedQty: 5, leadTimeDays: 10, lineItems: [{ part: "SS34", qty: 10000, unitPrice: 2.80, received: 10000 }, { part: "CDRH127", qty: 2000, unitPrice: 12, received: 0 }] },
  { id: "PO-2026-051", supplier: "PCB Power", items: 2, total: 340000, eta: "2026-03-25", status: "closed", receivedQty: 2, orderedQty: 2, leadTimeDays: 14, lineItems: [{ part: "ECU-X500 Bare PCB", qty: 6000, unitPrice: 45, received: 6000 }, { part: "ADAS-M1 Bare PCB", qty: 1200, unitPrice: 38, received: 1200 }] },
  { id: "PO-2026-050", supplier: "Mouser", items: 4, total: 95000, eta: "2026-04-01", status: "confirmed", receivedQty: 0, orderedQty: 4, leadTimeDays: 10, lineItems: [{ part: "ABM8-8.000MHZ", qty: 2000, unitPrice: 8.50, received: 0 }, { part: "B4B-PH-K-S", qty: 5000, unitPrice: 5.20, received: 0 }] },
]

export const suppliers = [
  { id: "sup-001", name: "Mouser Electronics", location: "USA", category: "Components" as const, rating: 4.8, activePOs: 2, totalBusiness: 2850000, contact: "James Wilson", email: "james.w@mouser.com", phone: "+1-800-346-6873", paymentTerms: "Net 30", certifications: ["ISO 9001", "ISO 14001", "AS9120"], onTimeDelivery: 96.2, qualityScore: 99.1, priceCompetitiveness: 88, responsiveness: 94 },
  { id: "sup-002", name: "Digi-Key", location: "USA", category: "Components" as const, rating: 4.7, activePOs: 1, totalBusiness: 1920000, contact: "Sarah Miller", email: "sarah.m@digikey.com", phone: "+1-800-344-4539", paymentTerms: "Net 30", certifications: ["ISO 9001", "ISO 14001"], onTimeDelivery: 97.5, qualityScore: 98.8, priceCompetitiveness: 85, responsiveness: 96 },
  { id: "sup-003", name: "Arrow Electronics", location: "USA", category: "Components" as const, rating: 4.2, activePOs: 1, totalBusiness: 3100000, contact: "Mike Chen", email: "mike.c@arrow.com", phone: "+1-800-777-2776", paymentTerms: "Net 45", certifications: ["ISO 9001", "IATF 16949"], onTimeDelivery: 82.5, qualityScore: 97.2, priceCompetitiveness: 92, responsiveness: 78 },
  { id: "sup-004", name: "Element14", location: "Singapore", category: "Components" as const, rating: 4.5, activePOs: 1, totalBusiness: 890000, contact: "Anita Rao", email: "anita.r@element14.com", phone: "+65-6513-7700", paymentTerms: "Net 30", certifications: ["ISO 9001"], onTimeDelivery: 91.0, qualityScore: 98.5, priceCompetitiveness: 90, responsiveness: 88 },
  { id: "sup-005", name: "PCB Power", location: "India", category: "PCB" as const, rating: 4.3, activePOs: 1, totalBusiness: 1450000, contact: "Rajesh Iyer", email: "rajesh@pcbpower.com", phone: "+91-79-4000-4007", paymentTerms: "Net 30", certifications: ["ISO 9001", "UL", "IATF 16949"], onTimeDelivery: 88.0, qualityScore: 96.5, priceCompetitiveness: 95, responsiveness: 85 },
  { id: "sup-006", name: "SRM Circuits", location: "India", category: "PCB" as const, rating: 4.0, activePOs: 0, totalBusiness: 620000, contact: "Vikram Shah", email: "vikram@srmcircuits.com", phone: "+91-80-2345-6789", paymentTerms: "Net 45", certifications: ["ISO 9001", "UL"], onTimeDelivery: 85.0, qualityScore: 94.0, priceCompetitiveness: 98, responsiveness: 80 },
  { id: "sup-007", name: "Shree Electronics", location: "India", category: "Components" as const, rating: 3.8, activePOs: 0, totalBusiness: 340000, contact: "Sanjay Patel", email: "sanjay@shreeelec.com", phone: "+91-22-2567-8901", paymentTerms: "Net 60", certifications: ["ISO 9001"], onTimeDelivery: 78.0, qualityScore: 92.0, priceCompetitiveness: 97, responsiveness: 72 },
  { id: "sup-008", name: "Global Packaging Co", location: "India", category: "Packaging" as const, rating: 4.1, activePOs: 0, totalBusiness: 180000, contact: "Meena Krishnan", email: "meena@globalpack.in", phone: "+91-44-2890-1234", paymentTerms: "Net 30", certifications: ["ISO 9001", "ISO 14001"], onTimeDelivery: 92.0, qualityScore: 95.5, priceCompetitiveness: 91, responsiveness: 90 },
]

// ─── Inventory / MSL ───
export const inventoryItems = [
  { partNumber: "STM32F407VGT6", description: "MCU LQFP-100", stock: 230, reelCount: 3, location: "R4-B2", msl: 3, reorderPoint: 500 },
  { partNumber: "GRM155R71C104K", description: "100nF 0402", stock: 8200, reelCount: 2, location: "R2-A5", msl: 1, reorderPoint: 5000 },
  { partNumber: "LM358BDR", description: "Op-Amp SOIC-8", stock: 0, reelCount: 0, location: "-", msl: 2, reorderPoint: 200 },
  { partNumber: "RC0402FR-07100R", description: "100Ω 0402", stock: 850, reelCount: 1, location: "R1-C3", msl: 1, reorderPoint: 1000 },
  { partNumber: "105450-0101", description: "USB-C Molex", stock: 450, reelCount: 1, location: "R3-A1", msl: 1, reorderPoint: 200 },
]

export const mslReels = [
  { reelId: "RL-88421", partNumber: "STM32F407VGT6", msl: 3, floorLifeHours: 168, remainingHours: 3.2, status: "critical" as const },
  { reelId: "RL-88430", partNumber: "BGA-PKG-X1", msl: 4, floorLifeHours: 72, remainingHours: 1.75, status: "critical" as const },
  { reelId: "RL-88419", partNumber: "QFN-48-IC", msl: 3, floorLifeHours: 168, remainingHours: 22, status: "warning" as const },
  { reelId: "RL-88425", partNumber: "LM358BDR", msl: 2, floorLifeHours: 672, remainingHours: 432, status: "ok" as const },
  { reelId: "RL-88440", partNumber: "GRM155R71C104K", msl: 1, floorLifeHours: Infinity, remainingHours: Infinity, status: "ok" as const },
]

// ─── Work Orders ───
export const workOrders = [
  { id: "WO-2026-0341", soId: "SO-2026-089", board: "ECU-X500", customer: "Bosch", qty: 1200, line: "Line 1", progress: 71, oee: 82, status: "active" as const },
  { id: "WO-2026-0338", soId: "SO-2026-087", board: "PS-220", customer: "L&T", qty: 500, line: "THT-1", progress: 64, oee: 71, status: "active" as const },
  { id: "WO-2026-0343", soId: "SO-2026-089", board: "ECU-X500", customer: "Bosch", qty: 1200, line: "Line 2", progress: 0, oee: 0, status: "scheduled" as const },
  { id: "WO-2026-0345", soId: "SO-2026-086", board: "VFD-CTRL", customer: "ABB", qty: 2000, line: "Line 1", progress: 0, oee: 0, status: "scheduled" as const },
]

export const routeSteps = [
  { step: "Paste Print", completed: 1200, total: 1200, status: "done" as const },
  { step: "SPI", completed: 1200, total: 1200, status: "done" as const },
  { step: "Pick & Place", completed: 1200, total: 1200, status: "done" as const },
  { step: "Reflow", completed: 1200, total: 1200, status: "done" as const },
  { step: "AOI", completed: 847, total: 1200, status: "active" as const },
  { step: "ICT", completed: 0, total: 1200, status: "pending" as const },
  { step: "FCT", completed: 0, total: 1200, status: "pending" as const },
]

// ─── Quality ───
export const qualityMetrics = {
  fpy: 97.8,
  fpyTarget: 98,
  dpmo: 342,
  dpmoChange: -12,
  openNCRs: 4,
  openCAPAs: 2,
  customerComplaints: 1,
}

export const defectPareto = [
  { defect: "Solder Bridge", count: 34, percentage: 34 },
  { defect: "Missing Part", count: 22, percentage: 22 },
  { defect: "Tombstone", count: 18, percentage: 18 },
  { defect: "Wrong Polarity", count: 11, percentage: 11 },
  { defect: "Insufficient Solder", count: 8, percentage: 8 },
  { defect: "Other", count: 7, percentage: 7 },
]

// ─── Maintenance ───
export const equipment = [
  { id: "eq-001", name: "Reflow Oven 1", type: "Reflow", status: "overdue" as const, nextPM: "2026-03-25", usageHours: 1240 },
  { id: "eq-002", name: "Pick & Place 1", type: "Pick & Place", status: "due" as const, nextPM: "2026-04-01", usageHours: 890 },
  { id: "eq-003", name: "AOI-1", type: "AOI", status: "due" as const, nextPM: "2026-04-02", usageHours: 450 },
  { id: "eq-004", name: "SPI-1", type: "SPI", status: "ok" as const, nextPM: "2026-04-15", usageHours: 200 },
  { id: "eq-005", name: "ICT-1", type: "ICT", status: "ok" as const, nextPM: "2026-05-01", usageHours: 120 },
  { id: "eq-006", name: "Reflow Oven 2", type: "Reflow", status: "ok" as const, nextPM: "2026-04-20", usageHours: 980 },
]

// ─── Delivery ───
export const shipments = [
  { id: "SH-2026-022", customer: "L&T", soId: "SO-087", boards: 10000, carrier: "FedEx", tracking: "FX-123456", status: "in_transit" as const, eta: "2026-04-02" },
  { id: "SH-2026-021", customer: "Bosch", soId: "SO-089", boards: 1200, carrier: "DHL", tracking: null, status: "ready" as const, eta: null },
]

// ─── RMA ───
export const rmaList = [
  { id: "RMA-009", customer: "Bosch", board: "ECU-X500", qty: 2, issue: "No power output", status: "analysis" as const, daysOpen: 3 },
  { id: "RMA-008", customer: "L&T", board: "Relay-BR", qty: 5, issue: "Intermittent failure", status: "rework" as const, daysOpen: 7 },
  { id: "RMA-007", customer: "Continental", board: "ADAS-M1", qty: 1, issue: "Dead IC U3", status: "shipped" as const, daysOpen: 0 },
]

// ─── Finance: Customer Invoices ───
export const customerInvoices = [
  {
    invoiceNo: "INV-2026-042", customer: "Bosch India", soNo: "SO-089", amount: 850000, dueDate: "2026-03-30",
    status: "partial" as const, amountReceived: 425000, balance: 425000, agingDays: 15,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
  {
    invoiceNo: "INV-2026-041", customer: "Continental", soNo: "SO-088", amount: 720000, dueDate: "2026-03-15",
    status: "overdue" as const, amountReceived: 360000, balance: 360000, agingDays: 45,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
  {
    invoiceNo: "INV-2026-040", customer: "L&T", soNo: "SO-087", amount: 480000, dueDate: "2026-04-01",
    status: "pending" as const, amountReceived: 0, balance: 480000, agingDays: 10,
    milestones: [{ label: "Advance", percent: 50, paid: false }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
  {
    invoiceNo: "INV-2026-039", customer: "ABB", soNo: "SO-086", amount: 310000, dueDate: "2026-02-20",
    status: "overdue" as const, amountReceived: 0, balance: 310000, agingDays: 68,
    milestones: [{ label: "Advance", percent: 50, paid: false }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
  {
    invoiceNo: "INV-2026-038", customer: "Tata Elxsi", soNo: "SO-085", amount: 195000, dueDate: "2026-03-25",
    status: "paid" as const, amountReceived: 195000, balance: 0, agingDays: 20,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: true }, { label: "Pre-Delivery", percent: 20, paid: true }],
  },
  {
    invoiceNo: "INV-2026-037", customer: "Bosch India", soNo: "SO-084", amount: 620000, dueDate: "2026-03-10",
    status: "paid" as const, amountReceived: 620000, balance: 0, agingDays: 35,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: true }, { label: "Pre-Delivery", percent: 20, paid: true }],
  },
  {
    invoiceNo: "INV-2026-036", customer: "Continental", soNo: "SO-083", amount: 540000, dueDate: "2026-04-05",
    status: "pending" as const, amountReceived: 270000, balance: 270000, agingDays: 5,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
  {
    invoiceNo: "INV-2026-035", customer: "L&T", soNo: "SO-082", amount: 380000, dueDate: "2026-01-15",
    status: "overdue" as const, amountReceived: 190000, balance: 190000, agingDays: 95,
    milestones: [{ label: "Advance", percent: 50, paid: true }, { label: "Mid-Prod", percent: 30, paid: false }, { label: "Pre-Delivery", percent: 20, paid: false }],
  },
]

// ─── Finance: Vendor Bills ───
export const vendorBills = [
  {
    billNo: "BILL-2026-021", supplier: "Mouser Electronics", poNo: "PO-2026-055", amount: 385000, dueDate: "2026-03-31",
    status: "pending" as const, paymentTerms: "Net 30", amountPaid: 0, balance: 385000, agingDays: 18,
  },
  {
    billNo: "BILL-2026-020", supplier: "Digi-Key", poNo: "PO-2026-054", amount: 245000, dueDate: "2026-03-20",
    status: "overdue" as const, paymentTerms: "Net 30", amountPaid: 125000, balance: 120000, agingDays: 40,
  },
  {
    billNo: "BILL-2026-019", supplier: "Arrow Electronics", poNo: "PO-2026-053", amount: 620000, dueDate: "2026-04-05",
    status: "approved" as const, paymentTerms: "Net 60", amountPaid: 310000, balance: 310000, agingDays: 12,
  },
  {
    billNo: "BILL-2026-018", supplier: "PCB Power", poNo: "PO-2026-052", amount: 184000, dueDate: "2026-04-02",
    status: "pending" as const, paymentTerms: "Net 30", amountPaid: 0, balance: 184000, agingDays: 8,
  },
  {
    billNo: "BILL-2026-017", supplier: "Mouser Electronics", poNo: "PO-2026-051", amount: 290000, dueDate: "2026-03-05",
    status: "paid" as const, paymentTerms: "Net 30", amountPaid: 290000, balance: 0, agingDays: 55,
  },
  {
    billNo: "BILL-2026-016", supplier: "Arrow Electronics", poNo: "PO-2026-050", amount: 175000, dueDate: "2026-02-28",
    status: "overdue" as const, paymentTerms: "Net 60", amountPaid: 0, balance: 175000, agingDays: 62,
  },
]

// ─── Finance: Payroll Batches ───
export const payrollBatches = [
  {
    id: "PAY-2026-03", month: "March 2026", totalEmployees: 9, grossPay: 810000,
    totalDeductions: 125000, netPay: 685000, employerPF: 48600, employerESI: 26730,
    status: "pending_approval" as const,
    employees: [
      { name: "Sandeep Koppula", department: "Management", basic: 60000, hra: 24000, allowances: 16000, gross: 100000, pf: 7200, esi: 1750, tds: 8500, netPay: 82550 },
      { name: "Priya Sharma", department: "Operations", basic: 50000, hra: 20000, allowances: 12000, gross: 82000, pf: 6000, esi: 1435, tds: 5800, netPay: 68765 },
      { name: "Rajesh Menon", department: "Engineering", basic: 55000, hra: 22000, allowances: 15000, gross: 92000, pf: 6600, esi: 1610, tds: 7200, netPay: 76590 },
      { name: "Anita Desai", department: "Manufacturing", basic: 48000, hra: 19200, allowances: 10800, gross: 78000, pf: 5760, esi: 1365, tds: 4900, netPay: 65975 },
      { name: "Vikram Patel", department: "Supply Chain", basic: 50000, hra: 20000, allowances: 12000, gross: 82000, pf: 6000, esi: 1435, tds: 5800, netPay: 68765 },
      { name: "Deepa Nair", department: "Human Resources", basic: 45000, hra: 18000, allowances: 10000, gross: 73000, pf: 5400, esi: 1278, tds: 4200, netPay: 62122 },
      { name: "Karthik Iyer", department: "Quality", basic: 42000, hra: 16800, allowances: 9200, gross: 68000, pf: 5040, esi: 1190, tds: 3500, netPay: 58270 },
      { name: "Meera Joshi", department: "Sales", basic: 40000, hra: 16000, allowances: 9000, gross: 65000, pf: 4800, esi: 1138, tds: 3000, netPay: 56062 },
      { name: "Arjun Reddy", department: "Manufacturing", basic: 35000, hra: 14000, allowances: 8000, gross: 57000, pf: 4200, esi: 998, tds: 1800, netPay: 50002 },
    ],
  },
  {
    id: "PAY-2026-02", month: "February 2026", totalEmployees: 9, grossPay: 798000,
    totalDeductions: 126000, netPay: 672000, employerPF: 47880, employerESI: 26334,
    status: "paid" as const,
    employees: [
      { name: "Sandeep Koppula", department: "Management", basic: 60000, hra: 24000, allowances: 14000, gross: 98000, pf: 7200, esi: 1715, tds: 8500, netPay: 80585 },
      { name: "Priya Sharma", department: "Operations", basic: 50000, hra: 20000, allowances: 12000, gross: 82000, pf: 6000, esi: 1435, tds: 5800, netPay: 68765 },
      { name: "Rajesh Menon", department: "Engineering", basic: 55000, hra: 22000, allowances: 13000, gross: 90000, pf: 6600, esi: 1575, tds: 7200, netPay: 74625 },
      { name: "Anita Desai", department: "Manufacturing", basic: 48000, hra: 19200, allowances: 10800, gross: 78000, pf: 5760, esi: 1365, tds: 4900, netPay: 65975 },
      { name: "Vikram Patel", department: "Supply Chain", basic: 50000, hra: 20000, allowances: 10000, gross: 80000, pf: 6000, esi: 1400, tds: 5600, netPay: 67000 },
      { name: "Deepa Nair", department: "Human Resources", basic: 45000, hra: 18000, allowances: 10000, gross: 73000, pf: 5400, esi: 1278, tds: 4200, netPay: 62122 },
      { name: "Karthik Iyer", department: "Quality", basic: 42000, hra: 16800, allowances: 9200, gross: 68000, pf: 5040, esi: 1190, tds: 3500, netPay: 58270 },
      { name: "Meera Joshi", department: "Sales", basic: 40000, hra: 16000, allowances: 9000, gross: 65000, pf: 4800, esi: 1138, tds: 3000, netPay: 56062 },
      { name: "Arjun Reddy", department: "Manufacturing", basic: 35000, hra: 14000, allowances: 8000, gross: 57000, pf: 4200, esi: 998, tds: 1800, netPay: 50002 },
    ],
  },
  {
    id: "PAY-2026-01", month: "January 2026", totalEmployees: 9, grossPay: 790000,
    totalDeductions: 122000, netPay: 668000, employerPF: 47400, employerESI: 26070,
    status: "paid" as const,
    employees: [
      { name: "Sandeep Koppula", department: "Management", basic: 60000, hra: 24000, allowances: 13000, gross: 97000, pf: 7200, esi: 1698, tds: 8500, netPay: 79602 },
      { name: "Priya Sharma", department: "Operations", basic: 50000, hra: 20000, allowances: 11000, gross: 81000, pf: 6000, esi: 1418, tds: 5600, netPay: 67982 },
      { name: "Rajesh Menon", department: "Engineering", basic: 55000, hra: 22000, allowances: 12000, gross: 89000, pf: 6600, esi: 1558, tds: 7000, netPay: 73842 },
      { name: "Anita Desai", department: "Manufacturing", basic: 48000, hra: 19200, allowances: 10800, gross: 78000, pf: 5760, esi: 1365, tds: 4900, netPay: 65975 },
      { name: "Vikram Patel", department: "Supply Chain", basic: 50000, hra: 20000, allowances: 10000, gross: 80000, pf: 6000, esi: 1400, tds: 5600, netPay: 67000 },
      { name: "Deepa Nair", department: "Human Resources", basic: 45000, hra: 18000, allowances: 9000, gross: 72000, pf: 5400, esi: 1260, tds: 4000, netPay: 61340 },
      { name: "Karthik Iyer", department: "Quality", basic: 42000, hra: 16800, allowances: 8200, gross: 67000, pf: 5040, esi: 1173, tds: 3300, netPay: 57487 },
      { name: "Meera Joshi", department: "Sales", basic: 40000, hra: 16000, allowances: 8000, gross: 64000, pf: 4800, esi: 1120, tds: 2800, netPay: 55280 },
      { name: "Arjun Reddy", department: "Manufacturing", basic: 35000, hra: 14000, allowances: 7000, gross: 56000, pf: 4200, esi: 980, tds: 1600, netPay: 49220 },
    ],
  },
]
