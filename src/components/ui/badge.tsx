import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground",
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
        engineering: "border-transparent bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
        production: "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
        quality: "border-transparent bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400",
        supply: "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
        hr: "border-transparent bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
        sales: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        finance: "border-transparent bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
