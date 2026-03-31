import { api, setToken, clearToken, getToken } from "./api"

export type UserRole =
  | "super_admin"
  | "admin"
  | "hr_manager"
  | "finance_manager"
  | "engineering_manager"
  | "production_manager"
  | "scm_manager"
  | "sales_crm"
  | "quality_engineer"
  | "operator"
  | "customer"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  designation: string
  avatar: null
}

interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    full_name: string | null
    role: UserRole
    designation: string | null
    tenant_id: string
  }
}

const STORAGE_KEY = "pcb_erp_user"

// Hardcoded fallback users for offline/demo mode
const DEMO_USERS: { email: string; password: string; user: AuthUser }[] = [
  { email: "superadmin@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-001", name: "Sandeep K", email: "superadmin@thinksemi.com", role: "super_admin", designation: "CEO / Super Admin", avatar: null } },
  { email: "admin@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-002", name: "Rajesh Venkat", email: "admin@thinksemi.com", role: "admin", designation: "Factory Manager", avatar: null } },
  { email: "hr@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-003", name: "Lakshmi Venkat", email: "hr@thinksemi.com", role: "hr_manager", designation: "HR Manager", avatar: null } },
  { email: "finance@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-004", name: "Deepa Krishnan", email: "finance@thinksemi.com", role: "finance_manager", designation: "Finance Manager", avatar: null } },
  { email: "engineering@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-005", name: "Arun Krishnan", email: "engineering@thinksemi.com", role: "engineering_manager", designation: "Engineering Manager", avatar: null } },
  { email: "production@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-006", name: "Karthik Raja", email: "production@thinksemi.com", role: "production_manager", designation: "Production Manager", avatar: null } },
  { email: "scm@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-007", name: "Mohan Rajan", email: "scm@thinksemi.com", role: "scm_manager", designation: "Supply Chain Manager", avatar: null } },
  { email: "sales@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-008", name: "Suresh Babu", email: "sales@thinksemi.com", role: "sales_crm", designation: "Sales Manager", avatar: null } },
  { email: "quality@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-009", name: "Priya Sharma", email: "quality@thinksemi.com", role: "quality_engineer", designation: "Quality Manager", avatar: null } },
  { email: "operator@thinksemi.com", password: "ThinkSemi@ERP2026!", user: { id: "usr-010", name: "Ravi Kumar", email: "operator@thinksemi.com", role: "operator", designation: "SMT Operator", avatar: null } },
  { email: "customer@bosch.com", password: "Bosch@Portal2026!", user: { id: "usr-011", name: "Rahul Menon", email: "customer@bosch.com", role: "customer", designation: "Bosch India - Procurement", avatar: null } },
]

function mapApiUser(apiUser: LoginResponse["user"]): AuthUser {
  return {
    id: apiUser.id,
    name: apiUser.full_name || apiUser.email,
    email: apiUser.email,
    role: apiUser.role,
    designation: apiUser.designation || "",
    avatar: null,
  }
}

export async function login(email: string, password: string): Promise<AuthUser | null> {
  try {
    // Try real backend first
    const data = await api.post<LoginResponse>("/auth/login/json", { email, password })
    setToken(data.access_token)
    const user = mapApiUser(data.user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  } catch {
    // Fallback to demo users if backend is unreachable
    const match = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!match) return null
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user))
    return match.user
  }
}

export function logout(): void {
  clearToken()
  localStorage.removeItem(STORAGE_KEY)
  window.location.href = "/login"
}

export function getCurrentUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as AuthUser
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function hasToken(): boolean {
  return getToken() !== null
}
