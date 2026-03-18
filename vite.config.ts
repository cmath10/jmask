import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dts from 'vite-plugin-dts'

import common from './vite.config.common'
import manifest from './package.json'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  ...common,

  build: {
    lib: {
      name: manifest.name,
      formats: ['es', 'cjs'],
      entry: path.resolve(dirname, './src/JMask.ts'),
      fileName: format => `jmask.${{
        es: 'mjs',
        cjs: 'cjs',
      }[format as 'es' | 'cjs'] ?? 'js'}`,
    },
    minify: false,
  },

  plugins: [
    dts({ rollupTypes: true }),
  ],
})
