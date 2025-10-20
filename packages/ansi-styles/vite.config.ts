/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['./tests/*.test.ts'],
    isolate: false,
    fileParallelism: false,
    pool: 'threads',
  },
});
