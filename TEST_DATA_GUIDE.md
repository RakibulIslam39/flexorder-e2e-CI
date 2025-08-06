# 📊 WooCommerce Test Data Generation Guide

This guide explains the comprehensive test data generation system for FlexOrder E2E testing.

## 📋 **Overview**

The test data generation system creates:
- **8 Product Categories** with diverse product types
- **22 Products** (19 simple + 3 variable) with realistic pricing
- **8 Customers** with complete billing information
- **50 Orders** with various statuses and random product combinations

## 🏗️ **Test Data Structure**

### **Product Categories**
```
1. Clothing          - Apparel and fashion items
2. Electronics       - Tech gadgets and accessories
3. Books             - Educational and entertainment books
4. Home & Garden     - Household and garden items
5. Sports            - Fitness and sports equipment
6. Beauty            - Cosmetics and personal care
7. Automotive        - Car accessories and parts
8. Toys & Games      - Entertainment and gaming
```

### **Products by Category**

#### **Clothing (4 products)**
- Premium Cotton T-Shirt - $29.99 (Sale: $24.99)
- Classic Blue Jeans - $79.99
- Designer Hoodie - $89.99 (Sale: $69.99)
- Summer Dress - $59.99

#### **Electronics (4 products)**
- Wireless Bluetooth Headphones - $89.99 (Sale: $69.99)
- Gaming Laptop - $1,299.99
- Smartphone Case - $19.99 (Sale: $14.99)
- USB-C Cable - $12.99

#### **Books (3 products)**
- Programming Guide Book - $39.99
- Business Strategy Book - $24.99
- Cookbook Collection - $34.99

#### **Home & Garden (3 products)**
- Garden Tool Set - $149.99 (Sale: $119.99)
- Coffee Maker - $199.99
- LED Desk Lamp - $49.99

#### **Sports (3 products)**
- Yoga Mat - $49.99
- Running Shoes - $129.99
- Dumbbell Set - $89.99

#### **Beauty (3 products)**
- Organic Face Cream - $34.99
- Makeup Brush Set - $29.99
- Perfume Collection - $79.99

#### **Variable Products (3 products)**
- Designer T-Shirt Collection - $44.99
- Smart Watch Series - $299.99
- Sneaker Collection - $89.99

### **Customers**
```
1. John Doe     - customer1@test.com - New York, NY
2. Jane Smith   - customer2@test.com - Los Angeles, CA
3. Mike Johnson - customer3@test.com - Chicago, IL
4. Sarah Wilson - customer4@test.com - Houston, TX
5. David Brown  - customer5@test.com - Phoenix, AZ
6. Emily Davis  - customer6@test.com - Miami, FL
7. Robert Miller- customer7@test.com - Seattle, WA
8. Lisa Garcia  - customer8@test.com - Denver, CO
```

### **Order Statuses**
- **completed** - Orders that have been fulfilled
- **processing** - Orders being prepared
- **pending** - Orders awaiting payment
- **on-hold** - Orders temporarily held
- **cancelled** - Orders that were cancelled
- **refunded** - Orders that were refunded

## 🚀 **Usage**

### **Automatic Generation (CI/CD)**
The test data is automatically generated during CI/CD setup in the `main.sh` script.

### **Manual Generation**
```bash
# Generate all test data
npm run generate:test-data

# Or run the script directly
node scripts/generate-test-data.js
```

### **Integration with main.sh**
The test data generation is integrated into the main setup script:
```bash
# Generate WooCommerce test data (your prerequisite)
echo "Generating WooCommerce test data"
generate_woocommerce_test_data
```

## 📊 **Generated Data Summary**

### **What Gets Created**
- ✅ **8 Product Categories** with descriptions
- ✅ **22 Products** with realistic pricing and descriptions
- ✅ **8 Customers** with complete billing addresses
- ✅ **50 Orders** with random statuses and product combinations

### **Order Distribution**
- Random status distribution across all 6 statuses
- Random customer assignment from 8 customers
- Random product selection from 22 products
- Random quantities (1-5 items per order)
- Random order totals ($50-$1,050)

### **Data Quality Features**
- **Realistic Pricing**: Products have realistic prices with some on sale
- **Complete Customer Data**: Full billing information for each customer
- **Diverse Products**: Mix of simple and variable products
- **Realistic Descriptions**: Detailed product descriptions and short descriptions
- **Geographic Diversity**: Customers from different US cities

## 🔧 **Configuration**

