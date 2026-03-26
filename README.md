# JustUUID

![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

**Your permanent identity, one UUID at a time.**

JustUUID is a small web service that assigns a permanent UUID v4 to a GitHub account.

After signing in with GitHub, a user gets:

- a permanent UUID
- a public profile page
- a shareable URL

Live site: [justuuid.pages.dev](https://justuuid.pages.dev/)

## README Badge

Registered user count badge:

```md
![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
```

Badge endpoint: `GET /api/badge/users.svg`

UUID badge by GitHub username:

```md
![octocat UUID](https://justuuid.pages.dev/api/badge/user/octocat.svg)
```

Endpoint: `GET /api/badge/user/{github-username}.svg`

UUID badge by UUID:

```md
![UUID badge](https://justuuid.pages.dev/api/badge/u/00000000-0000-4000-8000-000000000000.svg)
```

Endpoint: `GET /api/badge/u/{uuid}.svg`

## What It Does

- Sign in with GitHub and receive a UUID v4
- Keep the same UUID for the same GitHub account
- Publish a simple public profile page
- Resolve `?user=<github-username>` to that profile when the user exists
- Support English and Japanese

## Public Profile

Each public profile can show:

- GitHub username
- Avatar
- UUID
- Joined date

Profile pages are public by design.

## Privacy Summary

JustUUID stores only the data needed to operate the service:

- GitHub user ID
- GitHub username
- GitHub avatar URL
- Assigned UUID

See the live legal pages for details:

- [Privacy Policy](https://justuuid.pages.dev/privacy-policy)
- [Terms of Service](https://justuuid.pages.dev/terms-of-service)

## Open Source

This repository is public. It contains the application source code, but it does not contain deployment secrets such as:

- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`
- Cloudflare D1 `database_id`

## Tech Stack

- SvelteKit
- Cloudflare Pages Functions
- Cloudflare D1
- GitHub OAuth

## Development

Developer setup and deployment instructions are documented in [README-dev.md](./README-dev.md).

## License

MIT
