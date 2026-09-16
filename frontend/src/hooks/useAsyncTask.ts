import { useCallback, useState } from 'react';

export function useAsyncTask() {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const run = useCallback(
    async <T>(label: string, work: () => Promise<T>, done: (value: T) => void) => {
      setBusy(label);
      setError('');
      try {
        done(await work());
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Unexpected error');
      } finally {
        setBusy('');
      }
    },
    [],
  );

  return { busy, error, run };
}
