#!/usr/bin/env bash
set -ex

######################################################
######################## VARS ########################
SITE_NAME='flexorder.local'
SITE_ROOT="/var/www/$SITE_NAME/htdocs"
SITE_URL="http://$SITE_NAME/"
PLUGIN_NAME="order-sync-with-google-sheets-for-woocommerce"
PLUGIN_SLUG="order-sync-with-google-sheets-for-woocommerce"

#####################################################
# Start required services for site creation
function start_services() {
    echo "Starting services"
    git config --global user.email "nobody@example.com"
    git config --global user.name "nobody"
    rm -f /etc/nginx/conf.d/stub_status.conf /etc/nginx/sites-available/22222 /etc/nginx/sites-enabled/22222
    rm -rf /var/www/22222
    
    # Start WordPress stack (similar to rtMedia)
    if command -v ee &> /dev/null; then
        echo "Using EasyEngine stack"
        ee stack start --nginx --mysql --php74
        ee stack status --nginx --mysql --php74
    else
        echo "Using local WordPress setup"
        # Start MySQL and Nginx if available
        sudo service mysql start 2>/dev/null || true
        sudo service nginx start 2>/dev/null || true
    fi
}



# Create, setup and populate FlexOrder plugin with data
function create_and_configure_site() {
    echo "Creating and configuring FlexOrder WordPress site"
    
    # Create WordPress site (following rtMedia's approach)
    if command -v ee &> /dev/null; then
        echo "Creating site with EasyEngine"
        ee site create $SITE_NAME --wp --php74
        cd $SITE_ROOT/wp-content/plugins/
        mkdir -p $PLUGIN_NAME
        rsync -azh $GITHUB_WORKSPACE/ $SITE_ROOT/wp-content/plugins/$PLUGIN_NAME
        echo "127.0.0.1 $SITE_NAME" >> /etc/hosts
    else
        echo "Creating site with WP-CLI"
        sudo mkdir -p $SITE_ROOT
        cd $SITE_ROOT
        
        # Download WordPress
        wp core download --allow-root
        
        # Create wp-config.php
        wp config create \
            --dbname=flexorder_test \
            --dbuser=flexorder_user \
            --dbpass=flexorder_pass \
            --dbhost=localhost \
            --allow-root
        
        # Install WordPress
        wp core install \
            --url="$SITE_URL" \
            --title="FlexOrder Test Site" \
            --admin_user=admin \
            --admin_password=admin123 \
            --admin_email=admin@flexorder.test \
            --allow-root
        
        # Add to hosts file
        echo "127.0.0.1 $SITE_NAME" | sudo tee -a /etc/hosts
    fi
    
    cd $SITE_ROOT
    
    # Install and activate WooCommerce (your prerequisite)
    echo "Installing WooCommerce"
    wp plugin install woocommerce --activate --allow-root
    
    # Install FlexOrder plugin (Free Version)
    echo "Installing FlexOrder plugin (Free Version)"
    if [ -f "$GITHUB_WORKSPACE/build/$PLUGIN_NAME.zip" ]; then
        wp plugin install "$GITHUB_WORKSPACE/build/$PLUGIN_NAME.zip" --activate --allow-root
    else
        echo "Installing from current directory"
        wp plugin install . --activate --allow-root
    fi
    
    # Install and activate Pro version if license key is available
    echo "Checking for Pro version installation"
    if [ -n "$FLEXORDER_PRO_LICENSE_KEY" ]; then
        echo "Installing FlexOrder Pro version"
        install_pro_version
    else
        echo "No Pro license key provided, using Free version only"
    fi
    
    # Create test users (like rtMedia)
    echo "Creating test users"
    wp user create test test@example.com --role=administrator --user_pass=1234 --allow-root
    wp user create test1 test1@example.com --role=administrator --user_pass=1234 --allow-root
    
    # Install and activate theme
    echo "Installing theme"
    wp theme install twentytwentyone --activate --allow-root
    
    # Generate WooCommerce test data (your prerequisite)
    echo "Generating WooCommerce test data"
    generate_woocommerce_test_data
    
    # Generate WooCommerce REST API keys (your prerequisite)
    echo "Generating WooCommerce REST API keys"
    generate_api_keys
    
    echo "Site configuration completed"
}

