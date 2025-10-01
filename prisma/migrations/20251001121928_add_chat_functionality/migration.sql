-- CreateEnum
CREATE TYPE "alitrucks"."ChatStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "alitrucks"."MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE');

-- CreateTable
CREATE TABLE "alitrucks"."chat" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "status" "alitrucks"."ChatStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "initiatorId" TEXT NOT NULL,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."chat_participant" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alitrucks"."chat_message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" "alitrucks"."MessageType" NOT NULL DEFAULT 'TEXT',
    "readBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_participant_chatId_userId_key" ON "alitrucks"."chat_participant"("chatId", "userId");

-- AddForeignKey
ALTER TABLE "alitrucks"."chat" ADD CONSTRAINT "chat_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."chat_participant" ADD CONSTRAINT "chat_participant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "alitrucks"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."chat_participant" ADD CONSTRAINT "chat_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."chat_message" ADD CONSTRAINT "chat_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "alitrucks"."chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alitrucks"."chat_message" ADD CONSTRAINT "chat_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "alitrucks"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
