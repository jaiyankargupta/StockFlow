from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from src.core.config import settings

# Neon (and other managed Postgres) requires SSL
connect_args = {}
if "neon.tech" in settings.POSTGRES_SERVER or settings.POSTGRES_SERVER not in (
    "localhost",
    "127.0.0.1",
    "db",
):
    connect_args = {"sslmode": "require"}

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
