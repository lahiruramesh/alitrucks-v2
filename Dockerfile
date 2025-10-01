# Use the official Node.js 22.11 Alpine image as base
FROM node:22.11-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Accept build arguments
ARG BETTER_AUTH_SECRET
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG DATABASE_URL

# Set environment variables for build
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and verify generation
RUN pnpm dlx prisma migrate deploy
RUN pnpm dlx prisma generate
RUN ls -la /app/prisma/generated/ || echo "Prisma generation location check"
RUN ls -la /app/node_modules/.prisma/ || echo "Standard Prisma location check"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from the project as this is not included in the build process
COPY --from=builder /app/public ./public

# Create uploads directory for file uploads and set permissions
RUN mkdir -p ./public/uploads
RUN chown -R nextjs:nodejs ./public/uploads

# Create logs directory for application logs
RUN mkdir -p ./logs
RUN chown -R nextjs:nodejs ./logs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Ensure node_modules directory exists
RUN mkdir -p ./node_modules

# Copy Prisma-related dependencies that are needed for runtime
RUN if [ -d "/tmp/builder/app/node_modules/@prisma" ]; then \
      mkdir -p ./node_modules/@prisma && \
      cp -r /tmp/builder/app/node_modules/@prisma/* ./node_modules/@prisma/ 2>/dev/null || true; \
    fi

# Handle custom Prisma client output location
RUN if [ -d "./prisma/generated" ]; then \
      mkdir -p ./node_modules/.prisma/client && \
      cp -r ./prisma/generated/prisma/* ./node_modules/.prisma/client/ 2>/dev/null || true; \
    fi

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]