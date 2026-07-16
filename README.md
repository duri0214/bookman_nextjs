# Bookman Next.js

Bookman のフロントエンドです。

Next.js / React / MUI で画面を作り、同じ親フォルダにある `bookman_backend` の Django REST Framework API と連携します。

```text
dev/
  portfolio/
  bookman_backend/
  bookman_nextjs/
```

## Codex 運用

このリポジトリは、同じ親フォルダにある `portfolio/.codex` を Codex 運用ルールとスキルの管理元として参照します。

詳細は `AGENTS.md` を参照してください。

## 初回セットアップ

フロントエンドの依存関係をインストールします。

```console
npm install
```

バックエンド側も同じ親フォルダに配置しておきます。

```console
cd ../bookman_backend
```

必要に応じて仮想環境を有効化し、DB migration と fixture 読み込みを実行します。

```console
.\venv311\Scripts\Activate.ps1
python manage.py migrate
python manage.py loaddata bookman/fixtures/m_branch-data.json
python manage.py loaddata bookman/fixtures/m_category-data.json
python manage.py loaddata bookman/fixtures/author-data.json
python manage.py loaddata bookman/fixtures/book-data.json
```

## サーバーの起動

Bookman はフロントエンドとバックエンドを両方起動して動かします。

ターミナル 1 でバックエンドを起動します。

```console
cd ../bookman_backend
.\venv311\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```

ターミナル 2 でフロントエンドを起動します。

```console
cd ../bookman_nextjs
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

フロントエンドは現在、以下の Django API を参照します。

- `http://127.0.0.1:8000/bookman/api/branches/`
- `http://127.0.0.1:8000/bookman/api/books/`

## テストと検証

通常は Codex に「テスト実行して」「lint と build まで確認して」と依頼すれば十分です。

手元で実行する場合は、以下を使います。

```console
npm test
npm run lint
npm run build
```

依存関係の脆弱性も確認する場合は、次を実行します。

```console
npm audit
```

バックエンド側のテストは `bookman_backend` で実行します。

```console
cd ../bookman_backend
.\venv311\Scripts\Activate.ps1
python manage.py test
```

## 主な画面

- `/dashboard`
- `/branch`
- `/book`
