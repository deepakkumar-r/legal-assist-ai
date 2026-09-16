import { describe, expect, it } from 'vitest';
import handler from './index.js';

describe('single-project Vercel adapter', () => {
  it('routes health through Fastify', async () => {
    const response = await handler.fetch(
      new Request('https://example.test/api/index?__path=health'),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', provider: 'demo' });
  });

  it('routes JSON analysis requests without a listening socket', async () => {
    const response = await handler.fetch(
      new Request('https://example.test/api/index?__path=analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Lease',
          text: 'A'.repeat(100),
          readingLevel: 'simple',
          language: 'en',
        }),
      }),
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      analysis: { documentType: 'Agreement (demo)' },
    });
  });
});
