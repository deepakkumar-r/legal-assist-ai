import type { Analysis } from '@lexclarity/shared';

export interface DocumentRecord {
  id: string;
  ownerId: string;
  title: string;
  text: string;
  analysis: Analysis;
  createdAt: string;
}

/** Persistence boundary for encrypted source documents and their derived analysis. */
export interface DocumentRepository {
  save(ownerId: string, title: string, text: string, analysis: Analysis): DocumentRecord;
  get(ownerId: string, id: string): DocumentRecord | undefined;
  delete(ownerId: string, id: string): boolean;
}
