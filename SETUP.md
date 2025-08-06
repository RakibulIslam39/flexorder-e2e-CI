# FlexOrder Environment Setup (rtMedia-Style)

This is a simplified, focused setup following rtMedia's proven approach for WordPress plugin testing.

## 🎯 What's Included

### ✅ Your Prerequisites (All Implemented)
- **WooCommerce Installation** via WP-CLI
- **Random Products & Orders** generated programmatically
- **WooCommerce REST API Key** generation with Read/Write permissions
- **Test Data** for comprehensive testing

### ✅ rtMedia-Style Architecture
- **`main.sh`** - Single bash script for complete setup
- **`.github/workflows/playwright.yml`** - GitHub Actions workflow
- **`.travis.yml`** - Travis CI configuration
- **`pre-commit`** - Code quality hooks

## 🚀 Quick Commands

### Development (Current Working Setup)
```bash
npm run test:ci:full
```

### CI/CD (Fresh WordPress Environment)
```bash
npm run test:flexorder:ci
```

## 📋 How It Works

### 1. Environment Setup (`main.sh`)
- Creates fresh WordPress site
- Installs WooCommerce plugin
- Installs FlexOrder plugin
- Generates test data (products, orders, customers)
- Creates API keys automatically
- Configures environment variables

### 2. CI/CD Pipeline
- **GitHub Actions**: Uses `rtcamp/base-wo` Docker image
- **Travis CI**: Sets up WordPress environment locally
- **Multi-branch**: Works on `dev`, `qa`, `main` branches

### 3. Test Execution
- Runs Playwright tests against fresh environment
- Generates reports and screenshots
- Uploads artifacts on failure

## 🔧 Files Structure

```
├── main.sh                           # Main setup script (rtMedia-style)
├── .github/workflows/playwright.yml  # GitHub Actions workflow
├── .travis.yml                       # Travis CI configuration
├── pre-commit                        # Code quality hooks
├── tests/
│   ├── testcase/
│   │   ├── ab_setup.spec.js          # Setup test
│   │   └── createNewOrder.spec.js    # Order creation test
│   └── utilities/
│       └── .env                      # Environment configuration
└── package.json                      # Simplified scripts
```

## 🎉 Benefits

- **Simple**: Single script handles everything
- **Reliable**: Follows rtMedia's proven approach
- **Complete**: Includes all your prerequisites
- **CI/CD Ready**: Works in GitHub Actions and Travis CI
- **Cross-Platform**: Works on Linux, Windows, and CI

## 📚 References

- [rtMedia Repository](https://github.com/rtCamp/rtMedia) - Original inspiration
- [Playwright Documentation](https://playwright.dev/)
- [WP-CLI Documentation](https://wp-cli.org/)

---

**🎯 This setup provides exactly what you need: WooCommerce installation, API key generation, test data creation, and reliable CI/CD pipeline following rtMedia's proven approach.** 