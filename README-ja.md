# JustUUID

![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

[English](./README.md) | 日本語

**Your permanent identity, one UUID at a time.**

JustUUID は、GitHub アカウントごとに 1 つの永続 UUID v4 を割り当てる Web サービスです。  
公開プロフィールページと、README に貼れる SVG バッジを提供します。

公開サイト: [https://justuuid.pages.dev](https://justuuid.pages.dev)

## 主な機能

- GitHub OAuth ログインによる UUID 発行
- 同一 GitHub アカウントに対する UUID の永続維持
- 公開プロフィールページ: `/u/{uuid}`
- `/?user={github-username}` でユーザー検索（大文字小文字を区別しない）
- トップのユーザー一覧:
  - ランダム / 新しい順 / 古い順
  - 「もっと見る」でページ再読み込みなしに追加表示
- ユーザーごとの類似 UUID ランキング:
  - 初期 10 件
  - 「もっと見る」で 10 件ずつ追加
- 全体 UUID 類似度ランキング（`/ranking`）:
  - 初期 20 件
  - 「もっと見る」で 20 件ずつ追加
  - 自動更新（ユーザー数変化時、または 6 時間ごと）
- README 向け SVG バッジ API

## SVG バッジ

登録ユーザー数:

```md
![JustUUID Users](https://justuuid.pages.dev/api/badge/users.svg)
```

GitHub ユーザー名から UUID:

```md
![octocat UUID](https://justuuid.pages.dev/api/badge/user/octocat.svg)
```

UUID 指定:

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

## セキュリティに関する注意

このリポジトリには、次の秘密情報を含めません:

- `GITHUB_CLIENT_SECRET`
- `JWT_SECRET`

`database_id` はリソース識別子であり、秘密鍵そのものではありません。  
機密値は Cloudflare の環境変数で管理してください。

## 開発者向けドキュメント

- 英語: [README-dev.md](./README-dev.md)
- 日本語: [README-dev-ja.md](./README-dev-ja.md)

## License

MIT
