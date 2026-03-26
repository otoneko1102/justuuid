# JustUUID

![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

**Your permanent identity, one UUID at a time.**

JustUUID は GitHub アカウントごとに **永続UUID v4** を 1 つ割り当てるサービスです。  
公開プロフィールURLと、READMEに貼れるバッジを提供します。

Live: [https://justuuid.pages.dev](https://justuuid.pages.dev)

## 主な機能

- GitHub OAuth ログインで UUID を発行（同じアカウントは同じUUIDを維持）
- 公開プロフィールページ `/u/{uuid}`
- `/?user={github-username}` でユーザー検索（大文字小文字を区別しない）
- トップのユーザー一覧
  - ランダム / 新しい順 / 古い順
  - 「もっと見る」で追加表示（ページ再読み込みなし）
- 各ユーザーの類似UUIDランキング
  - 初期10件表示
  - 「もっと見る」で10件ずつ追加
- 全体UUID類似度ランキング `/ranking`
  - 初期20件表示
  - 「もっと見る」で20件ずつ追加
  - 自動更新（ユーザー数変化 or 6時間経過時）
- README向けSVGバッジ API

## SVG バッジ

登録ユーザー数:

```md
![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
```

GitHubユーザー名からUUID:

```md
![octocat UUID](https://justuuid.pages.dev/api/badge/user/octocat.svg)
```

UUID指定:

```md
![UUID badge](https://justuuid.pages.dev/api/badge/u/00000000-0000-4000-8000-000000000000.svg)
```

エンドポイント:

- `GET /api/badge/users.svg`
- `GET /api/badge/user/{github-username}.svg`
- `GET /api/badge/u/{uuid}.svg`

## 公開ページ

- Home: `/`
- Ranking: `/ranking`
- Privacy Policy: `/privacy-policy`
- Terms of Service: `/terms-of-service`

## データとセキュリティ

このリポジトリには以下の**秘密情報は含めません**。

- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

`database_id` は D1 バインディングの識別子であり、認証情報そのものではありません。  
実際の機密値（OAuthシークレット/JWTシークレット）は Cloudflare 側の環境変数で管理します。

## 開発者向け

セットアップ・運用・デプロイ詳細は [README-dev.md](./README-dev.md) を参照してください。

## License

MIT
