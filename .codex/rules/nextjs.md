---
apply: ".*\.(ts|tsx|js|jsx)$"
---

# Next.js 開発規約

Next.js App Router を前提に、React と Next.js の責務を分けてシンプルに実装する。

## 公式ドキュメントの確認

- Next.js の機能や API を使う前に、対象バージョンに合う公式ドキュメントを確認する。
- Next.js 16.2.0-canary.37 以降では、公式ガイドに従い `node_modules/next/dist/docs/` の同梱ドキュメントを優先して読む。
- それ以前のバージョンでは、インストール済みバージョンを確認したうえで、公式 docs を参照する。
- ルーティング、データ取得、キャッシュ、Server Components、Server Actions などは、記憶や古い知識だけで実装しない。

## Server Components を基本にする

- `app/` 配下では、必要になるまで Client Component にしない。
- `use client` は、イベントハンドラ、ブラウザ API、ローカル state、React hook が必要なコンポーネントに限定する。
- データ取得だけを理由に Client Component へ寄せない。可能なら Server Component 側で取得し、表示用コンポーネントへ props として渡す。
- Client Component は小さく保ち、画面全体を安易に `use client` 化しない。

## useEffect を最小化する

- `useEffect` は外部システムとの同期に使う。通常のデータ取得、props からの派生値計算、イベント起点の処理には使わない。
- 初期表示に必要なデータは、できるだけ Server Component、専用 fetch 関数、またはルーティング単位のデータ取得で扱う。
- state から計算できる値は render 中に計算する。`useEffect` と追加 state で二重管理しない。
- ユーザー操作で発生する処理はイベントハンドラに置く。`useEffect` で「状態が変わったら処理する」形に逃がさない。
- `useEffect` を使う場合は、依存配列が自然に説明できる粒度まで処理を分ける。

## バックエンドとの責務分離

- このリポジトリは frontend として扱い、永続化、認可、複雑な業務ルールは backend API 側に寄せる。
- Server Actions は、backend API の代替として使わない。Bookman の主要な更新処理は backend と HTTP API の境界を明確に保つ。
- frontend 側には、API 呼び出し、画面状態、入力検証、表示整形を置く。
- API クライアントは集約し、画面コンポーネント内に URL、HTTP method、レスポンス整形を散らさない。
- API レスポンスは TypeScript 型で受け、画面で必要な形へ変換する処理を明示する。
- Server Component や server-only helper だけで読む環境変数には `NEXT_PUBLIC_` prefix を付けない。`NEXT_PUBLIC_` はブラウザへ公開してよい値に限定する。

## データ取得とエラー処理

- fetch / axios の呼び出しは、再利用できる helper や resource 層に寄せる。
- loading、empty、error の状態を画面ごとに用意する。
- 失敗時に `console.error` だけで終わらせず、ユーザーが次に取れる行動が分かる表示にする。
- 外部データを表示する場合は `references/external-data-display.md` を確認する。

## UI と状態管理

- URL で表現できる検索条件、ページ番号、タブなどは URL state を優先する。
- 一時的な入力、開閉、選択状態だけをローカル state として持つ。
- コンポーネント間で共有する必要がない状態をグローバル化しない。
- 既存の UI ライブラリ、レイアウト、命名規則を優先し、小さな変更で大きな設計を持ち込まない。

## テストと検証

- 表示ロジック、API 変換、入力検証を変更した場合は、既存の Jest / Testing Library の近いテストを追加・更新する。
- ルーティング、フォーム、一覧操作などユーザー操作が重要な変更では、手動確認手順を明確に残す。
- ドキュメントや `.codex` のみの変更では `git diff --check` を最低限の検証とする。
