import { createContext, useCallback, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: ToastMessage[]
  toast: (type: ToastType, title: string, description?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap: Record<ToastType, string> = {
  success: "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700",
  error: "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-200 dark:border-red-700",
  info: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700",
  warning: "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700",
}

const iconColorMap: Record<ToastType, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, title, description }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const Icon = iconMap[t.type]
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 shadow-lg animate-in slide-in-from-right-full duration-300",
                colorMap[t.type]
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColorMap[t.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{t.title}</p>
                {t.description && <p className="text-xs mt-0.5 opacity-80">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
