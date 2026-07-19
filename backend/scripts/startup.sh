#!/usr/bin/env bash
set -e
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)"
echo "Running Alembic migrations..."
alembic upgrade head
echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
