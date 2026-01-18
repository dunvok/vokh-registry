import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  outputOptions: {
    entryFileNames: '[name].js',
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
  logLevel: 'info',
  format: ['esm'],
  platform: 'node',
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  minify: true,
  unbundle: false,
  skipNodeModulesBundle: false,
});
