-- CreateTable: permintaan penawaran (RFQ) untuk mode "web publish + CMS"
CREATE TABLE "quote_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "country" TEXT,
    "productIds" TEXT NOT NULL DEFAULT '[]',
    "productsText" TEXT,
    "meters" INTEGER,
    "needsSample" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'id',
    "source" TEXT NOT NULL DEFAULT 'website',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quote_requests_status_idx" ON "quote_requests"("status");

-- CreateIndex
CREATE INDEX "quote_requests_createdAt_idx" ON "quote_requests"("createdAt");
