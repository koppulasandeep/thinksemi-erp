import type { UserRole } from "./auth"

/**
 * Module access permissions per role.
 * Each role maps to an array of sidebar route prefixes they can access.
 * "/*" means full access.
 */
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ["/*"],
  admin: ["/*"],
  hr_manager: ["/", "/hr", "/settings"],
  finance_manager: ["/", "/finance", "/hr", "/supply-chain", "/settings"],
  engineering_manager: ["/", "/npi", "/eco", "/supply-chain", "/manufacturing", "/quality", "/traceability"],
  production_manager: ["/", "/manufacturing", "/quality", "/maintenance", "/msl", "/inventory", "/traceability", "/delivery"],
  scm_manager: ["/", "/supply-chain", "/inventory", "/msl", "/delivery"],
  sales_crm: ["/", "/crm", "/supply-chain"],
  quality_engineer: ["/", "/quality", "/traceability", "/manufacturing", "/rma"],
  operator: ["/", "/manufacturing", "/quality", "/hr"],
  customer: ["/portal"],
}

/**
 * Check if a role can access a given route path.
 */
export function canAccess(role: UserRole | undefined, path: string): boolean {
  if (!role) return false
  const allowed = rolePermissions[role]
  if (!allowed) return false
  if (allowed.includes("/*")) return true
  // Check if path starts with any allowed prefix
  return allowed.some((prefix) => {
    if (prefix === "/") return path === "/"
    return path === prefix || path.startsWith(prefix + "/")
  })
}

/**
 * Get the default landing page for a role.
 */
export function getDefaultRoute(role: UserRole): string {
  if (role === "customer") return "/portal"
  return "/"
}

/**
 * Human-readable role labels.
 */
export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hr_manager: "HR Manager",
  finance_manager: "Finance Manager",
  engineering_manager: "Engineering Manager",
  production_manager: "Production Manager",
  scm_manager: "Supply Chain Manager",
  sales_crm: "Sales / CRM",
  quality_engineer: "Quality Engineer",
  operator: "Floor Operator",
  customer: "Customer",
}
