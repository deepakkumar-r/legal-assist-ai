import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { DISCLAIMER } from '@lexclarity/shared';

export function Disclaimer() {
  return (
    <aside className="disclaimer" aria-label="Legal information notice">
      <Info aria-hidden="true" size={18} />
      <span>
        <strong>Important:</strong> {DISCLAIMER}
      </span>
    </aside>
  );
}
export function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const Icon = risk === 'high' ? ShieldAlert : risk === 'medium' ? AlertTriangle : CheckCircle2;
  return (
    <span className={`risk risk-${risk}`}>
      <Icon size={14} aria-hidden="true" />
      {risk} risk
    </span>
  );
}
export function EmptyState({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Loading({ label, step = 2 }: { label: string; step?: number }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <span>{label}</span>
      <div className="progress">
        <i style={{ width: `${step * 25}%` }} />
      </div>
      <small>Step {step} of 4 · Your document stays private</small>
    </div>
  );
}
