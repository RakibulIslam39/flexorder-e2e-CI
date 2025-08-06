
# FlexOrder E2E Automation

Comprehensive end-to-end testing automation suite for the FlexOrder plugin integration with WooCommerce and Google Sheets.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd flexorder-e2e-automation

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Copy environment configuration
cp tests/utilities/env.example tests/utilities/.env
```

### Environment Setup

Edit `tests/utilities/.env` with your configuration:

```bash
# WordPress Configuration
SITE_URL=https://your-test-site.com/
URL=https://your-test-site.com/wp-login.php
USER_NAME=your_admin_username
PASSWORD=your_admin_password

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/your_sheet_id
GOOGLE_ACCOUNT_EMAIL=your_google_email
GOOGLE_ACCOUNT_PASSWORD=your_google_password

# Service Account
SERVICE_ACCOUNT_UPLOAD_FILE=path/to/your/service-account.json
```

## 🧪 Testing Options

### Option 1: Dedicated Test Site (Default)

```bash
# Run tests against dedicated site
npm run test:ci:full

# Run specific test
npx playwright test --grep "Setup Add Credentials and Upload File Test"
```

### Option 2: Fresh WordPress Environment (CI/CD)

```bash
# Run complete FlexOrder setup and tests
npm run test:flexorder:ci
```

## 🔄 CI/CD Workflow

The project includes a comprehensive CI/CD workflow inspired by [rtMedia](https://github.com/rtCamp/rtMedia):

### Features

- ✅ **Fresh WordPress Environment** for each test run
- ✅ **WooCommerce Installation** via CLI and API
- ✅ **Test Data Generation** (products, orders, customers)
- ✅ **REST API Key Generation** for testing
- ✅ **Multi-browser Testing** (Chromium, Firefox, WebKit)
- ✅ **Multi-branch Support** (dev, qa, main)
- ✅ **Automated Releases** for main branch

### Branch Strategy

| Branch | Tests | Deploy | Purpose |
|--------|-------|--------|---------|
| `dev` | E2E Tests | ❌ | Development testing |
| `qa` | E2E + Integration | ❌ | Quality assurance |
| `main` | All Tests | ✅ | Production release |

### Quick CI Setup

```bash
# Complete setup and testing
npm run test:complete:ci

# Individual setup steps
npm run setup:fresh-wordpress:ci
npm run setup:woocommerce:ci
npm run setup:api-keys:ci
npm run setup:test-data:ci
```

## 📁 Project Structure

```
flexorder-e2e-automation/
├── .github/workflows/          # GitHub Actions workflows
├── config/                     # Environment configuration
├── docs/                       # Documentation
├── scripts/                    # Setup and utility scripts
├── tests/
│   ├── pages/                  # Page Object Models
│   ├── testcase/               # Test specifications
│   ├── utilities/              # Test utilities and data
│   └── utils/                  # Helper utilities
├── docker-compose.fresh-wordpress.yml  # Docker environment
└── package.json
```

## 🛠️ Available Scripts

### Testing

```bash
npm run test                    # Run all tests
npm run test:headed            # Run tests with browser visible
npm run test:debug             # Run tests in debug mode
npm run test:ui                # Run tests with Playwright UI
npm run test:smoke             # Run smoke tests only
npm run test:regression        # Run regression tests only
npm run test:integration       # Run integration tests
npm run test:performance       # Run performance tests
npm run test:security          # Run security tests
```

### Setup

```bash
npm run setup:complete         # Complete environment setup
npm run setup:fresh-wordpress  # Fresh WordPress setup
npm run setup:woocommerce      # WooCommerce installation
npm run setup:api-keys         # API key generation
npm run setup:test-data        # Test data generation
```

### Docker

```bash
npm run docker:up              # Start Docker environment
npm run docker:down            # Stop Docker environment
npm run docker:clean           # Clean Docker environment
npm run docker:logs            # View Docker logs
npm run docker:restart         # Restart Docker environment
```

### Development

```bash
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint issues
npm run format                 # Format code with Prettier
npm run type-check             # Run TypeScript type checking
npm run build:plugin           # Build plugin package
```

## 🔧 Configuration

### Environment Variables

```bash
# WordPress Environment Mode
USE_FRESH_WORDPRESS=false      # Use dedicated site (default)
CI_FRESH_WORDPRESS=true        # Use fresh WordPress in CI

