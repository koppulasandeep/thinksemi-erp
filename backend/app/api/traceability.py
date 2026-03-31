"""Traceability API — forward and reverse trace for boards and components."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_tenant_id
from app.core.exceptions import BadRequestError
from app.core.tenant import TenantQuery
from app.models.user import User
from app.models.traceability import BoardTrace, ComponentTrace
from app.models.manufacturing import WorkOrder

router = APIRouter(tags=["traceability"])


@router.get("/search")
def trace_search(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    tenant_id: Annotated[uuid.UUID, Depends(get_tenant_id)],
    q: str = Query(..., min_length=1, description="Board serial, reel ID, or work order number"),
):
    """
    Universal trace search. Returns:
    - For a board serial: process timeline + component list (forward trace)
    - For a reel ID: list of boards that used this reel (reverse trace)
    - For a WO number: all boards and steps in that work order
    """
    results: dict = {"query": q, "type": None, "data": {}}

    # Try board serial (forward trace)
    board_steps = TenantQuery(db, BoardTrace, tenant_id).filter(
        BoardTrace.board_serial == q,
    ).all(order_by=BoardTrace.sequence_order)

    if board_steps:
        results["type"] = "forward_trace"
        components = TenantQuery(db, ComponentTrace, tenant_id).filter(
            ComponentTrace.board_serial == q,
        ).all(order_by=ComponentTrace.placed_at)
        results["data"] = {
            "board_serial": q,
            "process_timeline": [
                {
                    "step_name": s.step_name,
                    "machine_id": s.machine_id,
                    "operator_name": s.operator_name,
                    "result": s.result,
                    "wo_ref_number": s.wo_ref_number,
                    "timestamp": s.created_at.isoformat() if s.created_at else None,
                }
                for s in board_steps
            ],
            "components": [
                {
                    "reel_id": c.reel_id,
                    "part_number": c.part_number,
                    "ref_designator": c.ref_designator,
                    "placed_at": c.placed_at.isoformat() if c.placed_at else None,
                }
                for c in components
            ],
        }
        return results

    # Try reel ID (reverse trace)
    reel_traces = TenantQuery(db, ComponentTrace, tenant_id).filter(
        ComponentTrace.reel_id == q,
    ).all(order_by=ComponentTrace.placed_at)

    if reel_traces:
        results["type"] = "reverse_trace"
        board_serials = list({ct.board_serial for ct in reel_traces})
        results["data"] = {
            "reel_id": q,
            "part_number": reel_traces[0].part_number if reel_traces else None,
            "boards_used": [
                {
                    "board_serial": ct.board_serial,
                    "ref_designator": ct.ref_designator,
                    "work_order_id": str(ct.work_order_id) if ct.work_order_id else None,
                    "placed_at": ct.placed_at.isoformat() if ct.placed_at else None,
                }
                for ct in reel_traces
            ],
            "total_boards_affected": len(board_serials),
        }
        return results

    # Try work order number
    wo = (
        db.query(WorkOrder)
        .filter(WorkOrder.tenant_id == tenant_id, WorkOrder.ref_number == q)
        .first()
    )
    if wo:
        wo_boards = TenantQuery(db, BoardTrace, tenant_id).filter(
            BoardTrace.work_order_id == wo.id,
        ).all(order_by=BoardTrace.board_serial)

        board_serials = sorted({bt.board_serial for bt in wo_boards})
        results["type"] = "work_order_trace"
        results["data"] = {
            "work_order": {
                "id": str(wo.id),
                "ref_number": wo.ref_number,
                "board_name": wo.board_name,
                "customer_name": wo.customer_name,
                "quantity": wo.quantity,
                "status": wo.status,
            },
            "boards": board_serials,
            "total_boards_traced": len(board_serials),
        }
        return results

    # Nothing found
    results["type"] = "not_found"
    results["data"] = {"message": f"No traceability records found for '{q}'"}
    return results
