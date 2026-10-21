-- CreateTable: cache terjemahan AI untuk konten CMS/database
CREATE TABLE "content_translations" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_translations_entity_entityId_field_locale_key" ON "content_translations"("entity", "entityId", "field", "locale");

-- CreateIndex
CREATE INDEX "content_translations_locale_idx" ON "content_translations"("locale");
