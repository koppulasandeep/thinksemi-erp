"""Model registry — import all models so Alembic can discover them."""

from app.models.tenant import Tenant
from app.models.user import User
from app.models.activity import Activity
from app.models.employee import Employee, Attendance, LeaveBalance, LeaveRequest
from app.models.payroll import PayrollBatch, PayrollEmployee
from app.models.crm import CRMLead, CRMContact, CRMActivity, Quotation
from app.models.sales_order import SalesOrder, SOLineItem, SOPaymentMilestone, DeliverySchedule
from app.models.bom import BOMItem, BOMRevision, BOMAlternate
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.supplier import Supplier
from app.models.inventory import InventoryItem, MSLReel
from app.models.manufacturing import ProductionLine, WorkOrder, RouteStep
from app.models.npi import NPIProject
from app.models.eco import ECO
from app.models.quality import NCR, CAPA
from app.models.equipment import Equipment, MaintenanceSchedule
from app.models.shipment import Shipment
from app.models.rma import RMA
from app.models.finance import Invoice, VendorBill
from app.models.settings_model import SystemSetting, PayrollConfig
from app.models.traceability import BoardTrace, ComponentTrace
from app.models.item_master import ItemGroup, ItemMaster, SupplierGroup
from app.models.salary import SalaryStructure, TaxDeclaration
from app.models.holiday import Holiday, LeaveType, LeavePolicy

__all__ = [
    "Tenant",
    "User",
    "Activity",
    "Employee",
    "Attendance",
    "LeaveBalance",
    "LeaveRequest",
    "PayrollBatch",
    "PayrollEmployee",
    "CRMLead",
    "CRMContact",
    "CRMActivity",
    "Quotation",
    "SalesOrder",
    "SOLineItem",
    "SOPaymentMilestone",
    "DeliverySchedule",
    "BOMItem",
    "BOMRevision",
    "BOMAlternate",
    "PurchaseOrder",
    "POLineItem",
    "Supplier",
    "InventoryItem",
    "MSLReel",
    "ProductionLine",
    "WorkOrder",
    "RouteStep",
    "NPIProject",
    "ECO",
    "NCR",
    "CAPA",
    "Equipment",
    "MaintenanceSchedule",
    "Shipment",
    "RMA",
    "Invoice",
    "VendorBill",
    "SystemSetting",
    "PayrollConfig",
    "BoardTrace",
    "ComponentTrace",
    "ItemGroup",
    "ItemMaster",
    "SupplierGroup",
    "SalaryStructure",
    "TaxDeclaration",
    "Holiday",
    "LeaveType",
    "LeavePolicy",
]
