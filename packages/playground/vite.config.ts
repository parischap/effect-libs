/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  "build": {
    "outDir": "${prodFolderName}",
    "minify": "esbuild",
    "ssr": "./esm.index.ts"
  },
  "ssr": {
    "noExternal": true
  }
});