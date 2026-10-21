-- CreateTable: artikel / pusat panduan tekstil (blog B2B)
CREATE TABLE "cms_articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'panduan',
    "articleType" TEXT NOT NULL DEFAULT 'panduan',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "relatedProducts" TEXT NOT NULL DEFAULT '[]',
    "author" TEXT NOT NULL DEFAULT 'Tim Tekstil Texora',
    "authorRole" TEXT,
    "readMinutes" INTEGER NOT NULL DEFAULT 4,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_articles_slug_key" ON "cms_articles"("slug");

-- CreateIndex
CREATE INDEX "cms_articles_isPublished_publishedAt_idx" ON "cms_articles"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "cms_articles_category_idx" ON "cms_articles"("category");
