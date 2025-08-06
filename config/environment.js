const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from multiple possible locations
const envPaths = [
  path.resolve(__dirname, '../tests/utilities/.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

// If no .env file found, show helpful message
if (!envLoaded) {
  console.warn('⚠️  No .env file found. Please copy tests/utilities/env.example to tests/utilities/.env and configure your environment variables.');
  console.warn('🔒 For security, never commit your .env file to version control!');
}

function validateEnvironmentVariable(name, value, required = true) {
  if (!value && required) {
    const envExamplePath = path.resolve(__dirname, '../tests/utilities/env.example');
    const envPath = path.resolve(__dirname, '../tests/utilities/.env');
    
    console.error(`❌ Required environment variable ${name} is not set`);
    console.error(`📝 Please copy ${envExamplePath} to ${envPath} and configure your environment variables`);
    console.error(`🔧 You can also set ${name} as an environment variable or in your .env file`);
    console.error(`🔒 IMPORTANT: Never commit your .env file to version control!`);
    
    throw new Error(`Required environment variable ${name} is not set. Please check tests/utilities/env.example for configuration instructions.`);
  }
  return value || '';
}

function validateBooleanEnvironmentVariable(name, value) {
  if (!value) { return false; }
  return value.toLowerCase() === 'true';
}

function validateNumberEnvironmentVariable(name, value, defaultValue) {
  if (!value) { return defaultValue; }
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

// Enhanced CI detection
function detectCIEnvironment() {
  const ciIndicators = [
    'CI',
    'GITHUB_ACTIONS',
    'GITLAB_CI',
    'JENKINS_URL',
    'TRAVIS',
    'CIRCLECI',
    'BITBUCKET_BUILD_NUMBER'
  ];
  
  return ciIndicators.some(indicator => process.env[indicator] === 'true' || process.env[indicator]);
}

// Detect if we should use fresh WordPress
function shouldUseFreshWordPress() {
  return validateBooleanEnvironmentVariable('USE_FRESH_WORDPRESS', process.env.USE_FRESH_WORDPRESS) || 
         (detectCIEnvironment() && validateBooleanEnvironmentVariable('CI_FRESH_WORDPRESS', process.env.CI_FRESH_WORDPRESS));
}

const config = {
  // WooCommerce Configuration
  SITE_URL: validateEnvironmentVariable('SITE_URL', process.env.SITE_URL),
  WOOCOMMERCE_CONSUMER_KEY: validateEnvironmentVariable('WOOCOMMERCE_CONSUMER_KEY', process.env.WOOCOMMERCE_CONSUMER_KEY),
  WOOCOMMERCE_CONSUMER_SECRET: validateEnvironmentVariable('WOOCOMMERCE_CONSUMER_SECRET', process.env.WOOCOMMERCE_CONSUMER_SECRET),
  
  // WordPress Admin Configuration
  URL: validateEnvironmentVariable('URL', process.env.URL),
  USER_NAME: validateEnvironmentVariable('USER_NAME', process.env.USER_NAME),
  PASSWORD: validateEnvironmentVariable('PASSWORD', process.env.PASSWORD),
  ADMIN_PANEL_URL: validateEnvironmentVariable('ADMIN_PANEL_URL', process.env.ADMIN_PANEL_URL),
  
  // Google Sheets Configuration
  GOOGLE_SHEET_ID: validateEnvironmentVariable('GOOGLE_SHEET_ID', process.env.GOOGLE_SHEET_ID),
  GOOGLE_SHEET_URL: validateEnvironmentVariable('GOOGLE_SHEET_URL', process.env.GOOGLE_SHEET_URL),
  GOOGLE_SHEET_SCOPES: validateEnvironmentVariable('GOOGLE_SHEET_SCOPES', process.env.GOOGLE_SHEET_SCOPES),
  SHEET_NAME: validateEnvironmentVariable('SHEET_NAME', process.env.SHEET_NAME),
  SHEET_RANGE: validateEnvironmentVariable('SHEET_RANGE', process.env.SHEET_RANGE),
  
  // Google Account Configuration
  GOOGLE_ACCOUNT_EMAIL: validateEnvironmentVariable('GOOGLE_ACCOUNT_EMAIL', process.env.GOOGLE_ACCOUNT_EMAIL),
  GOOGLE_ACCOUNT_PASSWORD: validateEnvironmentVariable('GOOGLE_ACCOUNT_PASSWORD', process.env.GOOGLE_ACCOUNT_PASSWORD),
  
  // Service Account Configuration
  SERVICE_ACCOUNT_UPLOAD_FILE: validateEnvironmentVariable('SERVICE_ACCOUNT_UPLOAD_FILE', process.env.SERVICE_ACCOUNT_UPLOAD_FILE),
  
  // Plugin Configuration
  Replace_Plugin_Path: validateEnvironmentVariable('Replace_Plugin_Path', process.env.Replace_Plugin_Path),
  REPLACE_PLUGIN_URL: validateEnvironmentVariable('REPLACE_PLUGIN_URL', process.env.REPLACE_PLUGIN_URL, false),
  
  // Apps Script Configuration
  APPS_SCRIPT_DEPLOYMENT_ID: validateEnvironmentVariable('APPS_SCRIPT_DEPLOYMENT_ID', process.env.APPS_SCRIPT_DEPLOYMENT_ID),
  APPS_SCRIPT_PROJECT_ID: validateEnvironmentVariable('APPS_SCRIPT_PROJECT_ID', process.env.APPS_SCRIPT_PROJECT_ID),
  
  // Playwright Configuration
  PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL || process.env.SITE_URL || 'http://localhost:8000',
  CI: detectCIEnvironment() || validateBooleanEnvironmentVariable('CI', process.env.CI),
  
  // Test Configuration
  TEST_TIMEOUT: validateNumberEnvironmentVariable('TEST_TIMEOUT', process.env.TEST_TIMEOUT, 300000), // 5 minutes
  RETRY_ATTEMPTS: validateNumberEnvironmentVariable('RETRY_ATTEMPTS', process.env.RETRY_ATTEMPTS, 2),
  PARALLEL_WORKERS: validateNumberEnvironmentVariable('PARALLEL_WORKERS', process.env.PARALLEL_WORKERS, 1),
  HEADLESS: validateBooleanEnvironmentVariable('HEADLESS', process.env.HEADLESS) || detectCIEnvironment(),
  SLOW_MO: validateNumberEnvironmentVariable('SLOW_MO', process.env.SLOW_MO, detectCIEnvironment() ? 0 : 100),
  
  // WordPress Environment Configuration
  USE_FRESH_WORDPRESS: shouldUseFreshWordPress(),
  FRESH_SITE_URL: process.env.FRESH_SITE_URL || 'http://localhost:8080',
  CI_FRESH_WORDPRESS: validateBooleanEnvironmentVariable('CI_FRESH_WORDPRESS', process.env.CI_FRESH_WORDPRESS),
  
  // Database Configuration (for fresh WordPress)
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'flexorder_test',
  DB_USER: process.env.DB_USER || 'flexorder_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'flexorder_pass',
  
  // Additional Configuration
  ...(process.env.ARRAY_INDEX && { ARRAY_INDEX: process.env.ARRAY_INDEX }),
  ...(process.env.STOCK_STATUS && { STOCK_STATUS: process.env.STOCK_STATUS }),
  ...(process.env.ORDER_STATUS_RANGE && { ORDER_STATUS_RANGE: process.env.ORDER_STATUS_RANGE }),
  ...(process.env.GOOGLE_PROJECT && { GOOGLE_PROJECT: process.env.GOOGLE_PROJECT }),
  ...(process.env.Web_App_URL && { Web_App_URL: process.env.Web_App_URL }),
};

function validateConfig() {
  console.log('✅ Environment configuration validated successfully');
  console.log(`📊 WooCommerce Site: ${config.SITE_URL}`);
  console.log(`📋 Google Sheet: ${config.GOOGLE_SHEET_URL}`);
  console.log(`🔧 CI Mode: ${config.CI}`);
  console.log(`🌱 Fresh WordPress Mode: ${config.USE_FRESH_WORDPRESS}`);
  console.log(`⏱️  Test Timeout: ${config.TEST_TIMEOUT}ms`);
  console.log(`🔄 Retry Attempts: ${config.RETRY_ATTEMPTS}`);
  console.log(`👥 Parallel Workers: ${config.PARALLEL_WORKERS}`);
  console.log(`🎭 Headless Mode: ${config.HEADLESS}`);
  console.log(`🐌 Slow Motion: ${config.SLOW_MO}ms`);
  
  if (config.USE_FRESH_WORDPRESS) {
    console.log(`🏗️  Fresh WordPress URL: ${config.FRESH_SITE_URL}`);
    console.log(`🗄️  Database: ${config.DB_HOST}/${config.DB_NAME}`);
  }
  
  console.log('🔒 Security: Environment variables loaded from .env file (not committed to version control)');
}

module.exports = {
  config,
  validateConfig
}; 