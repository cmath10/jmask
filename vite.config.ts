import { defineConfig } from 'vite'
import path from 'node:path'

import dts from 'vite-plugin-dts'

import common from './vite.config.common'
import manifest from './package.json'

export default defineConfig({
  ...common,

  build: {
    lib: {
      name: manifest.name,
      formats: ['es', 'cjs'],
      entry: path.resolve(__dirname, './src/JMask.ts'),
      fileName: format => `jmask.${{
        es: 'mjs',
        cjs: 'cjs',
      }[format]}`,
    },
    minify: false,
  },

  plugins: [
    dts({ rollupTypes: true }),
  ],
})
