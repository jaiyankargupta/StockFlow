import csv
import io
from typing import List, Optional, Tuple

from fastapi import HTTPException
from fastapi import status as http_status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from src.models.product import Product
from src.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def get_products(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> Tuple[List[Product], int]:
        query = select(Product)
        count_query = select(func.count(Product.id))

        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total = db.execute(count_query).scalar_one()
        products = db.execute(query.offset(skip).limit(limit)).scalars().all()
        return list(products), total

    def get_product(self, db: Session, product_id: int) -> Product:
        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found",
            )
        return product

    def create_product(self, db: Session, data: ProductCreate) -> Product:
        existing = db.execute(
            select(Product).where(Product.sku == data.sku)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{data.sku}' already exists",
            )

        product = Product(**data.model_dump())
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    def update_product(
        self, db: Session, product_id: int, data: ProductUpdate
    ) -> Product:
        product = self.get_product(db, product_id)
        update_data = data.model_dump(exclude_unset=True)

        if "sku" in update_data and update_data["sku"] != product.sku:
            conflict = db.execute(
                select(Product).where(Product.sku == update_data["sku"])
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=http_status.HTTP_409_CONFLICT,
                    detail=f"Product with SKU '{update_data['sku']}' already exists",
                )

        for field, value in update_data.items():
            setattr(product, field, value)

        db.commit()
        db.refresh(product)
        return product

    def delete_product(self, db: Session, product_id: int) -> None:
        product = self.get_product(db, product_id)
        db.delete(product)
        db.commit()

    def get_low_stock_products(self, db: Session, threshold: int = 10) -> List[Product]:
        query = (
            select(Product)
            .where(Product.stock_quantity <= threshold)
            .order_by(Product.stock_quantity.asc())
        )
        return list(db.execute(query).scalars().all())

    def export_products_csv(self, db: Session) -> str:
        products = db.execute(select(Product).order_by(Product.id)).scalars().all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            [
                "ID",
                "SKU",
                "Name",
                "Description",
                "Price",
                "Stock Quantity",
                "Created At",
                "Updated At",
            ]
        )
        for p in products:
            writer.writerow(
                [
                    p.id,
                    p.sku,
                    p.name,
                    p.description,
                    p.price,
                    p.stock_quantity,
                    p.created_at,
                    p.updated_at,
                ]
            )
        return output.getvalue()


product_service = ProductService()
