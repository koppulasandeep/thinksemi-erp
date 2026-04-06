import { useState } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"

interface MobileMenuProps {
  children: React.ReactNode
}

export function MobileMenu({ children }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl md:hidden",
            "animate-in slide-in-from-left duration-200"
          )}>
            <div className="flex items-center justify-end p-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto h-[calc(100%-64px)]">{children}</div>
          </div>
        </>
      )}
    </>
  )
}
