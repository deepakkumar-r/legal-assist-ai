import { describe, expect, it, vi } from 'vitest';
import { buildApp } from './serverApp.js';
import type { Config } from './config.js';
import type { LLMClient } from './services/llm.js';
const config: Config = {
  NODE_ENV: 'test',
  PORT: 8787,
  APP_ORIGIN: 'http://localhost:5173',
  GEMINI_REASONING_MODEL: 'reason',
  GEMINI_FAST_MODEL: 'fast',
  GEMINI_EMBEDDING_MODEL: 'embed',
  AUTH_MODE: 'local',
  DEMO_MODE: true,
};
const generateStructured = vi.fn(async () => ({
  documentType: 'Lease',
  overview: 'Overview',
  sections: [],
  clauses: [],
})) as unknown as LLMClient['generateStructured'];
const llm: LLMClient = {
  generate: vi.fn(),
  embed: vi.fn(async (texts) => texts.map(() => [1, 0])),
  generateStructured,
};
describe('API', () => {
  it('validates inputs and returns consistent errors', async () => {
    const app = await buildApp(config, llm);
    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { title: 'x', text: 'short' },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });
  it('analyzes, exports, and deletes a record', async () => {
    const app = await buildApp(config, llm);
    const response = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { title: 'Lease', text: 'A'.repeat(100), readingLevel: 'simple', language: 'en' },
    });
    expect(response.statusCode).toBe(201);
    const id = response.json().documentId;
    expect(
      (await app.inject({ method: 'GET', url: `/api/documents/${id}/export.md` })).statusCode,
    ).toBe(200);
    expect((await app.inject({ method: 'DELETE', url: `/api/documents/${id}` })).statusCode).toBe(
      204,
    );
    await app.close();
  });
  it('prevents another owner from reading a document', async () => {
    const app = await buildApp(config, llm);
    const created = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      headers: { 'x-user-id': 'owner-a' },
      payload: { title: 'Lease', text: 'A'.repeat(100), readingLevel: 'simple', language: 'en' },
    });
    const id = created.json().documentId as string;
    const response = await app.inject({
      method: 'GET',
      url: `/api/documents/${id}/export.md`,
      headers: { 'x-user-id': 'owner-b' },
    });
    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
