import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { config, validateConfig } from './config/environment';

// Validate environment configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Environment configuration validation failed:', error);
  process.exit(1);
}

export default defineConfig({
  testDir: './tests',
  timeout: config.TEST_TIMEOUT,
  expect: {
    timeout: 2 * 60 * 1000, // 2 minutes for expect()
  },
  fullyParallel: config.CI ? false : true, // Disable parallel in CI for stability
  forbidOnly: !!config.CI,
  retries: config.CI ? config.RETRY_ATTEMPTS : 0,
  workers: config.CI ? config.PARALLEL_WORKERS : 1,
  
  // Global setup and teardown - temporarily disabled for debugging
  // globalSetup: './tests/global-setup.ts',
  // globalTeardown: './tests/global-teardown.ts',
  
  // Reporters
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/e2e-junit-results.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'], // Console reporter
    ...(config.CI ? [['github']] : []), // GitHub reporter for CI
  ] as any,
  
  // Use configuration
  use: {
    baseURL: config.PLAYWRIGHT_BASE_URL,
    headless: config.HEADLESS,
    screenshot: 'only-on-failure',
    video: config.CI ? 'retain-on-failure' : 'off',
    trace: config.CI ? 'on-first-retry' : 'off',
    testIdAttribute: 'data-testid',
    actionTimeout: 0,
    
    // Viewport settings
    viewport: { width: 1920, height: 1080 },
    
    // Browser settings
    launchOptions: {
      slowMo: config.SLOW_MO,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    },
    
    // Context settings
    contextOptions: {
      ignoreHTTPSErrors: true,
      userAgent: 'FlexOrder-Automation/1.0',
    },
  },
  
  // Projects for different browsers and test types
  projects: [
    // Smoke tests - quick validation
    {
      name: 'smoke-chromium',
      testMatch: /.*smoke.*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // Main test suite
    {
      name: 'chromium',
      testIgnore: /.*(smoke|visual|accessibility).*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // Visual regression tests
    {
      name: 'visual-chromium',
      testMatch: /.*visual.*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // Accessibility tests
    {
      name: 'accessibility-chromium',
      testMatch: /.*accessibility.*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    
    // Mobile testing
    {
      name: 'mobile-chrome',
      testMatch: /.*mobile.*\.spec\.(js|ts)/,
      use: { 
        ...devices['Pixel 5'],
      },
    },
    
    // Firefox for cross-browser testing (only in non-CI or specific CI runs)
    {
      name: 'firefox',
      testIgnore: /.*(smoke|visual|accessibility|mobile).*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'media.navigator.enabled': false,
          },
        },
      },
    },
    
    // Safari for cross-browser testing (only in non-CI or specific CI runs)
    {
      name: 'webkit',
      testIgnore: /.*(smoke|visual|accessibility|mobile).*\.spec\.(js|ts)/,
      use: { 
        ...devices['Desktop Safari'],
      },
    },
  ],
  
  // Output directories
  outputDir: 'test-results/',
  
  // Metadata
  metadata: {
    name: 'FlexOrder Plugin Automation',
    version: '1.0.0',
    description: 'Automated testing for FlexOrder plugin integration with WooCommerce and Google Sheets',
    environment: {
      woocommerce: config.SITE_URL,
      google_sheets: config.GOOGLE_SHEET_URL,
      ci_mode: config.CI,
      test_timeout: config.TEST_TIMEOUT,
      retry_attempts: config.RETRY_ATTEMPTS,
    },
  },
});