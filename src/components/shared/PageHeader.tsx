import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
  }
  children?: React.ReactNode
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  const ActionIcon = action?.icon ?? Plus

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button onClick={action.onClick}>
            <ActionIcon className="h-4 w-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
