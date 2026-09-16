import { buildApp } from '../backend/src/app.js';
import { loadConfig } from '../backend/src/config.js';
import { GeminiLLMClient } from '../backend/src/services/llm.js';
import { DemoLLMClient } from '../backend/src/services/mock.js';

let appPromise: ReturnType<typeof buildApp> | undefined;

async function application() {
  if (!appPromise) {
    const config = loadConfig();
    const llm = config.DEMO_MODE ? new DemoLLMClient() : new GeminiLLMClient(config);
    appPromise = buildApp(config, llm);
  }
  const app = await appPromise;
  await app.ready();
  return app;
}

function targetUrl(requestUrl: URL): string {
  const path = requestUrl.searchParams.get('__path') ?? '';
  requestUrl.searchParams.delete('__path');
  const query = requestUrl.searchParams.toString();
  const pathname = path === 'health' ? '/health' : `/api/${path}`;
  return `${pathname}${query ? `?${query}` : ''}`;
}

/** Adapts a Web Fetch request to Fastify without opening a listening socket. */
export default {
  async fetch(request: Request): Promise<Response> {
    const app = await application();
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const body =
      method === 'GET' || method === 'HEAD' ? undefined : Buffer.from(await request.arrayBuffer());
    const injected = await app.inject({
      method: method as 'GET',
      url: targetUrl(url),
      headers: Object.fromEntries(request.headers.entries()),
      ...(body ? { payload: body } : {}),
    });
    const headers = new Headers();
    for (const [name, value] of Object.entries(injected.headers)) {
      if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
      else if (value !== undefined) headers.set(name, String(value));
    }
    return new Response(injected.body, { status: injected.statusCode, headers });
  },
};
