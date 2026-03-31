"""API router registry — mounts all module routers under /api/v1."""

from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.hr import router as hr_router
from app.api.crm import router as crm_router
from app.api.npi import router as npi_router
from app.api.eco import router as eco_router
from app.api.supply_chain import router as supply_chain_router
from app.api.inventory import router as inventory_router
from app.api.manufacturing import router as manufacturing_router
from app.api.quality import router as quality_router
from app.api.traceability import router as traceability_router
from app.api.maintenance import router as maintenance_router
from app.api.delivery import router as delivery_router
from app.api.rma import router as rma_router
from app.api.finance import router as finance_router
from app.api.portal import router as portal_router
from app.api.settings_routes import router as settings_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router, prefix="/auth")
api_router.include_router(dashboard_router, prefix="/dashboard")
api_router.include_router(hr_router, prefix="/hr")
api_router.include_router(crm_router, prefix="/crm")
api_router.include_router(npi_router, prefix="/npi")
api_router.include_router(eco_router, prefix="/eco")
api_router.include_router(supply_chain_router, prefix="/supply-chain")
api_router.include_router(inventory_router, prefix="/inventory")
api_router.include_router(manufacturing_router, prefix="/manufacturing")
api_router.include_router(quality_router, prefix="/quality")
api_router.include_router(traceability_router, prefix="/traceability")
api_router.include_router(maintenance_router, prefix="/maintenance")
api_router.include_router(delivery_router, prefix="/delivery")
api_router.include_router(rma_router, prefix="/rma")
api_router.include_router(finance_router, prefix="/finance")
api_router.include_router(portal_router, prefix="/portal")
api_router.include_router(settings_router, prefix="/settings")
