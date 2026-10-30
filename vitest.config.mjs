import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Tests load source directly without the development server's private-file rules.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.{js,jsx}'],
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
  },
});
