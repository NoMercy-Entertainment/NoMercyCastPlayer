import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

const moduleBoundaryRules = {
  // Module boundary rules per spec §7.1. The cast/ directory is the only
  // place that touches cast.framework; stores never import from
  // components or queries; lib has zero Vue imports; etc.
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['@/components/*', '@/views/*', '@/queries/*'],
          message:
            'lib/ and stores/ must not import from components/, views/, or queries/. ' +
            'Reverse the dependency or move the helper into the consumer.',
        },
      ],
    },
  ],
}

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/**',
      '.archive-v0/**',
      'dist/**',
      '*.config.js',
      '*.config.ts',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: { window: 'readonly', document: 'readonly', cast: 'readonly', console: 'readonly', fetch: 'readonly', URLSearchParams: 'readonly', atob: 'readonly', Buffer: 'readonly' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/lib/**/*.ts', 'src/stores/**/*.ts'],
    rules: moduleBoundaryRules,
  },
  ...vue.configs['flat/recommended'],
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { window: 'readonly', document: 'readonly', console: 'readonly' },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/html-self-closing': 'off',
    },
  },
]
