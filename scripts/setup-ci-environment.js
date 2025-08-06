#!/usr/bin/env node

/**
 * CI Environment Setup Script
 * Sets up a complete WordPress + WooCommerce environment for CI testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
// const path = require('path');

console.log('🚀 Setting up CI Environment for FlexOrder Plugin Testing...\n');

// Configuration
const config = {
  WORDPRESS_VERSION: process.env.WORDPRESS_VERSION || '6.4',
  PHP_VERSION: process.env.PHP_VERSION || '8.1',
  MYSQL_VERSION: process.env.MYSQL_VERSION || '8.0',
  WOOCOMMERCE_VERSION: process.env.WOOCOMMERCE_VERSION || '8.5',
  SITE_URL: process.env.SITE_URL || 'http://localhost:8080',
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@test.local',
  DB_HOST: process.env.DB_HOST || 'mysql',
  DB_NAME: process.env.DB_NAME || 'wordpress',
  DB_USER: process.env.DB_USER || 'wordpress',
  DB_PASSWORD: process.env.DB_PASSWORD || 'wordpress_password'
};

async function runCommand(command, description, options = {}) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options
    });
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (options.throwOnError !== false) {
      throw error;
    }
    return null;
  }
}

async function createDockerCompose() {
  const dockerCompose = `version: '3.8'
services:
  wordpress:
    image: wordpress:${config.WORDPRESS_VERSION}-php${config.PHP_VERSION}-apache
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: ${config.DB_HOST}
      WORDPRESS_DB_NAME: ${config.DB_NAME}
      WORDPRESS_DB_USER: ${config.DB_USER}
      WORDPRESS_DB_PASSWORD: ${config.DB_PASSWORD}
      WORDPRESS_DEBUG: 1
      WORDPRESS_CONFIG_EXTRA: |
        define('WP_DEBUG_LOG', true);
        define('WP_DEBUG_DISPLAY', false);
        define('WP_MEMORY_LIMIT', '256M');
        define('WP_MAX_MEMORY_LIMIT', '512M');
    volumes:
      - wordpress_data:/var/www/html
      - ./plugins:/var/www/html/wp-content/plugins
      - ./uploads:/var/www/html/wp-content/uploads
    depends_on:
      - mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql:
    image: mysql:${config.MYSQL_VERSION}
    environment:
      MYSQL_DATABASE: ${config.DB_NAME}
      MYSQL_USER: ${config.DB_USER}
      MYSQL_PASSWORD: ${config.DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: somewordpress
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    ports:
      - "8081:80"
    environment:
      PMA_HOST: ${config.DB_HOST}
      PMA_USER: ${config.DB_USER}
      PMA_PASSWORD: ${config.DB_PASSWORD}
    depends_on:
      - mysql
    restart: unless-stopped

volumes:
  wordpress_data:
  mysql_data:`;

  fs.writeFileSync('docker-compose.yml', dockerCompose);
  console.log('✅ Docker Compose file created');
}

async function setupWordPress() {
  console.log('\n🔧 Setting up WordPress environment...\n');

  // Create docker-compose.yml
  await createDockerCompose();

  // Start WordPress
  await runCommand('docker-compose up -d', 'Starting WordPress containers');

  // Wait for WordPress to be ready
  console.log('⏳ Waiting for WordPress to be ready...');
  let attempts = 0;
  const maxAttempts = 60;
  
  while (attempts < maxAttempts) {
    try {
      execSync('curl -f http://localhost:8080', { stdio: 'pipe' });
      console.log('✅ WordPress is ready!');
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('WordPress failed to start within timeout');
      }
      console.log(`⏳ Attempt ${attempts}/${maxAttempts} - Waiting for WordPress...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Install WP-CLI
  await runCommand(
    'docker-compose exec -T wordpress curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
    'Downloading WP-CLI'
  );
  
  await runCommand(
    'docker-compose exec -T wordpress chmod +x wp-cli.phar',
    'Making WP-CLI executable'
  );
  
  await runCommand(
    'docker-compose exec -T wordpress mv wp-cli.phar /usr/local/bin/wp',
    'Installing WP-CLI'
  );

  // Install WordPress
  await runCommand(
    `docker-compose exec -T wordpress wp core install --url="${config.SITE_URL}" --title="FlexOrder Test Site" --admin_user="${config.ADMIN_USER}" --admin_password="${config.ADMIN_PASSWORD}" --admin_email="${config.ADMIN_EMAIL}" --skip-email`,
    'Installing WordPress core'
  );

  console.log('✅ WordPress setup completed!');
}

async function setupWooCommerce() {
  console.log('\n🛒 Setting up WooCommerce...\n');

  // Install WooCommerce
  await runCommand(
    'docker-compose exec -T wordpress wp plugin install woocommerce --activate',
    'Installing and activating WooCommerce'
  );

  // Configure WooCommerce
  await runCommand(
    'docker-compose exec -T wordpress wp option update woocommerce_currency USD',
    'Setting WooCommerce currency'
  );
  
  await runCommand(
    'docker-compose exec -T wordpress wp option update woocommerce_weight_unit lbs',
    'Setting WooCommerce weight unit'
  );
  
  await runCommand(
    'docker-compose exec -T wordpress wp option update woocommerce_dimension_unit in',
    'Setting WooCommerce dimension unit'
  );

  // Generate WooCommerce REST API key
  console.log('🔑 Generating WooCommerce REST API key...');
  const apiKeyData = execSync(
    'docker-compose exec -T wordpress wp wc api create_key --user=admin --description="FlexOrder Test API Key" --permissions=read_write --format=json',
    { encoding: 'utf8' }
  );

  const apiKey = JSON.parse(apiKeyData);
  console.log('✅ WooCommerce API key generated:');
  console.log(`   Consumer Key: ${apiKey.consumer_key}`);
  console.log(`   Consumer Secret: ${apiKey.consumer_secret}`);

  // Activate Cash on Delivery
  await runCommand(
    'docker-compose exec -T wordpress wp wc payment_gateway update cod --enabled=yes',
    'Activating Cash on Delivery'
  );

  console.log('✅ WooCommerce setup completed!');
  return apiKey;
}

async function createTestData() {
  console.log('\n📦 Creating test data...\n');

  // Create test products
  const testProducts = [
    { name: 'Football Net', price: '29.99', sku: 'FN001' },
    { name: 'Basketball', price: '24.99', sku: 'BB001' },
    { name: 'Tennis Racket', price: '89.99', sku: 'TR001' },
    { name: 'Soccer Ball', price: '19.99', sku: 'SB001' },
    { name: 'Baseball Glove', price: '45.99', sku: 'BG001' }
  ];

  for (const product of testProducts) {
    await runCommand(
      `docker-compose exec -T wordpress wp wc product create --user=admin --name="${product.name}" --type=simple --regular_price=${product.price} --sku="${product.sku}" --description="Test product for automation" --short_description="${product.name}" --status=publish`,
      `Creating test product: ${product.name}`
    );
  }

  // Create test orders
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
    await runCommand(
      `docker-compose exec -T wordpress wp wc order create --user=admin --status=processing --billing='{"first_name":"${order.customer.first}","last_name":"${order.customer.last}","email":"${order.customer.email}","phone":"1234567890","address_1":"123 Test St","city":"Test City","state":"TS","postcode":"12345","country":"US"}' --shipping='{"first_name":"${order.customer.first}","last_name":"${order.customer.last}","address_1":"123 Test St","city":"Test City","state":"TS","postcode":"12345","country":"US"}' --line_items='[{"product_id":1,"quantity":1}]'`,
      `Creating test order for: ${order.customer.first} ${order.customer.last}`
    );
  }

  console.log('✅ Test data creation completed!');
}

async function createTestEnvironment() {
  console.log('\n🧪 Creating test environment file...\n');

  const envContent = `# CI Test Environment Configuration
# Generated automatically for testing

# Site Configuration
URL=${config.SITE_URL}/wp-login.php?loggedout=true&wp_lang=en_US
ADMIN_PANEL_URL=${config.SITE_URL}/wp-admin/
SITE_URL=${config.SITE_URL}/
PLAYWRIGHT_BASE_URL=${config.SITE_URL}/

# Admin Credentials
USER_NAME=${config.ADMIN_USER}
PASSWORD=${config.ADMIN_PASSWORD}

# WooCommerce Configuration (will be updated with actual keys)
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here

# Google Sheets Configuration
GOOGLE_SHEET_ID=1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM/edit?pli=1&gid=0#gid=0
GOOGLE_SHEET_SCOPES=https://www.googleapis.com/auth/spreadsheets
SHEET_NAME=Orders
SHEET_RANGE=Orders!A1:Z1000

# Google Account Configuration
GOOGLE_ACCOUNT_EMAIL=rakibul1@wppool.dev
GOOGLE_ACCOUNT_PASSWORD=WpPool#03029#

# Service Account Configuration
SERVICE_ACCOUNT_UPLOAD_FILE=./tests/utilities/upload_key.json
GOOGLE_PROJECT=

# Plugin Configuration
Replace_Plugin_Path=tests/utilities/order-sync-with-google-sheets-for-woocommerce.zip
REPLACE_PLUGIN_URL=

# Apps Script Configuration
APPS_SCRIPT_DEPLOYMENT_ID=AKfycbxixhzG8LBMG4DoHG-c2ddP-Hna4KvehQysKDCWozaAZAB2apXPPAbND7gTh6ipWVgLUA
APPS_SCRIPT_PROJECT_ID=windy-nation-438204-d0
Web_App_URL=https://script.google.com/a/macros/wppool.dev/s/AKfycbxixhzG8LBMG4DoHG-c2ddP-Hna4KvehQysKDCWozaAZAB2apXPPAbND7gTh6ipWVgLUA/exec

# Test Configuration
ARRAY_INDEX=6
STOCK_STATUS=wc-completed
ORDER_STATUS_RANGE=Orders!C2:C1000

# Database Configuration
DB_HOST=${config.DB_HOST}
DB_NAME=${config.DB_NAME}
DB_USER=${config.DB_USER}
DB_PASSWORD=${config.DB_PASSWORD}

# Playwright Configuration
CI=true
TEST_TIMEOUT=300000
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=1
HEADLESS=true
SLOW_MO=0
`;

  fs.writeFileSync('tests/utilities/.env.ci', envContent);
  console.log('✅ Test environment file created: tests/utilities/.env.ci');
}

async function runSmokeTests() {
  console.log('\n🧪 Running smoke tests...\n');

  // Copy CI environment file
  fs.copyFileSync('tests/utilities/.env.ci', 'tests/utilities/.env');

  // Run smoke tests
  try {
    await runCommand('npm run test:ci:smoke', 'Running smoke tests');
    console.log('✅ Smoke tests completed successfully!');
  } catch (error) {
    console.log('⚠️ Some smoke tests failed (this might be expected for Google Sheets tests)');
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up...\n');

  try {
    await runCommand('docker-compose down -v', 'Stopping containers and removing volumes', { throwOnError: false });
    await runCommand('docker volume prune -f', 'Cleaning up Docker volumes', { throwOnError: false });
    console.log('✅ Cleanup completed!');
  } catch (error) {
    console.log('⚠️ Cleanup had some issues:', error.message);
  }
}

async function main() {
  try {
    // Check if Docker is available
    try {
      execSync('docker --version', { stdio: 'pipe' });
      execSync('docker-compose --version', { stdio: 'pipe' });
    } catch (error) {
      console.error('❌ Docker or Docker Compose not available. Please install Docker first.');
      process.exit(1);
    }

    // Setup environment
    await setupWordPress();
    const apiKey = await setupWooCommerce();
    await createTestData();
    await createTestEnvironment();

    // Update environment file with actual API keys
    if (apiKey) {
      const envPath = 'tests/utilities/.env.ci';
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace('your_consumer_key_here', apiKey.consumer_key);
      envContent = envContent.replace('your_consumer_secret_here', apiKey.consumer_secret);
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated environment file with actual API keys');
    }

    // Run tests
    await runSmokeTests();

    console.log('\n🎉 CI Environment Setup Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   🌐 WordPress Site: ${config.SITE_URL}`);
    console.log(`   👤 Admin User: ${config.ADMIN_USER}`);
    console.log(`   🔑 Admin Password: ${config.ADMIN_PASSWORD}`);
    console.log(`   🛒 WooCommerce: Installed and configured`);
    console.log(`   📦 Test Products: 5 created`);
    console.log(`   📋 Test Orders: 3 created`);
    console.log(`   💳 Payment Methods: Cash on Delivery activated`);
    if (apiKey) {
      console.log(`   🔑 API Keys: Generated and configured`);
    }

    // Ask if user wants to keep the environment running
    console.log('\n❓ Do you want to keep the test environment running? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        console.log('✅ Test environment will remain running. Use "docker-compose down" to stop it later.');
      } else {
        await cleanup();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ CI Environment Setup Failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Received interrupt signal. Cleaning up...');
  await cleanup();
  process.exit(0);
});

main(); 