import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/utils/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 80,
        lines: 70,
      },
    },
  },
});
