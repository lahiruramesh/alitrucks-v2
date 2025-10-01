/*
  Warnings:

  - A unique constraint covering the columns `[currentApprovalId]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "alitrucks"."VehicleStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "alitrucks"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "alitrucks"."vehicles" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "currentApprovalId" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "status" "alitrucks"."VehicleStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "alitrucks"."vehicle_approvals" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "status" "alitrucks"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."vehicle_availability" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookingId" TEXT,
    "price" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_availability_vehicleId_date_startTime_key" ON "alitrucks"."vehicle_availability"("vehicleId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_currentApprovalId_key" ON "alitrucks"."vehicles"("currentApprovalId");

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_currentApprovalId_fkey" FOREIGN KEY ("currentApprovalId") REFERENCES "alitrucks"."vehicle_approvals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicle_approvals" ADD CONSTRAINT "vehicle_approvals_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "alitrucks"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicle_approvals" ADD CONSTRAINT "vehicle_approvals_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "alitrucks"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicle_availability" ADD CONSTRAINT "vehicle_availability_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "alitrucks"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicle_availability" ADD CONSTRAINT "vehicle_availability_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "alitrucks"."bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
