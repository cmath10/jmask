export const getCoverageConfig = (suite: 'unit' | 'e2e') => ({
  provider: 'v8' as const,
  include: ['src/**/*.ts'],
  exclude: [
    'src/types.ts',
  ],
  reporter: [
    ...(process.env.COVERAGE_TEXT_REPORT === '0' ? [] : ['text']),
    'html',
    'json',
    'json-summary',
  ],
  reportsDirectory: `coverage/${suite}`,
})
