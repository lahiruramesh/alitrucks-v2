/*
  Warnings:

  - You are about to drop the column `model` on the `vehicles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "alitrucks"."vehicle_types" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "alitrucks"."vehicles" DROP COLUMN "model",
ADD COLUMN     "modelId" INTEGER,
ADD COLUMN     "modelName" TEXT;

-- CreateTable
CREATE TABLE "alitrucks"."vehicle_models" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "makeId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_models_name_makeId_key" ON "alitrucks"."vehicle_models"("name", "makeId");

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicle_models" ADD CONSTRAINT "vehicle_models_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "alitrucks"."vehicle_makes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."vehicles" ADD CONSTRAINT "vehicles_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "alitrucks"."vehicle_models"("id") ON DELETE SET NULL ON UPDATE CASCADE;
