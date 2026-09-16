# Evaluation Rubric Evidence

| Criterion         | Implementation evidence                                                                                                                                     | Verification                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Code Quality      | Strict shared `tsconfig.base.json`; modular `frontend/`, `backend/`, `shared/`; Zod contracts; centralized `AppError`; `docs/openapi.yaml`; ESLint/Prettier | `npm run lint && npm run typecheck && npm run build`                                       |
| Security          | AES-256-GCM store, redacted logs, upload allowlist/limit/executable rejection, rate limits, prompt delimiters, environment secrets                          | `SECURITY.md`, `backend/src/lib/cryptoStore.test.ts`, `backend/src/services/legal.test.ts` |
| Efficiency        | Content-hash analysis/Q&A cache, paragraph-aware chunks, embedding top-5 retrieval, reasoning/fast routing, staged progress UI                              | `backend/src/services/legal.ts`, `frontend/src/components.tsx`                             |
| Testing           | Real unit/API/wiring tests, mocked model, coverage task, CI                                                                                                 | `backend/src/**/*.test.ts`, `.github/workflows/ci.yml`, `TESTING.md`                       |
| Accessibility     | Semantic landmarks, keyboard focus, reduced motion, non-color risk text/icons, live regions, responsive UI                                                  | `ACCESSIBILITY.md`, `frontend/src/`                                                        |
| Problem alignment | Simplify, risk tags, compare, cited RAG, next steps, export, handoff, disclaimer, Spanish output option                                                     | `frontend/src/App.tsx`, `backend/src/app.ts`                                               |
| Mandatory GenAI   | Every interpretive route delegates through `LLMClient`; official Gemini SDK and structured schemas                                                          | `GENAI_USAGE.md`, wiring tests                                                             |

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
