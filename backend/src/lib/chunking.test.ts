import { describe, expect, it } from 'vitest';
import { chunkDocument } from './chunking.js';
describe('chunkDocument', () => {
  it('keeps headings as citation labels and obeys a budget', () => {
    const chunks = chunkDocument(
      'Section 1 Terms\n\n' + 'A sentence. '.repeat(20) + '\n\nSection 2 Fees\n\nPayment is due.',
      80,
    );
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.at(-1)?.section).toBe('Section 2 Fees');
    expect(chunks.every((c) => c.text.length <= 80)).toBe(true);
  });
});
