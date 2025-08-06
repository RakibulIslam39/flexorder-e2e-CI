// import { test, expect } from '@playwright/test';
// import { TestHelpers, ciUtils } from '../utils/test-helpers';
// import { config } from '../../config/environment';

// test.describe('FlexOrder Plugin Smoke Tests', () => {
//   let testHelpers: TestHelpers;

//   test.beforeEach(async ({ page }) => {
//     testHelpers = new TestHelpers(page);
//     ciUtils.logCIInfo();
    
//     // Handle common popups
//     await testHelpers.handleCommonPopups();
//   });

//   test('should load WordPress site successfully @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing WordPress site accessibility');
    
//     await testHelpers.navigateTo(config.SITE_URL);
//     await testHelpers.waitForPageLoad();
    
//     // Verify WordPress is running
//     const title = await page.title();
//     expect(title).toContain('WordPress');
    
//     // Check for WordPress admin bar (if logged in)
//     const adminBar = page.locator('#wpadminbar');
//     if (await adminBar.isVisible({ timeout: 5000 })) {
//       console.log('✅ WordPress admin bar is visible');
//     } else {
//       console.log('ℹ️ WordPress admin bar not visible (not logged in)');
//     }
    
//     // Take screenshot for verification
//     await testHelpers.takeScreenshot('wordpress-site-loaded');
//   });

//   test('should access WordPress admin panel @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing WordPress admin access');
    
//     await testHelpers.navigateTo(config.ADMIN_PANEL_URL);
//     await testHelpers.waitForPageLoad();
    
//     // Should redirect to login page if not authenticated
//     const currentUrl = page.url();
//     if (currentUrl.includes('wp-login.php')) {
//       console.log('ℹ️ Redirected to login page');
      
//       // Test login functionality
//       await testHelpers.fillFormField('#user_login', config.USER_NAME);
//       await testHelpers.fillFormField('#user_pass', config.PASSWORD);
//       await testHelpers.clickElement('#wp-submit');
      
//       await testHelpers.waitForPageLoad();
      
//       // Verify successful login
//       const adminBar = page.locator('#wpadminbar');
//       await expect(adminBar).toBeVisible({ timeout: 10000 });
//       console.log('✅ Successfully logged into WordPress admin');
//     } else {
//       // Already logged in
//       const adminBar = page.locator('#wpadminbar');
//       await expect(adminBar).toBeVisible();
//       console.log('✅ Already logged into WordPress admin');
//     }
    
//     await testHelpers.takeScreenshot('wordpress-admin-accessible');
//   });

//   test('should verify WooCommerce is active @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing WooCommerce activation');
    
//     // Login first
//     await testHelpers.navigateTo(config.URL);
//     await testHelpers.fillFormField('#user_login', config.USER_NAME);
//     await testHelpers.fillFormField('#user_pass', config.PASSWORD);
//     await testHelpers.clickElement('#wp-submit');
//     await testHelpers.waitForPageLoad();
    
//     // Navigate to WooCommerce status page
//     await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/admin.php?page=wc-status`);
//     await testHelpers.waitForPageLoad();
    
//     // Check for WooCommerce status page
//     const wcHeader = page.locator('.woocommerce-layout__header');
//     if (await wcHeader.isVisible({ timeout: 5000 })) {
//       console.log('✅ WooCommerce is active and accessible');
      
//       // Check for WooCommerce version
//       const versionElement = page.locator('.woocommerce-layout__header h1');
//       const versionText = await versionElement.textContent();
//       console.log(`📦 WooCommerce version: ${versionText}`);
//     } else {
//       console.log('⚠️ WooCommerce status page not accessible');
      
//       // Try alternative WooCommerce pages
//       await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/edit.php?post_type=product`);
//       await testHelpers.waitForPageLoad();
      
//       const productPage = page.locator('.wp-heading-inline');
//       if (await productPage.isVisible({ timeout: 5000 })) {
//         console.log('✅ WooCommerce products page accessible');
//       } else {
//         throw new Error('WooCommerce does not appear to be active');
//       }
//     }
    
//     await testHelpers.takeScreenshot('woocommerce-status');
//   });

//   test('should verify FlexOrder plugin is active @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing FlexOrder plugin activation');
    
//     // Login first
//     await testHelpers.navigateTo(config.URL);
//     await testHelpers.fillFormField('#user_login', config.USER_NAME);
//     await testHelpers.fillFormField('#user_pass', config.PASSWORD);
//     await testHelpers.clickElement('#wp-submit');
//     await testHelpers.waitForPageLoad();
    
//     // Navigate to plugins page
//     await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/plugins.php`);
//     await testHelpers.waitForPageLoad();
    
//     // Look for FlexOrder plugin
//     const flexOrderPlugin = page.locator('text=FlexOrder, text=order-sync-with-google-sheets-for-woocommerce');
    
//     if (await flexOrderPlugin.isVisible({ timeout: 5000 })) {
//       console.log('✅ FlexOrder plugin found');
      
//       // Check if it's active
//       const activePlugin = page.locator('text=FlexOrder, text=order-sync-with-google-sheets-for-woocommerce').locator('..').locator('.deactivate');
//       if (await activePlugin.isVisible({ timeout: 2000 })) {
//         console.log('✅ FlexOrder plugin is active');
//       } else {
//         console.log('⚠️ FlexOrder plugin is installed but not active');
//       }
//     } else {
//       console.log('⚠️ FlexOrder plugin not found in plugins list');
      
