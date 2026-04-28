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

// Cosmetic Vue style rules deferred to Prettier — vue-tsc + the build
// already validate semantics. Keep the boundary + correctness rules
// strict; drop the line-break / attribute-order opinions.
const relaxedVueStyle = {
  'vue/max-attributes-per-line': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/html-indent': 'off',
  'vue/html-self-closing': 'off',
  'vue/multi-word-component-names': 'off',
  'vue/attributes-order': 'off',
  'vue/first-attribute-linebreak': 'off',
  'vue/html-closing-bracket-newline': 'off',
  'vue/no-multiple-template-root': 'off',
}

export default [
  {
    ignores: [
      'node_modules/**',
      'docs/**',
      '.archive-v0/**',
      'dist/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'eslint.config.js',
    ],
  },
  // js.configs.recommended is JS-only — the .ts and .vue blocks below
  // have their own rule sets via @typescript-eslint and eslint-plugin-vue.
  // Applying the JS recommended set globally fires `no-unused-vars` and
  // `no-undef` against TS/Vue files where the TS-aware variants own those
  // rules.
  { files: ['**/*.js', '**/*.cjs', '**/*.mjs'], ...js.configs.recommended },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: {
        window: 'readonly',
        document: 'readonly',
        cast: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        atob: 'readonly',
        Buffer: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        KeyboardEvent: 'readonly',
        Headers: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        EventTarget: 'readonly',
        Event: 'readonly',
        MutationObserver: 'readonly',
        IntersectionObserver: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/lib/**/*.ts', 'src/stores/**/*.ts'],
    rules: moduleBoundaryRules,
  },
  ...vue.configs['flat/recommended'].map((cfg) => ({
    ...cfg,
    rules: { ...(cfg.rules ?? {}), ...relaxedVueStyle },
  })),
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        cast: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        atob: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        Element: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        Event: 'readonly',
        Headers: 'readonly',
        Response: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
      },
    },
    rules: { ...relaxedVueStyle, 'no-undef': 'off' },
  },
]
