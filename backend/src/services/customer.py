import csv
import io
from typing import List, Optional, Tuple

from fastapi import HTTPException
from fastapi import status as http_status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from src.models.customer import Customer
from src.schemas.customer import CustomerCreate, CustomerUpdate


class CustomerService:
    def get_customers(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> Tuple[List[Customer], int]:
        query = select(Customer)
        count_query = select(func.count(Customer.id))

        if search:
            search_filter = or_(
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total = db.execute(count_query).scalar_one()
        customers = db.execute(query.offset(skip).limit(limit)).scalars().all()
        return list(customers), total

    def get_customer(self, db: Session, customer_id: int) -> Customer:
        customer = db.get(Customer, customer_id)
        if not customer:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {customer_id} not found",
            )
        return customer

    def create_customer(self, db: Session, data: CustomerCreate) -> Customer:
        existing = db.execute(
            select(Customer).where(Customer.email == data.email)
        ).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{data.email}' already exists",
            )

        customer = Customer(**data.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    def update_customer(
        self, db: Session, customer_id: int, data: CustomerUpdate
    ) -> Customer:
        customer = self.get_customer(db, customer_id)
        update_data = data.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] != customer.email:
            conflict = db.execute(
                select(Customer).where(Customer.email == update_data["email"])
            ).scalar_one_or_none()
            if conflict:
                raise HTTPException(
                    status_code=http_status.HTTP_409_CONFLICT,
                    detail=f"Customer with email '{update_data['email']}' already exists",
                )

        for field, value in update_data.items():
            setattr(customer, field, value)

        db.commit()
        db.refresh(customer)
        return customer

    def delete_customer(self, db: Session, customer_id: int) -> None:
        customer = self.get_customer(db, customer_id)
        db.delete(customer)
        db.commit()

    def export_customers_csv(self, db: Session) -> str:
        customers = db.execute(select(Customer).order_by(Customer.id)).scalars().all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(
            ["ID", "Name", "Email", "Phone", "Address", "Created At", "Updated At"]
        )
        for c in customers:
            writer.writerow(
                [c.id, c.name, c.email, c.phone, c.address, c.created_at, c.updated_at]
            )
        return output.getvalue()


customer_service = CustomerService()
