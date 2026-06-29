# External Audit Hardening

Last updated: 2026-06-18

## 目的

AGID/AOID をオープンソースとして公開し、将来 Hosted Registry、ZK proof、POS/配送、自治体・NGO・配送業者向け private deployment へ進めるには、外部監査を「後から受けるイベント」ではなく、日常のリリース設計に組み込む必要がある。

この文書は、外部監査人に何を渡し、何を渡してはいけないか、どの段階で監査を必須にするかを定義する。対応する機械可読モデルは `src/lib/externalAuditHardening.ts`、検証テストは `src/lib/externalAuditHardening.test.ts` に置く。

## 基本原則

外部監査 readiness とは、第三者が次を安全に再現・検証できる状態である。

- 仕様、脅威モデル、信頼境界、攻撃者入力、不変条件を読める。
- ビルド、テスト、リリース成果物、データパックを再現できる。
- raw address、AOID plaintext、AGID-S payload、proof witness、秘密鍵、個人文書を受け取らずに監査できる。
- 指摘、修正、残リスク、未監査範囲を公開レポートへ安全に書ける。

## P0: OSS公開前・強い主張前の必須監査ゲート

| ゲート | 対象 | ブロック条件 |
| --- | --- | --- |
| Threat model / SECURITY policy | repository | 脅威モデル、連絡先、開示方針がない |
| Release artifact hygiene | release artifacts | secret scan、private fixture scan、raw address log scan が通っていない |
| Privacy / no raw address audit | privacy/security | 公開API、例、ログ、POS receipt、webhook に raw address 系が出る |
| ZK production claim audit | zk/cryptography | 外部暗号監査なしに production-grade ZK と呼ぶ |
| Data license / provenance audit | data licenses | `DATA_LICENSES`、出典、freshness、利用条件が不完全 |

## P1: Public pilot / hosted production 前

| ゲート | 対象 | 必要な証拠 |
| --- | --- | --- |
| Accessibility audit | frontend / POS / Portal | keyboard-only、screen reader、contrast、language direction、high-risk text |
| Hosted registry/API pentest | Hosted Registry / Dashboard / webhooks | auth、rate limit、tenant isolation、replay、signature、no raw payload |
| POS handoff abuse audit | POS / Field handoff | QR copy、stale QR、fake carrier scan、offline conflict、recipient proof bypass |

## P2: Enterprise / private deployment 前

| ゲート | 対象 | 必要な証拠 |
| --- | --- | --- |
| Cloud/private deployment review | Azure/GCP/AWS/self-host | key management、logs、OCR、storage、backup、tenant isolation |
| Incident response exercise | operation | leaked key、malicious issuer、copied QR、privacy incident、revocation drill |

## 監査パケット

### OSS Release Audit Packet

公開前に揃える。

- threat model
- `SECURITY.md` または同等の開示方針
- release checklist
- secret/private fixture/raw address scan 結果
- `DATA_LICENSES` と attribution manifest
- accessibility hardening result

渡してはいけないもの:

- real addresses
- AOID plaintext
- AGID-S payload
- private PDFs
- API keys

### Production ZK Claim Audit Packet

ZK を production-grade と呼ぶ前に揃える。

- circuit source and circuit id
- public signal schema
- witness hygiene policy
- nullifier domain separation analysis
- verifier key reference
- external cryptography audit result

渡してはいけないもの:

- witnesses
- private inputs
- credential secrets
- real address examples

### Hosted Service Audit Packet

Hosted Registry や Dashboard を本番提供する前に揃える。

- OpenAPI and webhook specs
- auth/rate-limit policy
- tenant isolation model
- log retention and redaction policy
- incident runbook
- penetration test summary

渡してはいけないもの:

- production API keys
- tenant secrets
- raw webhook bodies
- private tenant data

### Enterprise / Field Deployment Audit Packet

自治体、NGO、配送業者、倉庫、災害現場向け導入前に揃える。

- POS handoff state machine
- offline conflict protocol
- device diagnostic matrix
- high-risk field checklist
- operator accessibility walkthrough
- incident tabletop notes

渡してはいけないもの:

- real waybills
- recipient proofs
- precise delivery locations
- device secrets

## 公開レポートのルール

公開してよい:

- 監査スコープ
- 方法論
- severity count
- 修正済み finding の要約
- 残リスク
- 未監査範囲

公開してはいけない:

- real address
- AOID plaintext
- AGID-S payload
- proof witness
- private input
- API key
- exploit payload の詳細
- 被害者や現場が特定される情報

## すぐ追加すべき実務項目

1. `SECURITY.md` を作る。
   脆弱性報告先、想定レスポンス、対象範囲、報奨金なし/あり、公開タイミングを書く。

2. Release checklist を作る。
   `npm run verify:external-audit`、`npm run lint`、secret scan、private fixture scan、data license scan、checksum/signature を含める。

3. Public fixture policy を作る。
   実在する個人住所、電話番号、部屋番号、proof witness、private PDF を fixture に使わない。

4. ZK audit status table を作る。
   `fixture-only`、`internal-tested`、`external-reviewed`、`production-audited` を明示する。

5. External audit issue template を作る。
   findings を severity、scope、reproduction、privacy impact、fix status で管理する。

## 検証コマンド

```bash
npm run verify:external-audit
```

このコマンドは、外部監査モデルそのものに加えて、セキュリティ/プライバシー、ZK baseline、アクセシビリティ、OSS寄付レディネスの関連テストをまとめて走らせる。

## 現時点の判定

現状は、外部監査の前提となる設計方針はかなり揃っている。一方で、次はまだ不足している。

- 公開用 `SECURITY.md`
- 外部監査済み threat model
- 自動 secret scan / private fixture scan / release artifact scan の正式な CI 化
- ZK 回路の外部暗号監査
- accessibility の外部監査
- Hosted Registry / Dashboard / webhook の外部 pentest

したがって、今の安全な言い方は次である。

> AGID/AOID has an implementation-facing external audit readiness model and internal tests, but production-grade ZK, hosted registry, and enterprise deployment claims require independent external review before public release.
