-- Migration: Add packages field to Organization
-- Date: 2026-07-23
-- Description: Adds packages array field for modular app system per ADR-0005
-- Fixed: apps column now comes from init migration; packages added safely

-- Add packages field to Organization table (idempotent)
-- Uses IF NOT EXISTS pattern for databases that already have it from db push
ALTER TABLE "Organization"
ADD COLUMN IF NOT EXISTS "packages" TEXT[] DEFAULT ARRAY['project-os', 'human-capital-os'];

-- Backfill existing organizations that lack packages
-- (databases that evolved via db push may have apps but no packages)
UPDATE "Organization"
SET "packages" = ARRAY['project-os', 'human-capital-os']
WHERE "packages" IS NULL OR array_length("packages", 1) IS NULL;

-- Sync any orgs that have empty apps (legacy or partial state) to the correct defaults
UPDATE "Organization"
SET "apps" = ARRAY['projects', 'stages', 'tasks', 'board', 'team', 'payouts']
WHERE array_length("apps", 1) IS NULL OR array_length("apps", 1) = 0;

-- Add index for packages (optional, for faster lookups)
-- CREATE INDEX IF NOT EXISTS "Organization_packages_idx" ON "Organization" USING GIN ("packages");

-- Verify the changes
-- SELECT id, name, plan, packages, apps FROM "Organization" LIMIT 5;
