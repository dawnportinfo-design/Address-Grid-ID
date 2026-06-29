# Security Policy

AGID/AOID handles address-derived workflows, QR/NFC payloads, local resolver data,
POS handoff receipts, optional ZK proof envelopes, and optional registry APIs.
Security reports are welcome, especially when they protect users from address
exposure, tracking, replay, issuer spoofing, or unsafe release artifacts.

Default security posture:

- **Ethereum optional:** wallets, gas, public ledgers, and crypto payments are not required for basic use, local POS operation, revocation, deletion, export, or high-risk safety.
- **Local-first:** private address records, AOID details, proof preparation, and POS evidence stay local or encrypted unless a user explicitly chooses a sync, registry, or disclosure flow.
- **No raw address by default:** public artifacts, logs, registries, Address DNS, Ethereum records, webhooks, examples, and audit exports must use commitments, short aliases, roots, nullifiers, tails, and redacted evidence instead of raw address material.

## Supported Scope

Security reports are in scope for:

- AGID encode/decode, parsing, QR/NFC payloads, and public API contracts.
- AOID public/private separation, redaction, commitments, nullifiers, and local sync.
- AGID-S encrypted QR handling, expiry, revocation, and used-state flows.
- POS scan, handoff, receipt, offline queue, and device trust workflows.
- ZK address predicate envelopes, public signal schemas, witness hygiene, and fixture separation.
- Hosted registry designs for issuer, revocation, freshness, nullifier, webhook, and audit APIs.
- Public documentation, examples, test vectors, and release artifacts.

Out of scope:

- Attacks requiring physical coercion or unauthorized access to a user's device.
- Denial-of-service reports without a plausible address privacy or integrity impact.
- Findings against third-party services not controlled by this project.
- Social engineering, spam, or phishing of maintainers.

## What Not To Send

Do not include real private address material in reports. Please redact or use synthetic data.

Never send:

- real addresses, recipient names, phone numbers, room/unit numbers, access codes, or proof codes
- AOID plaintext
- AGID-S ciphertext from real deployments
- proof witnesses, private inputs, credential secrets, private salts, or private keys
- API keys, webhook secrets, cloud credentials, or production tenant data
- private PDFs, identity documents, utility bills, or shipping labels

## Reporting Process

Preferred reporting path:

1. Use GitHub private vulnerability reporting or a private security advisory when available.
2. If a private channel is not yet configured, open a minimal public issue titled `Security contact needed` without exploit details or private data.
3. Include the affected component, impact, reproduction steps using synthetic data, and whether the issue affects local-only, hosted, ZK, POS, or release-artifact flows.

This repository is pre-release and does not currently operate a paid bug bounty.
Good-faith responsible disclosure is still appreciated and will be credited when safe.

## Expected Response

Current target response times:

- Initial triage: best effort within 7 days.
- Severity classification: best effort within 14 days.
- Coordinated disclosure target: normally 90 days after confirmation, adjusted for active exploitation or user risk.

High-risk address privacy issues may be fixed and disclosed faster when delay increases harm.

## Severity Guide

Critical:

- raw address, AOID plaintext, AGID-S payload, proof witness, private key, or credential secret exposed in public release artifacts, hosted logs, public APIs, or public reports
- bypass of recipient proof or nullifier replay that enables unauthorized handoff in high-risk mode
- ZK production claims that leak forbidden public signals or store witnesses

High:

- issuer spoofing, webhook signature bypass, registry replay, or tenant isolation failures
- POS handoff completion without required carrier/recipient evidence
- external API or agent flow exposing private address data without consent

Medium:

- stale revocation/freshness use, incomplete redaction, weak rate limits, or audit-log privacy regressions
- accessibility failures that block critical safety workflows

Low:

- documentation mistakes, non-sensitive metadata leaks, or hardening gaps without direct privacy or integrity impact

## External Audit Readiness

External audit gates and audit packets are documented in
`docs/external-audit-hardening-ja.md`.

Mandatory operational release gates:

- no raw address material in public artifacts, examples, logs, reports, or audit exports
- terminal-signed POS, waybill, handoff, and receipt evidence before completion
- short-lived aliases for waybill, QR, NFC, and delivery references instead of raw IDs
- audit-log redaction with a recorded redaction policy version before persistence or export

Before public release, the project should pass:

```bash
npm run verify:external-audit
npm run verify:no-raw-address
npm run verify:mandatory-security
npm run verify:preaudit-secrets
npm run lint
```

Production-grade ZK, hosted registry, and enterprise deployment claims require
independent external review before public release.
