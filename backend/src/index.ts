import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotEnv } from 'dotenv';
import { loadConfig } from './config.js';
import { buildApp } from './serverApp.js';
import { GeminiLLMClient } from './services/llm.js';
import { DemoLLMClient } from './services/mock.js';

const localEnv = resolve(process.cwd(), '.env');
loadDotEnv({ path: existsSync(localEnv) ? localEnv : resolve(process.cwd(), '../.env') });
const config = loadConfig();
const llm = config.DEMO_MODE ? new DemoLLMClient() : new GeminiLLMClient(config);
const app = buildApp(config, llm);

if (!process.env.VERCEL) {
  void app.listen({ port: config.PORT, host: '0.0.0.0' });
}

export = app;
