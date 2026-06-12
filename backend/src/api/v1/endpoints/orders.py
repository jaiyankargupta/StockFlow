from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from src.api.deps import get_db_session
from src.schemas.order import (
    OrderCreate,
    OrderListResponse,
    OrderResponse,
    OrderStatus,
)
from src.services.order import order_service

router = APIRouter()


@router.get("", response_model=OrderListResponse, summary="List orders")
def list_orders(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=1000, description="Maximum records to return"),
    status: Optional[OrderStatus] = Query(None, description="Filter by order status"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    db: Session = Depends(get_db_session),
) -> OrderListResponse:
    orders, total = order_service.get_orders(
        db,
        skip=skip,
        limit=limit,
        status=status.value if status else None,
        customer_id=customer_id,
    )
    page = (skip // limit) + 1
    return OrderListResponse(data=orders, total=total, page=page, limit=limit)


@router.post("", response_model=OrderResponse, status_code=201, summary="Create order")
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db_session),
) -> OrderResponse:
    return order_service.create_order(db, data)


# NOTE: specific routes MUST come before /{order_id} to avoid path conflicts
@router.get("/export/csv", summary="Export orders as CSV")
def export_orders_csv(
    db: Session = Depends(get_db_session),
) -> Response:
    csv_data = order_service.export_orders_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders.csv"},
    )


@router.get("/{order_id}", response_model=OrderResponse, summary="Get order by ID")
def get_order(
    order_id: int,
    db: Session = Depends(get_db_session),
) -> OrderResponse:
    return order_service.get_order(db, order_id)
