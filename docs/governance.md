# AGID/AOID Governance

`src/lib/governance.ts` defines a local governance evidence model for AGID/AOID systems.
It is not a legal certification engine. Its role is to make privacy, auditability, data
protection, incident handling, and compliance evidence explicit before a hosted registry,
POS fleet, issuer registry, or private deployment stores operational data.

## Purpose

Governance sits above the AGID/AOID privacy boundary:

- raw addresses, AOID secrets, AGID-S payloads, proof codes, phone numbers, and exact coordinates must not be written into public governance records;
- audit records store aliases, commitments, safe summaries, timestamps, signatures, and hash-chain roots;
- compliance reports summarize engineering evidence and missing controls rather than claiming that a deployment is legally certified.

## Supported Framework Views

The module produces engineering-control coverage for:

- `GDPR`
- `CCPA`
- `HIPAA`
- `PCI-DSS`
- `SOC-2`
- `ISO-27001`

These framework labels are used to organize findings. A production deployment still needs legal,
security, and compliance review for the relevant jurisdiction and sector.

## Core Objects

### Data Asset

`classifyGovernanceDataAsset` normalizes an asset into:

- data classes: `personal`, `address`, `credential`, `payment`, `health`, `secret`, and others;
- purposes: `delivery`, `identity`, `audit`, `payment`, `healthcare`, and others;
- encryption, access control, retention, legal basis, DSR support, consent, and high-risk processing flags.

### Audit Log

`buildGovernanceAuditLog` creates tamper-evident records:

```text
event_1 hash -> event_2 previousHash -> event_2 hash -> rootHash
```

Each record stores:

- `actorAlias`
- `resourceCommitment`
- `metadataCommitment`
- `safeSummary`
- `signed`
- `previousHash`
- `eventHash`

Raw audit payloads are rejected. IP addresses, user agents, private identifiers, and raw metadata
are committed rather than stored as public values.

### DSR Queue

Data-subject requests are modeled as:

- `access`
- `delete`
- `correct`
- `portability`
- `opt-out-sale-share`
- `restrict-processing`
- `consent-withdrawal`

The assessment flags missing identity verification and overdue requests.

### Incident Register

Personal-data incidents trigger breach-notification review when they contain personal or sensitive
data and no notification-review timestamp is present. Open incidents without corrective actions are
also flagged.

## Assessment

`assessGovernancePosture` returns:

- overall score and risk level;
- framework coverage;
- findings and required actions;
- redacted audit log;
- DSR and incident state;
- report flags such as `dpiaRequired` and `breachNotificationReviewRequired`.

Typical critical findings:

- raw personal data storage;
- raw audit payloads;
- payment data without PCI-oriented controls;
- health data without HIPAA-oriented safeguards;
- personal-data incident without breach-notification review.

Typical high findings:

- missing encryption;
- missing access control;
- missing legal basis;
- required consent unavailable;
- overdue DSR request;
- no audit log.

## Compliance Report

`buildGovernanceComplianceReport` creates a redacted report summary with:

- compliance dashboard metrics;
- data-protection map;
- audit-log integrity;
- risk register;
- DSR queue;
- DPIA screening;
- breach-notification review when needed.

The report is suitable for dashboards and internal review, but it deliberately excludes raw private
address material.

## AGID/AOID Integration Points

Use this module when adding:

- Hosted Registry API;
- POS terminal management;
- staff/device permissions;
- evidence vaults;
- private municipality/NGO/carrier deployments;
- managed ZK proof generation;
- Address Connect webhooks;
- Address Radar risk rules;
- shipping-label and handoff receipts.

## Security Boundary

The public governance surface is:

```text
aliases + commitments + policy status + risk findings + redacted audit hashes
```

The public governance surface is not:

```text
raw address + raw AGID + raw AOID + exact location + phone + email + proof code + secret key
```

This keeps the platform auditable without turning governance logs into a surveillance database.

## References For Compliance Interpretation

- European Commission: GDPR data protection overview.
- California OAG / CPPA: CCPA consumer privacy rights and regulations.
- HHS: HIPAA Security Rule safeguards.
- PCI Security Standards Council: PCI DSS payment-account data controls.
- ISO: ISO/IEC 27001 ISMS requirements.
- AICPA: SOC 2 Trust Services Criteria.
