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

フロントエンドのコマンドは npm 前提です。

Next.js 16 を使うため、Node.js は `20.9.0` 以上が必要です。

```console
node --version
npm --version
```

Node.js を1種類だけ使う場合は、Windows では LTS 版を入れます。通常はこちらで十分です。

```console
winget install OpenJS.NodeJS.LTS
```

PowerShell を開き直してから、バージョンを確認します。

```console
node --version
npm --version
```

複数の Node.js バージョンをプロジェクトごとに切り替えたい場合だけ、`nvm-windows` を使います。`nvm-windows` は Python でいう `pyenv` に近い Node.js 本体のバージョン管理ツールです。npm は Python でいう `pip` に近いパッケージ管理ツールです。

```console
winget install CoreyButler.NVMforWindows
nvm install 24.18.0
nvm use 24.18.0
node --version
npm --version
```

フロントエンドの依存関係をインストールします。

```console
npm install
```

バックエンド側も同じ親フォルダに配置しておきます。

```console
cd ../bookman_backend
```

必要に応じて仮想環境を有効化し、DB migration と fixture 読み込みを実行します。fixture を入れ直す場合は backend 側のスクリプトを使います。

```console
.\venv\Scripts\Activate.ps1
python manage.py migrate
.\scripts\import_data.ps1
```

Linux では `bookman_backend/scripts/import_data.sh` を実行してください。既存データを削除する場合は、投入前に backend 側で `python manage.py flush --noinput` を明示的に実行します。

## サーバーの起動

Bookman はフロントエンドとバックエンドを両方起動して動かします。

ターミナル 1 でバックエンドを起動します。

```console
cd ../bookman_backend
.\venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```

ターミナル 2 でフロントエンドの開発用サーバーを起動します。

```console
cd ../bookman_nextjs
npm run dev
```

`npm run dev` は開発用サーバーです。Next.js の開発用インジケーターなど、開発中だけ表示されるUIがあります。

ブラウザで http://localhost:3000 を開きます。

### 本番相当で確認する場合

ローカルで本番相当の動作を確認する場合は、開発用サーバーではなく、ビルドしてから本番用サーバーを起動します。

```console
npm run build
npm run start
```

`npm run start` は、直前に作成された `.next` のビルド結果を使って起動します。コードを変更した後は、もう一度 `npm run build` を実行してから `npm run start` します。

### API 接続

通常の開発では、フロントエンドは以下の Django API を参照します。

- `http://127.0.0.1:8000/bookman/api/branches/`
- `http://127.0.0.1:8000/bookman/api/books/`

API の接続先は `BOOKMAN_API_BASE_URL` で変更できます。未指定の場合は `http://127.0.0.1:8000/bookman/api` を使います。

バックエンドが起動していない場合、`/branch` や `/book` では画面上にデータ取得エラーが表示されます。

### モックデータで確認する場合

フロントエンド単体で一覧画面を確認したい場合は、開発用モックデータへ切り替えられます。
Next.js では、ローカル開発の個人設定は `.env.local` に書きます。`.env` も読み込めますが、個人ごとに変わる値は Git 管理しない `.env.local` に置くのが基本です。

```console
copy .env.example .env.local
```

`.env.local` を編集します。

```env
BOOKMAN_API_BASE_URL=http://127.0.0.1:8000/bookman/api
USE_MOCK_DATA=true
```

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
.\venv\Scripts\Activate.ps1
python manage.py test
```

## push 前の確認

frontend の変更を push する前に、依存関係、lint、テスト、production build を確認します。

```console
npm ci
npm run lint
npm test
npm run build
```

本番サーバーへの反映は portfolio の README にある 3 リポジトリの更新手順に従います。

## 主な画面

- `/dashboard`
- `/branch`
- `/book`
