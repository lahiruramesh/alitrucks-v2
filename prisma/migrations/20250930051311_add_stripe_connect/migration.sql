/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "alitrucks"."StripeAccountType" AS ENUM ('EXPRESS', 'STANDARD', 'CUSTOM');

-- CreateEnum
CREATE TYPE "alitrucks"."PayoutStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'PAID', 'FAILED', 'CANCELED');

-- AlterTable
ALTER TABLE "alitrucks"."user" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeOnboardingUrl" TEXT;

-- CreateTable
CREATE TABLE "alitrucks"."stripe_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "accountType" "alitrucks"."StripeAccountType" NOT NULL DEFAULT 'EXPRESS',
    "country" TEXT NOT NULL DEFAULT 'SE',
    "email" TEXT,
    "chargesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "payoutsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "detailsSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "currentlyDue" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eventuallyDue" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pastDue" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pendingVerification" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onboardingUrl" TEXT,
    "dashboardUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."payouts" (
    "id" TEXT NOT NULL,
    "stripePayoutId" TEXT NOT NULL,
    "stripeAccountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SEK',
    "status" "alitrucks"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "arrivalDate" TIMESTAMP(3),
    "method" TEXT,
    "type" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_accounts_userId_key" ON "alitrucks"."stripe_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_accounts_stripeAccountId_key" ON "alitrucks"."stripe_accounts"("stripeAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_stripePayoutId_key" ON "alitrucks"."payouts"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stripeAccountId_key" ON "alitrucks"."user"("stripeAccountId");

-- AddForeignKey
ALTER TABLE "alitrucks"."stripe_accounts" ADD CONSTRAINT "stripe_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."payouts" ADD CONSTRAINT "payouts_stripeAccountId_fkey" FOREIGN KEY ("stripeAccountId") REFERENCES "alitrucks"."stripe_accounts"("stripeAccountId") ON DELETE CASCADE ON UPDATE CASCADE;
