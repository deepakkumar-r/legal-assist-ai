# Evaluation Rubric Evidence

| Criterion         | Implementation evidence                                                                                                                                           | Verification                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Code Quality      | Strict shared `tsconfig.base.json`; modular `frontend/`, `backend/`, `shared/`; Zod contracts; centralized `AppError`; `docs/openapi.yaml`; ESLint/Prettier       | `npm run lint && npm run typecheck && npm run build`                 |
| Security          | AES-256-GCM store, CSP/security headers, redacted logs, signature-verified uploads, rate limits, prompt delimiters, pinned dependencies, zero-vulnerability audit | `SECURITY.md`, `backend/src/**/*.test.ts`, `package-lock.json`       |
| Efficiency        | Bounded TTL/LRU cache for every repeat-safe AI operation, batched embeddings, top-5 retrieval, model routing, and a 76 KB gzip client bundle                      | `backend/src/services`, `backend/src/ports/cache.ts`, `frontend/`    |
| Testing           | Unit, API, security, AI-wiring, accessibility, and E2E tests; enforced 100% statements/lines/functions and 90% branches                                           | `backend/src/**/*.test.ts`, `.github/workflows/ci.yml`, `TESTING.md` |
| Accessibility     | Semantic landmarks, keyboard focus, reduced motion, non-color risk text/icons, live regions, responsive UI                                                        | `ACCESSIBILITY.md`, `frontend/src/`                                  |
| Problem alignment | Simplify, risk tags, compare, cited RAG, next steps, export, handoff, disclaimer, Spanish output option                                                           | `frontend/src/App.tsx`, `backend/src/serverApp.ts`                   |
| Mandatory GenAI   | Every interpretive route delegates through `LLMClient`; official Gemini SDK and structured schemas                                                                | `GENAI_USAGE.md`, wiring tests                                       |

## GenAI Usage Map

| Feature                | Gemini call                                                                        | Implementation                     |
| ---------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| Simplification         | `generateStructured(reasoning)`                                                    | `LegalService.analyze()`           |
| Clause classification  | Same structured analysis call (model produces each classification and risk reason) | `LegalService.analyze()`           |
| Comparison             | `generateStructured(reasoning)`                                                    | `LegalService.compare()`           |
| Q&A                    | `embed()` then `generateStructured(reasoning)`                                     | `LegalService.answer()`            |
| Options and next steps | `generateStructured(fast)`                                                         | `LegalService.nextSteps()`         |
| Translation            | `generateStructured(fast)`                                                         | `LegalService.translateAnalysis()` |

The deterministic code only parses, chunks, encrypts, caches, retrieves, and validates. It does not substitute keyword rules for legal reasoning.
