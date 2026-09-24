import type { FastifyInstance } from 'fastify';
import { DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import mammoth from 'mammoth';
import { AppError } from '../lib/errors.js';
import type { RouteDependencies } from './types.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

Object.assign(globalThis, { DOMMatrix, ImageData, Path2D });

const hasSignature = (buffer: Buffer, signature: string) =>
  buffer.subarray(0, signature.length).toString('binary') === signature;

const validateContent = (buffer: Buffer, mimetype: string) => {
  if (mimetype === 'application/pdf' && !hasSignature(buffer, '%PDF-')) {
    throw new AppError('INVALID_FILE_CONTENT', 'The uploaded file is not a valid PDF.', 415);
  }
  if (
    mimetype.includes('wordprocessingml') &&
    !['PK\x03\x04', 'PK\x05\x06', 'PK\x07\x08'].some((signature) => hasSignature(buffer, signature))
  ) {
    throw new AppError('INVALID_FILE_CONTENT', 'The uploaded file is not a valid DOCX.', 415);
  }
  if (mimetype === 'text/plain' && buffer.includes(0)) {
    throw new AppError('INVALID_FILE_CONTENT', 'The uploaded text file contains binary data.', 415);
  }
};

export function registerUploadRoutes(app: FastifyInstance, deps: RouteDependencies) {
  app.post('/api/extract', async (request) => {
    deps.identity.ownerId(request);
    const file = await request.file();
    if (!file) throw new AppError('FILE_REQUIRED', 'Choose a file to upload.');
    if (!ALLOWED.has(file.mimetype)) {
      throw new AppError('UNSUPPORTED_FILE', 'Only PDF, DOCX, and TXT files are accepted.', 415);
    }
    const buffer = await file.toBuffer();
    if (buffer.length > MAX_FILE_SIZE) {
      throw new AppError('FILE_TOO_LARGE', 'Files must be 10 MB or smaller.', 413);
    }
    validateContent(buffer, file.mimetype);
    const scan = await deps.scanner.scan(buffer, file.filename);
    if (!scan.safe) throw new AppError('MALWARE_REJECTED', scan.reason ?? 'Unsafe file.', 415);

    let text: string;
    if (file.mimetype === 'application/pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      try {
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else if (file.mimetype.includes('wordprocessingml')) {
      text = (await mammoth.extractRawText({ buffer })).value;
    } else {
      text = buffer.toString('utf8');
    }
    if (text.trim().length < 80)
      throw new AppError('NO_TEXT', 'No usable document text was found.');
    return { title: file.filename.replace(/\.[^.]+$/, ''), text };
  });
}
