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
    'comma-dangle': ['error', 'always-multiline'],
    'no-empty': 'off',
    'no-useless-escape': 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};