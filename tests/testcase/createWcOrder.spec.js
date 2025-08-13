const { test, expect } = require("@playwright/test");
const { CreateOrder, ordersData } = require("../pages/createWcOrder");
const { config } = require('../../config/environment');

test.describe("WooCommerce Order Creation and Validation on Google Sheets", () => {
    let createOrderInstance;
    const createdOrders = [];

    test.beforeAll(() => {
        createOrderInstance = new CreateOrder(config.SERVICE_ACCOUNT_UPLOAD_FILE);
    });

    test("Create a new order using WooCommerce API", async () => {
        const order = await createOrderInstance.createOrder();
        expect(order.id).toBeDefined();
        createdOrders.push(order);
    });

    test("Verify that the order exists in Google Sheets", async () => {
        const orderInfo = await createOrderInstance.validateOrderOnGoogleSheet(createdOrders[0].id);
    
        console.log("Google Sheet Order Info:", orderInfo);
        console.log("Created Orders Array:", ordersData);
    
        if (orderInfo) {
            const storedOrder = ordersData.find(order => order.id === Number(orderInfo[0]));
            expect.soft(storedOrder).toBeDefined();
        
            const [
                id = '',
                productNames = '',
                orderStatus = '',
                totalItems = '0',
                sku = '',
                totalPrice = '0',
                totalDiscount = '0',
                billingDetails = '||||',
                shippingDetails = '|||',
                orderDate = '',
                paymentMethod = '',
                customerNote = '',
                orderPlacedBy = '',
                orderUrl = '',
                orderNote = ''
            ] = orderInfo;
        
            expect.soft(orderStatus.replace('wc-', '')).toBe(storedOrder.status);
            expect.soft(parseFloat(totalPrice)).toBeCloseTo(parseFloat(storedOrder.total_price), 2);
            expect.soft(Number(id)).toBe(storedOrder.id);
            expect.soft(productNames.split('(')[0].trim()).toBe(storedOrder.product_names.split('(')[0].trim());
            expect.soft(Number(totalItems)).toBe(storedOrder.total_items);
            expect.soft(sku || "** No SKU Found **").toBe(storedOrder.sku);
        }
    });
    
});
