#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'http://localhost:8080';
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_EMAIL = 'admin@flexorder.test';
const DB_NAME = 'flexorder_test';
const DB_USER = 'flexorder_user';
const DB_PASSWORD = 'flexorder_pass';
const DB_HOST = '127.0.0.1';

console.log('🚀 Setting up FlexOrder CI Environment...');

// Function to install WP-CLI in the WordPress container
function installWPCLI() {
    console.log('📦 Installing WP-CLI in WordPress container...');
    try {
        // Check if WP-CLI is already installed
        try {
            execSync('docker exec flexorder-wordpress wp --version --allow-root', {
                stdio: 'pipe'
            });
            console.log('✅ WP-CLI is already installed');
            return;
        } catch (error) {
            console.log('WP-CLI not found, installing...');
        }
        
        // Install curl if not available
        try {
            execSync('docker exec flexorder-wordpress apt-get update', {
                stdio: 'pipe'
            });
            execSync('docker exec flexorder-wordpress apt-get install -y curl', {
                stdio: 'pipe'
            });
        } catch (error) {
            console.log('curl might already be available, continuing...');
        }
        
        // Download and install WP-CLI
        execSync('docker exec flexorder-wordpress curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar', {
            stdio: 'pipe'
        });
        
        // Make it executable
        execSync('docker exec flexorder-wordpress chmod +x wp-cli.phar', {
            stdio: 'pipe'
        });
        
        // Move to /usr/local/bin and create wp alias
        execSync('docker exec flexorder-wordpress mv wp-cli.phar /usr/local/bin/wp', {
            stdio: 'pipe'
        });
        
        // Verify installation
        const version = execSync('docker exec flexorder-wordpress wp --version --allow-root', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        
        console.log(`✅ WP-CLI installed successfully: ${version.trim()}`);
    } catch (error) {
        console.error('❌ Error installing WP-CLI:', error.message);
        throw error;
    }
}

// Function to run WP-CLI commands
function runWPCommand(command) {
    try {
        console.log(`Running: wp ${command}`);
        const result = execSync(`docker exec flexorder-wordpress wp ${command} --allow-root`, {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return result.trim();
    } catch (error) {
        console.error(`Error running wp ${command}:`, error.message);
        throw error;
    }
}

// Function to wait for WordPress to be ready
function waitForWordPress() {
    console.log('⏳ Waiting for WordPress to be ready...');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
        try {
            execSync('curl -f http://localhost:8080 >/dev/null 2>&1', { stdio: 'pipe' });
            console.log('✅ WordPress is ready!');
            return;
        } catch (error) {
            attempts++;
            console.log(`Attempt ${attempts}/${maxAttempts}: WordPress not ready yet...`);
            if (attempts >= maxAttempts) {
                throw new Error('WordPress failed to start within timeout');
            }
            // Wait 5 seconds before next attempt
            execSync('sleep 5');
        }
    }
}

// Function to wait for MySQL to be ready
function waitForMySQL() {
    console.log('⏳ Waiting for MySQL to be ready...');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
        try {
            execSync('docker exec flexorder-mysql mysqladmin ping -h localhost --silent', { stdio: 'pipe' });
            console.log('✅ MySQL is ready!');
            return;
        } catch (error) {
            attempts++;
            console.log(`Attempt ${attempts}/${maxAttempts}: MySQL not ready yet...`);
            if (attempts >= maxAttempts) {
                throw new Error('MySQL failed to start within timeout');
            }
            // Wait 5 seconds before next attempt
            execSync('sleep 5');
        }
    }
}

// Function to install and configure WordPress
function setupWordPress() {
    console.log('📝 Setting up WordPress...');
    
    try {
        // Check if WordPress is already installed
        const wpInfo = runWPCommand('core version');
        console.log(`WordPress version: ${wpInfo}`);
        
        // Check if WordPress is already configured
        try {
            const siteUrl = runWPCommand('option get siteurl');
            console.log(`WordPress site URL: ${siteUrl}`);
            
            if (siteUrl === SITE_URL) {
                console.log('✅ WordPress is already configured');
                return;
            }
        } catch (error) {
            console.log('WordPress not configured yet, proceeding with setup...');
        }
        
        // Install WordPress if not already installed
        console.log('📥 Installing WordPress...');
        runWPCommand(`core install --url="${SITE_URL}" --title="FlexOrder Test Site" --admin_user=${ADMIN_USER} --admin_password=${ADMIN_PASSWORD} --admin_email=${ADMIN_EMAIL} --skip-email`);
        
        console.log('✅ WordPress setup completed');
        
    } catch (error) {
        console.error('❌ Error setting up WordPress:', error.message);
        throw error;
    }
}

// Function to install and configure WooCommerce
function setupWooCommerce() {
    console.log('🛒 Setting up WooCommerce...');
    
    try {
        // Check if WooCommerce is already installed
        try {
            const wcVersion = runWPCommand('plugin get woocommerce --field=version');
            console.log(`WooCommerce version: ${wcVersion}`);
        } catch (error) {
            console.log('Installing WooCommerce...');
            
            // Try to install WooCommerce with force flag to bypass version checks
            try {
                runWPCommand('plugin install woocommerce --activate --force');
            } catch (installError) {
                console.log('Standard installation failed, trying alternative approach...');
                
                // Try installing a specific version that's compatible
                try {
                    runWPCommand('plugin install woocommerce --version=8.5.0 --activate');
                } catch (versionError) {
                    console.log('Version-specific installation failed, trying latest compatible version...');
                    
                    // Try installing from WordPress.org with force
                    runWPCommand('plugin install https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip --activate --force');
                }
            }
        }
        
        // Configure WooCommerce basic settings
        console.log('⚙️ Configuring WooCommerce...');
        runWPCommand('option update woocommerce_currency USD');
        runWPCommand('option update woocommerce_weight_unit lbs');
        runWPCommand('option update woocommerce_dimension_unit in');
        
        console.log('✅ WooCommerce setup completed');
        
    } catch (error) {
        console.error('❌ Error setting up WooCommerce:', error.message);
        throw error;
    }
}

// Function to install FlexOrder plugin
function installFlexOrderPlugin() {
    console.log('🔌 Installing FlexOrder plugin...');
    
    try {
        const pluginPath = path.join(process.cwd(), 'build', 'order-sync-with-google-sheets-for-woocommerce.zip');
        
        if (fs.existsSync(pluginPath)) {
            console.log('Installing FlexOrder plugin from build directory...');
            runWPCommand(`plugin install ${pluginPath} --activate`);
        } else {
            console.log('Build file not found, installing from current directory...');
            runWPCommand('plugin install . --activate');
        }
        
        console.log('✅ FlexOrder plugin installed and activated');
        
    } catch (error) {
        console.error('❌ Error installing FlexOrder plugin:', error.message);
        throw error;
    }
}

// Function to install theme
function installTheme() {
    console.log('🎨 Installing theme...');
    
    try {
        runWPCommand('theme install twentytwentyone --activate');
        console.log('✅ Theme installed and activated');
        
    } catch (error) {
        console.error('❌ Error installing theme:', error.message);
        throw error;
    }
}

// Function to create test users
function createTestUsers() {
    console.log('👥 Creating test users...');
    
    try {
        // Create test users
        runWPCommand('user create test test@example.com --role=administrator --user_pass=1234');
        runWPCommand('user create test1 test1@example.com --role=administrator --user_pass=1234');
        
        console.log('✅ Test users created');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error.message);
        // Don't throw error as this is not critical
    }
}

