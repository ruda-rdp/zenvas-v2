-- Migration: Align apps default with db-defaults.ts
-- Date: 2026-07-24
-- Description: Sets Organization.apps default to match apps/web/src/lib/db-defaults.ts DEFAULT_APPS
--              Single source of truth: db-defaults.ts; schema.prisma kept in sync.
--
-- Changes:
--   - apps: changed default from [] to ["projects", "stages", "tasks", "board", "team", "payouts"]

ALTER TABLE "Organization" ALTER COLUMN "apps" SET DEFAULT ARRAY['projects', 'stages', 'tasks', 'board', 'team', 'payouts']::TEXT[];
