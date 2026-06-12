# Multi-stage build: build wheels in a builder and create a minimal runtime image

FROM python:3.12-slim AS builder
WORKDIR /app

# Install build-time packages only in the builder
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc libpq-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Upgrade pip and build wheels into /wheels for offline install in final image
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# ---------------------
# Final minimal runtime
# ---------------------
FROM python:3.12-slim AS runtime
WORKDIR /app

# Update system packages (pull latest security fixes) and install minimal runtime deps
RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy pre-built wheels from builder and install without needing compilers
COPY --from=builder /wheels /wheels
COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

# Use a reasonable worker count for production; uvicorn will be the entrypoint
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
