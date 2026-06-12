from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from src.api.deps import get_db_session
from src.schemas.customer import (
    CustomerCreate,
    CustomerListResponse,
    CustomerResponse,
    CustomerUpdate,
)
from src.services.customer import customer_service

router = APIRouter()


@router.get("", response_model=CustomerListResponse, summary="List customers")
def list_customers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=1000, description="Maximum records to return"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db_session),
) -> CustomerListResponse:
    customers, total = customer_service.get_customers(
        db, skip=skip, limit=limit, search=search
    )
    page = (skip // limit) + 1
    return CustomerListResponse(data=customers, total=total, page=page, limit=limit)


@router.post(
    "", response_model=CustomerResponse, status_code=201, summary="Create customer"
)
def create_customer(
    data: CustomerCreate,
    db: Session = Depends(get_db_session),
) -> CustomerResponse:
    return customer_service.create_customer(db, data)


# NOTE: specific routes MUST come before /{customer_id} to avoid path conflicts
@router.get("/export/csv", summary="Export customers as CSV")
def export_customers_csv(
    db: Session = Depends(get_db_session),
) -> Response:
    csv_data = customer_service.export_customers_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers.csv"},
    )


@router.get(
    "/{customer_id}", response_model=CustomerResponse, summary="Get customer by ID"
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db_session),
) -> CustomerResponse:
    return customer_service.get_customer(db, customer_id)


@router.put(
    "/{customer_id}", response_model=CustomerResponse, summary="Update customer"
)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db_session),
) -> CustomerResponse:
    return customer_service.update_customer(db, customer_id, data)


@router.delete("/{customer_id}", status_code=204, summary="Delete customer")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db_session),
) -> None:
    customer_service.delete_customer(db, customer_id)
