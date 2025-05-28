import { defineConfig } from 'rolldown';

export default defineConfig({
  input: {
    index: 'src/index.ts',
    'ssr-safe': 'src/core/SSRSafeCircuitCanvas.tsx',
    'performance': 'src/utils/performanceUtils.tsx',
    'touch': 'src/utils/touchUtils.ts',
    'responsive': 'src/utils/responsiveUtils.ts',
    'ssr-utils': 'src/utils/ssrUtils.ts',
    'llm': 'src/llm/index.ts',
    'registry-server': 'src/registry/server.ts'
  },
  output: [
    {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].mjs',
      chunkFileNames: 'chunks/[name]-[hash].mjs',
      sourcemap: true,
      banner: (chunk) => {
        // Don't add "use client" to server-side modules
        return (chunk.name === 'llm' || chunk.name === 'registry-server') ? '' : '"use client";';
      }
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: '[name].cjs',
      chunkFileNames: 'chunks/[name]-[hash].cjs',
      sourcemap: true,
      exports: 'named',
      banner: (chunk) => {
        // Don't add "use client" to server-side modules
        return (chunk.name === 'llm' || chunk.name === 'registry-server') ? '' : '"use client";';
      }
    }
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  treeshake: {
    moduleSideEffects: false
  }
});
