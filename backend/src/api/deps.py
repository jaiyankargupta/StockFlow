from typing import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from src.db.database import get_db


def get_db_session(db: Session = Depends(get_db)) -> Generator:
    yield db
