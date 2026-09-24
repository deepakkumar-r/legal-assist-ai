import { describe, expect, it } from 'vitest';
import { EncryptedDocumentStore } from './cryptoStore.js';
const analysis = { documentType: 'NDA', overview: 'Overview', sections: [], clauses: [] };
describe('EncryptedDocumentStore', () => {
  it('requires an AES-256 key', () => {
    expect(() => new EncryptedDocumentStore(Buffer.alloc(16))).toThrow('32 bytes');
  });

  it('round trips and permanently deletes encrypted records', () => {
    const store = new EncryptedDocumentStore(Buffer.alloc(32, 7));
    const saved = store.save('owner-a', 'Test', 'secret text', analysis);
    expect(store.get('owner-a', saved.id)?.text).toBe('secret text');
    expect(store.get('owner-b', saved.id)).toBeUndefined();
    expect(store.delete('owner-b', saved.id)).toBe(false);
    expect(store.delete('owner-a', saved.id)).toBe(true);
    expect(store.get('owner-a', saved.id)).toBeUndefined();
  });
});
