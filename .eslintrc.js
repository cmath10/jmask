module.exports = {
  env: {
    browser: true,
    mocha: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 6,
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ['error', 'only-multiline'],
    'no-empty': 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single']
  },
};