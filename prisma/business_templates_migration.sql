-- Migration: Add template support for BusinessProfile

-- 1. Add templateId and userCustomConfig to BusinessProfile if not exists
ALTER TABLE "BusinessProfile" 
ADD COLUMN IF NOT EXISTS "templateId" TEXT,
ADD COLUMN IF NOT EXISTS "userCustomConfig" JSONB;

-- 2. Add foreign key relation from BusinessProfile to Template
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BusinessProfile_templateId_fkey'
    ) THEN
        ALTER TABLE "BusinessProfile" 
        ADD CONSTRAINT "BusinessProfile_templateId_fkey" 
        FOREIGN KEY ("templateId") REFERENCES "Template"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
