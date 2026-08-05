# Codex Project Instructions

このリポジトリで作業するときは、同じ親フォルダにある `portfolio/.codex` を Codex 運用ルールの管理元として参照する。

## 前提

- `portfolio` と `bookman_nextjs` は同じ親フォルダに配置する。
- 例:
  - `C:\Users\yoshi\OneDrive\dev\portfolio`
  - `C:\Users\yoshi\OneDrive\dev\bookman_nextjs`

## Rules

- `.codex/rules/` 配下の各 Markdown は参照スタブであり、実体は `../portfolio/.codex/rules/` にある。
- 着手前に `../portfolio/.codex/rules/` のうち、作業内容に関係するルールを確認する。
- `main` へ直接コミットせず、Issue に対応するトピックブランチで作業する。
- Next.js の build 前後で `.next` や `.next-*` が残っている場合は生成物として扱い、必要に応じて削除してよい。Windows/OneDrive の `EPERM` が出る場合は、対象を `.next` / `.next-*` に限定し、読み取り専用属性を外してから削除する。

## Skills

- `.codex/skills/` 配下の各 `SKILL.md` は参照スタブであり、実体は `../portfolio/.codex/skills/` にある。
- ブランチ作成、コミット、PR、Issue 作成などの運用手順は `../portfolio/.codex/skills/` を参照する。
- ユーザー依頼が skill の `description` に該当する場合は、該当 `SKILL.md` を読んでから作業する。
- ユーザーが GitHub Issue URL と `/$branch /$pull-request go` を同時に貼った場合は、このリポジトリの定型指示として扱う。対象 Issue からブランチを作成し、必要な変更、確認、コミット、push、PR 作成まで追加確認なしで進める。
