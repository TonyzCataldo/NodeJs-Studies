-- CreateTable
CREATE TABLE "UserCurrentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCurrentSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCurrentSession_userId_key" ON "UserCurrentSession"("userId");

-- AddForeignKey
ALTER TABLE "UserCurrentSession" ADD CONSTRAINT "UserCurrentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
