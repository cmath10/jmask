export default {
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/(tests/**/*.test.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))',
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  modulePaths: ['<rootDir>'],
  transform: {
    '.*\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.ts$': '<rootDir>/node_modules/ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/*.{js,ts}',
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  coverageProvider: 'babel',
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
  ],
}
