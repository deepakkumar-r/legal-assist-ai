import type { LLMClient, ModelTier } from './llm.js';

/** Synthetic development provider. It demonstrates flows but is never described as legal analysis. */
export class DemoLLMClient implements LLMClient {
  async generate() {
    return 'Demo response';
  }
  async embed(texts: string[]) {
    return texts.map((text) =>
      Array.from(
        { length: 24 },
        (_, i) => ((text.charCodeAt(i % Math.max(1, text.length)) || 0) % 31) / 31,
      ),
    );
  }
  async generateStructured<T>(prompt: string, tier: ModelTier, system: string): Promise<T> {
    void tier;
    void system;
    if (prompt.startsWith('Analyze'))
      return {
        documentType: 'Agreement (demo)',
        overview: 'Demo analysis: connect Gemini for document-specific legal reasoning.',
        sections: [
          {
            heading: 'Document overview',
            summary: 'The document contains contractual terms that should be reviewed carefully.',
            source: {
              section: 'Document',
              excerpt: 'Demo mode does not quote uploaded private text.',
            },
          },
        ],
        clauses: [
          {
            id: 'demo-1',
            title: 'Important term',
            category: 'Obligations',
            risk: 'medium',
            reason: 'Demo classification only; enable Gemini for a grounded assessment.',
            plainLanguage: 'This section may describe something a party must do.',
            source: { section: 'Document', excerpt: 'Demo mode' },
          },
        ],
      } as T satisfies T;
    if (prompt.startsWith('Compare'))
      return {
        overview: 'Demo comparison; connect Gemini for grounded differences.',
        items: [
          {
            topic: 'Terms',
            documentA: 'Version A',
            documentB: 'Version B',
            change: 'Potential variation detected in demo mode.',
            materiality: 'medium',
            reason: 'Requires Gemini analysis.',
          },
        ],
      } as T satisfies T;
    if (prompt.startsWith('Answer'))
      return {
        answer: 'This cannot be established in demo mode. Connect Gemini for a grounded answer.',
        found: false,
        sources: [],
      } as T satisfies T;
    return {
      options: ['Review the relevant clauses with a licensed attorney.'],
      nextSteps: ['Collect the signed document and related correspondence.'],
      attorneyQuestions: ['What options might apply in my jurisdiction?'],
    } as T satisfies T;
  }
}
