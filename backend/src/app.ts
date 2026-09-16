import { randomBytes } from 'node:crypto';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { ZodError } from 'zod';
import type { Config } from './config.js';
import { EncryptedDocumentStore } from './lib/cryptoStore.js';
import { errorBody } from './lib/errors.js';
import { MemoryCache } from './ports/cache.js';
import { GatewayIdentityProvider } from './ports/identity.js';
import { SignatureScanner } from './ports/malwareScanner.js';
import { registerAnalysisRoutes } from './routes/analysis.js';
import { registerDocumentRoutes } from './routes/documents.js';
import type { RouteDependencies } from './routes/types.js';
import { registerUploadRoutes } from './routes/upload.js';
import { LegalService } from './services/legal.js';
import type { LLMClient } from './services/llm.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Creates the HTTP composition root with replaceable infrastructure adapters. */
export async function buildApp(config: Config, llm: LLMClient) {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'test'
        ? false
        : {
            redact: [
              'req.headers.authorization',
              'req.body.text',
              'req.body.textA',
              'req.body.textB',
            ],
          },
    bodyLimit: MAX_FILE_SIZE + 1024,
  });
  await app.register(cors, { origin: config.APP_ORIGIN, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, { max: 30, timeWindow: '1 minute' });
  await app.register(multipart, { limits: { fileSize: MAX_FILE_SIZE, files: 1 } });

  const encryptionKey = config.DATA_ENCRYPTION_KEY
    ? Buffer.from(config.DATA_ENCRYPTION_KEY, 'hex')
    : randomBytes(32);
  const dependencies: RouteDependencies = {
    documents: new EncryptedDocumentStore(encryptionKey),
    identity: new GatewayIdentityProvider(config.AUTH_MODE === 'local'),
    legal: new LegalService(llm, new MemoryCache()),
    scanner: new SignatureScanner(),
  };

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.issues[0]?.message ?? 'Invalid request.',
        },
      });
    }
    const shaped = errorBody(error);
    if (shaped.status >= 500) {
      request.log.error({ err: error, code: shaped.body.error.code }, 'Request failed');
    }
    return reply.status(shaped.status).send(shaped.body);
  });
  app.get('/health', async () => ({
    status: 'ok',
    provider: config.DEMO_MODE ? 'demo' : 'gemini',
  }));
  await registerUploadRoutes(app, dependencies);
  await registerAnalysisRoutes(app, dependencies);
  await registerDocumentRoutes(app, dependencies);
  return app;
}
