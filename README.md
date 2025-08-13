
# 🚀 FlexOrder CI/CD Pipeline

A comprehensive automation suite for FlexOrder plugin integration with WooCommerce and Google Sheets, featuring end-to-end testing, automated builds, and continuous deployment.

## 📋 Quick Start

### Prerequisites
- ✅ Docker Desktop (v20.10+)
- ✅ Node.js (v18.0+)
- ✅ Git (v2.30+)
- ✅ GitHub Account

### One-Click Setup

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Clone repository
git clone https://github.com/wppool/flexorder-e2e-automation.git
cd flexorder-e2e-automation

# Install dependencies
npm install
npx playwright install --with-deps

# Start environment
docker-compose -f docker-compose.fresh-wordpress.yml up -d

# Run setup
chmod +x main.sh
./main.sh

# Build plugin
npm run build:plugin

# Run tests
npm run test
```

## 🏗️ Architecture

### Components
- **WordPress Environment**: Docker-based WordPress with WooCommerce
- **E2E Testing**: Playwright tests across multiple browsers
- **CI/CD Pipeline**: GitHub Actions automation
- **Plugin Building**: Automated plugin package creation
- **Release Management**: Automated GitHub releases

### Technology Stack
- **Testing**: Playwright, TypeScript
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Database**: MySQL 8.0
- **Web Server**: Apache with PHP 8.1

## 📁 Project Structure

```
flexorder-e2e-automation/
├── .github/workflows/          # CI/CD pipelines
├── config/                     # Environment configuration
├── scripts/                    # Build and setup scripts
├── tests/                      # Test files and utilities
├── docker-compose.fresh-wordpress.yml
├── main.sh                     # Setup script
├── setup.sh                    # Quick setup (Linux/Mac)
├── setup.bat                   # Quick setup (Windows)
└── package.json
```

## 🧪 Testing

### Test Types
- **Smoke Tests**: Basic functionality verification
- **E2E Tests**: Full user journey testing
- **Cross-Browser**: Chrome, Firefox, Safari
- **API Tests**: WooCommerce REST API testing

### Running Tests
```bash
# All tests
npm run test

# Smoke tests only
npm run test:smoke

# Specific browser
npx playwright test --project=chromium

# With UI
npm run test:ui

# Debug mode
npm run test:debug
```

## 🚀 CI/CD Pipeline

### Workflow Jobs
1. **Setup WordPress**: Environment preparation
2. **E2E Tests**: Cross-browser testing
3. **Build & Deploy**: Plugin building and release creation
4. **Cleanup**: Resource cleanup

### Triggers
- Push to `main`, `dev`, `qa` branches
- Pull requests to protected branches
- Manual workflow dispatch

### Artifacts
- Plugin ZIP files (Free & Pro versions)
- Test results and screenshots
- Build reports

## 🔧 Configuration

### Environment Variables
Copy `tests/utilities/env.example` to `tests/utilities/.env` and configure:

```env
# Site Configuration
SITE_URL=http://localhost:8080/
USER_NAME=admin
PASSWORD=admin123

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_ACCOUNT_EMAIL=your_email@gmail.com

# Test Configuration
CI=false
HEADLESS=false
SLOW_MO=1000
```

### GitHub Secrets
Set up in repository settings:
- `FLEXORDER_PRO_LICENSE_KEY` (optional)

## 📊 Services

### Local Development
- **WordPress**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081
- **MailHog**: http://localhost:8025

### Default Credentials
- **WordPress Admin**: admin / admin123
- **MySQL**: flexorder_user / flexorder_pass

## 🎯 Use Cases

### Development
- Local testing environment
- Automated test execution
- Plugin development and testing

### Quality Assurance
- Cross-browser compatibility testing
- Automated regression testing
- Performance monitoring

### Production
- Automated plugin builds
- Release management
- Deployment automation

## 📈 Benefits

### For Developers
- ✅ Rapid environment setup
- ✅ Automated testing
- ✅ Cross-browser validation
- ✅ Continuous integration

### For QA Teams
- ✅ Consistent test environments
- ✅ Automated test execution
- ✅ Detailed test reports
- ✅ Regression testing

### For Business
- ✅ Reduced manual testing time
- ✅ Higher code quality
- ✅ Faster release cycles
- ✅ Professional deployment process

## 🔍 Monitoring

### Test Reports
- HTML reports: `npm run test:report`
- Screenshots on failure
- Video recordings
- Console logs

### CI/CD Monitoring
- GitHub Actions dashboard
- Workflow execution logs
- Build status tracking
- Release history

## 🆘 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Restart services
docker-compose -f docker-compose.fresh-wordpress.yml down
docker-compose -f docker-compose.fresh-wordpress.yml up -d
```

#### Test Issues
```bash
# Clear cache
npm run clean

# Reinstall browsers
npx playwright install --with-deps

# Debug mode
npx playwright test --debug
```

#### WordPress Issues
```bash
# Reset WordPress
docker exec -it flexorder-wordpress wp db reset --yes --allow-root
```

### Getting Help
- 📖 [Complete Setup Guide](FLEXORDER_SETUP_GUIDE.md)
- 🔧 [GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md)
- 🐛 [Create GitHub Issue](https://github.com/wppool/flexorder-e2e-automation/issues)
- 💬 [GitHub Discussions](https://github.com/wppool/flexorder-e2e-automation/discussions)

## 📚 Documentation

- [📋 Complete Setup Guide](FLEXORDER_SETUP_GUIDE.md) - Detailed setup instructions
- [🚀 GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md) - CI/CD configuration
- [🔧 Plugin Build Guide](PLUGIN_BUILD_GUIDE.md) - Plugin development
- [🧪 Test Data Guide](TEST_DATA_GUIDE.md) - Test data management
- [🔐 Security Guide](SECURITY.md) - Security best practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🏢 About

FlexOrder is a WordPress plugin that synchronizes WooCommerce orders with Google Sheets, providing seamless order management and data synchronization capabilities.

---

**🎯 Ready to automate your FlexOrder development workflow? Start with the [Complete Setup Guide](FLEXORDER_SETUP_GUIDE.md)!**

