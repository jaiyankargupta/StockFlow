import csv
import io
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import HTTPException
from fastapi import status as http_status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session, selectinload

from src.models.customer import Customer
from src.models.order import Order
from src.models.order_item import OrderItem
from src.models.product import Product
from src.schemas.order import OrderCreate


class OrderService:
    def get_orders(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        customer_id: Optional[int] = None,
    ) -> Tuple[List[Order], int]:
        query = select(Order).options(selectinload(Order.items))
        count_query = select(func.count(Order.id))

        filters = []
        if status:
            filters.append(Order.status == status)
        if customer_id:
            filters.append(Order.customer_id == customer_id)

        if filters:
            combined = and_(*filters)
            query = query.where(combined)
            count_query = count_query.where(combined)

        total = db.execute(count_query).scalar_one()
        orders = (
            db.execute(
                query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
            )
            .scalars()
            .all()
        )
        return list(orders), total

    def get_order(self, db: Session, order_id: int) -> Order:
        order = db.execute(
            select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        ).scalar_one_or_none()
        if not order:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found",
            )
        return order

    def create_order(self, db: Session, data: OrderCreate) -> Order:
        # 1. Validate customer exists
        customer = db.get(Customer, data.customer_id)
        if not customer:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {data.customer_id} not found",
            )

        # 2. Lock products (SELECT FOR UPDATE) and validate stock
        total_amount = 0.0
        prepared_items: List[Dict[str, Any]] = []

        for item in data.items:
            product = db.execute(
                select(Product).where(Product.id == item.product_id).with_for_update()
            ).scalar_one_or_none()

            if not product:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} not found",
                )

            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Insufficient stock for product '{product.name}'. "
                        f"Available: {product.stock_quantity}, Requested: {item.quantity}"
                    ),
                )

            unit_price = float(product.price)
            total_amount += unit_price * item.quantity
            prepared_items.append(
                {
                    "product": product,
                    "product_id": product.id,
                    "quantity": item.quantity,
                    "unit_price": unit_price,
                }
            )

        # 3. Atomically create order, items, and deduct stock
        try:
            order = Order(
                customer_id=data.customer_id,
                total_amount=round(total_amount, 2),
                status="pending",
            )
            db.add(order)
            db.flush()  # Obtain order.id before commit

            created_order_id = order.id

            for item_data in prepared_items:
                order_item = OrderItem(
                    order_id=created_order_id,
                    product_id=item_data["product_id"],
                    quantity=item_data["quantity"],
                    unit_price=item_data["unit_price"],
                )
                db.add(order_item)
                # Deduct stock
                item_data["product"].stock_quantity -= item_data["quantity"]

            db.commit()

            # Re-fetch with items eagerly loaded
            created_order = db.execute(
                select(Order)
                .where(Order.id == created_order_id)
                .options(selectinload(Order.items))
            ).scalar_one()
            return created_order

        except HTTPException:
            db.rollback()
            raise
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order due to an internal error",
            ) from exc

    def get_dashboard_metrics(self, db: Session) -> Dict[str, Any]:
        total_products = db.execute(select(func.count(Product.id))).scalar_one()
        total_customers = db.execute(select(func.count(Customer.id))).scalar_one()
        total_orders = db.execute(select(func.count(Order.id))).scalar_one()

        total_revenue_raw = db.execute(
            select(func.sum(Order.total_amount))
        ).scalar_one()
        total_revenue = (
            float(total_revenue_raw) if total_revenue_raw is not None else 0.0
        )

        low_stock_count = db.execute(
            select(func.count(Product.id)).where(Product.stock_quantity <= 10)
        ).scalar_one()

        recent_orders_rows = (
            db.execute(select(Order).order_by(Order.created_at.desc()).limit(5))
            .scalars()
            .all()
        )

        orders_by_status_rows = db.execute(
            select(Order.status, func.count(Order.id)).group_by(Order.status)
        ).all()
        orders_by_status = {row[0]: row[1] for row in orders_by_status_rows}

        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        revenue_30d_raw = db.execute(
            select(func.sum(Order.total_amount)).where(
                Order.created_at >= thirty_days_ago
            )
        ).scalar_one()
        revenue_last_30_days = (
            float(revenue_30d_raw) if revenue_30d_raw is not None else 0.0
        )

        return {
            "total_products": total_products,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
            "low_stock_count": low_stock_count,
            "recent_orders": [
                {
                    "id": o.id,
                    "customer_id": o.customer_id,
                    "total_amount": float(o.total_amount),
                    "status": o.status,
                    "created_at": o.created_at.isoformat() if o.created_at else None,
                }
                for o in recent_orders_rows
            ],
            "orders_by_status": orders_by_status,
            "revenue_last_30_days": revenue_last_30_days,
        }

    def export_orders_csv(self, db: Session) -> str:
        orders = db.execute(select(Order).order_by(Order.id)).scalars().all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Customer ID", "Total Amount", "Status", "Created At"])
        for o in orders:
            writer.writerow(
                [o.id, o.customer_id, o.total_amount, o.status, o.created_at]
            )
        return output.getvalue()


order_service = OrderService()
