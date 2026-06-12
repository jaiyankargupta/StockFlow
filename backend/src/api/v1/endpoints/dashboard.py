from typing import Any, Dict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.deps import get_db_session
from src.services.order import order_service

router = APIRouter()


@router.get("/metrics", summary="Get dashboard metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db_session),
) -> Dict[str, Any]:
    return order_service.get_dashboard_metrics(db)
