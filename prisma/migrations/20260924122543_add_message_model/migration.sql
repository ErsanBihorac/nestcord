-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_authorId_key" ON "Message"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_conversationId_key" ON "Message"("conversationId");
