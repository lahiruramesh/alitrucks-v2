/*
  Warnings:

  - A unique constraint covering the columns `[userId,providerId]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "account_userId_providerId_key" ON "alitrucks"."account"("userId", "providerId");
