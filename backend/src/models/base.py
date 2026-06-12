from typing import Any
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from datetime import datetime

class Base(DeclarativeBase):
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + "s"
