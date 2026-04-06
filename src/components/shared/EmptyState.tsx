import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Inbox } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no items to display",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
