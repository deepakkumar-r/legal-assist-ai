import { GoogleGenAI } from '@google/genai';
import type { Config } from '../config.js';
import { AppError } from '../lib/errors.js';

export type ModelTier = 'reasoning' | 'fast';
export interface LLMClient {
  generate(prompt: string, tier: ModelTier, system: string): Promise<string>;
  generateStructured<T>(
    prompt: string,
    tier: ModelTier,
    system: string,
    schema: unknown,
  ): Promise<T>;
  embed(texts: string[]): Promise<number[][]>;
}

export class GeminiLLMClient implements LLMClient {
  private readonly ai: GoogleGenAI;
  constructor(private readonly config: Config) {
    if (!config.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');
    this.ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }
  private model(tier: ModelTier) {
    return tier === 'reasoning'
      ? this.config.GEMINI_REASONING_MODEL
      : this.config.GEMINI_FAST_MODEL;
  }

  private status(error: unknown): number | undefined {
    return typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status: unknown }).status)
      : undefined;
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const status = this.status(error);
        const hasNoQuota = this.message(error).includes('limit: 0');
        if ((status !== 429 && status !== 503) || hasNoQuota || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 750 * 2 ** attempt));
      }
    }
    throw lastError;
  }

  private providerError(error: unknown): AppError {
    const status = this.status(error);
    if (status === 429) {
      return new AppError(
        'AI_QUOTA_EXCEEDED',
        'Gemini quota is unavailable for this API project. Enable billing or choose a model with available quota, then try again.',
        429,
      );
    }
    if (status === 503) {
      return new AppError(
        'AI_TEMPORARILY_UNAVAILABLE',
        'Gemini is temporarily at capacity. Please wait a moment and try again.',
        503,
      );
    }
    return new AppError('AI_PROVIDER_ERROR', 'Gemini could not complete the analysis.', 502);
  }
  async generate(prompt: string, tier: ModelTier, system: string) {
    try {
      const response = await this.retry(() =>
        this.ai.models.generateContent({
          model: this.model(tier),
          contents: prompt,
          config: { systemInstruction: system, temperature: 0.2 },
        }),
      );
      return response.text ?? '';
    } catch (error) {
      throw this.providerError(error);
    }
  }
  async generateStructured<T>(prompt: string, tier: ModelTier, system: string, schema: unknown) {
    const request = (model: string) =>
      this.retry(() =>
        this.ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: system,
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseJsonSchema: schema as Record<string, unknown>,
          },
        }),
      );
    let response;
    try {
      response = await request(this.model(tier));
    } catch (error) {
      if (tier !== 'reasoning' || ![429, 503].includes(this.status(error) ?? 0)) {
        throw this.providerError(error);
      }
      try {
        response = await request(this.config.GEMINI_FAST_MODEL);
      } catch (fallbackError) {
        throw this.providerError(fallbackError);
      }
    }
    if (!response.text) throw new Error('Gemini returned no content');
    return JSON.parse(response.text) as T;
  }
  async embed(texts: string[]) {
    const rows: number[][] = [];
    for (const text of texts) {
      let response;
      try {
        response = await this.retry(() =>
          this.ai.models.embedContent({
            model: this.config.GEMINI_EMBEDDING_MODEL,
            contents: text,
            config: { outputDimensionality: 768 },
          }),
        );
      } catch (error) {
        throw this.providerError(error);
      }
      rows.push(response.embeddings?.[0]?.values ?? []);
    }
    return rows;
  }
}
