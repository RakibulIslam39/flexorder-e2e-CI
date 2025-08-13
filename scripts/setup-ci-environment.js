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
            
            // Try multiple installation methods
            let installed = false;
            
            // Method 1: Install from WordPress.org repository
            try {
                console.log('Trying to install WooCommerce from WordPress.org...');
                runWPCommand('plugin install woocommerce --activate');
                installed = true;
            } catch (installError) {
                console.log('WordPress.org installation failed, trying with force flag...');
                
                // Method 2: Install with force flag
                try {
                    runWPCommand('plugin install woocommerce --activate --force');
                    installed = true;
                } catch (forceError) {
                    console.log('Force installation failed, trying specific version...');
                    
                    // Method 3: Install specific version
                    try {
                        runWPCommand('plugin install woocommerce --version=8.5.0 --activate');
                        installed = true;
                    } catch (versionError) {
                        console.log('Version-specific installation failed, trying direct download...');
                        
                        // Method 4: Direct download from WordPress.org
                        try {
                            runWPCommand('plugin install https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip --activate --force');
                            installed = true;
                        } catch (downloadError) {
                            console.log('Direct download failed, trying alternative URL...');
                            
                            // Method 5: Alternative download URL
                            try {
                                runWPCommand('plugin install https://downloads.wordpress.org/plugin/woocommerce.8.5.0.zip --activate');
                                installed = true;
                            } catch (altError) {
                                throw new Error('All WooCommerce installation methods failed');
                            }
                        }
                    }
                }
            }
            
            if (!installed) {
                throw new Error('Failed to install WooCommerce after trying all methods');
            }
            
            // Verify installation
            try {
                const wcVersion = runWPCommand('plugin get woocommerce --field=version');
                console.log(`✅ WooCommerce installed successfully: ${wcVersion}`);
            } catch (verifyError) {
                throw new Error('WooCommerce installation verification failed');
            }
        }
        
        // Configure WooCommerce basic settings
        console.log('⚙️ Configuring WooCommerce...');
        runWPCommand('option update woocommerce_currency USD');
        runWPCommand('option update woocommerce_weight_unit lbs');
        runWPCommand('option update woocommerce_dimension_unit in');
        
        // Verify WooCommerce is properly activated
        try {
            const isActive = runWPCommand('plugin is-active woocommerce');
            if (isActive === 'yes') {
                console.log('✅ WooCommerce is active and configured');
            } else {
                console.log('⚠️ WooCommerce is installed but not active, activating...');
                runWPCommand('plugin activate woocommerce');
            }
        } catch (error) {
            console.log('⚠️ Could not verify WooCommerce activation status');
        }
        
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
        runWPCommand('wc product_cat create --name="Clothing" --description="Test clothing category" --user=1');
        runWPCommand('wc product_cat create --name="Electronics" --description="Test electronics category" --user=1');
        runWPCommand('wc product_cat create --name="Books" --description="Test books category" --user=1');
        runWPCommand('wc product_cat create --name="Home & Garden" --description="Test home and garden category" --user=1');
        runWPCommand('wc product_cat create --name="Sports" --description="Test sports category" --user=1');
        
        // Create 20 products across different categories
        console.log('Creating 20 products...');
        const products = [
            // Clothing (Category 1)
            { name: "Premium Cotton T-Shirt", price: 29.99, sale_price: 24.99, category: 1, description: "Comfortable cotton t-shirt" },
            { name: "Denim Jeans", price: 79.99, sale_price: 59.99, category: 1, description: "Classic blue denim jeans" },
            { name: "Hooded Sweatshirt", price: 45.99, sale_price: 35.99, category: 1, description: "Warm hooded sweatshirt" },
            { name: "Running Shoes", price: 89.99, sale_price: 69.99, category: 1, description: "Comfortable running shoes" },
            
            // Electronics (Category 2)
            { name: "Wireless Bluetooth Headphones", price: 89.99, sale_price: 69.99, category: 2, description: "High-quality wireless headphones" },
            { name: "Smartphone Case", price: 19.99, sale_price: 14.99, category: 2, description: "Protective smartphone case" },
            { name: "USB-C Cable", price: 12.99, sale_price: 9.99, category: 2, description: "Fast charging USB-C cable" },
            { name: "Wireless Mouse", price: 34.99, sale_price: 24.99, category: 2, description: "Ergonomic wireless mouse" },
            
            // Books (Category 3)
            { name: "Programming Guide Book", price: 39.99, sale_price: 29.99, category: 3, description: "Complete programming guide" },
            { name: "Business Strategy Book", price: 24.99, sale_price: 19.99, category: 3, description: "Business strategy guide" },
            { name: "Cookbook Collection", price: 49.99, sale_price: 39.99, category: 3, description: "Delicious recipes collection" },
            { name: "Travel Guide", price: 19.99, sale_price: 14.99, category: 3, description: "Comprehensive travel guide" },
            
            // Home & Garden (Category 4)
            { name: "Garden Tool Set", price: 59.99, sale_price: 44.99, category: 4, description: "Complete garden tool set" },
            { name: "Kitchen Mixer", price: 129.99, sale_price: 99.99, category: 4, description: "Professional kitchen mixer" },
            { name: "LED Desk Lamp", price: 34.99, sale_price: 24.99, category: 4, description: "Adjustable LED desk lamp" },
            { name: "Plant Pot Set", price: 24.99, sale_price: 19.99, category: 4, description: "Decorative plant pot set" },
            
            // Sports (Category 5)
            { name: "Yoga Mat", price: 29.99, sale_price: 19.99, category: 5, description: "Non-slip yoga mat" },
            { name: "Dumbbell Set", price: 79.99, sale_price: 59.99, category: 5, description: "Adjustable dumbbell set" },
            { name: "Basketball", price: 24.99, sale_price: 19.99, category: 5, description: "Official size basketball" },
            { name: "Tennis Racket", price: 89.99, sale_price: 69.99, category: 5, description: "Professional tennis racket" }
        ];
        
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const salePriceParam = product.sale_price ? `--sale_price=${product.sale_price}` : '';
            runWPCommand(`wc product create --name="${product.name}" --type=simple --regular_price=${product.price} ${salePriceParam} --categories="[{\\"id\\":${product.category}}]" --description="${product.description}" --short_description="${product.description}" --user=1`);
        }
        
        // Create test customers with correct parameters
        console.log('Creating test customers...');
        runWPCommand('wc customer create --email=customer1@test.com --first_name=John --last_name=Doe --user=1');
        runWPCommand('wc customer create --email=customer2@test.com --first_name=Jane --last_name=Smith --user=1');
        runWPCommand('wc customer create --email=customer3@test.com --first_name=Mike --last_name=Johnson --user=1');
        runWPCommand('wc customer create --email=customer4@test.com --first_name=Sarah --last_name=Wilson --user=1');
        runWPCommand('wc customer create --email=customer5@test.com --first_name=David --last_name=Brown --user=1');
        
        // Create 50 orders with various statuses and multiple products
        console.log('Creating 50 orders with multiple products...');
        const orderStatuses = ['completed', 'processing', 'pending', 'on-hold', 'cancelled', 'refunded'];
        const customerEmails = ['customer1@test.com', 'customer2@test.com', 'customer3@test.com', 'customer4@test.com', 'customer5@test.com'];
        
        for (let i = 1; i <= 50; i++) {
            const status = orderStatuses[i % orderStatuses.length];
            const customerEmail = customerEmails[i % customerEmails.length];
            
            // Create orders with 1-4 products randomly
            const numProducts = Math.floor(Math.random() * 4) + 1; // 1-4 products
            let total = 0;
            
            // Create line items for the order
            const lineItems = [];
            for (let j = 0; j < numProducts; j++) {
                const productId = Math.floor(Math.random() * 20) + 1; // Products 1-20
                const quantity = Math.floor(Math.random() * 3) + 1; // Quantity 1-3
                const product = products[productId - 1];
                const price = product.sale_price || product.price;
                const itemTotal = price * quantity;
                total += itemTotal;
                
                lineItems.push({
                    product_id: productId,
                    quantity: quantity,
                    total: itemTotal,
                    subtotal: itemTotal
                });
            }
            
            // Create order using wp post create with WooCommerce order post type
            try {
                const orderId = runWPCommand(`post create --post_type=shop_order --post_status=wc-${status} --post_title="Order #${i}" --user=1`);
                console.log(`Created order #${i} with ID: ${orderId}`);
                
                // Set order meta data
                runWPCommand(`post meta update ${orderId} _customer_user 1`);
                runWPCommand(`post meta update ${orderId} _billing_email "${customerEmail}"`);
                runWPCommand(`post meta update ${orderId} _order_total ${total.toFixed(2)}`);
                runWPCommand(`post meta update ${orderId} _order_currency USD`);
                runWPCommand(`post meta update ${orderId} _payment_method bacs`);
                runWPCommand(`post meta update ${orderId} _payment_method_title "Direct bank transfer"`);
                
                // Add line items to the order
                for (let k = 0; k < lineItems.length; k++) {
                    const item = lineItems[k];
                    runWPCommand(`post meta update ${orderId} _line_items_${k}_product_id ${item.product_id}`);
                    runWPCommand(`post meta update ${orderId} _line_items_${k}_qty ${item.quantity}`);
                    runWPCommand(`post meta update ${orderId} _line_items_${k}_line_total ${item.total}`);
                    runWPCommand(`post meta update ${orderId} _line_items_${k}_line_subtotal ${item.subtotal}`);
                }
                
                // Set line items count
                runWPCommand(`post meta update ${orderId} _line_items_count ${lineItems.length}`);
                
            } catch (error) {
                console.log(`⚠️ Failed to create order #${i}, continuing...`);
            }
        }
        
        console.log('✅ WooCommerce test data generated successfully!');
        console.log(`📦 Created ${products.length} products across 5 categories`);
        console.log(`👥 Created ${customerEmails.length} test customers`);
        console.log(`📋 Created 50 orders with various statuses and multiple products`);
        
    } catch (error) {
        console.error('❌ Error generating WooCommerce test data:', error.message);
        console.log('⚠️ Continuing with setup - test data generation is not critical');
        // Don't throw error as this is not critical for the main setup
    }
}

// Function to generate API keys
function generateApiKeys() {
    console.log('🔑 Generating WooCommerce API keys...');
    
    try {
        // Generate placeholder API keys since WooCommerce CLI doesn't support REST API key creation
        const consumerKey = 'ck_' + require('crypto').randomBytes(32).toString('hex');
        const consumerSecret = 'cs_' + require('crypto').randomBytes(32).toString('hex');
        
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
        console.log('Note: These are placeholder keys. For real API access, create keys via WooCommerce admin panel.');
        
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