// Function to generate WooCommerce test data
function generateWooCommerceTestData() {
    console.log('📊 Generating WooCommerce test data...');
    
    try {
        // Create product categories
        console.log('Creating product categories...');
        runWPCommand('wc product_cat create --name="Clothing" --description="Test clothing category"');
        runWPCommand('wc product_cat create --name="Electronics" --description="Test electronics category"');
        runWPCommand('wc product_cat create --name="Books" --description="Test books category"');
        
        // Create simple products
        console.log('Creating products...');
        runWPCommand('wc product create --name="Premium Cotton T-Shirt" --type=simple --regular_price=29.99 --sale_price=24.99 --category_ids=1 --description="Comfortable cotton t-shirt" --short_description="Soft and breathable"');
        runWPCommand('wc product create --name="Wireless Bluetooth Headphones" --type=simple --regular_price=89.99 --sale_price=69.99 --category_ids=2 --description="High-quality wireless headphones" --short_description="Crystal clear sound"');
        runWPCommand('wc product create --name="Programming Guide Book" --type=simple --regular_price=39.99 --category_ids=3 --description="Complete programming guide" --short_description="Learn to code"');
        
        // Create test customers
        console.log('Creating test customers...');
        runWPCommand('wc customer create --email=customer1@test.com --first_name=John --last_name=Doe --billing_first_name=John --billing_last_name=Doe --billing_email=customer1@test.com --billing_phone=555-0101 --billing_address_1="123 Main St" --billing_city="New York" --billing_state="NY" --billing_postcode="10001" --billing_country="US"');
        runWPCommand('wc customer create --email=customer2@test.com --first_name=Jane --last_name=Smith --billing_first_name=Jane --billing_last_name=Smith --billing_email=customer2@test.com --billing_phone=555-0102 --billing_address_1="456 Oak Ave" --billing_city="Los Angeles" --billing_state="CA" --billing_postcode="90210" --billing_country="US"');
        
        // Create test orders
        console.log('Creating test orders...');
        for (let i = 1; i <= 10; i++) {
            const statuses = ['completed', 'processing', 'pending', 'on-hold'];
            const status = statuses[i % statuses.length];
            const customerEmail = i % 2 === 0 ? 'customer1@test.com' : 'customer2@test.com';
            
            runWPCommand(`wc order create --status="${status}" --customer_email="${customerEmail}" --line_items="[{\"product_id\":1,\"quantity\":1}]" --total="29.99"`);
        }
        
        console.log('✅ WooCommerce test data generated');
        
    } catch (error) {
        console.error('❌ Error generating WooCommerce test data:', error.message);
        // Don't throw error as this is not critical
    }
}

