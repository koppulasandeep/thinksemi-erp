import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "@/components/shared/Toast"
import { MobileMenu } from "@/components/shared/MobileMenu"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background">
          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Mobile menu */}
          <MobileMenu>
            <Sidebar collapsed={false} onToggle={() => {}} />
          </MobileMenu>

          <div
            className={cn(
              "transition-all duration-300",
              "md:ml-[var(--sidebar-width)]",
              sidebarCollapsed && "md:ml-[var(--sidebar-collapsed-width)]"
            )}
          >
            <Header />
            <main className="p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </ToastProvider>
    </TooltipProvider>
  )
}
