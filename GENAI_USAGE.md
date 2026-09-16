# GenAI Services Used

## Service

Google AI Studio — Gemini API ([ai.google.dev](https://ai.google.dev)) through the official `@google/genai` SDK. All calls originate in the backend.

## Models

- `gemini-3.1-pro-preview` — primary legal-document reasoning.
- `gemini-3.6-flash` — lower-cost next-step guidance, translation, and Pro-capacity fallback.
- `gemini-embedding-2` — semantic document retrieval.

These identifiers were checked against Google's live model catalog on 2026-09-16 and remain environment-overridable.

## Where each model is used

| Feature                 | Capability                            | Model                    | Code location                                 | Why                                         |
| ----------------------- | ------------------------------------- | ------------------------ | --------------------------------------------- | ------------------------------------------- |
| Simplifier              | Long-context structured summarization | `gemini-3.1-pro-preview` | `backend/src/services/legal.ts` → `analyze()` | Nuanced contract reasoning                  |
| Clause/risk highlighter | JSON-schema classification            | `gemini-3.1-pro-preview` | `legal.ts` → `analyze()`                      | Consistent categories plus explanations     |
| Comparison              | Structured cross-document diff        | `gemini-3.1-pro-preview` | `legal.ts` → `compare()`                      | Materiality needs cross-document reasoning  |
| Grounded Q&A            | Retrieval-grounded generation         | `gemini-3.1-pro-preview` | `legal.ts` → `answer()`                       | Strong instruction following and abstention |
| Next-steps guide        | Structured generation                 | `gemini-3.6-flash`       | `legal.ts` → `nextSteps()`                    | Bounded, lighter-weight task                |
| Embeddings              | Semantic vectors                      | `gemini-embedding-2`     | `GeminiLLMClient.embed()`                     | Retrieves relevant clauses before Q&A       |
| Spanish output          | Structure-preserving translation      | `gemini-3.6-flash`       | `legal.ts` → `translateAnalysis()`            | Efficient multilingual transformation       |

## How to verify

`backend/src/services/legal.test.ts` injects a spy `LLMClient` and asserts calls for every intelligent feature. `DemoLLMClient` is an explicit synthetic development provider; it does not claim to analyze user content. Set `DEMO_MODE=false` for all real features.
