const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login');
const { SetupAddCredentialsPage } = require('../pages/setup');
// const { config } = require('../../config/environment');

test('Setup Add Credentials and Upload File Test', async ({ page }) => {
    
    const loginPage = new LoginPage(page);
    const setupPage = new SetupAddCredentialsPage(page);

    try {
        console.log('Starting test: Setup Add Credentials and Upload File Test');
        
        await loginPage.navigate();
        console.log('✅ Navigation completed');
        
        await loginPage.login();
        console.log('✅ Login completed');
        
        await setupPage.navigateToPluginPage();
        console.log('✅ Plugin page navigation completed');
        
        await setupPage.uploadFile();
        console.log('✅ File upload completed');
        
        await setupPage.completeSetup();
        console.log('✅ Setup completion finished');
        
        await setupPage.finalizeSetup();
        console.log('✅ Setup finalization completed');
        
        // Verify that we're on a valid page after setup
        await page.waitForLoadState('domcontentloaded');
        const currentUrl = page.url();
        console.log(`✅ Current URL after setup: ${currentUrl}`);
        
        // Check if we're on a valid WordPress admin page
        const isWordPressAdmin = currentUrl.includes('/wp-admin/') || currentUrl.includes('wppool.dev');
        expect(isWordPressAdmin).toBeTruthy();
        console.log('✅ Verified we are on a valid WordPress admin page');
        
    } catch (error) {
        console.error('Test failed with error:', error);
        
        // // Safe screenshot attempt
        // try {
        //     await page.screenshot({ path: 'test-failure.png' });
        //     console.log('✅ Screenshot saved as test-failure.png');
        // } catch (screenshotError) {
        //     console.log('⚠️ Screenshot failed (page may be closed):', screenshotError.message);
        // }
        
        throw error;
    }
});