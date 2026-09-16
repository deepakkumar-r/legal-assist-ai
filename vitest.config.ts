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
        'backend/src/services/legal.ts',
      ],
      thresholds: { lines: 80, statements: 80 },
    },
  },
});
