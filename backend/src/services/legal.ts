import { z } from 'zod';
import {
  AnalysisSchema,
  ChecklistSchema,
  ComparisonSchema,
  QaSchema,
  type Analysis,
  type Checklist,
  type Comparison,
  type QaAnswer,
} from '@lexclarity/shared';
import { chunkDocument, type Chunk } from '../lib/chunking.js';
import { contentHash } from '../lib/cryptoStore.js';
import { evidence, SYSTEM_INSTRUCTION } from '../lib/prompts.js';
import type { LLMClient } from './llm.js';
import type { CacheStore } from '../ports/cache.js';
import { MemoryCache } from '../ports/cache.js';

const jsonSchema = (schema: z.ZodType) => z.toJSONSchema(schema);
const cosine = (a: number[], b: number[]) => {
  const dot = a.reduce((n, v, i) => n + v * (b[i] ?? 0), 0);
  const na = Math.sqrt(a.reduce((n, v) => n + v * v, 0));
  const nb = Math.sqrt(b.reduce((n, v) => n + v * v, 0));
  return na && nb ? dot / (na * nb) : 0;
};

export class LegalService {
  constructor(
    private readonly llm: LLMClient,
    private readonly cache: CacheStore = new MemoryCache(),
  ) {}
  async analyze(
    text: string,
    readingLevel: 'simple' | 'detailed',
    language: 'en' | 'es',
  ): Promise<Analysis> {
    const key = contentHash('analyze', text, readingLevel, language);
    const hit = this.cache.get<Analysis>(key);
    if (hit) return hit as Analysis;
    const prompt = `Analyze the legal document. Create section summaries and classify meaningful clauses with risks. Reading level: ${readingLevel}. Output language: ${language}. Risk reasons must be cautious and informational. ${evidence('document', text)}`;
    const output = AnalysisSchema.parse(
      await this.llm.generateStructured(
        prompt,
        'reasoning',
        SYSTEM_INSTRUCTION,
        jsonSchema(AnalysisSchema),
      ),
    );
    this.cache.set(key, output);
    return output;
  }
  async compare(a: string, b: string): Promise<Comparison> {
    const prompt = `Compare A and B. Identify changed, missing, and unusual terms; assess materiality without advising. ${evidence('document_a', a)} ${evidence('document_b', b)}`;
    return ComparisonSchema.parse(
      await this.llm.generateStructured(
        prompt,
        'reasoning',
        SYSTEM_INSTRUCTION,
        jsonSchema(ComparisonSchema),
      ),
    );
  }
  async answer(text: string, question: string): Promise<QaAnswer> {
    const key = contentHash('qa', text, question);
    const hit = this.cache.get<QaAnswer>(key);
    if (hit) return hit as QaAnswer;
    const chunks = chunkDocument(text);
    const vectors = await this.llm.embed([...chunks.map((c) => c.text), question]);
    const q = vectors.at(-1) ?? [];
    const ranked = chunks
      .map((chunk, i) => ({ chunk, score: cosine(vectors[i] ?? [], q) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 5)
      .map((x) => x.chunk);
    const prompt = `Answer the question only from the retrieved evidence. found=false and explicitly say not found when evidence is insufficient. Include exact citations. ${evidence('question', question)} ${ranked.map((c) => evidence(`chunk_${c.id}`, `Section: ${c.section}\n${c.text}`)).join('\n')}`;
    const output = QaSchema.parse(
      await this.llm.generateStructured(
        prompt,
        'reasoning',
        SYSTEM_INSTRUCTION,
        jsonSchema(QaSchema),
      ),
    );
    this.cache.set(key, output);
    return output;
  }
  async nextSteps(text: string, goal: string): Promise<Checklist> {
    const chunks = chunkDocument(text).slice(0, 12);
    const prompt = `Provide general options, typical next steps, and questions for a licensed attorney for the user's goal. Do not direct the user or assume jurisdiction. ${evidence('goal', goal)} ${evidence('document', chunks.map((c: Chunk) => `${c.section}: ${c.text}`).join('\n'))}`;
    return ChecklistSchema.parse(
      await this.llm.generateStructured(
        prompt,
        'fast',
        SYSTEM_INSTRUCTION,
        jsonSchema(ChecklistSchema),
      ),
    );
  }
  async translateAnalysis(analysis: Analysis, language: 'en' | 'es'): Promise<Analysis> {
    if (language === 'en') return analysis;
    const prompt = `Translate all human-readable strings in this JSON to ${language}; preserve ids, category enums, risk enums, and structure. ${evidence('json', JSON.stringify(analysis))}`;
    return AnalysisSchema.parse(
      await this.llm.generateStructured(
        prompt,
        'fast',
        SYSTEM_INSTRUCTION,
        jsonSchema(AnalysisSchema),
      ),
    );
  }
}
