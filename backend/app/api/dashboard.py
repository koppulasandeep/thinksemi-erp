"""Dashboard API — aggregated KPIs, alerts, and production line status."""

import uuid
from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.finance import Invoice
from app.models.sales_order import SalesOrder
from app.models.manufacturing import ProductionLine, WorkOrder
from app.models.quality import NCR
from app.models.equipment import Equipment, MaintenanceSchedule
from app.models.inventory import MSLReel
from app.models.eco import ECO
from app.models.purchase_order import PurchaseOrder
from app.models.shipment import Shipment

router = APIRouter(tags=["dashboard"])


@router.get("/kpis")
def get_kpis(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return aggregated KPIs for the dashboard."""
    today = date.today()
    month_start = today.replace(day=1)

    # Revenue: sum of paid invoices this month
    revenue = (
        db.query(func.coalesce(func.sum(Invoice.amount_paid), 0))
        .filter(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "paid",
            Invoice.paid_date >= month_start,
            Invoice.paid_date <= today,
        )
        .scalar()
    )

    # Active orders count
    active_orders = (
        db.query(func.count(SalesOrder.id))
        .filter(
            SalesOrder.tenant_id == tenant_id,
            SalesOrder.status.in_(["confirmed", "material_pending", "production"]),
        )
        .scalar()
    )

    # On-time delivery %
    delivered_this_month = (
        db.query(Shipment)
        .filter(
            Shipment.tenant_id == tenant_id,
            Shipment.status == "delivered",
            Shipment.delivered_date >= month_start,
        )
        .all()
    )
    total_delivered = len(delivered_this_month)
    on_time_count = sum(
        1 for s in delivered_this_month
        if s.eta_date and s.delivered_date and s.delivered_date <= s.eta_date
    )
    on_time_delivery = round((on_time_count / total_delivered * 100), 1) if total_delivered else 100.0

    # OEE: average across production lines
    oee_avg = (
        db.query(func.coalesce(func.avg(ProductionLine.oee), 0))
        .filter(ProductionLine.tenant_id == tenant_id)
        .scalar()
    )

    # FPY (First Pass Yield): boards that passed without NCR / total boards produced
    completed_wo = TenantQuery(db, WorkOrder, tenant_id).filter(
        WorkOrder.status == "completed",
        WorkOrder.completed_at >= datetime.combine(month_start, datetime.min.time()),
    ).all()
    total_produced = sum(wo.quantity for wo in completed_wo) if completed_wo else 0
    ncr_qty = (
        db.query(func.coalesce(func.sum(NCR.quantity_affected), 0))
        .filter(
            NCR.tenant_id == tenant_id,
            NCR.created_at >= datetime.combine(month_start, datetime.min.time()),
        )
        .scalar()
    )
    fpy = round(((total_produced - ncr_qty) / total_produced * 100), 1) if total_produced else 100.0

    # DPMO: defects per million opportunities (simplified)
    dpmo = round((ncr_qty / max(total_produced, 1)) * 1_000_000, 0)

    return {
        "revenue": float(revenue),
        "active_orders": active_orders,
        "on_time_delivery": on_time_delivery,
        "oee": round(float(oee_avg), 1),
        "fpy": fpy,
        "dpmo": int(dpmo),
        "month": today.strftime("%Y-%m"),
    }


@router.get("/alerts")
def get_alerts(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return active alerts: overdue maintenance, MSL expiring, quality escapes, PO delays, ECO pending."""
    today = date.today()
    alerts = []

    # Overdue maintenance
    overdue_maint = TenantQuery(db, MaintenanceSchedule, tenant_id).filter(
        MaintenanceSchedule.status.in_(["scheduled", "overdue"]),
        MaintenanceSchedule.scheduled_date < today,
    ).all()
    for ms in overdue_maint:
        alerts.append({
            "type": "maintenance_overdue",
            "severity": "high",
            "message": f"Maintenance overdue for equipment (schedule {ms.id})",
            "entity_id": str(ms.id),
            "date": str(ms.scheduled_date),
        })

    # MSL expiring (warning or critical)
    msl_alerts = TenantQuery(db, MSLReel, tenant_id).filter(
        MSLReel.status.in_(["warning", "critical"]),
    ).all()
    for reel in msl_alerts:
        alerts.append({
            "type": "msl_expiring",
            "severity": "critical" if reel.status == "critical" else "warning",
            "message": f"Reel {reel.reel_id} ({reel.part_number}) — {reel.remaining_hours}h remaining",
            "entity_id": reel.reel_id,
            "remaining_hours": float(reel.remaining_hours),
        })

    # Quality escapes: open NCRs with critical severity
    quality_escapes = TenantQuery(db, NCR, tenant_id).filter(
        NCR.status.in_(["open", "investigating"]),
        NCR.severity == "critical",
    ).all()
    for ncr in quality_escapes:
        alerts.append({
            "type": "quality_escape",
            "severity": "critical",
            "message": f"Critical NCR: {ncr.title} ({ncr.ref_number})",
            "entity_id": str(ncr.id),
        })

    # PO delays
    delayed_pos = TenantQuery(db, PurchaseOrder, tenant_id).filter(
        PurchaseOrder.status.in_(["sent", "confirmed"]),
        PurchaseOrder.eta_date < today,
    ).all()
    for po in delayed_pos:
        alerts.append({
            "type": "po_delayed",
            "severity": "warning",
            "message": f"PO {po.ref_number} from {po.supplier_name} is past ETA ({po.eta_date})",
            "entity_id": str(po.id),
        })

    # ECO pending review
    pending_ecos = TenantQuery(db, ECO, tenant_id).filter(
        ECO.status == "pending_review",
    ).all()
    for eco in pending_ecos:
        alerts.append({
            "type": "eco_pending",
            "severity": "medium",
            "message": f"ECO pending review: {eco.title} ({eco.ref_number})",
            "entity_id": str(eco.id),
        })

    return {"alerts": alerts, "total": len(alerts)}


@router.get("/production-lines")
def get_production_lines(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
):
    """Return all production lines with current status."""
    lines = TenantQuery(db, ProductionLine, tenant_id).all(
        order_by=ProductionLine.name
    )
    result = []
    for line in lines:
        current_wo = None
        if line.current_wo_id:
            wo = db.query(WorkOrder).filter(WorkOrder.id == line.current_wo_id).first()
            if wo:
                current_wo = {
                    "id": str(wo.id),
                    "ref_number": wo.ref_number,
                    "board_name": wo.board_name,
                    "customer_name": wo.customer_name,
                    "progress": wo.progress,
                }
        result.append({
            "id": str(line.id),
            "name": line.name,
            "line_type": line.line_type,
            "status": line.status,
            "oee": float(line.oee),
            "oee_target": float(line.oee_target),
            "current_work_order": current_wo,
        })
    return {"lines": result}
