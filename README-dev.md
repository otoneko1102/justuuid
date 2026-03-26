# JustUUID Developer Guide

## Overview

JustUUID runs on Cloudflare Pages with SvelteKit server routes and a Cloudflare D1 database.

## Prerequisites

- Node.js 20+
- A Cloudflare account
- A GitHub OAuth App

## Install

```bash
git clone <your-repo-url>
cd justuuid
npm install
```

## GitHub OAuth App

Create an OAuth App in GitHub and set:

- Homepage URL: `https://justuuid.pages.dev`
- Authorization callback URL: `https://justuuid.pages.dev/auth/callback`

For local development, also allow:

- `http://localhost:5173/auth/callback`

Keep these values outside the repository:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## D1 Database

Create the database:

```bash
npx wrangler login
npx wrangler d1 create justuuid-db
```

Save the returned `database_id` somewhere private. Do not commit it.

## Cloudflare Pages Configuration

If the Cloudflare dashboard says this project is managed through `wrangler.toml` or `wrangler.jsonc`, first deploy a revision that does not use `pages_build_output_dir` in the Wrangler file. This repository is already set up that way so the dashboard can become editable again after the next deployment.

In Cloudflare Dashboard:

1. Open `Workers & Pages`
2. Select the Pages project
3. Go to `Settings -> Bindings`
4. Add a D1 binding named `DB`
5. Select `justuuid-db`
6. Redeploy

Then set environment variables in `Settings -> Environment variables`:

| Variable               | Value                            |
| ---------------------- | -------------------------------- |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App client ID       |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret   |
| `JWT_SECRET`           | Random string, at least 32 chars |

Generate a JWT secret with:

```bash
openssl rand -hex 32
```

## Migrations

Apply migrations to the remote database:

```bash
npx wrangler d1 migrations apply justuuid-db --remote
```

Apply migrations to local D1 storage:

```bash
npx wrangler d1 migrations apply justuuid-db --local
```

## Local Development

Create local secrets:

```bash
cp .dev.vars.example .dev.vars
```

Fill in:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

Run the app in normal local dev mode:

```bash
npm run dev
```

If you need local Cloudflare Pages bindings with D1:

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare --d1 DB=YOUR_DATABASE_ID
```

## Deploy

First deploy:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name justuuid
```

Subsequent deploys:

```bash
npm run deploy
```

If GitHub integration is enabled for Cloudflare Pages, keep bindings and secrets in the Cloudflare dashboard.

If you are switching an existing Pages project from Wrangler-managed configuration to dashboard-managed configuration, push this change first, let Cloudflare create a new deployment, and then add the `DB` binding in the dashboard.
