// const { test, expect } = require('@playwright/test');
const { google } = require('googleapis');
const { config } = require('../../config/environment');

class GoogleSheetAPI {
    constructor(authConfigPath) {
        this.auth = new google.auth.GoogleAuth({
            keyFile: authConfigPath,
            scopes: [config.GOOGLE_SHEET_SCOPES],
        });
    }

    async writeToSheet(spreadsheetId, range, values) {
        const sheets = google.sheets({ version: 'v4', auth: this.auth });
        const valueInputOption = 'USER_ENTERED';
        const resource = { values };

        try {
            const response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption,
                resource,
            });
            return response.data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetAPI;