# Fresh WordPress Configuration
FRESH_SITE_URL=http://localhost:8080
DB_HOST=localhost
DB_NAME=flexorder_test
DB_USER=flexorder_user
DB_PASSWORD=flexorder_pass

# Test Configuration
TEST_TIMEOUT=300000            # 5 minutes
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=1
HEADLESS=true                  # false for local development
SLOW_MO=100                    # 0 for CI
```

### Playwright Configuration

The project uses Playwright with the following configuration:

- **Browsers**: Chromium, Firefox, WebKit
- **Timeout**: 5 minutes (configurable)
- **Retries**: 2 attempts
- **Parallel**: Configurable workers
- **Headless**: Enabled in CI, disabled locally

## 📊 Test Data

The system generates comprehensive test data:

### Products
- 5 Simple products (T-Shirt, Jeans, Sneakers, etc.)
- 2 Variable products
- 2 Downloadable products
- 2 Draft/Private products

### Orders
- Processing, Completed, On-Hold, Cancelled, Refunded

### Customers
- 8 test customers with different profiles

### Categories
- Clothing, Footwear, Accessories, Digital, Electronics, Home & Garden

## 🔑 API Key Management

- **Auto-generated** for each CI run
- **Read/Write permissions** for testing
- **Secure storage** in `.env.api-keys`
- **Never committed** to version control
- **Automatic cleanup** after tests

## 🐳 Docker Environment

### Services

- **WordPress**: `http://localhost:8080`
- **MySQL**: `localhost:3306`
- **phpMyAdmin**: `http://localhost:8081`
- **MailHog**: `http://localhost:8025`

### Quick Docker Commands

```bash
# Start environment
docker-compose -f docker-compose.fresh-wordpress.yml up -d

# Check status
docker-compose -f docker-compose.fresh-wordpress.yml ps

# View logs
docker-compose -f docker-compose.fresh-wordpress.yml logs -f wordpress

# Stop and clean
docker-compose -f docker-compose.fresh-wordpress.yml down -v
```

## 🚨 Troubleshooting

### Common Issues

#### WordPress Setup Fails
```bash
# Check Docker containers
npm run docker:logs

# Restart environment
npm run docker:restart
```

#### WooCommerce Installation Fails
```bash
# Check WordPress accessibility
curl http://localhost:8080

# Manual installation
npm run setup:woocommerce
```

#### API Key Generation Fails
```bash
# Check WooCommerce status
docker exec flexorder-wordpress wp plugin status woocommerce

# Regenerate keys
npm run setup:api-keys
```

#### Test Data Generation Fails
```bash
# Validate test data
node scripts/setup-test-data.js --validate

# Regenerate data
npm run setup:test-data
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run with UI
npm run test:ui

# Run with trace
npx playwright test --trace on
```

## 📈 Performance

### Optimization Features

- **Parallel execution** across browsers
- **Caching** of Node modules and browsers
- **Resource management** with automatic cleanup
- **Isolated environments** for each test run

### Performance Metrics

- Test execution time tracking
- Resource usage monitoring
- Performance regression detection
- Build time optimization

## 🔒 Security

### Security Features

- **Isolated test environments**
- **Secure API key management**
- **No real data in tests**
- **Automatic cleanup**
- **Environment isolation**

### Best Practices

- Never commit `.env` files
- Use fresh environments for each test
- Generate API keys per test run
- Clean up resources after tests

## 📚 Documentation

- [WordPress Environment Setup](docs/wordpress-environment-setup.md)
- [CI/CD Workflow Implementation](docs/ci-workflow-implementation.md)
- [Testing Best Practices](docs/testing-best-practices.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

```bash
# Setup development environment
npm run setup:complete

# Run tests
npm run test

# Check code quality
npm run lint
npm run type-check

# Format code
npm run format
```

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [rtMedia's CI/CD approach](https://github.com/rtCamp/rtMedia)
- Built with [Playwright](https://playwright.dev/)
- Powered by [WordPress](https://wordpress.org/) and [WooCommerce](https://woocommerce.com/)

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the [documentation](docs/)
- Review the [troubleshooting guide](docs/troubleshooting.md)

---

**Happy Testing! 🎉**

