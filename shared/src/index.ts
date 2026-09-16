import { z } from 'zod';

export const DISCLAIMER =
  'This is general information, not legal advice. Consult a licensed attorney for advice about your specific situation.';
export const RiskLevel = z.enum(['low', 'medium', 'high']);
export const ClauseCategory = z.enum([
  'Obligations',
  'Rights',
  'Financial Terms',
  'Termination',
  'Liability/Indemnity',
  'Auto-Renewal',
  'Dispute Resolution/Arbitration',
  'Data & Privacy',
]);
export const SourceSchema = z.object({
  section: z.string(),
  page: z.number().int().positive().optional(),
  excerpt: z.string().min(1),
});
export const ClauseSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: ClauseCategory,
  risk: RiskLevel,
  reason: z.string(),
  plainLanguage: z.string(),
  source: SourceSchema,
});
export const SummarySectionSchema = z.object({
  heading: z.string(),
  summary: z.string(),
  source: SourceSchema,
});
export const AnalysisSchema = z.object({
  documentType: z.string(),
  overview: z.string(),
  sections: z.array(SummarySectionSchema),
  clauses: z.array(ClauseSchema),
});
export const ComparisonSchema = z.object({
  items: z.array(
    z.object({
      topic: z.string(),
      documentA: z.string(),
      documentB: z.string(),
      change: z.string(),
      materiality: RiskLevel,
      reason: z.string(),
    }),
  ),
  overview: z.string(),
});
export const QaSchema = z.object({
  answer: z.string(),
  found: z.boolean(),
  sources: z.array(SourceSchema),
});
export const ChecklistSchema = z.object({
  options: z.array(z.string()),
  nextSteps: z.array(z.string()),
  attorneyQuestions: z.array(z.string()),
});
export const AnalyzeRequestSchema = z.object({
  title: z.string().trim().min(1).max(120),
  text: z.string().min(80).max(500_000),
  readingLevel: z.enum(['simple', 'detailed']).default('simple'),
  language: z.enum(['en', 'es']).default('en'),
});
export const CompareRequestSchema = z.object({
  titleA: z.string().min(1).max(120),
  textA: z.string().min(80).max(500_000),
  titleB: z.string().min(1).max(120),
  textB: z.string().min(80).max(500_000),
});
export const QaRequestSchema = z.object({
  documentId: z.string().uuid(),
  question: z.string().trim().min(3).max(1000),
});
export const NextStepsRequestSchema = z.object({
  documentId: z.string().uuid(),
  goal: z.string().trim().min(5).max(1000),
});
export type Analysis = z.infer<typeof AnalysisSchema>;
export type Comparison = z.infer<typeof ComparisonSchema>;
export type QaAnswer = z.infer<typeof QaSchema>;
export type Checklist = z.infer<typeof ChecklistSchema>;
