from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from src.api.deps import get_db_session
from src.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from src.services.product import product_service

router = APIRouter()


@router.get("", response_model=ProductListResponse, summary="List products")
def list_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=1000, description="Maximum records to return"),
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    db: Session = Depends(get_db_session),
) -> ProductListResponse:
    products, total = product_service.get_products(
        db, skip=skip, limit=limit, search=search
    )
    page = (skip // limit) + 1
    return ProductListResponse(data=products, total=total, page=page, limit=limit)


@router.post(
    "", response_model=ProductResponse, status_code=201, summary="Create product"
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db_session),
) -> ProductResponse:
    return product_service.create_product(db, data)


# NOTE: specific routes MUST come before /{product_id} to avoid path conflicts
@router.get(
    "/low-stock",
    response_model=List[ProductResponse],
    summary="List low-stock products",
)
def get_low_stock_products(
    threshold: int = Query(10, ge=0, description="Stock quantity threshold"),
    db: Session = Depends(get_db_session),
) -> List[ProductResponse]:
    return product_service.get_low_stock_products(db, threshold=threshold)


@router.get("/export/csv", summary="Export products as CSV")
def export_products_csv(
    db: Session = Depends(get_db_session),
) -> Response:
    csv_data = product_service.export_products_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products.csv"},
    )


@router.get(
    "/{product_id}", response_model=ProductResponse, summary="Get product by ID"
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db_session),
) -> ProductResponse:
    return product_service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse, summary="Update product")
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db_session),
) -> ProductResponse:
    return product_service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=204, summary="Delete product")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db_session),
) -> None:
    product_service.delete_product(db, product_id)
