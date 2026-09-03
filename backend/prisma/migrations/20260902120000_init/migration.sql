-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING NOT NULL,
    "name" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "users" SET (schema_locked = false);

-- CreateTable
CREATE TABLE "cards" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "role" STRING,
    "email" STRING NOT NULL,
    "phone" STRING,
    "website" STRING,
    "bio" STRING,
    "skills" STRING[] DEFAULT ARRAY[]::STRING[],
    "linkedin" STRING,
    "github" STRING,
    "twitter" STRING,
    "avatarUrl" STRING,
    "backgroundColor" STRING NOT NULL DEFAULT '#2e3a4e',
    "slug" STRING NOT NULL,
    "isPublic" BOOL NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "cards" SET (schema_locked = false);

-- CreateTable
CREATE TABLE "contacts" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "name" STRING NOT NULL,
    "email" STRING,
    "phone" STRING,
    "website" STRING,
    "bio" STRING,
    "skills" STRING[] DEFAULT ARRAY[]::STRING[],
    "sourceCardId" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "contacts" SET (schema_locked = false);

-- CreateTable
CREATE TABLE "card_views" (
    "id" STRING NOT NULL,
    "cardId" STRING NOT NULL,
    "userId" STRING,
    "ipAddress" STRING,
    "userAgent" STRING,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_views_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "card_views" SET (schema_locked = false);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cards_userId_key" ON "cards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cards_slug_key" ON "cards"("slug");

-- CreateIndex
CREATE INDEX "cards_userId_idx" ON "cards"("userId");

-- CreateIndex
CREATE INDEX "contacts_userId_idx" ON "contacts"("userId");

-- CreateIndex
CREATE INDEX "card_views_cardId_idx" ON "card_views"("cardId");

-- CreateIndex
CREATE INDEX "card_views_userId_idx" ON "card_views"("userId");

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_views" ADD CONSTRAINT "card_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
