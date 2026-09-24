# Security and Threat Model

## Sensitive assets and boundaries

Uploaded contracts and derived analysis may contain PII, financial terms, signatures, and confidential business information. The browser/API boundary, upload parser, model boundary, and storage adapter are treated as trust boundaries. Secrets are environment-only; `.env` and runtime databases are ignored.

## Controls

- AES-256-GCM authenticated encryption at rest with a unique 96-bit IV per document. Production must supply a KMS-managed 32-byte key.
- TLS is mandatory at the production ingress. Helmet applies a deny-by-default Content Security Policy and defensive headers; CORS is restricted to the configured origin.
- Zod validation limits every JSON field. Uploads allow only PDF, DOCX, and TXT, cap at 10 MB, verify magic bytes or reject binary text, reject executable headers, and expose a replaceable scanning boundary.
- Runtime and development dependencies are pinned, lockfile-controlled, audited in CI, and currently report zero known vulnerabilities.
- AI routes are rate limited. Document bodies and authorization headers are redacted from logs.
- The system instruction states that document/question content is untrusted evidence. XML-style delimiters are escaped; structured output is validated before use. Injection tests verify hostile text remains within the evidence delimiter.
- Permanent deletion removes both encrypted source and derived analysis from the active store.

## Gemini safety settings

LexClarity currently uses provider defaults; no harm-category threshold is relaxed. Legal language can discuss liability or harm, but silent relaxation was judged less safe than surfacing an upstream safety error. The adapter treats empty/blocked output as an error instead of inventing a result.

## Known production gaps

The included in-memory repository is a local submission adapter. Before multi-user deployment, add OIDC/JWT authorization, per-owner database policies, CSRF tokens for cookie sessions, managed KMS rotation, malware scanning, durable audit metadata, retention jobs, and incident monitoring. No claim is made that the demo server is production-hosting ready.
