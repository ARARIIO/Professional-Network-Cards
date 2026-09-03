-- AlterTable
ALTER TABLE "cards" SET (schema_locked = false);
ALTER TABLE "cards" ADD COLUMN "viewsCount" INT8 NOT NULL DEFAULT 0;

UPDATE "cards"
SET "viewsCount" = (
  SELECT count(*)::INT8 FROM "card_views" WHERE "card_views"."cardId" = "cards"."id"
);

-- CreateIndex
ALTER TABLE "card_views" SET (schema_locked = false);
CREATE INDEX "card_views_viewedAt_idx" ON "card_views"("viewedAt");
