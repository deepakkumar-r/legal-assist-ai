import { createCipheriv, createDecipheriv, randomBytes, createHash, randomUUID } from 'node:crypto';
import type { Analysis } from '@lexclarity/shared';
import type { DocumentRecord, DocumentRepository } from '../ports/documentRepository.js';

interface Stored {
  id: string;
  ownerId: string;
  title: string;
  iv: string;
  tag: string;
  ciphertext: string;
  analysis: Analysis;
  createdAt: string;
}
/** Minimal swappable encrypted repository; replace Map with a database adapter in production. */
export class EncryptedDocumentStore implements DocumentRepository {
  private readonly records = new Map<string, Stored>();
  constructor(private readonly key: Buffer) {
    if (key.length !== 32) throw new Error('Encryption key must be 32 bytes');
  }
  save(ownerId: string, title: string, text: string, analysis: Analysis): DocumentRecord {
    const id = randomUUID(),
      iv = randomBytes(12),
      cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const stored = {
      id,
      ownerId,
      title,
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
      analysis,
      createdAt: new Date().toISOString(),
    };
    this.records.set(id, stored);
    return { ...stored, text } as DocumentRecord;
  }
  get(ownerId: string, id: string): DocumentRecord | undefined {
    const item = this.records.get(id);
    if (!item || item.ownerId !== ownerId) return;
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(item.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(item.tag, 'base64'));
    const text = Buffer.concat([
      decipher.update(Buffer.from(item.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
    return {
      id: item.id,
      ownerId: item.ownerId,
      title: item.title,
      text,
      analysis: item.analysis,
      createdAt: item.createdAt,
    };
  }
  delete(ownerId: string, id: string) {
    const item = this.records.get(id);
    if (!item || item.ownerId !== ownerId) return false;
    return this.records.delete(id);
  }
}
export const contentHash = (...values: string[]) =>
  createHash('sha256').update(values.join('\u0000')).digest('hex');
