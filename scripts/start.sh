#!/bin/bash

# Quick start script for Docker deployment
set -e

echo "🚀 Starting Ali Trucks Docker Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your actual values before running again."
    echo "💡 Required variables: DATABASE_URL, BETTER_AUTH_SECRET, STRIPE_SECRET_KEY"
    exit 1
fi

# Source environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check required environment variables
required_vars=("DATABASE_URL" "BETTER_AUTH_SECRET" "STRIPE_SECRET_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "📝 Please set these in your .env file"
    exit 1
fi

echo "✅ Environment variables validated"

# Generate a secure BETTER_AUTH_SECRET if it's using the default
if [ "$BETTER_AUTH_SECRET" = "your-better-auth-secret-key-here-min-32-chars" ]; then
    echo "🔐 Generating secure BETTER_AUTH_SECRET..."
    NEW_SECRET=$(openssl rand -hex 32)
    sed -i.bak "s/BETTER_AUTH_SECRET=.*/BETTER_AUTH_SECRET=$NEW_SECRET/" .env
    export BETTER_AUTH_SECRET=$NEW_SECRET
    echo "✅ Generated new BETTER_AUTH_SECRET"
fi

# Build and start the application
echo "🐳 Building and starting Docker containers..."
docker compose -f docker-compose.prod.yml up --build

echo "🎉 Deployment completed!"