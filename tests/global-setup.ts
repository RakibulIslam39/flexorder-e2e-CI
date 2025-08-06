import { chromium, FullConfig } from '@playwright/test';
import { config as envConfig } from '../config/environment';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:8080';
  
  console.log('🚀 Starting global setup...');
  console.log(`📊 Base URL: ${baseURL}`);
  console.log(`🔧 CI Mode: ${envConfig.CI}`);
  
  // Check if the application is accessible
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    // Check if WordPress is running
    const title = await page.title();
    console.log(`✅ Application is accessible. Title: ${title}`);
    
    // Check if WooCommerce is active
    try {
      await page.goto(`${baseURL}/wp-admin`);
      const isLoggedIn = await page.locator('#wpadminbar').isVisible();
      
      if (isLoggedIn) {
        console.log('✅ WordPress admin is accessible');
        
        // Check WooCommerce status
        await page.goto(`${baseURL}/wp-admin/admin.php?page=wc-status`);
        const wcStatus = await page.locator('.woocommerce-layout__header').isVisible();
        
        if (wcStatus) {
          console.log('✅ WooCommerce is active');
        } else {
          console.warn('⚠️ WooCommerce might not be active');
        }
      } else {
        console.log('ℹ️ WordPress admin requires login');
      }
    } catch (error) {
      console.warn('⚠️ Could not check WooCommerce status:', (error as Error).message);
    }
    
    // In CI mode, ensure we have consistent test data
    if (envConfig.CI) {
      console.log('🧪 CI mode detected - ensuring test data consistency...');
      await ensureTestData(page, baseURL);
    } else {
      console.log('🏠 Local mode - using existing site configuration');
    }
    
  } catch (error) {
    console.error('❌ Application is not accessible:', (error as Error).message);
    
    if (envConfig.CI) {
      console.log('🔧 CI mode: Attempting to setup fresh WordPress site...');
      await setupFreshWordPressForCI();
    } else {
      console.log('💡 Make sure to run: npm run setup:local');
    }
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

async function setupFreshWordPressForCI() {
  console.log('🚀 Setting up fresh WordPress for CI...');
  
  try {
    // Import the fresh WordPress setup
    const { FreshWordPressSetup } = require('../scripts/setup-fresh-wordpress');
    const setup = new FreshWordPressSetup();
    
    await setup.setupFreshWordPress();
    console.log('✅ Fresh WordPress setup completed for CI');
    
  } catch (error) {
    console.error('❌ Failed to setup fresh WordPress for CI:', error);
    throw error;
  }
}

async function ensureTestData(page: any, baseURL: string) {
  console.log('🧪 Ensuring consistent test data in CI mode...');
  
  try {
    // Login to WordPress admin
    await page.goto(`${baseURL}/wp-login.php`);
    await page.fill('#user_login', envConfig.USER_NAME);
    await page.fill('#user_pass', envConfig.PASSWORD);
    await page.click('#wp-submit');
    await page.waitForLoadState('networkidle');
    
    // Check if we have test products
    await page.goto(`${baseURL}/wp-admin/edit.php?post_type=product`);
    const productCount = await page.locator('.wp-list-table tbody tr').count();
    
    if (productCount < 5) {
      console.log(`📦 Creating test products (found ${productCount}, need at least 5)...`);
      await createTestProducts(page, baseURL);
    } else {
      console.log(`✅ Found ${productCount} products, sufficient for testing`);
    }
    
    // Check if we have test orders
    await page.goto(`${baseURL}/wp-admin/edit.php?post_type=shop_order`);
    const orderCount = await page.locator('.wp-list-table tbody tr').count();
    
    if (orderCount < 3) {
      console.log(`📋 Creating test orders (found ${orderCount}, need at least 3)...`);
      await createTestOrders(page, baseURL);
    } else {
      console.log(`✅ Found ${orderCount} orders, sufficient for testing`);
    }
    
  } catch (error) {
    console.warn('⚠️ Could not ensure test data:', (error as Error).message);
  }
}

async function createTestProducts(page: any, baseURL: string) {
  const testProducts = [
    { name: 'Football Net', price: '29.99', description: 'High-quality football net for training' },
    { name: 'Basketball', price: '24.99', description: 'Professional basketball for indoor/outdoor use' },
    { name: 'Tennis Racket', price: '89.99', description: 'Premium tennis racket with case' },
    { name: 'Soccer Ball', price: '19.99', description: 'Official size soccer ball' },
    { name: 'Baseball Glove', price: '45.99', description: 'Leather baseball glove for all ages' }
  ];
  
  for (const product of testProducts) {
    try {
      await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=product`);
      await page.waitForLoadState('networkidle');
      
      // Fill product details
      await page.fill('#title', product.name);
      await page.fill('#_regular_price', product.price);
      await page.fill('#excerpt', product.description);
      
      // Publish product
      await page.click('#publish');
      await page.waitForLoadState('networkidle');
      
      console.log(`✅ Created product: ${product.name}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create product ${product.name}:`, (error as Error).message);
    }
  }
}

async function createTestOrders(page: any, baseURL: string) {
  const testOrders = [
    {
      customer: { first: 'John', last: 'Doe', email: 'john.doe@test.com' },
      product: 'Football Net'
    },
    {
      customer: { first: 'Jane', last: 'Smith', email: 'jane.smith@test.com' },
      product: 'Basketball'
    },
    {
      customer: { first: 'Bob', last: 'Johnson', email: 'bob.johnson@test.com' },
      product: 'Tennis Racket'
    }
  ];
  
  for (const order of testOrders) {
    try {
      await page.goto(`${baseURL}/wp-admin/post-new.php?post_type=shop_order`);
      await page.waitForLoadState('networkidle');
      
      // Fill customer details
      await page.fill('#_billing_first_name', order.customer.first);
      await page.fill('#_billing_last_name', order.customer.last);
      await page.fill('#_billing_email', order.customer.email);
      await page.fill('#_billing_phone', '1234567890');
      await page.fill('#_billing_address_1', '123 Test Street');
      await page.fill('#_billing_city', 'Test City');
      await page.fill('#_billing_postcode', '12345');
      
      // Add product to order
      await page.click('#add-line-item');
      await page.waitForTimeout(1000);
      
      // Select product (this is a simplified version)
      await page.selectOption('.wc-product-search', { label: order.product });
      
      // Set order status
      await page.selectOption('#order_status', 'processing');
      
      // Save order
      await page.click('#publish');
      await page.waitForLoadState('networkidle');
      
      console.log(`✅ Created order for: ${order.customer.first} ${order.customer.last}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create order for ${order.customer.first}:`, (error as Error).message);
    }
  }
}

export default globalSetup; 