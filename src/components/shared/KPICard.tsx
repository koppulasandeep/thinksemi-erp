import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  change?: number
  changePeriod?: string
  icon?: LucideIcon
  iconColor?: string
  color?: string
  className?: string
}

const colorMap: Record<string, { border: string; iconBg: string; iconText: string }> = {
  green: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    border: "border-l-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconText: "text-violet-600 dark:text-violet-400",
  },
  orange: {
    border: "border-l-orange-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconText: "text-orange-600 dark:text-orange-400",
  },
  teal: {
    border: "border-l-teal-500",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconText: "text-teal-600 dark:text-teal-400",
  },
  pink: {
    border: "border-l-pink-500",
    iconBg: "bg-pink-100 dark:bg-pink-900/40",
    iconText: "text-pink-600 dark:text-pink-400",
  },
}

export function KPICard({
  title,
  value,
  subtitle,
  change,
  changePeriod,
  icon: Icon,
  iconColor = "text-primary",
  color,
  className,
}: KPICardProps) {
  const palette = color ? colorMap[color] : null

  return (
    <Card
      className={cn(
        "p-4 border-l-4 transition-shadow hover:shadow-md",
        palette ? palette.border : "border-l-primary",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={change >= 0 ? "text-emerald-600 font-semibold dark:text-emerald-400" : "text-red-600 font-semibold dark:text-red-400"}>
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              {changePeriod && (
                <span className="text-muted-foreground">{changePeriod}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "rounded-lg p-2.5",
            palette ? `${palette.iconBg} ${palette.iconText}` : `bg-primary/10 ${iconColor}`
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  )
}
