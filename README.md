# JustUUID

**Your permanent identity, one UUID at a time.**
Live: https://justuuid.pages.dev/

Sign in with GitHub to receive a permanent UUID v4. Your UUID is forever linked to your GitHub account and accessible via a public URL anyone can visit.

---

## Architecture

```
Browser
  └── Cloudflare Pages (justuuid.pages.dev)
        ├── Static assets  — served directly from Cloudflare CDN
        └── SSR / API      — Cloudflare Pages Functions (= Workers)
              └── D1 Database — bound to the Pages project
```

Everything runs within Cloudflare Pages. There is no separate Worker project needed — SvelteKit's server-side routes compile to Pages Functions automatically via `@sveltejs/adapter-cloudflare`.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | SvelteKit 2 + Svelte 5 |
| Hosting | Cloudflare Pages |
| SSR / API | Cloudflare Pages Functions (Workers) |
| Database | Cloudflare D1 (SQLite) |
| Auth | GitHub OAuth 2.0 + JWT (httpOnly cookie) |
| i18n | English / Japanese |

All infrastructure runs on Cloudflare's **free tier**.

---

## Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as dev dependency)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- A [GitHub OAuth App](https://github.com/settings/developers)

### 2. Clone & install

```bash
git clone <your-repo-url>
cd justuuid
npm install
```

### 3. Create a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name**: JustUUID
   - **Homepage URL**: `https://justuuid.pages.dev`
   - **Authorization callback URL**: `https://justuuid.pages.dev/auth/callback`
3. For local development, add a second callback URL (or create a separate dev OAuth App):
   - `http://localhost:5173/auth/callback`
4. Note your **Client ID** and generate a **Client Secret**

### 4. Create the D1 Database

```bash
# Log in to Cloudflare
npx wrangler login

# Create the database
npx wrangler d1 create justuuid-db
```

Copy the `database_id` from the output and paste it into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "justuuid-db",
    "database_id": "YOUR_DATABASE_ID_HERE",   // ← paste here
    "migrations_dir": "migrations"
  }
]
```

### 5. Run database migrations

```bash
# Production
npx wrangler d1 migrations apply justuuid-db

# Local development
npx wrangler d1 migrations apply justuuid-db --local
```

### 6. Configure environment variables

**Update `wrangler.jsonc`** with your GitHub Client ID:

```jsonc
"vars": {
  "GITHUB_CLIENT_ID": "your_github_client_id"
}
```

**Set secrets** via the Cloudflare Pages dashboard after first deploy:
- Go to Pages project → **Settings → Environment variables**
- Add under **Production** (and optionally Preview):

| Variable | Value |
|---|---|
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth App client secret |
| `JWT_SECRET` | A random string ≥ 32 chars (`openssl rand -hex 32`) |

Or set via CLI after deploying:
```bash
npx wrangler pages secret put GITHUB_CLIENT_SECRET
npx wrangler pages secret put JWT_SECRET
```

**For local development**, create `.dev.vars` (gitignored):

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your actual values
```

### 7. Local development

```bash
npm run dev
```

Wrangler reads `.dev.vars` for secrets and uses a local D1 SQLite file automatically.

Open http://localhost:5173

### 8. Deploy to Cloudflare Pages

#### First deploy

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name justuuid
```

This creates the project and makes it available at **https://justuuid.pages.dev**.

#### Subsequent deploys

```bash
npm run deploy
# (runs: npm run build && wrangler pages deploy)
```

Alternatively, connect your GitHub repo to Cloudflare Pages for automatic deploys on push — the build command is `npm run build` and the output directory is `.svelte-kit/cloudflare`.

---

## Project Structure

```
justuuid/
├── wrangler.jsonc              # Cloudflare Pages + D1 config
├── svelte.config.js            # SvelteKit + Cloudflare adapter
├── migrations/
│   └── 0001_initial.sql        # D1 schema
├── static/
│   ├── favicon.svg
│   └── robots.txt
└── src/
    ├── app.html                # HTML shell (includes Material Icons font)
    ├── app.d.ts                # TypeScript env types (Cloudflare bindings)
    ├── app.css                 # Global styles / design tokens
    ├── hooks.server.ts         # Auth + language detection middleware
    ├── lib/
    │   ├── types.ts
    │   ├── auth.ts             # JWT sign/verify (Web Crypto API)
    │   ├── db.ts               # D1 database helpers
    │   └── i18n/
    │       ├── en.ts           # English translations
    │       ├── ja.ts           # Japanese translations
    │       └── index.ts        # t(lang) + detectLang()
    └── routes/
        ├── +layout.server.ts   # Provides user + lang to all pages
        ├── +layout.svelte      # Header, footer, language switcher (EN/JA)
        ├── +error.svelte       # 404 / error page
        ├── +page.svelte        # Home — hero + user list
        ├── +page.server.ts     # Home data (user list, collision flag)
        ├── login/
        │   └── +page.server.ts # GitHub OAuth redirect
        ├── auth/callback/
        │   └── +page.server.ts # OAuth callback → JWT cookie
        ├── logout/
        │   └── +page.server.ts # Clear session cookie
        ├── u/[uuid]/
        │   ├── +page.server.ts # Load user by UUID, pass origin
        │   └── +page.svelte    # Public user profile
        ├── privacy-policy/
        │   └── +page.svelte
        └── terms-of-service/
            └── +page.svelte
```

---

## Database Schema

```sql
CREATE TABLE users (
  id                TEXT     PRIMARY KEY,   -- UUID v4 (public identifier)
  github_id         INTEGER  UNIQUE NOT NULL,
  username          TEXT     NOT NULL,
  avatar_url        TEXT     NOT NULL,
  collision_detected INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT     NOT NULL DEFAULT (datetime('now'))
);
```

---

## Features

### UUID v4
Each user receives a cryptographically random UUID v4 on first login, permanently linked to their GitHub account.

### UUID Collision Detection
If a generated UUID v4 happens to collide with an existing one (a 1-in-5.3×10³⁶ event), the collision is flagged on the user's profile and shown with a special indicator on their profile page and the home page.

### i18n
English and Japanese, detected from the browser's `Accept-Language` header. Stored in a cookie and switchable via the `EN` / `JA` toggle in the header.

### Auth
GitHub OAuth 2.0 with CSRF `state` validation. Sessions use a signed JWT (HS256) in an `httpOnly`, `Secure`, `SameSite=Lax` cookie, valid for 30 days.

---

## Environment Variables Reference

| Variable | Where set | Description |
|---|---|---|
| `GITHUB_CLIENT_ID` | `wrangler.jsonc` `vars` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | Pages secret | GitHub OAuth App Client Secret |
| `JWT_SECRET` | Pages secret | Random string ≥ 32 chars for JWT signing |
| `DB` | D1 binding in `wrangler.jsonc` | Cloudflare D1 database |

---

## License

MIT
