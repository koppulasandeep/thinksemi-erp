import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { LoginPage } from "@/pages/auth/LoginPage"
import { Dashboard } from "@/pages/Dashboard"
import { HRDashboard } from "@/pages/hr/HRDashboard"
import { Attendance } from "@/pages/hr/Attendance"
import { LeaveManagement } from "@/pages/hr/LeaveManagement"
import { Payroll } from "@/pages/hr/Payroll"
import { Performance } from "@/pages/hr/Performance"
import { Compliance } from "@/pages/hr/Compliance"
import { CRMDashboard } from "@/pages/crm/CRMDashboard"
import { Pipeline } from "@/pages/crm/Pipeline"
import { Quotations } from "@/pages/crm/Quotations"
import { Contacts } from "@/pages/crm/Contacts"
import { Activities } from "@/pages/crm/Activities"
import { Analytics } from "@/pages/crm/Analytics"
import { NPIPipeline } from "@/pages/npi/NPIPipeline"
import { NPIDetail } from "@/pages/npi/NPIDetail"
import { ECOList } from "@/pages/eco/ECOList"
import { ECODetail } from "@/pages/eco/ECODetail"
import { SupplyChainDashboard } from "@/pages/supply-chain/SupplyChainDashboard"
import { SalesOrders } from "@/pages/supply-chain/SalesOrders"
import { BOMManager } from "@/pages/supply-chain/BOMManager"
import { PurchaseOrders } from "@/pages/supply-chain/PurchaseOrders"
import { Suppliers } from "@/pages/supply-chain/Suppliers"
import { InventoryDashboard } from "@/pages/inventory/InventoryDashboard"
import { MSLDashboard } from "@/pages/msl/MSLDashboard"
import { ManufacturingDashboard } from "@/pages/manufacturing/ManufacturingDashboard"
import { WorkOrderDetail } from "@/pages/manufacturing/WorkOrderDetail"
import { QualityDashboard } from "@/pages/quality/QualityDashboard"
import { NCRList } from "@/pages/quality/NCRList"
import { TraceSearch } from "@/pages/traceability/TraceSearch"
import { MaintenanceDashboard } from "@/pages/maintenance/MaintenanceDashboard"
import { DeliveryDashboard } from "@/pages/delivery/DeliveryDashboard"
import { RMADashboard } from "@/pages/rma/RMADashboard"
import { CustomerPortal } from "@/pages/portal/CustomerPortal"
import { FinanceDashboard } from "@/pages/finance/FinanceDashboard"
import { SettingsPage } from "@/pages/settings/SettingsPage"
import { PayrollConfig } from "@/pages/settings/PayrollConfig"
import { UserManual } from "@/pages/UserManual"
import { ItemMaster } from "@/pages/inventory/ItemMaster"
import { SalaryStructure } from "@/pages/hr/SalaryStructure"
import { TaxDeclarations } from "@/pages/hr/TaxDeclarations"
import { Holidays } from "@/pages/hr/Holidays"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
        <Route element={<AppLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* HR */}
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/hr/attendance" element={<Attendance />} />
          <Route path="/hr/leave" element={<LeaveManagement />} />
          <Route path="/hr/payroll" element={<Payroll />} />
          <Route path="/hr/performance" element={<Performance />} />
          <Route path="/hr/compliance" element={<Compliance />} />
          <Route path="/hr/salary" element={<SalaryStructure />} />
          <Route path="/hr/tax-declarations" element={<TaxDeclarations />} />
          <Route path="/hr/holidays" element={<Holidays />} />

          {/* Finance */}
          <Route path="/finance" element={<FinanceDashboard />} />

          {/* CRM */}
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/pipeline" element={<Pipeline />} />
          <Route path="/crm/quotations" element={<Quotations />} />
          <Route path="/crm/contacts" element={<Contacts />} />
          <Route path="/crm/activities" element={<Activities />} />
          <Route path="/crm/analytics" element={<Analytics />} />

          {/* NPI */}
          <Route path="/npi" element={<NPIPipeline />} />
          <Route path="/npi/:id" element={<NPIDetail />} />

          {/* ECO */}
          <Route path="/eco" element={<ECOList />} />
          <Route path="/eco/:id" element={<ECODetail />} />

          {/* Supply Chain */}
          <Route path="/supply-chain" element={<SupplyChainDashboard />} />
          <Route path="/supply-chain/sales-orders" element={<SalesOrders />} />
          <Route path="/supply-chain/bom" element={<BOMManager />} />
          <Route path="/supply-chain/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/supply-chain/suppliers" element={<Suppliers />} />

          {/* Inventory & MSL */}
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/inventory/item-master" element={<ItemMaster />} />
          <Route path="/msl" element={<MSLDashboard />} />

          {/* Manufacturing */}
          <Route path="/manufacturing" element={<ManufacturingDashboard />} />
          <Route path="/manufacturing/:id" element={<WorkOrderDetail />} />

          {/* Quality */}
          <Route path="/quality" element={<QualityDashboard />} />
          <Route path="/quality/ncr" element={<NCRList />} />

          {/* Traceability */}
          <Route path="/traceability" element={<TraceSearch />} />

          {/* Maintenance */}
          <Route path="/maintenance" element={<MaintenanceDashboard />} />

          {/* Delivery */}
          <Route path="/delivery" element={<DeliveryDashboard />} />

          {/* RMA */}
          <Route path="/rma" element={<RMADashboard />} />

          {/* Customer Portal */}
          <Route path="/portal" element={<CustomerPortal />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/payroll-config" element={<PayrollConfig />} />
        </Route>
        </Route>

        {/* Manual - requires login but no layout */}
        <Route element={<AuthGuard />}>
          <Route path="/manual" element={<UserManual />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
