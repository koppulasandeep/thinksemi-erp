import { Navigate, Outlet, useLocation } from "react-router-dom"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { canAccess, getDefaultRoute } from "@/lib/permissions"

export function AuthGuard() {
  const location = useLocation()
  const user = getCurrentUser()

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" replace />
  }

  // Redirect customers to portal
  if (user.role === "customer" && !location.pathname.startsWith("/portal")) {
    return <Navigate to="/portal" replace />
  }

  // Block access to unauthorized routes
  if (!canAccess(user.role, location.pathname)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <Outlet />
}
