-- CreateEnum
CREATE TYPE "alitrucks"."ListingType" AS ENUM ('RENT', 'SELL');

-- CreateEnum
CREATE TYPE "alitrucks"."BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "alitrucks"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- DropEnum
DROP TYPE "alitrucks"."UserRole";

-- DropEnum
DROP TYPE "alitrucks"."UserType";

-- CreateTable
CREATE TABLE "alitrucks"."vehicle_makes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_makes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."vehicle_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."fuel_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fuel_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."vehicles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,
    "makeId" INTEGER,
    "typeId" INTEGER,
    "fuelTypeId" INTEGER,
    "model" TEXT,
    "year" INTEGER,
    "vinNumber" TEXT,
    "pricePerDay" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRegistered" BOOLEAN NOT NULL DEFAULT false,
    "odometer" INTEGER,
    "enginePower" TEXT,
    "emissionClass" TEXT,
    "transmission" TEXT,
    "towbarType" TEXT,
    "numberOfSeats" INTEGER,
    "numberOfKeys" INTEGER,
    "vehicleStatus" TEXT,
    "isImported" BOOLEAN NOT NULL DEFAULT false,
    "firstRegistration" TIMESTAMP(3),
    "trafficDate" TIMESTAMP(3),
    "lastInspection" TIMESTAMP(3),
    "inspectionValidTo" TIMESTAMP(3),
    "annualTax" DECIMAL(10,2),
    "annualTaxPaidTo" TIMESTAMP(3),
    "annualRoadFee" DECIMAL(10,2),
    "category" TEXT,
    "kerbWeight" INTEGER,
    "grossVehicleWeight" INTEGER,
    "maxLoadWeight" INTEGER,
    "allowedLoadWeight" INTEGER,
    "maxTrailerWeight" INTEGER,
    "maxCombinedWeight" INTEGER,
    "length" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "cargoCompartmentLength" INTEGER,
    "axleDistance" TEXT,
    "hasAC" BOOLEAN NOT NULL DEFAULT false,
    "hasACC" BOOLEAN NOT NULL DEFAULT false,
    "hasCentralLock" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricWindows" BOOLEAN NOT NULL DEFAULT false,
    "hasABS" BOOLEAN NOT NULL DEFAULT false,
    "hasDigitalTachograph" BOOLEAN NOT NULL DEFAULT false,
    "hasTailLift" BOOLEAN NOT NULL DEFAULT false,
    "hasDieselHeater" BOOLEAN NOT NULL DEFAULT false,
    "hasSunroof" BOOLEAN NOT NULL DEFAULT false,
    "hasRefrigerator" BOOLEAN NOT NULL DEFAULT false,
    "hasCoffeeMachine" BOOLEAN NOT NULL DEFAULT false,
    "hasExtraLights" BOOLEAN NOT NULL DEFAULT false,
    "hasTruxWildbar" BOOLEAN NOT NULL DEFAULT false,
    "hasCompartmentHeater" BOOLEAN NOT NULL DEFAULT false,
    "usageInfo" TEXT,
    "knownRemarks" TEXT,
    "serviceHistory" TEXT,
    "startDriveStatus" TEXT,
    "city" TEXT,
    "region" TEXT,
    "carbonFootprint" DECIMAL(10,2),
    "images" TEXT[],
    "videoTourUrl" TEXT,
    "auctionId" TEXT,
    "reservationPrice" DECIMAL(10,2),
    "vatStatus" TEXT,
    "listingType" "alitrucks"."ListingType" NOT NULL DEFAULT 'RENT',

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."bookings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "alitrucks"."BookingStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."payments" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "alitrucks"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePaymentIntentId" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_makes_name_key" ON "alitrucks"."vehicle_makes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_types_name_key" ON "alitrucks"."vehicle_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_types_name_key" ON "alitrucks"."fuel_types"("name");

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "alitrucks"."vehicle_makes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "alitrucks"."vehicle_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "alitrucks"."fuel_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."bookings" ADD CONSTRAINT "bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "alitrucks"."vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."bookings" ADD CONSTRAINT "bookings_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "alitrucks"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
