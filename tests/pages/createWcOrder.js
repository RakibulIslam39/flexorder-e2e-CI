
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { generateRandomOrderData } = require("../../test-utils/generateRandomOrderData");
const { google } = require("googleapis");
const { config } = require('../../config/environment');

const ordersData = [];

class CreateOrder {
    constructor(authConfigPath) {
        this.api = new WooCommerceRestApi({
            url: config.SITE_URL,
            consumerKey: config.WOOCOMMERCE_CONSUMER_KEY,
            consumerSecret: config.WOOCOMMERCE_CONSUMER_SECRET,
            version: "wc/v3",
        });

        this.auth = new google.auth.GoogleAuth({
            keyFile: authConfigPath,
            scopes: [config.GOOGLE_SHEET_SCOPES],
        });
    }

    async getRandomProduct() {
        try {
            const response = await this.api.get("products", { per_page: 10 });
            const products = response.data;
            return products[Math.floor(Math.random() * products.length)];
        } catch (error) {
            console.error("Error fetching products:", error.response?.data || error.message);
            throw error;
        }
    }

    async createOrder() {
        const product = await this.getRandomProduct();
        const orderData = generateRandomOrderData(product);

        console.log("Creating order with:", orderData);
        try {
            const response = await this.api.post("orders", orderData);
            const createdOrder = response.data;

            ordersData.push({
                id: createdOrder.id,
                sku: product.sku,
                billing: createdOrder.billing,
            });

            return createdOrder;
        } catch (error) {
            console.error("Error creating order:", error.response?.data || error.message);
            throw error;
        }
    }

    async getGoogleSheetData(range) {
        const sheets = google.sheets({ version: "v4", auth: this.auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.GOOGLE_SHEET_ID,
            range,
        });

        return response.data.values || [];
    }

    async validateOrderOnGoogleSheet(orderId) {
        const range = `${config.SHEET_NAME}!A2:Z1000`;
        const rows = await this.getGoogleSheetData(range);
        console.log("Google Sheet data:", rows);

        return rows.find(row => Number(row[0]) === orderId);
    }
}

module.exports = { CreateOrder, ordersData };
