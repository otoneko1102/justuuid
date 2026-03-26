# JustUUID

![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

English | [日本語](./README-ja.md)

**Your permanent identity, one UUID at a time.**

JustUUID is a web service that assigns one permanent UUID v4 to each GitHub account.
It provides a public profile page and README-friendly SVG badges.

Live: [https://justuuid.pages.dev](https://justuuid.pages.dev)

## Features

- GitHub OAuth login and UUID issuance
- Stable UUID mapping for the same GitHub account
- Public profile page: `/u/{uuid}`
- Username lookup via `/?user={github-username}` (case-insensitive)
- Home user list with:
  - Random / Newest / Oldest sorting
  - "Load more" without page reload
- Per-user similarity ranking:
  - Initial 10 results
  - +10 results per "Load more"
- Global UUID similarity ranking (`/ranking`):
  - Initial 20 results
  - +20 results per "Load more"
  - Auto refresh (when user count changes or every 6 hours)
- SVG badge endpoints for README

## SVG Badges

Registered user count:

```md
![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
```

UUID by GitHub username:

```md
![octocat UUID](https://justuuid.pages.dev/api/badge/user/octocat.svg)
```

UUID by UUID:

```md
![UUID badge](https://justuuid.pages.dev/api/badge/u/00000000-0000-4000-8000-000000000000.svg)
```

Endpoints:

- `GET /api/badge/users.svg`
- `GET /api/badge/user/{github-username}.svg`
- `GET /api/badge/u/{uuid}.svg`

## Public Pages

- Home: `/`
- Ranking: `/ranking`
- Privacy Policy: `/privacy-policy`
- Terms of Service: `/terms-of-service`

## Security Notes

This repository must not contain secrets such as:

- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

`database_id` is a resource identifier, not a secret credential.
Sensitive values are managed via Cloudflare environment variables.

## Developer Docs

- English: [README-dev.md](./README-dev.md)
- Japanese: [README-dev-ja.md](./README-dev-ja.md)

## License

MIT
