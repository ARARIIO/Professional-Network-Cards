CREATE TABLE "contact_invites" (
    "id" STRING NOT NULL,
    "fromUserId" STRING NOT NULL,
    "toUserId" STRING NOT NULL,
    "sourceCardId" STRING NOT NULL,
    "status" STRING NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "contact_invites_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "contact_invites" SET (schema_locked = false);

CREATE UNIQUE INDEX "contact_invites_fromUserId_sourceCardId_key" ON "contact_invites"("fromUserId", "sourceCardId");
CREATE INDEX "contact_invites_toUserId_status_idx" ON "contact_invites"("toUserId", "status");
CREATE INDEX "contact_invites_fromUserId_idx" ON "contact_invites"("fromUserId");

ALTER TABLE "contact_invites" ADD CONSTRAINT "contact_invites_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_invites" ADD CONSTRAINT "contact_invites_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_invites" ADD CONSTRAINT "contact_invites_sourceCardId_fkey" FOREIGN KEY ("sourceCardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
