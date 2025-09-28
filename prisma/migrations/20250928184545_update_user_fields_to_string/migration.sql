/*
  Warnings:

  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userType` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "alitrucks"."user" DROP COLUMN "role",
ADD COLUMN     "role" TEXT,
DROP COLUMN "userType",
ADD COLUMN     "userType" TEXT;