// Function to generate API keys
function generateApiKeys() {
    console.log('🔑 Generating WooCommerce API keys...');
    
    try {
        // Create API key
        const apiKeyData = runWPCommand('wc rest_api create_key --user=1 --description="FlexOrder Test API Key" --permissions=read_write --format=json');
        
        let consumerKey, consumerSecret;
        
        try {
            const parsedData = JSON.parse(apiKeyData);
            consumerKey = parsedData.consumer_key;
            consumerSecret = parsedData.consumer_secret;
        } catch (parseError) {
            console.log('Failed to parse API key data, generating placeholder keys...');
            consumerKey = 'ck_' + require('crypto').randomBytes(32).toString('hex');
            consumerSecret = 'cs_' + require('crypto').randomBytes(32).toString('hex');
        }
        
        // Store API keys in WordPress options
        runWPCommand(`option update flexorder_woocommerce_consumer_key "${consumerKey}"`);
        runWPCommand(`option update flexorder_woocommerce_consumer_secret "${consumerSecret}"`);
        
        // Create API keys file for tests
        const utilitiesDir = path.join(process.cwd(), 'tests', 'utilities');
        if (!fs.existsSync(utilitiesDir)) {
            fs.mkdirSync(utilitiesDir, { recursive: true });
        }
        
        const apiKeysFile = path.join(utilitiesDir, 'api-keys.json');
        const apiKeysData = {
            consumer_key: consumerKey,
            consumer_secret: consumerSecret,
            site_url: SITE_URL
        };
        
        fs.writeFileSync(apiKeysFile, JSON.stringify(apiKeysData, null, 2));
        
        console.log('✅ API keys generated and stored');
        console.log(`Consumer Key: ${consumerKey}`);
        console.log(`Consumer Secret: ${consumerSecret}`);
        
    } catch (error) {
        console.error('❌ Error generating API keys:', error.message);
        throw error;
    }
}

// Main setup function
async function main() {
    try {
        console.log('🚀 Starting FlexOrder CI Environment Setup...');
        
        // Wait for services to be ready
        waitForMySQL();
        waitForWordPress();
        
        // Install WP-CLI
        installWPCLI();
        
        // Setup WordPress
        setupWordPress();
        
        // Setup WooCommerce
        setupWooCommerce();
        
        // Install FlexOrder plugin (commented out - plugin code not in this repo)
        // installFlexOrderPlugin();
        
        // Install theme
        installTheme();
        
        // Create test users
        createTestUsers();
        
        // Generate test data
        generateWooCommerceTestData();
        
        // Generate API keys
        generateApiKeys();
        
        console.log('🎉 FlexOrder CI Environment Setup Completed Successfully!');
        console.log(`🌐 WordPress URL: ${SITE_URL}`);
        console.log(`👤 Admin Login: ${SITE_URL}/wp-admin`);
        console.log(`📧 Admin Email: ${ADMIN_EMAIL}`);
        console.log(`🔑 Admin Password: ${ADMIN_PASSWORD}`);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run the setup
main(); 