# JustUUID 開発者ガイド

[English](./README-dev.md) | 日本語

このドキュメントは JustUUID の開発・運用向け詳細ガイドです。

## 1. アーキテクチャ

- Framework: SvelteKit (Svelte 5)
- Runtime: Cloudflare Pages Functions
- Database: Cloudflare D1（`DB` バインディング）
- Auth: GitHub OAuth
- Session: JWT cookie（`session`）

主要テーブル:

- `users`: ユーザー情報 + UUID
- `similarity_pairs`: 全体 UUID 類似度ランキング
- `ranking_meta`: ランキング更新メタ情報（自動作成）

## 2. 前提条件

- Node.js 20+
- npm
- Cloudflare アカウント
- GitHub OAuth App

## 3. セットアップ

### 3.1 クローンと依存インストール

```bash
git clone <your-repo-url>
cd justuuid
npm install
```

### 3.2 GitHub OAuth App 作成

設定:

- Homepage URL: `https://justuuid.pages.dev`
- Authorization callback URL: `https://justuuid.pages.dev/auth/callback`
- ローカル callback URL: `http://localhost:5173/auth/callback`

### 3.3 ローカル秘密情報

`.dev.vars.example` を参考に `.dev.vars` を作成:

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
```

JWT_SECRET 生成例:

```bash
openssl rand -hex 32
```

### 3.4 D1 データベース

作成:

```bash
npx wrangler login
npx wrangler d1 create justuuid-db
```

マイグレーション:

```bash
# リモート
npm run db:migrate:remote

# ローカル
npm run db:migrate:local
```

## 4. 開発コマンド

```bash
npm run dev
npm run check
npm run format:check
npm run format
```

Cloudflare 互換のローカル実行:

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare
```

## 5. Cloudflare 設定

`wrangler.jsonc` には D1 バインディング情報（`DB`）を定義しています。  
秘密情報はリポジトリに入れません。

Cloudflare Pages 側で設定する環境変数:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

## 6. 全体ランキング更新戦略

全体ランキングは `similarity_pairs` を参照します。  
無料枠を考慮し、重い再計算は条件付きで実行します。

再計算トリガー:

- `similarity_pairs` が空
- 前回更新時からユーザー数が変化
- 最終更新から 6 時間経過

同時実行と安全性:

- ロック + タイムアウトで重複実行を防止
- `ranking_meta` に更新状態を保存
- 更新失敗時は既存ランキングを保持

関連ファイル:

- `src/lib/ranking.ts`
- `src/routes/ranking/+page.server.ts`
- `src/routes/api/ranking/+server.ts`

## 7. ユーザー別類似ランキング

ユーザー別の類似 UUID はオンデマンド計算です。

- 初期: 10件
- 追加: 10件ずつ
- フルリロードなし

関連ファイル:

- `src/lib/similar-users.ts`
- `src/routes/u/[uuid]/+page.server.ts`
- `src/routes/api/similar/[uuid]/+server.ts`

## 8. 主な API

- `POST /api/users`
- `POST /api/similar/{uuid}`
- `POST /api/ranking`
- `GET /api/badge/users.svg`
- `GET /api/badge/user/{github-username}.svg`
- `GET /api/badge/u/{uuid}.svg`

## 9. ディレクトリ構成

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

## 10. デプロイ

```bash
npm run deploy
```

手動で同等実行:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name justuuid
```

## 11. トラブルシュート

### ランキングが更新されない

- Cloudflare logs で runtime error を確認
- D1 の `users` / `similarity_pairs` / `ranking_meta` を確認
- `src/lib/ranking.ts` の更新条件を確認

### OAuth ログインエラー

- GitHub OAuth App の callback URL を確認
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `JWT_SECRET` を確認

### D1 マイグレーション問題

```bash
npm run db:migrate:remote
```
