#!/usr/bin/env bash
# ============================================================
# Deploy Murgdur on Amazon EC2 (Free Tier)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$ROOT_DIR"

echo "=================================================="
echo "🚀 Deploying Murgdur on Amazon EC2"
echo "=================================================="

# Check for .env file
if [ ! -f .env ]; then
  echo "⚠️ .env file not found at root. Creating from template..."
  cp backend/.env .env 2>/dev/null || true
fi

# Ensure Docker is running
if ! systemctl is-active --quiet docker; then
  echo "Starting Docker service..."
  sudo systemctl start docker
fi

echo "📦 Building and starting Murgdur containers..."
docker compose -f infrastructure/docker-compose.prod.yml up -d --build

echo "⏳ Waiting for backend health check..."
for i in {1..30}; do
  if curl -sf http://localhost:3001/health >/dev/null; then
    echo "✅ Backend API is healthy!"
    break
  fi
  echo "Waiting for API ($i/30)..."
  sleep 3
done

echo "🌱 Seeding database with admin user & initial config..."
docker compose -f infrastructure/docker-compose.prod.yml exec -T backend node prisma/seed.js || true

echo "🎉 Deployment complete!"
echo "  Frontend:  http://$(curl -s http://checkip.amazonaws.com):3000"
echo "  Admin:     http://$(curl -s http://checkip.amazonaws.com):3000/admin"
echo "  Backend:   http://$(curl -s http://checkip.amazonaws.com):3001"
