export interface Chunk {
  id: string;
  section: string;
  page?: number;
  text: string;
}

/** Splits on paragraph boundaries while retaining source labels for citations. */
export function chunkDocument(text: string, maxChars = 2400): Chunk[] {
  const paragraphs = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: Chunk[] = [];
  let current = '';
  let section = 'Document';
  const flush = () => {
    if (current) {
      chunks.push({ id: `chunk-${chunks.length + 1}`, section, text: current.trim() });
      current = '';
    }
  };
  for (const paragraph of paragraphs) {
    const heading =
      paragraph.length < 100 && /^(section|article|clause|\d+[.)])\s/i.test(paragraph);
    if (heading) {
      flush();
      section = paragraph.slice(0, 100);
    }
    if (current && current.length + paragraph.length + 2 > maxChars) flush();
    if (paragraph.length > maxChars) {
      flush();
      for (let i = 0; i < paragraph.length; i += maxChars)
        chunks.push({
          id: `chunk-${chunks.length + 1}`,
          section,
          text: paragraph.slice(i, i + maxChars),
        });
    } else current += `${current ? '\n\n' : ''}${paragraph}`;
  }
  flush();
  return chunks;
}
