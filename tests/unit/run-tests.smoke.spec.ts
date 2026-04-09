import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const runTests = require('../../scripts/run-tests');

test.describe('scripts/run-tests helpers', () => {
  test('builds playwright args from options', () => {
    const args = runTests.getTestArgs({
      browser: 'chromium',
      testType: 'smoke',
      reporters: ['html', 'json'],
      workers: 3,
      timeout: 45000,
      headed: true,
    });

    expect(args).toEqual([
      '--project', 'chromium',
      '--grep', '@smoke',
      '--reporter', 'html,json',
      '--workers', '3',
      '--timeout', '45000',
      '--headed',
    ]);
  });

  test('does not add headed flag by default', () => {
    const args = runTests.getTestArgs({});
    expect(args).toEqual([]);
    expect(args).not.toContain('--headed');
  });

  test('creates CI environment file with CI defaults', () => {
    const previousCwd = process.cwd();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flexorder-run-tests-'));

    try {
      process.chdir(tempDir);
      runTests.createEnvironmentFile('ci');

      const content = fs.readFileSync(path.join(tempDir, '.env.test'), 'utf8');
      expect(content).toContain('CI=true');
      expect(content).toContain('TEST_TIMEOUT=300000');
      expect(content).toContain('HEADLESS=true');
    } finally {
      process.chdir(previousCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
