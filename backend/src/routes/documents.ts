import type { FastifyInstance } from 'fastify';
import { DISCLAIMER } from '@lexclarity/shared';
import { AppError } from '../lib/errors.js';
import type { DocumentRecord } from '../ports/documentRepository.js';
import type { RouteDependencies } from './types.js';

const markdown = (record: DocumentRecord) => `# ${record.title}

> ${DISCLAIMER}

## Overview

${record.analysis.overview}

## Plain-language summary

${record.analysis.sections.map((section) => `### ${section.heading}\n\n${section.summary}\n\n_Source: ${section.source.section} — “${section.source.excerpt}”_`).join('\n\n')}

## Clauses and risks

${record.analysis.clauses.map((clause) => `- **${clause.title} — ${clause.risk.toUpperCase()}** (${clause.category}): ${clause.plainLanguage} ${clause.reason}`).join('\n')}
`;

const handoffHtml = (record: DocumentRecord) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Attorney intake brief</title><style>body{font:16px/1.6 system-ui;max-width:800px;margin:40px auto;padding:0 24px;color:#182b2a}h1,h2{font-family:Georgia,serif}aside{background:#fff8e8;border-left:4px solid #b6782d;padding:12px}article{border-top:1px solid #ddd;padding:12px 0}@media print{button{display:none}}</style></head><body><button onclick="window.print()">Save as PDF</button><h1>Attorney intake brief</h1><p><strong>Document:</strong> ${escapeHtml(record.title)}</p><aside>${DISCLAIMER}</aside><h2>Situation summary</h2><p>${escapeHtml(record.analysis.overview)}</p><h2>Terms worth discussing</h2>${record.analysis.clauses
    .filter((clause) => clause.risk !== 'low')
    .map(
      (clause) =>
        `<article><strong>${escapeHtml(clause.title)} — ${clause.risk}</strong><p>${escapeHtml(clause.plainLanguage)}</p><blockquote>“${escapeHtml(clause.source.excerpt)}” — ${escapeHtml(clause.source.section)}</blockquote></article>`,
    )
    .join('')}<h2>Questions for counsel</h2><ul>${record.analysis.clauses
    .filter((clause) => clause.risk === 'high')
    .map(
      (clause) =>
        `<li>What are the practical implications of “${escapeHtml(clause.title)}” in my jurisdiction?</li>`,
    )
    .join('')}</ul></body></html>`;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ??
      character,
  );

export async function registerDocumentRoutes(app: FastifyInstance, deps: RouteDependencies) {
  app.get<{ Params: { id: string } }>('/api/documents/:id/export.md', async (request, reply) => {
    const record = deps.documents.get(deps.identity.ownerId(request), request.params.id);
    if (!record) throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
    return reply
      .header('content-type', 'text/markdown; charset=utf-8')
      .header('content-disposition', `attachment; filename="lexclarity-${record.id}.md"`)
      .send(markdown(record));
  });

  app.get<{ Params: { id: string } }>('/api/documents/:id/handoff', async (request, reply) => {
    const record = deps.documents.get(deps.identity.ownerId(request), request.params.id);
    if (!record) throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
    return reply.header('content-type', 'text/html; charset=utf-8').send(handoffHtml(record));
  });

  app.delete<{ Params: { id: string } }>('/api/documents/:id', async (request, reply) => {
    if (!deps.documents.delete(deps.identity.ownerId(request), request.params.id)) {
      throw new AppError('DOCUMENT_NOT_FOUND', 'Document not found.', 404);
    }
    return reply.status(204).send();
  });
}
