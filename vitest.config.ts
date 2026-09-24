import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    testTimeout: 15000,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'backend/src/lib/chunking.ts',
        'backend/src/lib/cryptoStore.ts',
        'backend/src/lib/prompts.ts',
        'backend/src/ports/cache.ts',
        'backend/src/ports/identity.ts',
        'backend/src/ports/malwareScanner.ts',
        'backend/src/services/legal.ts',
      ],
      thresholds: { lines: 100, statements: 100, functions: 100, branches: 90 },
    },
  },
});
