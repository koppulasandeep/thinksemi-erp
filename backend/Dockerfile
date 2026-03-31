FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev libffi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

COPY . .

EXPOSE 8000

CMD alembic upgrade head && \
    python -m scripts.seed 2>/dev/null; \
    gunicorn app.main:app \
      --worker-class uvicorn.workers.UvicornWorker \
      --bind 0.0.0.0:${PORT:-8000} \
      --workers 2 \
      --timeout 120
