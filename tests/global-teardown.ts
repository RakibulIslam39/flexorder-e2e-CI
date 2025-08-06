import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up any test data if needed
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // You can add cleanup logic here if needed
    // For example, cleaning up test orders, products, etc.
    
    await browser.close();
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.warn('⚠️ Global teardown encountered an error:', (error as Error).message);
  }
}

export default globalTeardown; 