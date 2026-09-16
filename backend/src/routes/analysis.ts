import type { FastifyInstance } from 'fastify';
import {
  AnalyzeRequestSchema,
  CompareRequestSchema,
  DISCLAIMER,
  NextStepsRequestSchema,
  QaRequestSchema,
} from '@lexclarity/shared';
import { AppError } from '../lib/errors.js';
import type { RouteDependencies } from './types.js';

export function registerAnalysisRoutes(app: FastifyInstance, deps: RouteDependencies) {
  app.post(
    '/api/analyze',
    { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const ownerId = deps.identity.ownerId(request);
      const body = AnalyzeRequestSchema.parse(request.body);
      const analysis = await deps.legal.analyze(body.text, body.readingLevel, body.language);
      const record = deps.documents.save(ownerId, body.title, body.text, analysis);
      return reply.status(201).send({ documentId: record.id, analysis, disclaimer: DISCLAIMER });
    },
  );

  app.post(
    '/api/compare',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request) => {
      deps.identity.ownerId(request);
      const body = CompareRequestSchema.parse(request.body);
      return {
        comparison: await deps.legal.compare(body.textA, body.textB),
        disclaimer: DISCLAIMER,
      };
    },
  );

  app.post(
    '/api/qa',
    { config: { rateLimit: { max: 12, timeWindow: '1 minute' } } },
    async (request) => {
      const ownerId = deps.identity.ownerId(request);
      const body = QaRequestSchema.parse(request.body);
      const record = deps.documents.get(ownerId, body.documentId);
      if (!record) throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
      return {
        result: await deps.legal.answer(record.text, body.question),
        disclaimer: DISCLAIMER,
      };
    },
  );

  app.post(
    '/api/next-steps',
    { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } },
    async (request) => {
      const ownerId = deps.identity.ownerId(request);
      const body = NextStepsRequestSchema.parse(request.body);
      const record = deps.documents.get(ownerId, body.documentId);
      if (!record) throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
      return {
        checklist: await deps.legal.nextSteps(record.text, body.goal),
        disclaimer: DISCLAIMER,
      };
    },
  );
}
