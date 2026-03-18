import { defineConfig } from 'vitest/config'

import { getCoverageConfig } from './vitest.coverage'
import common from './vite.config.common'

export default defineConfig({
  ...common,
  test: {
    coverage: getCoverageConfig('unit'),
    exclude: ['tests/**/*.e2e.ts'],
    include: ['tests/**/*.test.ts'],
  },
})
