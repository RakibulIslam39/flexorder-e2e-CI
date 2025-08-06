const { expect } = require('@playwright/test');
const { config } = require('../../config/environment');

class LoginPage {
    constructor(page) {
        this.page = page;
        this.usernameField = page.getByLabel('Username or Email Address');
        this.passwordField = page.getByLabel('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Log In' });
        this.dashboardButton = page.locator("(//div[normalize-space()='Dashboard'])[1]");
    }

    async navigate() {
        await this.page.goto(config.URL);
    }

    async login() {
        await this.usernameField.fill(config.USER_NAME);
        await this.passwordField.fill(config.PASSWORD);
        await this.loginButton.click();

        await this.dashboardButton.click();
        await expect(this.page.locator("(//h1[normalize-space()='Dashboard'])[1]")).toBeVisible();
    }
}

module.exports = { LoginPage };