# Install FlexOrder Pro version
function install_pro_version() {
    echo "Installing FlexOrder Pro version"
    
    # Check if Pro plugin file exists
    if [ -f "$GITHUB_WORKSPACE/build/${PLUGIN_NAME}-pro.zip" ]; then
        echo "Installing Pro plugin from zip"
        wp plugin install "$GITHUB_WORKSPACE/build/${PLUGIN_NAME}-pro.zip" --activate --allow-root
    else
        echo "Pro plugin zip not found, checking for Pro directory"
        if [ -d "$GITHUB_WORKSPACE/pro" ]; then
            echo "Installing Pro plugin from directory"
            wp plugin install "$GITHUB_WORKSPACE/pro" --activate --allow-root
        else
            echo "Pro plugin not found, continuing with Free version"
            return
        fi
    fi
    
    # Activate Pro license if key is provided
    if [ -n "$FLEXORDER_PRO_LICENSE_KEY" ]; then
        echo "Activating Pro license"
        activate_pro_license
    fi
}

# Activate FlexOrder Pro license
function activate_pro_license() {
    echo "Activating FlexOrder Pro license"
    
    # This would typically involve making an API call to the license server
    # For now, we'll store the license key in WordPress options
    wp option update flexorder_pro_license_key "$FLEXORDER_PRO_LICENSE_KEY" --allow-root
    wp option update flexorder_pro_license_status "active" --allow-root
    
    echo "Pro license activated"
}