### **Customizing Test Data**
Edit `scripts/generate-test-data.js` to modify:

#### **Adding Categories**
```javascript
categories: [
    { name: "New Category", description: "Description here" },
    // ... existing categories
]
```

#### **Adding Products**
```javascript
products: [
    { 
        name: "New Product", 
        type: "simple", 
        price: 99.99, 
        sale_price: 79.99, // optional
        category: 1, // category index (1-based)
        description: "Product description",
        short_desc: "Short description"
    },
    // ... existing products
]
```

#### **Adding Customers**
```javascript
customers: [
    {
        email: "newcustomer@test.com",
        first_name: "First",
        last_name: "Last",
        phone: "555-0000",
        address: "123 Street",
        city: "City",
        state: "ST",
        postcode: "12345"
    },
    // ... existing customers
]
```

#### **Modifying Order Count**
```javascript
numOrders: 100 // Change from 50 to any number
```

## 📈 **Monitoring & Verification**

### **Verification Commands**
```bash
# Check categories
wp wc product_cat list --allow-root

# Check products
wp wc product list --allow-root

# Check customers
wp wc customer list --allow-root

# Check orders
wp wc order list --allow-root

# Get specific counts
wp wc product_cat list --format=count --allow-root
wp wc product list --format=count --allow-root
wp wc customer list --format=count --allow-root
wp wc order list --format=count --allow-root
```

### **Expected Output**
```
Categories: 8
Products: 22
Customers: 8
Orders: 50
```

### **Sample Order Data**
```json
{
  "id": 1,
  "status": "completed",
  "customer_email": "customer1@test.com",
  "line_items": [
    {
      "product_id": 5,
      "quantity": 2,
      "total": "179.98"
    }
  ],
  "total": "179.98"
}
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Issue: Products Not Created**
```bash
# Check if WooCommerce is active
wp plugin list --status=active --allow-root | grep woocommerce

# Check WooCommerce CLI
wp wc --help --allow-root
```

#### **Issue: Orders Not Created**
```bash
# Check if products exist
wp wc product list --allow-root

# Check if customers exist
wp wc customer list --allow-root
```

#### **Issue: Slow Generation**
```bash
# The script includes delays to avoid overwhelming the system
# You can reduce delays by modifying the sleep commands
```

### **Debug Mode**
```bash
# Run with verbose output
wp wc product create --name="Test Product" --type=simple --regular_price=10.00 --debug --allow-root
```

## 📚 **Integration with Tests**

### **Test Data Access**
The generated test data is available to your Playwright tests through:

1. **WooCommerce REST API** - Using the generated API keys
2. **WordPress Database** - Direct database queries
3. **WP-CLI Commands** - Command-line access

### **Sample Test Usage**
```javascript
// In your Playwright tests
const { test, expect } = require('@playwright/test');

test('should display products', async ({ page }) => {
    await page.goto('/shop');
    
    // Should have 22 products
    const productCount = await page.locator('.product').count();
    expect(productCount).toBe(22);
});

test('should show orders', async ({ page }) => {
    await page.goto('/wp-admin/edit.php?post_type=shop_order');
    
    // Should have 50 orders
    const orderCount = await page.locator('.wp-list-table tbody tr').count();
    expect(orderCount).toBe(50);
});
```

## 🎯 **Best Practices**

### **Data Management**
- **Fresh Data**: Test data is generated fresh for each CI run
- **Consistent Structure**: Same data structure across all environments
- **Realistic Data**: Products and customers mimic real-world scenarios
- **Comprehensive Coverage**: Tests all product types and order statuses

### **Performance**
- **Optimized Creation**: Efficient batch creation with progress tracking
- **Error Handling**: Graceful handling of creation failures
- **Resource Management**: Delays to prevent system overload

### **Maintainability**
- **Configuration-Driven**: Easy to modify data without code changes
- **Modular Design**: Separate functions for categories, products, customers, orders
- **Comprehensive Logging**: Detailed progress and error reporting

---

**🎉 Your WooCommerce test data generation is now comprehensive and production-ready!**

**Key Benefits:**
- 📊 **Rich Test Data** - 8 categories, 22 products, 8 customers, 50 orders
- 🔄 **Automated Generation** - Integrated into CI/CD pipeline
- 🎯 **Realistic Scenarios** - Mimics real e-commerce data
- 🔧 **Easy Customization** - Configuration-driven approach
- 📈 **Comprehensive Coverage** - Tests all WooCommerce features 