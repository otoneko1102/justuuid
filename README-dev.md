# JustUUID Developer Guide

このドキュメントは、JustUUID の開発・運用を行う人向けの詳細ガイドです。

## 1. アーキテクチャ概要

- Framework: SvelteKit (Svelte 5)
- Runtime: Cloudflare Pages Functions
- DB: Cloudflare D1 (`DB` binding)
- Auth: GitHub OAuth
- Session: JWT cookie (`session`)

主要データ:

- `users` テーブル: ユーザー基本情報 + UUID
- `similarity_pairs` テーブル: 全体類似度ランキング用ペア
- `ranking_meta` テーブル: ランキングの更新状態（自動作成）

## 2. 前提条件

- Node.js 20+
- npm
- Cloudflare アカウント
- GitHub OAuth App

## 3. 初期セットアップ

### 3.1 リポジトリ

```bash
git clone <your-repo-url>
cd justuuid
npm install
```

### 3.2 GitHub OAuth App

GitHub で OAuth App を作成し、以下を設定:

- Homepage URL: `https://justuuid.pages.dev`
- Authorization callback URL: `https://justuuid.pages.dev/auth/callback`
- ローカル用 callback: `http://localhost:5173/auth/callback`

### 3.3 ローカル環境変数

`.dev.vars` を作成（`.dev.vars.example` を参照）:

```txt
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...
```

`JWT_SECRET` は 32文字以上推奨:

```bash
openssl rand -hex 32
```

### 3.4 D1 データベース

初回作成:

```bash
npx wrangler login
npx wrangler d1 create justuuid-db
```

スキーマ適用:

```bash
# リモート
npm run db:migrate:remote

# ローカル
npm run db:migrate:local
```

## 4. 実行方法

### 4.1 通常のローカル開発

```bash
npm run dev
```

### 4.2 型チェック/整形

```bash
npm run check
npm run format:check
npm run format
```

### 4.3 Cloudflare Pages 互換での確認

```bash
npm run build
npx wrangler pages dev .svelte-kit/cloudflare
```

## 5. Cloudflare 設定方針

### 5.1 `wrangler.jsonc`

このリポジトリの `wrangler.jsonc` には D1 binding (`DB`) が定義されています。  
環境変数の秘密値は入れません。

### 5.2 ダッシュボードで管理する値

Cloudflare Pages 側で以下を設定:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`
- D1 binding `DB`（必要に応じて確認）

## 6. 全体ランキング更新戦略（重要）

全体ランキングは `similarity_pairs` を参照します。  
再計算は重いため、無料枠を考慮して「必要時のみ」実行します。

更新トリガー:

- `similarity_pairs` が空
- 前回更新時からユーザー数が変化
- 前回更新から 6 時間経過

制御:

- `ranking_meta` に更新時刻・ユーザー数スナップショットを保存
- 同時更新防止ロック（10分タイムアウト）
- 上位 `MAX_GLOBAL_RANKING_PAIRS`（現在 500）まで保存

実装:

- `src/lib/ranking.ts`
- `src/routes/ranking/+page.server.ts`
- `src/routes/api/ranking/+server.ts`

## 7. ユーザー個別類似ランキング

`/u/{uuid}` の「最も近いUUID」は都度計算です（初期10件、追加10件）。

実装:

- `src/lib/similar-users.ts`
- `src/routes/u/[uuid]/+page.server.ts`
- `src/routes/api/similar/[uuid]/+server.ts`

## 8. 主要 API エンドポイント

- `POST /api/users`  
  ホーム一覧のソート/追加読み込み
- `POST /api/similar/{uuid}`  
  個別類似ランキングの追加読み込み
- `POST /api/ranking`  
  全体ランキングの追加読み込み
- `GET /api/badge/users.svg`  
  登録ユーザー数バッジ
- `GET /api/badge/user/{github-username}.svg`  
  GitHubユーザー名指定のUUIDバッジ
- `GET /api/badge/u/{uuid}.svg`  
  UUID指定バッジ

## 9. ディレクトリ早見

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

手動で明示する場合:

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name justuuid
```

## 11. トラブルシュート

### ランキングが更新されない

- `/ranking` を開いても更新されない場合は、`ranking_meta` の更新条件を満たしているか確認
- Cloudflare Logs で関数エラー確認
- D1 に `users` / `similarity_pairs` / `ranking_meta` が存在するか確認

### ログインできない

- OAuth callback URL を再確認
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `JWT_SECRET` の設定確認

### DBエラー

- `DB` binding 名がコードと一致しているか確認
- マイグレーション再適用:

```bash
npm run db:migrate:remote
```