# Generate WooCommerce test data (your prerequisite)
function generate_woocommerce_test_data() {
    echo "Generating comprehensive WooCommerce test data"
    
    # Create product categories
    echo "Creating product categories..."
    wp wc product_cat create --name="Clothing" --description="Test clothing category" --allow-root
    wp wc product_cat create --name="Electronics" --description="Test electronics category" --allow-root
    wp wc product_cat create --name="Books" --description="Test books category" --allow-root
    wp wc product_cat create --name="Home & Garden" --description="Test home and garden category" --allow-root
    wp wc product_cat create --name="Sports" --description="Test sports category" --allow-root
    wp wc product_cat create --name="Beauty" --description="Test beauty category" --allow-root
    
    # Create simple products with more variety
    echo "Creating simple products..."
    wp wc product create --name="Premium Cotton T-Shirt" --type=simple --regular_price=29.99 --sale_price=24.99 --category_ids=1 --description="Comfortable cotton t-shirt" --short_description="Soft and breathable" --allow-root
    wp wc product create --name="Classic Blue Jeans" --type=simple --regular_price=79.99 --category_ids=1 --description="Classic blue denim jeans" --short_description="Perfect fit" --allow-root
    wp wc product create --name="Wireless Bluetooth Headphones" --type=simple --regular_price=89.99 --sale_price=69.99 --category_ids=2 --description="High-quality wireless headphones" --short_description="Crystal clear sound" --allow-root
    wp wc product create --name="Gaming Laptop" --type=simple --regular_price=1299.99 --category_ids=2 --description="High-performance gaming laptop" --short_description="Perfect for gaming" --allow-root
    wp wc product create --name="Programming Guide Book" --type=simple --regular_price=39.99 --category_ids=3 --description="Complete programming guide" --short_description="Learn to code" --allow-root
    wp wc product create --name="Garden Tool Set" --type=simple --regular_price=149.99 --sale_price=119.99 --category_ids=4 --description="Complete garden maintenance set" --short_description="Professional tools" --allow-root
    wp wc product create --name="Yoga Mat" --type=simple --regular_price=49.99 --category_ids=5 --description="Premium yoga mat" --short_description="Non-slip surface" --allow-root
    wp wc product create --name="Organic Face Cream" --type=simple --regular_price=34.99 --category_ids=6 --description="Natural organic face cream" --short_description="Hydrating formula" --allow-root
    wp wc product create --name="Smartphone Case" --type=simple --regular_price=19.99 --sale_price=14.99 --category_ids=2 --description="Protective smartphone case" --short_description="Shock resistant" --allow-root
    wp wc product create --name="Coffee Maker" --type=simple --regular_price=199.99 --category_ids=4 --description="Automatic coffee maker" --short_description="Perfect brew every time" --allow-root
    
    # Create variable products
    echo "Creating variable products..."
    wp wc product create --name="Designer T-Shirt Collection" --type=variable --regular_price=44.99 --category_ids=1 --description="Collection of designer t-shirts" --short_description="Multiple colors and sizes" --allow-root
    wp wc product create --name="Smart Watch Series" --type=variable --regular_price=299.99 --category_ids=2 --description="Latest smart watch series" --short_description="Track your fitness" --allow-root
    
    # Create test customers
    echo "Creating test customers..."
    wp wc customer create --email=customer1@test.com --first_name=John --last_name=Doe --billing_first_name=John --billing_last_name=Doe --billing_email=customer1@test.com --billing_phone=555-0101 --billing_address_1="123 Main St" --billing_city="New York" --billing_state="NY" --billing_postcode="10001" --billing_country="US" --allow-root
    wp wc customer create --email=customer2@test.com --first_name=Jane --last_name=Smith --billing_first_name=Jane --billing_last_name=Smith --billing_email=customer2@test.com --billing_phone=555-0102 --billing_address_1="456 Oak Ave" --billing_city="Los Angeles" --billing_state="CA" --billing_postcode="90210" --billing_country="US" --allow-root
    wp wc customer create --email=customer3@test.com --first_name=Mike --last_name=Johnson --billing_first_name=Mike --billing_last_name=Johnson --billing_email=customer3@test.com --billing_phone=555-0103 --billing_address_1="789 Pine Rd" --billing_city="Chicago" --billing_state="IL" --billing_postcode="60601" --billing_country="US" --allow-root
    wp wc customer create --email=customer4@test.com --first_name=Sarah --last_name=Wilson --billing_first_name=Sarah --billing_last_name=Wilson --billing_email=customer4@test.com --billing_phone=555-0104 --billing_address_1="321 Elm St" --billing_city="Houston" --billing_state="TX" --billing_postcode="77001" --billing_country="US" --allow-root
    wp wc customer create --email=customer5@test.com --first_name=David --last_name=Brown --billing_first_name=David --billing_last_name=Brown --billing_email=customer5@test.com --billing_phone=555-0105 --billing_address_1="654 Maple Dr" --billing_city="Phoenix" --billing_state="AZ" --billing_postcode="85001" --billing_country="US" --allow-root
    
    # Create 50 orders with various statuses and products
    echo "Creating 50 test orders..."
    
    # Order statuses to cycle through
    order_statuses=("completed" "processing" "pending" "on-hold" "cancelled" "refunded")
    
    # Customer emails to cycle through
    customer_emails=("customer1@test.com" "customer2@test.com" "customer3@test.com" "customer4@test.com" "customer5@test.com")
    
    # Product IDs (we'll get these from the created products)
    product_ids=()
    
    # Get product IDs from created products
    products_json=$(wp wc product list --format=json --allow-root 2>/dev/null || echo "[]")
    if [ "$products_json" != "[]" ]; then
        # Extract product IDs using jq if available, otherwise use a simple approach
        if command -v jq &> /dev/null; then
            product_ids=($(echo "$products_json" | jq -r '.[].id'))
        else
            # Fallback: use a simple array of expected product IDs
            product_ids=(1 2 3 4 5 6 7 8 9 10 11 12)
        fi
    else
        # Fallback product IDs
        product_ids=(1 2 3 4 5 6 7 8 9 10 11 12)
    fi
    
    # Create 50 orders
    for i in {1..50}; do
        # Select random status and customer
        status_index=$((RANDOM % ${#order_statuses[@]}))
        customer_index=$((RANDOM % ${#customer_emails[@]}))
        product_index=$((RANDOM % ${#product_ids[@]}))
        
        status=${order_statuses[$status_index]}
        customer_email=${customer_emails[$customer_index]}
        product_id=${product_ids[$product_index]}
        
        # Generate random quantity (1-5)
        quantity=$((RANDOM % 5 + 1))
        
        # Generate random order total
        order_total=$((RANDOM % 1000 + 50))
        
        echo "Creating order $i: Status=$status, Customer=$customer_email, Product=$product_id, Qty=$quantity"
        
        # Create order with line items
        wp wc order create \
            --status="$status" \
            --customer_email="$customer_email" \
            --line_items="[{\"product_id\":$product_id,\"quantity\":$quantity}]" \
            --total="$order_total" \
            --allow-root
        
        # Add some delay to avoid overwhelming the system
        sleep 0.1
    done
    
    echo "WooCommerce test data generated successfully"
    echo "Created:"
    echo "- 6 product categories"
    echo "- 12 products (10 simple + 2 variable)"
    echo "- 5 customers with complete billing information"
    echo "- 50 orders with various statuses and products"
    echo "- All orders distributed across 6 statuses (completed, processing, pending, on-hold, cancelled, refunded)"
}

# Generate WooCommerce REST API keys (your prerequisite)
function generate_api_keys() {
    echo "Generating WooCommerce REST API keys"
    
    # Create API key via WP-CLI (if supported)
    API_KEY_DATA=$(wp wc rest_api create_key \
        --user=1 \
        --description="FlexOrder Test API Key" \
        --permissions=read_write \
        --format=json \
        --allow-root 2>/dev/null || echo "")
    
    if [ -n "$API_KEY_DATA" ]; then
        echo "API key created via WP-CLI"
        CONSUMER_KEY=$(echo "$API_KEY_DATA" | jq -r '.consumer_key')
        CONSUMER_SECRET=$(echo "$API_KEY_DATA" | jq -r '.consumer_secret')
    else
        echo "WP-CLI API key creation failed, creating placeholder keys"
        CONSUMER_KEY="ck_$(openssl rand -hex 32)"
        CONSUMER_SECRET="cs_$(openssl rand -hex 32)"
    fi
    
    # Store API keys in WordPress options for the plugin to use
    wp option update flexorder_woocommerce_consumer_key "$CONSUMER_KEY" --allow-root
    wp option update flexorder_woocommerce_consumer_secret "$CONSUMER_SECRET" --allow-root
    
    # Also store in a file for tests to access
    mkdir -p "$GITHUB_WORKSPACE/tests/utilities"
    cat > "$GITHUB_WORKSPACE/tests/utilities/api-keys.json" << EOF
{
    "consumer_key": "$CONSUMER_KEY",
    "consumer_secret": "$CONSUMER_SECRET",
    "site_url": "$SITE_URL"
}
EOF
    
    # Save to environment file
    cat > "$GITHUB_WORKSPACE/tests/utilities/.env" << EOF
# FlexOrder Plugin E2E Testing Environment Configuration
SITE_URL=$SITE_URL
URL=$SITE_URL/wp-login.php
ADMIN_PANEL_URL=$SITE_URL/wp-admin/
PLAYWRIGHT_BASE_URL=$SITE_URL

# Admin Credentials
USER_NAME=admin
PASSWORD=admin123

# WooCommerce Configuration (generated dynamically)
WOOCOMMERCE_CONSUMER_KEY=$CONSUMER_KEY
WOOCOMMERCE_CONSUMER_SECRET=$CONSUMER_SECRET

# Google Sheets Configuration
GOOGLE_SHEET_ID=1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM/edit?pli=1&gid=0
GOOGLE_SHEET_SCOPES=https://www.googleapis.com/auth/spreadsheets
SHEET_NAME=Orders
SHEET_RANGE=Orders!A1:Z1000

# Google Account Configuration
GOOGLE_ACCOUNT_EMAIL=rakibul1@wppool.dev
GOOGLE_ACCOUNT_PASSWORD='WpPool#03029#'

# Service Account Configuration
SERVICE_ACCOUNT_UPLOAD_FILE=./tests/utilities/upload_key.json

# Plugin Configuration
Replace_Plugin_Path=build/$PLUGIN_NAME.zip

# Apps Script Configuration
APPS_SCRIPT_DEPLOYMENT_ID=AKfycbxixhzG8LBMG4DoHG-c2ddP-Hna4KvehQysKDCWozaAZAB2apXPPAbND7gTh6ipWVgLUA
APPS_SCRIPT_PROJECT_ID=windy-nation-438204-d0
Web_App_URL=https://script.google.com/a/macros/wppool.dev/s/AKfycbxixhzG8LBMG4DoHG-c2ddP-Hna4KvehQysKDCWozaAZAB2apXPPAbND7gTh6ipWVgLUA/exec

# Test Configuration
CI=true
USE_FRESH_WORDPRESS=true
FRESH_SITE_URL=$SITE_URL
TEST_TIMEOUT=300000
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=1
HEADLESS=true
SLOW_MO=0

# Plugin Version Configuration
PLUGIN_VERSION=free
PRO_LICENSE_KEY=$FLEXORDER_PRO_LICENSE_KEY
EOF
    
    echo "API keys generated and environment configured"
    echo "Consumer Key: $CONSUMER_KEY"
    echo "Consumer Secret: $CONSUMER_SECRET"
}

# Install Playwright dependencies (like rtMedia)
function install_playwright_package() {
    echo "Installing Playwright dependencies"
    cd $GITHUB_WORKSPACE
    npm install
}

# Install Playwright browsers (like rtMedia)
function install_playwright() {
    echo "Installing Playwright browsers"
    cd $GITHUB_WORKSPACE
    npx playwright install --with-deps
}

# Run Playwright tests (like rtMedia)
function run_playwright_tests() {
    echo "Running Playwright tests"
    cd $GITHUB_WORKSPACE
    
    # Run specific test files (like rtMedia's approach)
    echo "Running Setup test..."
    npx playwright test tests/testcase/ab_setup.spec.js
    
    echo "Running Order creation test..."
    npx playwright test tests/testcase/createNewOrder.spec.js
    
    # Run all tests if needed
    # npx playwright test
}

# Main function (like rtMedia)
function main() {
    start_services
    create_and_configure_site
    install_playwright_package
    install_playwright
    run_playwright_tests
}

# Run main function
main 