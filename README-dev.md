# JustUUID Developer Guide

English | [日本語](./README-dev-ja.md)

This document is the detailed developer and operations guide for JustUUID.

## 1. Architecture

- Framework: SvelteKit (Svelte 5)
- Runtime: Cloudflare Pages Functions
- Database: Cloudflare D1 (`DB` binding)
- Auth: GitHub OAuth
- Session: JWT cookie (`session`)

Core tables:

- `users`: user identity data + UUID
- `similarity_pairs`: global UUID similarity ranking
- `ranking_meta`: ranking refresh metadata (auto-created)

## 2. Prerequisites

- Node.js 20+
- npm
- Cloudflare account
- GitHub OAuth App

## 3. Setup

### 3.1 Clone and install

```bash
git clone <your-repo-url>
cd justuuid
npm install
```

### 3.2 Create GitHub OAuth App

Configure:

- Homepage URL: `https://justuuid.pages.dev`
- Authorization callback URL: `https://justuuid.pages.dev/auth/callback`
- Local callback URL: `http://localhost:5173/auth/callback`

### 3.3 Local secrets

Create `.dev.vars` (based on `.dev.vars.example`):

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
```

Recommended JWT secret generation:

```bash
openssl rand -hex 32
```

### 3.4 D1 database

Create database:

```bash
npx wrangler login
npx wrangler d1 create justuuid-db
```

Run migrations:

```bash
# remote
npm run db:migrate:remote

# local
npm run db:migrate:local
```

## 4. Development Commands

```bash
npm run dev
npm run check
npm run format:check
npm run format
```

Cloudflare-compatible local run:

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare
```

## 5. Cloudflare Configuration

`wrangler.jsonc` defines D1 binding metadata (`DB`) for this project.
Do not store secrets in the repository.

Set these in Cloudflare Pages environment variables:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

## 6. Global Ranking Refresh Strategy

Global ranking reads from `similarity_pairs`.
To keep D1/Workers usage within free-tier-friendly limits, refresh is conditional.

Refresh triggers:

- `similarity_pairs` is empty
- user count has changed since last refresh
- last refresh is older than 6 hours

Concurrency and safety:

- refresh lock with timeout (to prevent duplicate heavy recomputations)
- metadata stored in `ranking_meta`
- if refresh fails, existing ranking remains untouched

Relevant files:

- `src/lib/ranking.ts`
- `src/routes/ranking/+page.server.ts`
- `src/routes/api/ranking/+server.ts`

## 7. Per-user Similarity Ranking

Per-user similarity is computed on demand.

- initial: 10 rows
- load more: +10 rows
- no full page reload

Relevant files:

- `src/lib/similar-users.ts`
- `src/routes/u/[uuid]/+page.server.ts`
- `src/routes/api/similar/[uuid]/+server.ts`

## 8. Main API Endpoints

- `POST /api/users`
- `POST /api/similar/{uuid}`
- `POST /api/ranking`
- `GET /api/badge/users.svg`
- `GET /api/badge/user/{github-username}.svg`
- `GET /api/badge/u/{uuid}.svg`

## 9. Directory Map

```txt
src/
  lib/
    auth.ts
    db.ts
    ranking.ts
    similar-users.ts
    similarity.ts
  routes/
    +page.svelte
    ranking/
    u/[uuid]/
    api/
migrations/
  0001_initial.sql
  0002_similarity_pairs.sql
```

## 10. Deploy

```bash
npm run deploy
```

Manual equivalent:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name justuuid
```

## 11. Troubleshooting

### Ranking not updating

- verify Cloudflare logs for runtime errors
- verify D1 tables exist: `users`, `similarity_pairs`, `ranking_meta`
- verify refresh conditions in `src/lib/ranking.ts`

### OAuth login errors

- verify callback URLs in GitHub OAuth App
- verify env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`

### D1 migration issues

```bash
npm run db:migrate:remote
```
