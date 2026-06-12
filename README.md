# Stockflow — Inventory & Order Management

Stockflow is a production-ready inventory and order management system: a full-stack app with a FastAPI + SQLAlchemy backend and a React + TypeScript frontend.

## Tech stack
- Backend: Python 3.12, FastAPI, SQLAlchemy, Alembic, Pydantic
- Database: PostgreSQL (compatible with Neon)
- Frontend: React, TypeScript, Vite, TailwindCSS
- Infra: Docker, Docker Compose

## Quick start (recommended)
From the repository root:

1. Build and start with Docker Compose:

```sh
# build images (optional, compose will build automatically if images not present)
docker compose build
# start services in background
docker compose up -d
# view backend logs
docker compose logs -f backend
```

2. Health checks
- Backend health: http://localhost:8000/health
- Frontend: http://localhost/ (port 80)

The `docker-compose.yml` runs Alembic migrations at backend startup, so migrations are applied automatically.

## Pull prebuilt images (Docker Hub)
If you prefer to use the images I published to Docker Hub, pull and run them instead of building locally:

```sh
# pull images
docker pull jaiyankargupta/stockflow-backend:latest
docker pull jaiyankargupta/stockflow-frontend:latest

# run the DB (example)
docker network create stockflow-net || true
docker run -d --name stockflow-db --network stockflow-net \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=inventory_db \
  -p 5432:5432 postgres:15-alpine

# run backend (migrations should be run once before starting in some setups):
# (the image entrypoint already runs migrations in the compose setup)
docker run -d --name stockflow-backend --network stockflow-net \
  -e POSTGRES_SERVER=stockflow-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=inventory_db \
  -p 8000:8000 jaiyankargupta/stockflow-backend:latest

# run frontend
docker run -d --name stockflow-frontend --network stockflow-net -p 80:80 \
  jaiyankargupta/stockflow-frontend:latest
```

## Default credentials (for demo/testing)
- Email: `admin@stockflow.io`
- Password: `Admin@123456`

Please rotate these credentials for any real deployment.

## Security notes
- I hardened the backend build (multi-stage Dockerfile) and removed local virtualenv artifacts from the image build context. The backend image on Docker Hub is `jaiyankargupta/stockflow-backend:latest`.
- Revoke any temporary tokens you created on Docker Hub after use and store production secrets securely (Render/Vercel/Neon secrets).
- For production, tighten CORS and never use allow_origins=["*"] with credentials enabled.

## Troubleshooting
- If Docker is not running: start Docker Desktop and re-run `docker compose up -d`.
- To view logs: `docker compose logs -f backend` and `docker compose logs -f frontend`.

## Repository
- GitHub: https://github.com/jaiyankargupta/stockflow

If you want, I can add a short troubleshooting README for HR, a docker-compose wrapper that uses the pushed images only, or a GitHub Actions workflow to run Trivy/pip-audit on each push. Tell me which one you prefer.