from fastapi import APIRouter, Depends

from src.api.v1.endpoints import auth, customers, dashboard, orders, products
from src.core.security import get_current_user

api_router = APIRouter()

# Public: auth
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Protected: all data routes require a valid JWT
api_router.include_router(
    products.router,
    prefix="/products",
    tags=["products"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    customers.router,
    prefix="/customers",
    tags=["customers"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    orders.router,
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)
