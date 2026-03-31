import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react"
import { login } from "@/lib/auth"

const FEATURES = [
  "Sales & CRM Pipeline",
  "Supply Chain Management",
  "BOM & Inventory Control",
  "Manufacturing Execution",
  "Quality & IPC Compliance",
  "NPI Tracking",
  "Engineering Change Orders",
  "MSL Moisture Management",
  "Traceability & Lot Control",
  "Maintenance (TPM)",
  "Shipping & Delivery",
  "RMA & Returns",
  "HR & Payroll",
  "Customer Portal",
  "Analytics & Reporting",
]

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate a brief delay for UX
    setTimeout(() => {
      const user = login(email, password)
      if (user) {
        navigate("/", { replace: true })
      } else {
        setError("Invalid credentials")
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-10 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-0 w-96 h-96 rounded-full bg-cyan-400/8 blur-3xl" />
        </div>

        {/* Logo - prominent on white card */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-4 rounded-xl bg-white px-6 py-4 shadow-lg shadow-black/20">
            <img
              src="/thinksemi-logo.png"
              alt="Thinksemi Infotech"
              className="h-12 object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
          <p className="text-cyan-300 text-lg mt-4 font-light">PCB Assembly Management System</p>
        </div>

        {/* Features list */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <h2 className="text-lg font-semibold mb-4 text-cyan-200">
            16 Integrated Modules
          </h2>
          <div className="grid grid-cols-1 gap-1.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-300/90">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Thinksemi Infotech Ltd. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src="/thinksemi-logo.png"
              alt="Thinksemi"
              className="h-8 w-8 rounded-lg object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
            <span className="text-xl font-bold text-slate-700 dark:text-slate-500">
              Thinksemi
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome Back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 mb-8">
            Sign in to your ERP account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@thinksemi.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-10 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-cyan-500"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                Remember me
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 text-sm transition-colors shadow-sm shadow-cyan-200 dark:shadow-slate-950/30"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400 text-center">
              Protected system. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
