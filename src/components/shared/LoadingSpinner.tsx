import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  variant?: "spinner" | "skeleton"
  text?: string
  className?: string
}

export function LoadingSpinner({ variant = "spinner", text, className }: LoadingSpinnerProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3 w-full", className)}>
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 gap-3", className)}>
      <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
