module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:playwright/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'playwright',
  ],
  rules: {
    // General rules
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Playwright specific rules
    'playwright/no-wait-for-timeout': 'error',
    'playwright/no-force-option': 'error',
    'playwright/no-element-handle': 'error',
    'playwright/prefer-web-first-assertions': 'error',
    'playwright/prefer-locator': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/no-focused-test': 'error',
    'playwright/no-conditional-in-test': 'warn',
    'playwright/expect-expect': 'error',
    'playwright/no-restricted-matchers': 'error',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts', '*.test.js', '*.spec.js'],
      env: { jest: true },
      rules: {
        'no-console': 'off',
        'playwright/no-skipped-test': 'off',
        'playwright/no-conditional-in-test': 'off',
        'playwright/no-conditional-expect': 'off',
      },
    },
    {
      files: ['playwright.config.ts'],
      rules: { 
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['scripts/**/*.js', 'test-utils/**/*.js'],
      rules: {
        'no-undef': 'off',
        'no-console': 'off',
      },
    },
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-console': 'off',
        'playwright/prefer-locator': 'off',
        'playwright/no-conditional-in-test': 'off',
        'playwright/no-conditional-expect': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'test-results/',
    'playwright-report/',
    'logs/',
    'artifacts/',
    '*.min.js',
    '*.ts', // Temporarily ignore TypeScript files
  ],
}; 