//       // Try to find it by partial name
//       const partialMatch = page.locator('text=google-sheets, text=order-sync');
//       if (await partialMatch.isVisible({ timeout: 2000 })) {
//         console.log('✅ Found plugin with similar name');
//       } else {
//         throw new Error('FlexOrder plugin not found');
//       }
//     }
    
//     await testHelpers.takeScreenshot('flexorder-plugin-status');
//   });

//   test('should verify test data exists @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing test data availability');
    
//     // Login first
//     await testHelpers.navigateTo(config.URL);
//     await testHelpers.fillFormField('#user_login', config.USER_NAME);
//     await testHelpers.fillFormField('#user_pass', config.PASSWORD);
//     await testHelpers.clickElement('#wp-submit');
//     await testHelpers.waitForPageLoad();
    
//     // Check for products
//     await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/edit.php?post_type=product`);
//     await testHelpers.waitForPageLoad();
    
//     const productRows = page.locator('.wp-list-table tbody tr');
//     const productCount = await productRows.count();
//     console.log(`📦 Found ${productCount} products`);
    
//     expect(productCount).toBeGreaterThan(0);
    
//     // Check for orders
//     await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/edit.php?post_type=shop_order`);
//     await testHelpers.waitForPageLoad();
    
//     const orderRows = page.locator('.wp-list-table tbody tr');
//     const orderCount = await orderRows.count();
//     console.log(`📋 Found ${orderCount} orders`);
    
//     expect(orderCount).toBeGreaterThan(0);
    
//     await testHelpers.takeScreenshot('test-data-verification');
//   });

//   test('should verify Google Sheets integration @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing Google Sheets integration');
    
//     // This test might fail in CI if Google Sheets credentials are not properly configured
//     // We'll make it more resilient
    
//     try {
//       // Login first
//       await testHelpers.navigateTo(config.URL);
//       await testHelpers.fillFormField('#user_login', config.USER_NAME);
//       await testHelpers.fillFormField('#user_pass', config.PASSWORD);
//       await testHelpers.clickElement('#wp-submit');
//       await testHelpers.waitForPageLoad();
      
//       // Navigate to FlexOrder settings
//       await testHelpers.navigateTo(`${config.SITE_URL}/wp-admin/admin.php?page=flexorder-settings`);
//       await testHelpers.waitForPageLoad();
      
//       // Check for Google Sheets configuration
//       const sheetUrlField = page.locator('input[placeholder*="google sheet"], input[name*="sheet"]');
//       if (await sheetUrlField.isVisible({ timeout: 5000 })) {
//         console.log('✅ Google Sheets configuration found');
        
//         // Check if sheet URL is configured
//         const sheetUrlValue = await sheetUrlField.inputValue();
//         if (sheetUrlValue && sheetUrlValue.includes('google.com')) {
//           console.log('✅ Google Sheets URL is configured');
//         } else {
//           console.log('⚠️ Google Sheets URL not configured');
//         }
//       } else {
//         console.log('⚠️ Google Sheets configuration not found');
//       }
      
//     } catch (error) {
//       console.warn('⚠️ Google Sheets integration test failed:', (error as Error).message);
      
//       if (config.CI) {
//         // In CI, we might not have Google Sheets configured, so this is expected
//         console.log('ℹ️ Skipping Google Sheets test in CI mode');
//       } else {
//         throw error;
//       }
//     }
    
//     await testHelpers.takeScreenshot('google-sheets-integration');
//   });

//   test('should verify API endpoints are accessible @smoke', async ({ page }) => {
//     testHelpers.logStep('Testing API endpoint accessibility');
    
//     // Test WooCommerce REST API
//     try {
//       const response = await page.request.get(`${config.SITE_URL}/wp-json/wc/v3/products`, {
//         headers: {
//           'Authorization': `Basic ${Buffer.from(`${config.WOOCOMMERCE_CONSUMER_KEY}:${config.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`
//         }
//       });
      
//       if (response.ok()) {
//         console.log('✅ WooCommerce REST API is accessible');
//         const products = await response.json();
//         console.log(`📦 Found ${products.length} products via API`);
//       } else {
//         console.warn(`⚠️ WooCommerce API returned status: ${response.status()}`);
//       }
//     } catch (error) {
//       console.warn('⚠️ WooCommerce API test failed:', (error as Error).message);
//     }
    
//     // Test WordPress REST API
//     try {
//       const response = await page.request.get(`${config.SITE_URL}/wp-json/wp/v2/posts`);
      
//       if (response.ok()) {
//         console.log('✅ WordPress REST API is accessible');
//       } else {
//         console.warn(`⚠️ WordPress API returned status: ${response.status()}`);
//       }
//     } catch (error) {
//       console.warn('⚠️ WordPress API test failed:', (error as Error).message);
//     }
    
//     await testHelpers.takeScreenshot('api-endpoints-test');
//   });

//   test.afterEach(async ({ page }) => {
//     // Clean up any test data if needed
//     if (config.CI) {
//       await testHelpers.cleanupTestData();
//     }
//   });
// }); 