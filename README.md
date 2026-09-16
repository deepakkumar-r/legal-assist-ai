# LexClarity

**Understand before you sign.** LexClarity turns dense agreements into cited plain-language explanations, highlights clauses worth reviewing, compares versions, answers questions only from the uploaded text, and prepares users for a conversation with a licensed attorney.

> This is general information, not legal advice. Consult a licensed attorney for advice about your specific situation.

[GenAI services used](GENAI_USAGE.md) · [Evaluation evidence](RUBRIC.md) · [Security](SECURITY.md) · [Testing](TESTING.md) · [Accessibility](ACCESSIBILITY.md)

## Quick start

Prerequisites: Node.js 20+.

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. `DEMO_MODE=true` runs a clearly labeled synthetic provider for UI evaluation. For real document reasoning, add `GEMINI_API_KEY` and set `DEMO_MODE=false`. The browser never receives the API key.

## What ships

- PDF/DOCX/TXT extraction and pasted-text input with file-size and MIME hardening.
- Gemini-powered simplification, structured clause/risk classification, comparison, grounded RAG Q&A, next-steps guidance, and Spanish translation scaffolding.
- Exact source excerpts, explicit “not found” fallback, and non-advice system instruction on every call.
- Markdown export, permanent deletion, and an attorney-intake handoff brief.
- AES-256-GCM encrypted document repository; content-hash and Q&A caching; semantic paragraph chunking; model tiering.

## Architecture

```text
Browser (React, WCAG UI)
  │ HTTPS / validated JSON or hardened upload
  ▼
Fastify API ── guardrails + rate limit + Zod ──► Encrypted repository (AES-256-GCM)
  │                                                    │
  ├─ extraction ─► semantic chunks ─► Gemini Embedding 2 ─► ranked evidence
  │                                                    │
  └─ LLMClient ─► Gemini 3.1 Pro Preview (reasoning) ◄─┘
              └─► Gemini 3.8 Flash (lighter guidance/translation)
                       │
                       ▼
                schema validation ─► cited UI + disclaimer
```

## Commands

| Command                | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Run web and API with hot reload                              |
| `npm test`             | Unit, integration, and security-oriented tests with coverage |
| `npm run typecheck`    | Strict TypeScript checks in every workspace                  |
| `npm run lint`         | ESLint                                                       |
| `npm run format:check` | Prettier verification                                        |
| `npm run build`        | Production builds                                            |

## Environment

See [.env.example](.env.example). Models were checked against the official model catalog on 2026-09-16: `gemini-3.1-pro-preview`, `gemini-3.6-flash`, and stable `gemini-embedding-2`. Override all three without code changes. The client falls back to Flash when Pro quota is unavailable. `gemini-3.6-flash` was verified with this project's full structured analysis schema.

## Vercel deployment

Vercel deploys this monorepo as two connected Projects from the same GitHub repository:

1. **Frontend project:** Root Directory `frontend`, Framework Preset `Vite`, Output Directory `dist`.
2. **API project:** Root Directory `backend`, Framework Preset `Fastify` (or automatic detection). Do not configure an Output Directory.

Both workspaces compile `@lexclarity/shared` automatically through their `prebuild` scripts. The per-folder `vercel.json` in `frontend/` overrides stale dashboard output settings.

After the API project deploys, set this public environment variable on the frontend project:

```env
VITE_API_BASE_URL=https://your-deployed-api.example.com
```

Set the API project's `APP_ORIGIN` to the exact frontend deployment origin. Add `GEMINI_API_KEY`, `DATA_ENCRYPTION_KEY`, `DEMO_MODE=false`, and `AUTH_MODE=local` only to the API project. Never expose either secret through a variable prefixed with `VITE_`.

The included encrypted repository is in-memory. A Vercel Function may be replaced or scaled at any time, so production deployments must replace it with durable storage (for example Postgres plus KMS-managed encryption). The current adapter is suitable for a short single-instance demonstration, not persistent production data.

## Responsible-use limitations

LexClarity does not represent users, file documents, predict outcomes, or replace a lawyer. Even grounded model output may omit or misinterpret a complex clause. Jurisdiction-specific law is intentionally out of scope. Verify source language and important decisions with a qualified professional. The development store is in-memory and single-process; production deployment should use authenticated users, a managed KMS, durable encrypted storage, malware scanning, and TLS termination.

## Repository map

- `frontend/` — accessible React/Vite client.
- `backend/` — Fastify API, extraction, encrypted storage, retrieval, Gemini orchestration.
- `shared/` — Zod schemas and shared contracts.
- `tests/e2e/` — Playwright journeys.
- `docs/openapi.yaml` — API contract.
- `samples/` — safe synthetic judge data.

## Judging-criteria map

The concise, path-by-path proof for code quality, security, efficiency, testing, accessibility, alignment, and mandatory GenAI usage is in [RUBRIC.md](RUBRIC.md).
