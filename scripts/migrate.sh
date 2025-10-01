#!/bin/sh

# Production database migration script
# This script should be run before starting the application in production

echo "🔄 Starting database migration..."

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client (if not already generated)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Optional: Seed the database (uncomment if needed)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "✅ Database migration completed successfully!"