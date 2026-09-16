# Testing

Run `npm test` for Vitest unit, integration, security-oriented prompt, encryption, and LLM-wiring tests. Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` for static and production verification. CI runs the same gates plus `npm audit --audit-level=high`.

Tests never call Gemini: they inject an `LLMClient` spy and assert the model boundary was invoked. The API suite boots Fastify in memory. Core cases cover semantic chunking, encryption/deletion, schema rejection, upload boundary structure, prompt-injection containment, model wiring, export, and deletion.

For manual acceptance, start `npm run dev`, load `samples/lease-a.txt`, acknowledge the informational boundary, analyze it, ask “What happens if I leave early?”, then compare it with `samples/lease-b.txt` and export the report.
