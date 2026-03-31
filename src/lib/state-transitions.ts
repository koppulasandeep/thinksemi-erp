/**
 * State transition definitions for all modules.
 * Each module defines its valid statuses and allowed transitions.
 * This ensures data integrity — a status can only move to its allowed next states.
 */

// ─── CRM Pipeline ───
export const crmTransitions: Record<string, string[]> = {
  "New Lead":    ["Qualified", "Lost"],
  "Qualified":   ["Quoted", "Lost"],
  "Quoted":      ["Negotiation", "Lost"],
  "Negotiation": ["Won", "Lost", "Quoted"], // can go back to re-quote
  "Won":         [], // terminal
  "Lost":        ["New Lead"], // can reopen
}

// ─── NPI Pipeline ───
export const npiTransitions: Record<string, string[]> = {
  "Incoming":        ["DFM Review", "On Hold"],
  "DFM Review":      ["Prototype Build", "Incoming", "On Hold"], // can send back
  "Prototype Build": ["Validation", "DFM Review", "On Hold"],    // can fail back to DFM
  "Validation":      ["Done", "Prototype Build", "On Hold"],     // can fail back to prototype
  "Done":            [],  // terminal — released to production
  "On Hold":         ["Incoming", "DFM Review", "Prototype Build", "Validation"], // can resume
}

// ─── ECO ───
export const ecoTransitions: Record<string, string[]> = {
  "draft":           ["pending"],           // submit for approval
  "pending":         ["approved", "rejected"], // CCB decides
  "approved":        ["in_progress"],       // start implementation
  "rejected":        ["draft"],             // revise and resubmit
  "in_progress":     ["completed"],         // implementation done
  "completed":       [],                    // terminal
}

// ─── Sales Order ───
export const salesOrderTransitions: Record<string, string[]> = {
  "draft":             ["confirmed"],
  "confirmed":         ["material_pending", "production", "on_hold", "cancelled"],
  "material_pending":  ["production", "on_hold"],
  "production":        ["ready_to_ship", "on_hold"],
  "on_hold":           ["confirmed", "production", "material_pending", "cancelled"],
  "ready_to_ship":     ["shipped"],
  "shipped":           ["delivered"],
  "delivered":         ["invoiced"],
  "invoiced":          ["closed"],
  "closed":            [],  // terminal
  "cancelled":         [],  // terminal
}

// ─── Purchase Order ───
export const purchaseOrderTransitions: Record<string, string[]> = {
  "draft":               ["sent"],
  "sent":                ["confirmed", "cancelled"],
  "confirmed":           ["partially_received", "received", "delayed"],
  "delayed":             ["partially_received", "received", "cancelled"],
  "partially_received":  ["received"],
  "received":            ["closed"],
  "closed":              [],
  "cancelled":           [],
}

// ─── Work Order ───
export const workOrderTransitions: Record<string, string[]> = {
  "scheduled":     ["active", "on_hold"],
  "active":        ["completed", "on_hold"],
  "on_hold":       ["active", "scheduled", "cancelled"],
  "completed":     [],   // terminal
  "cancelled":     [],   // terminal
}

// ─── Quality NCR ───
export const ncrTransitions: Record<string, string[]> = {
  "open":           ["investigation"],
  "investigation":  ["root_cause_identified"],
  "root_cause_identified": ["corrective_action"],
  "corrective_action":     ["verification"],
  "verification":          ["closed", "corrective_action"],  // can fail verification
  "closed":                [],  // terminal
}

// ─── CAPA ───
export const capaTransitions: Record<string, string[]> = {
  "open":            ["analysis"],
  "analysis":        ["action_plan"],
  "action_plan":     ["implementation"],
  "implementation":  ["verification"],
  "verification":    ["effective", "implementation"],  // can fail
  "effective":       ["closed"],
  "closed":          [],
}

// ─── RMA ───
export const rmaTransitions: Record<string, string[]> = {
  "received":  ["analysis"],
  "analysis":  ["rework", "replace", "credit", "rejected"],
  "rework":    ["testing"],
  "replace":   ["shipped"],
  "credit":    ["closed"],
  "rejected":  ["shipped"],  // ship back to customer
  "testing":   ["shipped", "rework"],  // can fail testing
  "shipped":   ["closed"],
  "closed":    [],
}

// ─── Leave Request ───
export const leaveTransitions: Record<string, string[]> = {
  "draft":     ["pending"],
  "pending":   ["approved", "rejected"],
  "approved":  ["cancelled"],  // employee can cancel approved leave
  "rejected":  ["draft"],      // can resubmit
  "cancelled": [],
}

// ─── Maintenance ───
export const maintenanceTransitions: Record<string, string[]> = {
  "scheduled":   ["in_progress", "overdue"],
  "overdue":     ["in_progress"],
  "in_progress": ["completed"],
  "completed":   [],  // terminal — next PM auto-scheduled
}

// ─── Shipment / Delivery ───
export const shipmentTransitions: Record<string, string[]> = {
  "packing":    ["ready"],
  "ready":      ["in_transit"],
  "in_transit": ["delivered", "returned"],
  "delivered":  [],
  "returned":   ["packing"],  // re-ship
}

// ─── Invoice ───
export const invoiceTransitions: Record<string, string[]> = {
  "draft":          ["sent"],
  "sent":           ["partially_paid", "cancelled"],
  "partially_paid": ["paid", "cancelled"],
  "paid":           [],  // terminal
  "cancelled":      [],  // terminal
}

// ─── Vendor Bill ───
export const vendorBillTransitions: Record<string, string[]> = {
  "received":  ["approved"],
  "approved":  ["scheduled", "paid"],
  "scheduled": ["paid"],
  "paid":      [],  // terminal
}

// ─── Payroll Approval ───
export const payrollApprovalTransitions: Record<string, string[]> = {
  "submitted":         ["under_review"],
  "under_review":      ["approved", "rejected"],
  "approved":          ["payment_initiated"],
  "payment_initiated": ["paid"],
  "paid":              [],  // terminal
  "rejected":          ["submitted"],  // can resubmit
}

// ─── Helper: check if transition is valid ───
export function isValidTransition(
  transitions: Record<string, string[]>,
  currentStatus: string,
  nextStatus: string
): boolean {
  const allowed = transitions[currentStatus]
  if (!allowed) return false
  return allowed.includes(nextStatus)
}

// ─── Helper: get allowed next statuses ───
export function getNextStatuses(
  transitions: Record<string, string[]>,
  currentStatus: string
): string[] {
  return transitions[currentStatus] ?? []
}
