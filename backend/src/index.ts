import { existsSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import { config as loadDotEnv } from 'dotenv';
import { loadConfig } from './config.js';
import { buildApp } from './app.js';
import { GeminiLLMClient } from './services/llm.js';
import { DemoLLMClient } from './services/mock.js';

async function createApp() {
  const localEnv = resolve(process.cwd(), '.env');
  loadDotEnv({ path: existsSync(localEnv) ? localEnv : resolve(process.cwd(), '../.env') });
  const config = loadConfig();
  const llm = config.DEMO_MODE ? new DemoLLMClient() : new GeminiLLMClient(config);
  return { app: await buildApp(config, llm), config };
}

const application = createApp();

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const { app } = await application;
  await app.ready();
  app.server.emit('request', request, response);
}

if (!process.env.VERCEL) {
  void application.then(({ app, config }) =>
    app.listen({ port: config.PORT, host: '0.0.0.0' }),
  );
}
