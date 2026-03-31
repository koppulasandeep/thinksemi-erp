import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div
          className={cn(
            "transition-all duration-300",
            sidebarCollapsed
              ? "ml-[var(--sidebar-collapsed-width)]"
              : "ml-[var(--sidebar-width)]"
          )}
        >
          <Header />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
