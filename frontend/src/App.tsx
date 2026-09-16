import { useRef, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  FileCheck2,
  FileText,
  Gavel,
  Languages,
  Lock,
  MessageCircle,
  Scale,
  Sparkles,
  Upload,
  Columns2,
} from 'lucide-react';
import type { Analysis, Checklist, Comparison, QaAnswer } from '@lexclarity/shared';
import { api } from './api';
import { AnalysisView, ComparisonView } from './features/results';
import { useAsyncTask } from './hooks/useAsyncTask';
import { SAMPLE_LEASE } from './sample';
import { Disclaimer, EmptyState, Loading } from './components';

type View = 'analyze' | 'compare';
export function App() {
  const [view, setView] = useState<View>('analyze');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [level, setLevel] = useState<'simple' | 'detailed'>('simple');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [documentId, setDocumentId] = useState('');
  const { busy, error, run } = useAsyncTask();
  const fileRef = useRef<HTMLInputElement>(null);
  const [textB, setTextB] = useState('');
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<QaAnswer | null>(null);
  const [goal, setGoal] = useState('');
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const choose = async (file: File) =>
    run(
      'Reading your document…',
      () => api.extract(file),
      (v) => {
        setTitle(v.title);
        setText(v.text);
      },
    );
  const analyze = () =>
    run(
      'Analyzing clauses and risks…',
      () =>
        api.analyze({ title: title || 'Untitled document', text, readingLevel: level, language }),
      (v) => {
        setAnalysis(v.analysis);
        setDocumentId(v.documentId);
      },
    );
  const compare = () =>
    run(
      'Comparing both documents…',
      () =>
        api.compare({ titleA: title || 'Document A', textA: text, titleB: 'Document B', textB }),
      (v) => setComparison(v.comparison),
    );
  return (
    <div className="app-shell">
      <header>
        <a className="brand" href="#top" aria-label="LexClarity home">
          <span className="brand-mark">
            <Scale size={22} />
          </span>
          <span>
            LexClarity<small>Understand before you sign.</small>
          </span>
        </a>
        <nav aria-label="Primary">
          <a href="#workspace">Workspace</a>
          <a href="#trust">How it works</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Change output language"
            onClick={() => setLanguage((v) => (v === 'en' ? 'es' : 'en'))}
          >
            <Languages />
            <span>{language.toUpperCase()}</span>
          </button>
          <span className="secure">
            <Lock size={14} /> Private by design
          </span>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div>
            <span className="kicker">
              <Sparkles size={15} /> AI clarity for everyday agreements
            </span>
            <h1>
              Legal language,
              <br />
              <em>made human.</em>
            </h1>
            <p>
              Understand what a document says, spot terms worth a closer look, and prepare better
              questions for a lawyer.
            </p>
            <div className="trust-row">
              <span>
                <FileCheck2 />
                Grounded in your document
              </span>
              <span>
                <Lock />
                Encrypted at rest
              </span>
              <span>
                <Gavel />
                Not legal advice
              </span>
            </div>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="paper">
              <small>RESIDENTIAL LEASE</small>
              <span className="line w80" />
              <span className="line" />
              <mark>Automatic renewal — 60 days’ notice</mark>
              <span className="line w65" />
              <span className="line" />
            </div>
            <div className="insight">
              <Sparkles size={18} />
              <div>
                <strong>Worth a closer look</strong>
                <span>This term could renew your lease if you miss the notice window.</span>
              </div>
            </div>
          </div>
        </section>
        <section className="workspace" id="workspace">
          <div className="workspace-head">
            <div>
              <span className="eyebrow">Your private workspace</span>
              <h2>What would you like to understand?</h2>
            </div>
            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={view === 'analyze'}
                onClick={() => setView('analyze')}
              >
                <BookOpen />
                Analyze
              </button>
              <button
                role="tab"
                aria-selected={view === 'compare'}
                onClick={() => setView('compare')}
              >
                <Columns2 />
                Compare
              </button>
            </div>
          </div>
          <Disclaimer />
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <div className="workspace-grid">
            <section className="input-panel" aria-label="Document input">
              <div className="panel-title">
                <span>01</span>
                <div>
                  <h3>{view === 'analyze' ? 'Add your document' : 'Add document A'}</h3>
                  <p>PDF, DOCX, TXT, or paste text</p>
                </div>
              </div>
              <button className="dropzone" onClick={() => fileRef.current?.click()}>
                <Upload />
                <strong>Choose a file</strong>
                <span>Up to 10 MB · never used to train models</span>
              </button>
              <input
                ref={fileRef}
                className="sr-only"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void choose(file);
                }}
              />
              <div className="or">
                <span>or paste text</span>
              </div>
              <label>
                Document title
                <input
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apartment lease"
                />
              </label>
              <label>
                Document text
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your agreement here…"
                  rows={view === 'compare' ? 8 : 12}
                />
              </label>
              {!text && (
                <button
                  className="sample"
                  onClick={() => {
                    setTitle('Sample residential lease');
                    setText(SAMPLE_LEASE);
                  }}
                >
                  Try a sample lease <ChevronRight />
                </button>
              )}
              {view === 'compare' && (
                <>
                  <div className="panel-title second">
                    <span>02</span>
                    <div>
                      <h3>Add document B</h3>
                      <p>The revised version or alternative</p>
                    </div>
                  </div>
                  <label>
                    Second document
                    <textarea
                      value={textB}
                      onChange={(e) => setTextB(e.target.value)}
                      placeholder="Paste the second agreement…"
                      rows={8}
                    />
                  </label>
                </>
              )}
              {view === 'analyze' && (
                <fieldset>
                  <legend>Explanation style</legend>
                  <div className="segmented">
                    <button aria-pressed={level === 'simple'} onClick={() => setLevel('simple')}>
                      New to this
                    </button>
                    <button
                      aria-pressed={level === 'detailed'}
                      onClick={() => setLevel('detailed')}
                    >
                      Detailed
                    </button>
                  </div>
                </fieldset>
              )}
              <button
                className="primary"
                disabled={
                  busy !== '' || text.length < 80 || (view === 'compare' && textB.length < 80)
                }
                onClick={view === 'analyze' ? analyze : compare}
              >
                <Sparkles />
                {view === 'analyze' ? 'Make this clear' : 'Compare documents'}
                <ChevronRight />
              </button>
            </section>
            <section className="results-panel" aria-label="Analysis results">
              {busy ? (
                <Loading label={busy} step={busy.startsWith('Reading') ? 1 : 3} />
              ) : view === 'analyze' ? (
                analysis ? (
                  <AnalysisView
                    analysis={analysis}
                    documentId={documentId}
                    question={question}
                    setQuestion={setQuestion}
                    answer={answer}
                    ask={() =>
                      run(
                        'Finding an answer in your document…',
                        () => api.ask({ documentId, question }),
                        (v) => setAnswer(v.result),
                      )
                    }
                    goal={goal}
                    setGoal={setGoal}
                    checklist={checklist}
                    next={() =>
                      run(
                        'Preparing general next steps…',
                        () => api.nextSteps({ documentId, goal }),
                        (v) => setChecklist(v.checklist),
                      )
                    }
                  />
                ) : (
                  <EmptyState
                    icon={<FileText />}
                    eyebrow="Ready when you are"
                    title="Clarity starts here"
                  >
                    Add a document and LexClarity will organize the key terms, explain them plainly,
                    and show exactly where each insight came from.
                  </EmptyState>
                )
              ) : comparison ? (
                <ComparisonView value={comparison} />
              ) : (
                <EmptyState icon={<Columns2 />} eyebrow="Side by side" title="See what changed">
                  Add two versions to surface material differences, missing terms, and areas worth
                  reviewing.
                </EmptyState>
              )}
            </section>
          </div>
        </section>
        <section className="how" id="trust">
          <span className="eyebrow">Built for informed decisions</span>
          <h2>AI support with responsible boundaries.</h2>
          <div>
            <article>
              <span>01</span>
              <Lock />
              <h3>Your text stays protected</h3>
              <p>Documents are encrypted at rest and can be permanently deleted.</p>
            </article>
            <article>
              <span>02</span>
              <MessageCircle />
              <h3>Every answer shows its source</h3>
              <p>Grounded excerpts make it easy to verify the original language.</p>
            </article>
            <article>
              <span>03</span>
              <Gavel />
              <h3>A bridge to professional help</h3>
              <p>Generate a concise intake brief and questions for a licensed attorney.</p>
            </article>
          </div>
        </section>
      </main>
      <footer>
        <div className="brand">
          <span className="brand-mark">
            <Scale size={18} />
          </span>
          <span>LexClarity</span>
        </div>
        <p>
          Information, not representation. Always verify important decisions with a qualified
          professional.
        </p>
      </footer>
    </div>
  );
}
