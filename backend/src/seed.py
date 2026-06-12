import sys
import os

# Set python path to allow importing src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete
from src.db.database import SessionLocal
from src.models.product import Product
from src.models.customer import Customer
from src.models.order import Order
from src.models.order_item import OrderItem


def seed():
    db = SessionLocal()
    try:
        print("Clearing existing transactions, orders, customers, and products...")
        db.execute(delete(OrderItem))
        db.execute(delete(Order))
        db.execute(delete(Customer))
        db.execute(delete(Product))
        db.commit()

        print("Seeding products...")
        products_data = [
            {
                "sku": "AMUL-BUTTER-500",
                "name": "Amul Butter (500g)",
                "description": "Delicious premium pasteurized butter made from fresh milk.",
                "price": 3.20,
                "stock_quantity": 150
            },
            {
                "sku": "TATA-TEAGOLD-1K",
                "name": "Tata Tea Gold (1kg)",
                "description": "Unique blend of fine Assam tea leaves with 15% long leaves for rich aroma.",
                "price": 7.50,
                "stock_quantity": 90
            },
            {
                "sku": "MAGGI-MASALA-12P",
                "name": "Maggi Masala Noodles (12-Pack)",
                "description": "India's favorite 2-minute instant noodles with tastemaker masala.",
                "price": 2.10,
                "stock_quantity": 200
            },
            {
                "sku": "AASH-ATTA-10K",
                "name": "Aashirvaad Shudh Chakki Atta (10kg)",
                "description": "100% pure whole wheat flour prepared through traditional chakki process.",
                "price": 6.80,
                "stock_quantity": 80
            },
            {
                "sku": "HALDIRAM-BHUJIA-400",
                "name": "Haldiram's Bhujia Sev (400g)",
                "description": "Crispy, spiced tepary bean and chickpea flour noodle snacks.",
                "price": 1.80,
                "stock_quantity": 120
            },
            {
                "sku": "SAFFOLA-GOLD-5L",
                "name": "Saffola Gold Cooking Oil (5L)",
                "description": "Blend of 70% refined rice bran oil and 30% refined safflower oil.",
                "price": 12.50,
                "stock_quantity": 50
            },
            {
                "sku": "DETTOL-HW-1.5L",
                "name": "Dettol Liquid Handwash Refill (1.5L)",
                "description": "Effective germ protection liquid handwash refill pack.",
                "price": 4.50,
                "stock_quantity": 75
            },
            {
                "sku": "PARLE-G-800G",
                "name": "Parle-G Biscuits (800g Pack)",
                "description": "Original glucose biscuits loved by generations.",
                "price": 1.20,
                "stock_quantity": 300
            }
        ]

        products = {}
        for p in products_data:
            prod = Product(**p)
            db.add(prod)
            db.flush()
            products[prod.sku] = prod

        print("Seeding customers...")
        customers_data = [
            {
                "name": "Aarav Sharma",
                "email": "aarav.sharma@gmail.com",
                "phone": "+91-9876543210",
                "address": "A-405, Shanti Kunj, Sector 56, Gurgaon, Haryana"
            },
            {
                "name": "Diya Patel",
                "email": "diya.patel@yahoo.com",
                "phone": "+91-9988776655",
                "address": "Flat 12B, Sterling Apartments, Juhu, Mumbai, Maharashtra"
            },
            {
                "name": "Arjun Iyer",
                "email": "arjun.iyer@outlook.com",
                "phone": "+91-9123456789",
                "address": "No. 42, 3rd Cross, Indiranagar, Bengaluru, Karnataka"
            },
            {
                "name": "Ananya Sen",
                "email": "ananya.sen@hotmail.com",
                "phone": "+91-9543210987",
                "address": "15/1, Gariahat Road, Kolkata, West Bengal"
            },
            {
                "name": "Vihaan Verma",
                "email": "vihaan.verma@gmail.com",
                "phone": "+91-8888877777",
                "address": "C-22, Defence Colony, New Delhi, Delhi"
            }
        ]

        customers = {}
        for c in customers_data:
            cust = Customer(**c)
            db.add(cust)
            db.flush()
            customers[cust.email] = cust

        print("Seeding orders...")
        
        # Order 1: Aarav Sharma ($17.70, delivered)
        order1 = Order(customer_id=customers["aarav.sharma@gmail.com"].id, total_amount=17.70, status="delivered")
        db.add(order1)
        db.flush()
        db.add(OrderItem(order_id=order1.id, product_id=products["AMUL-BUTTER-500"].id, quantity=2, unit_price=3.20))
        db.add(OrderItem(order_id=order1.id, product_id=products["DETTOL-HW-1.5L"].id, quantity=1, unit_price=4.50))
        db.add(OrderItem(order_id=order1.id, product_id=products["AASH-ATTA-10K"].id, quantity=1, unit_price=6.80))
        products["AMUL-BUTTER-500"].stock_quantity -= 2
        products["DETTOL-HW-1.5L"].stock_quantity -= 1
        products["AASH-ATTA-10K"].stock_quantity -= 1

        # Order 2: Diya Patel ($26.10, shipped)
        order2 = Order(customer_id=customers["diya.patel@yahoo.com"].id, total_amount=26.10, status="shipped")
        db.add(order2)
        db.flush()
        db.add(OrderItem(order_id=order2.id, product_id=products["SAFFOLA-GOLD-5L"].id, quantity=1, unit_price=12.50))
        db.add(OrderItem(order_id=order2.id, product_id=products["AASH-ATTA-10K"].id, quantity=2, unit_price=6.80))
        products["SAFFOLA-GOLD-5L"].stock_quantity -= 1
        products["AASH-ATTA-10K"].stock_quantity -= 2

        # Order 3: Arjun Iyer ($14.10, confirmed)
        order3 = Order(customer_id=customers["arjun.iyer@outlook.com"].id, total_amount=14.10, status="confirmed")
        db.add(order3)
        db.flush()
        db.add(OrderItem(order_id=order3.id, product_id=products["TATA-TEAGOLD-1K"].id, quantity=1, unit_price=7.50))
        db.add(OrderItem(order_id=order3.id, product_id=products["MAGGI-MASALA-12P"].id, quantity=2, unit_price=2.10))
        db.add(OrderItem(order_id=order3.id, product_id=products["PARLE-G-800G"].id, quantity=2, unit_price=1.20))
        products["TATA-TEAGOLD-1K"].stock_quantity -= 1
        products["MAGGI-MASALA-12P"].stock_quantity -= 2
        products["PARLE-G-800G"].stock_quantity -= 2

        # Order 4: Ananya Sen ($14.80, pending)
        order4 = Order(customer_id=customers["ananya.sen@hotmail.com"].id, total_amount=14.80, status="pending")
        db.add(order4)
        db.flush()
        db.add(OrderItem(order_id=order4.id, product_id=products["AASH-ATTA-10K"].id, quantity=2, unit_price=6.80))
        db.add(OrderItem(order_id=order4.id, product_id=products["PARLE-G-800G"].id, quantity=1, unit_price=1.20))
        products["AASH-ATTA-10K"].stock_quantity -= 2
        products["PARLE-G-800G"].stock_quantity -= 1

        db.commit()
        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()