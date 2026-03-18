import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import common from '../vite.config.common'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  ...common,

  build: {
    rollupOptions: {
      input: {
        index: path.resolve(dirname, 'index.html'),
      },
    },
  },
})
