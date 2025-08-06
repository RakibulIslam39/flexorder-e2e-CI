#!/usr/bin/env node

/**
 * Test Runner Script
 * Handles different test scenarios and environments
 */

const { spawn } = require('child_process');
const fs = require('fs');
// const path = require('path');

console.log('🧪 FlexOrder Test Runner...\n');

// Configuration
const config = {
  browsers: ['chromium', 'firefox'],
  testTypes: ['smoke', 'regression'],
  environments: ['local', 'ci'],
  reporters: ['html', 'junit', 'json']
};

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Command completed successfully`);
        resolve(code);
      } else {
        console.error(`❌ Command failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Command error:`, error.message);
      reject(error);
    });
  });
}

function createEnvironmentFile(envType = 'local') {
  const envContent = envType === 'ci' ? 
    `# CI Environment Configuration
CI=true
TEST_TIMEOUT=300000
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=1
HEADLESS=true
SLOW_MO=0
` : 
    `# Local Environment Configuration
CI=false
TEST_TIMEOUT=60000
RETRY_ATTEMPTS=1
PARALLEL_WORKERS=2
HEADLESS=false
SLOW_MO=1000
`;

  fs.writeFileSync('.env.test', envContent);
  console.log(`✅ Created .env.test for ${envType} environment`);
}

function getTestArgs(options) {
  const args = [];
  
  // Browser selection
  if (options.browser) {
    args.push('--project', options.browser);
  }
  
  // Test type filtering
  if (options.testType) {
    args.push('--grep', `@${options.testType}`);
  }
  
  // Reporters
  if (options.reporters) {
    args.push('--reporter', options.reporters.join(','));
  }
  
  // Workers
  if (options.workers) {
    args.push('--workers', options.workers.toString());
  }
  
  // Timeout
  if (options.timeout) {
    args.push('--timeout', options.timeout.toString());
  }
  
  // Headless mode
  if (options.headless !== undefined) {
    args.push('--headed');
  }
  
  return args;
}

async function runSmokeTests(options = {}) {
  console.log('\n🚀 Running Smoke Tests...');
  
  const args = getTestArgs({
    ...options,
    testType: 'smoke',
    reporters: ['html', 'junit']
  });
  
  try {
    await runCommand('npx', ['playwright', 'test', ...args]);
    console.log('✅ Smoke tests completed successfully');
  } catch (error) {
    console.error('❌ Smoke tests failed:', error.message);
    throw error;
  }
}

async function runRegressionTests(options = {}) {
  console.log('\n🚀 Running Regression Tests...');
  
  const args = getTestArgs({
    ...options,
    testType: 'regression',
    reporters: ['html', 'junit', 'json']
  });
  
  try {
    await runCommand('npx', ['playwright', 'test', ...args]);
    console.log('✅ Regression tests completed successfully');
  } catch (error) {
    console.error('❌ Regression tests failed:', error.message);
    throw error;
  }
}

async function runAllTests(options = {}) {
  console.log('\n🚀 Running All Tests...');
  
  const args = getTestArgs({
    ...options,
    reporters: ['html', 'junit', 'json']
  });
  
  try {
    await runCommand('npx', ['playwright', 'test', ...args]);
    console.log('✅ All tests completed successfully');
  } catch (error) {
    console.error('❌ All tests failed:', error.message);
    throw error;
  }
}

async function runCrossBrowserTests(options = {}) {
  console.log('\n🚀 Running Cross-Browser Tests...');
  
  const results = [];
  
  for (const browser of config.browsers) {
    console.log(`\n🌐 Testing on ${browser}...`);
    
    try {
      const args = getTestArgs({
        ...options,
        browser,
        reporters: ['html', 'junit']
      });
      
      await runCommand('npx', ['playwright', 'test', ...args]);
      results.push({ browser, status: 'success' });
    } catch (error) {
      console.error(`❌ ${browser} tests failed:`, error.message);
      results.push({ browser, status: 'failed', error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Cross-Browser Test Summary:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`   ${status} ${result.browser}: ${result.status}`);
  });
  
  const failedBrowsers = results.filter(r => r.status === 'failed');
  if (failedBrowsers.length > 0) {
    throw new Error(`${failedBrowsers.length} browser(s) failed`);
  }
}

async function runParallelTests(options = {}) {
  console.log('\n🚀 Running Parallel Tests...');
  
  const args = getTestArgs({
    ...options,
    workers: options.workers || 4,
    reporters: ['html', 'junit', 'json']
  });
  
  try {
    await runCommand('npx', ['playwright', 'test', ...args]);
    console.log('✅ Parallel tests completed successfully');
  } catch (error) {
    console.error('❌ Parallel tests failed:', error.message);
    throw error;
  }
}

function showHelp() {
  console.log(`
FlexOrder Test Runner

Usage: node scripts/run-tests.js [command] [options]

Commands:
  smoke              Run smoke tests only
  regression         Run regression tests only
  all                Run all tests
  cross-browser      Run tests across all browsers
  parallel           Run tests in parallel

Options:
  --browser <name>   Specify browser (chromium, firefox, webkit)
  --env <type>       Environment type (local, ci)
  --workers <num>    Number of parallel workers
  --timeout <ms>     Test timeout in milliseconds
  --headed           Run in headed mode
  --help, -h         Show this help message

Examples:
  node scripts/run-tests.js smoke                    # Run smoke tests
  node scripts/run-tests.js regression --browser chromium  # Run regression on Chrome
  node scripts/run-tests.js cross-browser --env ci   # Run cross-browser in CI
  node scripts/run-tests.js parallel --workers 4     # Run parallel with 4 workers
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  const options = {};
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--browser' && args[i + 1]) {
      options.browser = args[++i];
    } else if (arg === '--env' && args[i + 1]) {
      options.env = args[++i];
    } else if (arg === '--workers' && args[i + 1]) {
      options.workers = parseInt(args[++i]);
    } else if (arg === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[++i]);
    } else if (arg === '--headed') {
      options.headed = true;
    }
  }
  
  // Set environment
  const envType = options.env || 'local';
  createEnvironmentFile(envType);
  
  // Set CI environment variable
  if (envType === 'ci') {
    process.env.CI = 'true';
  }
  
  try {
    switch (command) {
      case 'smoke':
        await runSmokeTests(options);
        break;
      case 'regression':
        await runRegressionTests(options);
        break;
      case 'all':
        await runAllTests(options);
        break;
      case 'cross-browser':
        await runCrossBrowserTests(options);
        break;
      case 'parallel':
        await runParallelTests(options);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
    
    console.log('\n🎉 Test execution completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

main(); 