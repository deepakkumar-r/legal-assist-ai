import { ChevronRight, Gavel, MessageCircle } from 'lucide-react';
import type { Analysis, Checklist, Comparison, QaAnswer } from '@lexclarity/shared';
import { RiskBadge } from '../components';
import { apiUrl } from '../api';

export function AnalysisView({
  analysis,
  documentId,
  question,
  setQuestion,
  answer,
  ask,
  goal,
  setGoal,
  checklist,
  next,
}: {
  analysis: Analysis;
  documentId: string;
  question: string;
  setQuestion: (v: string) => void;
  answer: QaAnswer | null;
  ask: () => void;
  goal: string;
  setGoal: (v: string) => void;
  checklist: Checklist | null;
  next: () => void;
}) {
  return (
    <div className="results">
      <div className="result-top">
        <div>
          <span className="eyebrow">Analysis complete</span>
          <h2>{analysis.documentType}</h2>
        </div>
        <div className="export-actions">
          <button className="export" onClick={() => window.print()}>
            Save PDF
          </button>
          <a className="export" href={apiUrl(`/api/documents/${documentId}/export.md`)} download>
            Export .md
          </a>
        </div>
      </div>
      <p className="overview">{analysis.overview}</p>
      <h3>Plain-language summary</h3>
      {analysis.sections.map((s, i) => (
        <article className="summary-card" key={i}>
          <span>{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h4>{s.heading}</h4>
            <p>{s.summary}</p>
            <details>
              <summary>View source</summary>
              <blockquote>{s.source.excerpt}</blockquote>
            </details>
          </div>
        </article>
      ))}
      <div className="result-heading">
        <h3>Clauses worth reviewing</h3>
        <span>{analysis.clauses.length} found</span>
      </div>
      <div className="clauses">
        {analysis.clauses.map((c) => (
          <article key={c.id}>
            <div>
              <span className="category">{c.category}</span>
              <RiskBadge risk={c.risk} />
            </div>
            <h4>{c.title}</h4>
            <p>{c.plainLanguage}</p>
            <small>{c.reason}</small>
          </article>
        ))}
      </div>
      <div className="tool-card">
        <h3>
          <MessageCircle /> Ask this document
        </h3>
        <div className="inline">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Can I end this early?"
          />
          <button disabled={question.length < 3} onClick={ask}>
            Ask
          </button>
        </div>
        {answer && (
          <div className="answer" aria-live="polite">
            <strong>{answer.found ? 'Grounded answer' : 'Not found in document'}</strong>
            <p>{answer.answer}</p>
            {answer.sources.map((s, i) => (
              <blockquote key={i}>
                “{s.excerpt}” — {s.section}
              </blockquote>
            ))}
          </div>
        )}
      </div>
      <div className="tool-card">
        <h3>
          <Gavel /> Prepare next steps
        </h3>
        <div className="inline">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What are you trying to do?"
          />
          <button disabled={goal.length < 5} onClick={next}>
            Guide me
          </button>
        </div>
        {checklist && (
          <div className="checklist">
            <h4>General options</h4>
            <ul>
              {checklist.options.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <h4>Questions for an attorney</h4>
            <ul>
              {checklist.attorneyQuestions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <a
        className="handoff"
        href={apiUrl(`/api/documents/${documentId}/handoff`)}
        target="_blank"
        rel="noreferrer"
      >
        <Gavel />
        Create attorney handoff brief
        <ChevronRight />
      </a>
    </div>
  );
}
export function ComparisonView({ value }: { value: Comparison }) {
  return (
    <div className="results">
      <span className="eyebrow">Comparison complete</span>
      <h2>What changed</h2>
      <p className="overview">{value.overview}</p>
      {value.items.map((x, i) => (
        <article className="diff" key={i}>
          <div>
            <h3>{x.topic}</h3>
            <RiskBadge risk={x.materiality} />
          </div>
          <div className="diff-cols">
            <p>
              <small>Document A</small>
              {x.documentA}
            </p>
            <p>
              <small>Document B</small>
              {x.documentB}
            </p>
          </div>
          <strong>{x.change}</strong>
          <span>{x.reason}</span>
        </article>
      ))}
    </div>
  );
}
