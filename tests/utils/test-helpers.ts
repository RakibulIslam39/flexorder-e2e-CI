import { Page, expect } from '@playwright/test';
import { config } from '../../config/environment';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded with retry logic
   */
  async waitForPageLoad(timeout = 30000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch (error) {
      console.warn('Network idle timeout, waiting for DOM content loaded instead');
      await this.page.waitForLoadState('domcontentloaded', { timeout });
    }
  }

  /**
   * Take a screenshot with descriptive name
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${name}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: `test-results/screenshots/${screenshotName}`,
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${screenshotName}`);
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.page.waitForTimeout(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Wait for element to be visible with custom timeout
   */
  async waitForElement(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { 
      state: 'visible', 
      timeout 
    });
  }

  /**
   * Fill form fields with validation
   */
  async fillFormField(selector: string, value: string, validate = true) {
    await this.page.fill(selector, value);
    
    if (validate) {
      const actualValue = await this.page.inputValue(selector);
      expect(actualValue).toBe(value);
    }
  }

  /**
   * Click element with retry logic
   */
  async clickElement(selector: string, options?: { timeout?: number; retry?: boolean }) {
    const { timeout = 10000, retry = true } = options || {};
    
    if (retry) {
      return this.retry(async () => {
        await this.page.click(selector, { timeout });
      });
    } else {
      await this.page.click(selector, { timeout });
    }
  }

  /**
   * Navigate to URL with proper error handling
   */
  async navigateTo(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    try {
      await this.page.goto(url, { 
        waitUntil: options?.waitUntil || 'networkidle',
        timeout: 30000 
      });
    } catch (error) {
      console.warn(`Navigation to ${url} failed:`, (error as Error).message);
      // Try with domcontentloaded as fallback
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
    }
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get text content safely
   */
  async getTextContent(selector: string): Promise<string> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return await this.page.textContent(selector) || '';
    } catch {
      return '';
    }
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string, timeout = 30000) {
    return this.page.waitForResponse(
      response => response.url().includes(urlPattern),
      { timeout }
    );
  }

  /**
   * Generate random test data
   */
  generateTestData() {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      name: `Test User ${timestamp}`,
      phone: `555${timestamp.toString().slice(-7)}`,
      address: `${timestamp % 9999} Test Street`,
      city: 'Test City',
      postcode: `${timestamp % 99999}`.padStart(5, '0'),
    };
  }

  /**
   * Clean up test data (CI mode only)
   */
  async cleanupTestData() {
    if (!config.CI) {
      console.log('🧹 Skipping cleanup in non-CI mode');
      return;
    }

    console.log('🧹 Cleaning up test data...');
    // Add cleanup logic here if needed
  }

  /**
   * Log test step with timestamp
   */
  logStep(step: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 ${step}`);
  }

  /**
   * Assert page title contains expected text
   */
  async assertPageTitle(expectedTitle: string) {
    const title = await this.page.title();
    expect(title).toContain(expectedTitle);
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(spinnerSelector = '.loading, .spinner, [data-loading="true"]') {
    try {
      await this.page.waitForSelector(spinnerSelector, { 
        state: 'hidden', 
        timeout: 10000 
      });
    } catch {
      // Spinner might not exist, which is fine
      console.log('No loading spinner found, continuing...');
    }
  }

  /**
   * Handle common alerts and popups
   */
  async handleCommonPopups() {
    // Handle common browser alerts
    this.page.on('dialog', async dialog => {
      console.log(`Handling dialog: ${dialog.message()}`);
      await dialog.accept();
    });

    // Handle common popups
    const popupSelectors = [
      '[data-dismiss="alert"]',
      '.close',
      '.modal-close',
      '.popup-close'
    ];

    for (const selector of popupSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          console.log(`Closed popup with selector: ${selector}`);
        }
      } catch {
        // Element not found or not visible, continue
      }
    }
  }

  /**
   * Scroll to element smoothly
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Small delay for smooth scrolling
  }

  /**
   * Type text with human-like delays
   */
  async typeHumanLike(selector: string, text: string) {
    await this.page.focus(selector);
    for (const char of text) {
      await this.page.type(selector, char, { delay: 50 + Math.random() * 100 });
    }
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout = 10000) {
    try {
      await this.page.waitForLoadState('networkidle', { timeout });
    } catch {
      // Fallback to shorter timeout
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    }
  }
}

/**
 * Create test data for consistent testing
 */
export const createTestData = {
  products: [
    { name: 'Football Net', price: '29.99', sku: 'FN001' },
    { name: 'Basketball', price: '24.99', sku: 'BB001' },
    { name: 'Tennis Racket', price: '89.99', sku: 'TR001' },
    { name: 'Soccer Ball', price: '19.99', sku: 'SB001' },
    { name: 'Baseball Glove', price: '45.99', sku: 'BG001' }
  ],
  
  customers: [
    { first: 'John', last: 'Doe', email: 'john.doe@test.com' },
    { first: 'Jane', last: 'Smith', email: 'jane.smith@test.com' },
    { first: 'Bob', last: 'Johnson', email: 'bob.johnson@test.com' }
  ],
  
  orders: [
    { status: 'processing', payment_method: 'cod' },
    { status: 'completed', payment_method: 'cod' },
    { status: 'pending', payment_method: 'cod' }
  ]
};

/**
 * CI-specific utilities
 */
export const ciUtils = {
  /**
   * Check if running in CI environment
   */
  isCI: () => config.CI,
  
  /**
   * Get CI-specific timeout
   */
  getTimeout: (defaultTimeout: number) => config.CI ? defaultTimeout * 2 : defaultTimeout,
  
  /**
   * Get CI-specific retry attempts
   */
  getRetryAttempts: () => config.CI ? 2 : 1,
  
  /**
   * Log CI-specific information
   */
  logCIInfo: () => {
    if (config.CI) {
      console.log('🔧 Running in CI mode');
    }
  }
}; 