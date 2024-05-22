import { defineConfig } from 'vite'
import path from 'node:path'

import common from '../vite.config.common'

export default defineConfig({
  ...common,

  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})
