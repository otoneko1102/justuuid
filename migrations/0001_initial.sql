-- JustUUID initial schema
-- Run with: wrangler d1 migrations apply justuuid-db

CREATE TABLE IF NOT EXISTS users (
  -- UUID v4 — the user's public identifier
  id              TEXT     PRIMARY KEY,
  -- GitHub account identifiers
  github_id       INTEGER  UNIQUE NOT NULL,
  username        TEXT     NOT NULL,
  avatar_url      TEXT     NOT NULL,
  -- Set to 1 if a UUID collision was detected during signup (astronomically rare)
  collision_detected INTEGER NOT NULL DEFAULT 0,
  -- ISO 8601 timestamp
  created_at      TEXT     NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast lookup by github_id during OAuth login
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- Index for sorted display on home page
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
