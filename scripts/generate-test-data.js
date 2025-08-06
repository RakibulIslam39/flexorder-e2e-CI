#!/usr/bin/env node

/**
 * WooCommerce Test Data Generator
 * Creates comprehensive test data including products, customers, and orders
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    categories: [
        { name: "Clothing", description: "Test clothing category" },
        { name: "Electronics", description: "Test electronics category" },
        { name: "Books", description: "Test books category" },
        { name: "Home & Garden", description: "Test home and garden category" },
        { name: "Sports", description: "Test sports category" },
        { name: "Beauty", description: "Test beauty category" },
        { name: "Automotive", description: "Test automotive category" },
        { name: "Toys & Games", description: "Test toys and games category" }
    ],
    products: [
        // Clothing
        { name: "Premium Cotton T-Shirt", type: "simple", price: 29.99, sale_price: 24.99, category: 1, description: "Comfortable cotton t-shirt", short_desc: "Soft and breathable" },
        { name: "Classic Blue Jeans", type: "simple", price: 79.99, category: 1, description: "Classic blue denim jeans", short_desc: "Perfect fit" },
        { name: "Designer Hoodie", type: "simple", price: 89.99, sale_price: 69.99, category: 1, description: "Stylish designer hoodie", short_desc: "Warm and comfortable" },
        { name: "Summer Dress", type: "simple", price: 59.99, category: 1, description: "Elegant summer dress", short_desc: "Perfect for any occasion" },
        
        // Electronics
        { name: "Wireless Bluetooth Headphones", type: "simple", price: 89.99, sale_price: 69.99, category: 2, description: "High-quality wireless headphones", short_desc: "Crystal clear sound" },
        { name: "Gaming Laptop", type: "simple", price: 1299.99, category: 2, description: "High-performance gaming laptop", short_desc: "Perfect for gaming" },
        { name: "Smartphone Case", type: "simple", price: 19.99, sale_price: 14.99, category: 2, description: "Protective smartphone case", short_desc: "Shock resistant" },
        { name: "USB-C Cable", type: "simple", price: 12.99, category: 2, description: "Fast charging USB-C cable", short_desc: "High-speed data transfer" },
        
        // Books
        { name: "Programming Guide Book", type: "simple", price: 39.99, category: 3, description: "Complete programming guide", short_desc: "Learn to code" },
        { name: "Business Strategy Book", type: "simple", price: 24.99, category: 3, description: "Business strategy guide", short_desc: "Grow your business" },
        { name: "Cookbook Collection", type: "simple", price: 34.99, category: 3, description: "Delicious recipes collection", short_desc: "Master the kitchen" },
        
        // Home & Garden
        { name: "Garden Tool Set", type: "simple", price: 149.99, sale_price: 119.99, category: 4, description: "Complete garden maintenance set", short_desc: "Professional tools" },
        { name: "Coffee Maker", type: "simple", price: 199.99, category: 4, description: "Automatic coffee maker", short_desc: "Perfect brew every time" },
        { name: "LED Desk Lamp", type: "simple", price: 49.99, category: 4, description: "Modern LED desk lamp", short_desc: "Adjustable brightness" },
        
        // Sports
        { name: "Yoga Mat", type: "simple", price: 49.99, category: 5, description: "Premium yoga mat", short_desc: "Non-slip surface" },
        { name: "Running Shoes", type: "simple", price: 129.99, category: 5, description: "Professional running shoes", short_desc: "Maximum comfort" },
        { name: "Dumbbell Set", type: "simple", price: 89.99, category: 5, description: "Adjustable dumbbell set", short_desc: "Home workout essential" },
        
        // Beauty
        { name: "Organic Face Cream", type: "simple", price: 34.99, category: 6, description: "Natural organic face cream", short_desc: "Hydrating formula" },
        { name: "Makeup Brush Set", type: "simple", price: 29.99, category: 6, description: "Professional makeup brushes", short_desc: "Soft and durable" },
        { name: "Perfume Collection", type: "simple", price: 79.99, category: 6, description: "Luxury perfume collection", short_desc: "Long-lasting fragrance" },
        
        // Variable Products
        { name: "Designer T-Shirt Collection", type: "variable", price: 44.99, category: 1, description: "Collection of designer t-shirts", short_desc: "Multiple colors and sizes" },
        { name: "Smart Watch Series", type: "variable", price: 299.99, category: 2, description: "Latest smart watch series", short_desc: "Track your fitness" },
        { name: "Sneaker Collection", type: "variable", price: 89.99, category: 5, description: "Trendy sneaker collection", short_desc: "Various styles and colors" }
    ],
    customers: [
        { email: "customer1@test.com", first_name: "John", last_name: "Doe", phone: "555-0101", address: "123 Main St", city: "New York", state: "NY", postcode: "10001" },
        { email: "customer2@test.com", first_name: "Jane", last_name: "Smith", phone: "555-0102", address: "456 Oak Ave", city: "Los Angeles", state: "CA", postcode: "90210" },
        { email: "customer3@test.com", first_name: "Mike", last_name: "Johnson", phone: "555-0103", address: "789 Pine Rd", city: "Chicago", state: "IL", postcode: "60601" },
        { email: "customer4@test.com", first_name: "Sarah", last_name: "Wilson", phone: "555-0104", address: "321 Elm St", city: "Houston", state: "TX", postcode: "77001" },
        { email: "customer5@test.com", first_name: "David", last_name: "Brown", phone: "555-0105", address: "654 Maple Dr", city: "Phoenix", state: "AZ", postcode: "85001" },
        { email: "customer6@test.com", first_name: "Emily", last_name: "Davis", phone: "555-0106", address: "987 Cedar Ln", city: "Miami", state: "FL", postcode: "33101" },
        { email: "customer7@test.com", first_name: "Robert", last_name: "Miller", phone: "555-0107", address: "147 Birch St", city: "Seattle", state: "WA", postcode: "98101" },
        { email: "customer8@test.com", first_name: "Lisa", last_name: "Garcia", phone: "555-0108", address: "258 Spruce Ave", city: "Denver", state: "CO", postcode: "80201" }
    ],
    orderStatuses: ["completed", "processing", "pending", "on-hold", "cancelled", "refunded"],
    numOrders: 50
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        warning: '\x1b[33m', // Yellow
        error: '\x1b[31m'    // Red
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
}

function runCommand(command, description) {
    try {
        log(`Running: ${description}`, 'info');
        const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        log(`✅ ${description} completed`, 'success');
        return result;
    } catch (error) {
        log(`❌ ${description} failed: ${error.message}`, 'error');
        throw error;
    }
}

function createCategories() {
    log('Creating product categories...', 'info');
    const categoryIds = [];
    
    for (const category of config.categories) {
        try {
            const result = runCommand(
                `wp wc product_cat create --name="${category.name}" --description="${category.description}" --format=json --allow-root`,
                `Creating category: ${category.name}`
            );
            
            // Parse the JSON result to get the category ID
            const categoryData = JSON.parse(result);
            categoryIds.push(categoryData.id);
            log(`Created category: ${category.name} (ID: ${categoryData.id})`, 'success');
        } catch (error) {
            log(`Failed to create category: ${category.name}`, 'error');
        }
    }
    
    return categoryIds;
}

function createProducts(categoryIds) {
    log('Creating products...', 'info');
    const productIds = [];
    
    for (const product of config.products) {
        try {
            let command = `wp wc product create --name="${product.name}" --type=${product.type} --regular_price=${product.price}`;
            
            if (product.sale_price) {
                command += ` --sale_price=${product.sale_price}`;
            }
            
            if (product.category && categoryIds[product.category - 1]) {
                command += ` --category_ids=${categoryIds[product.category - 1]}`;
            }
            
            if (product.description) {
                command += ` --description="${product.description}"`;
            }
            
            if (product.short_desc) {
                command += ` --short_description="${product.short_desc}"`;
            }
            
            command += ' --format=json --allow-root';
            
            const result = runCommand(command, `Creating product: ${product.name}`);
            
            // Parse the JSON result to get the product ID
            const productData = JSON.parse(result);
            productIds.push(productData.id);
            log(`Created product: ${product.name} (ID: ${productData.id})`, 'success');
        } catch (error) {
            log(`Failed to create product: ${product.name}`, 'error');
        }
    }
    
    return productIds;
}

function createCustomers() {
    log('Creating customers...', 'info');
    const customerEmails = [];
    
    for (const customer of config.customers) {
        try {
            const command = `wp wc customer create \
                --email=${customer.email} \
                --first_name=${customer.first_name} \
                --last_name=${customer.last_name} \
                --billing_first_name=${customer.first_name} \
                --billing_last_name=${customer.last_name} \
                --billing_email=${customer.email} \
                --billing_phone=${customer.phone} \
                --billing_address_1="${customer.address}" \
                --billing_city=${customer.city} \
                --billing_state=${customer.state} \
                --billing_postcode=${customer.postcode} \
                --billing_country=US \
                --format=json \
                --allow-root`;
            
            const result = runCommand(command, `Creating customer: ${customer.first_name} ${customer.last_name}`);
            
            // Parse the JSON result to get the customer email
            const customerData = JSON.parse(result);
            customerEmails.push(customerData.email);
            log(`Created customer: ${customer.first_name} ${customer.last_name} (${customer.email})`, 'success');
        } catch (error) {
            log(`Failed to create customer: ${customer.first_name} ${customer.last_name}`, 'error');
        }
    }
    
    return customerEmails;
}

function createOrders(productIds, customerEmails) {
    log(`Creating ${config.numOrders} orders...`, 'info');
    let ordersCreated = 0;
    
    for (let i = 1; i <= config.numOrders; i++) {
        try {
            // Select random status, customer, and product
            const status = config.orderStatuses[Math.floor(Math.random() * config.orderStatuses.length)];
            const customerEmail = customerEmails[Math.floor(Math.random() * customerEmails.length)];
            const productId = productIds[Math.floor(Math.random() * productIds.length)];
            
            // Generate random quantity (1-5) and total
            const quantity = Math.floor(Math.random() * 5) + 1;
            const total = Math.floor(Math.random() * 1000) + 50;
            
            const command = `wp wc order create \
                --status=${status} \
                --customer_email=${customerEmail} \
                --line_items='[{"product_id":${productId},"quantity":${quantity}}]' \
                --total=${total} \
                --allow-root`;
            
            runCommand(command, `Creating order ${i}: Status=${status}, Customer=${customerEmail}, Product=${productId}, Qty=${quantity}`);
            ordersCreated++;
            
            // Add small delay to avoid overwhelming the system
            if (i % 10 === 0) {
                log(`Progress: ${i}/${config.numOrders} orders created`, 'info');
            }
        } catch (error) {
            log(`Failed to create order ${i}`, 'error');
        }
    }
    
    return ordersCreated;
}

function generateSummary(categoryIds, productIds, customerEmails, ordersCreated) {
    log('\n📊 Test Data Generation Summary:', 'info');
    log(`✅ Categories created: ${categoryIds.length}`, 'success');
    log(`✅ Products created: ${productIds.length}`, 'success');
    log(`✅ Customers created: ${customerEmails.length}`, 'success');
    log(`✅ Orders created: ${ordersCreated}`, 'success');
    
    log('\n📋 Created Categories:', 'info');
    config.categories.forEach((category, index) => {
        if (categoryIds[index]) {
            log(`  - ${category.name} (ID: ${categoryIds[index]})`, 'success');
        }
    });
    
    log('\n📦 Created Products:', 'info');
    config.products.forEach((product, index) => {
        if (productIds[index]) {
            log(`  - ${product.name} (ID: ${productIds[index]}) - $${product.price}`, 'success');
        }
    });
    
    log('\n👥 Created Customers:', 'info');
    customerEmails.forEach(email => {
        log(`  - ${email}`, 'success');
    });
    
    log('\n🎉 Test data generation completed successfully!', 'success');
}

function main() {
    log('🚀 Starting WooCommerce Test Data Generation', 'info');
    
    try {
        // Create categories
        const categoryIds = createCategories();
        
        // Create products
        const productIds = createProducts(categoryIds);
        
        // Create customers
        const customerEmails = createCustomers();
        
        // Create orders
        const ordersCreated = createOrders(productIds, customerEmails);
        
        // Generate summary
        generateSummary(categoryIds, productIds, customerEmails, ordersCreated);
        
    } catch (error) {
        log(`❌ Test data generation failed: ${error.message}`, 'error');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    config,
    createCategories,
    createProducts,
    createCustomers,
    createOrders
}; 