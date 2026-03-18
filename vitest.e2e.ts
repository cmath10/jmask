import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

import { getCoverageConfig } from './vitest.coverage'
import common from './vite.config.common'

export default defineConfig({
  ...common,
  test: {
    coverage: getCoverageConfig('e2e'),
    include: ['tests/**/*.e2e.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
  },
})
