#!/bin/bash

# Deployment script for Coolify
# This script handles the deployment process including database migrations

set -e

echo "🚀 Starting deployment process..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t alitrucks-app .

# Run database migrations (if needed)
echo "🔄 Running database migrations..."
docker run --rm \
  --env-file .env \
  --network host \
  alitrucks-app \
  sh -c "npx prisma migrate deploy && npx prisma generate"

echo "✅ Deployment preparation completed!"
echo "💡 You can now deploy the 'alitrucks-app' image"

# Optional: Push to registry if using one
# echo "📤 Pushing to registry..."
# docker tag alitrucks-app your-registry/alitrucks-app:latest
# docker push your-registry/alitrucks-app:latest