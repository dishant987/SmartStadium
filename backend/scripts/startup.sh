#!/usr/bin/env bash
set -e
export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)"
export PYTHONUNBUFFERED=1

echo "Verifying application imports..."
python -c "import app.main; print('Sanity check: Import app.main successful!')"

echo "Starting uvicorn..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
