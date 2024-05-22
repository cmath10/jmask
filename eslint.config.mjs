import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginTs from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'

// noinspection JSUnusedGlobalSymbols
export default [
  ...pluginTs.config(
    pluginJs.configs.recommended,
    ...pluginTs.configs.recommended
  ),
  ...pluginVue.configs['flat/recommended'],
  stylistic.configs['recommended-flat'],
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: pluginTs.parser,
        project: './tsconfig.node.json',
      },
      sourceType: 'module',
    },
    ignores: ['.yarn/**/*.*'],
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': ['error', {
        arrays: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
        imports: 'always-multiline',
        objects: 'always-multiline',
      }],
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'vue/html-indent': ['error', 4],
      'vue/max-attributes-per-line': ['error', {
        multiline: 1,
        singleline: 4,
      }],
      'vue/html-self-closing': ['error', {
        html: {
          component: 'always',
          normal: 'always',
          void: 'always',
        },
        math: 'always',
        svg: 'always',
      }],
    },
  },
]
