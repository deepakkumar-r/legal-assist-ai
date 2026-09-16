import type { Analysis, Checklist, Comparison, QaAnswer } from '@lexclarity/shared';
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: { 'content-type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message ?? 'Something went wrong. Please try again.');
  }
  return response.json() as Promise<T>;
};
export const api = {
  analyze: (body: unknown) =>
    request<{ documentId: string; analysis: Analysis }>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  compare: (body: unknown) =>
    request<{ comparison: Comparison }>('/api/compare', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  ask: (body: unknown) =>
    request<{ result: QaAnswer }>('/api/qa', { method: 'POST', body: JSON.stringify(body) }),
  nextSteps: (body: unknown) =>
    request<{ checklist: Checklist }>('/api/next-steps', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  extract: async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    const response = await fetch('/api/extract', { method: 'POST', body: data });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string };
      } | null;
      throw new Error(
        body?.error?.message ?? 'We could not read that file. Use a PDF, DOCX, or TXT under 10 MB.',
      );
    }
    return response.json() as Promise<{ title: string; text: string }>;
  },
};
