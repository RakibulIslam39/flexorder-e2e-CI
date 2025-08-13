# 🚀 FlexOrder CI/CD Pipeline - Complete Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [GitHub Repository Setup](#github-repository-setup)
4. [Environment Configuration](#environment-configuration)
5. [Docker Setup](#docker-setup)
6. [WordPress & WooCommerce Setup](#wordpress--woocommerce-setup)
7. [FlexOrder Plugin Setup](#flexorder-plugin-setup)
8. [Testing Setup](#testing-setup)
9. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- ✅ **Docker Desktop** (v20.10+)
- ✅ **Node.js** (v18.0+)
- ✅ **Git** (v2.30+)
- ✅ **GitHub Account**
- ✅ **Code Editor** (VS Code recommended)

### Required Accounts
- ✅ **GitHub Account** (for repository and CI/CD)
- ✅ **Google Account** (for Google Sheets integration)
- ✅ **WooCommerce Account** (for testing)

---

## 🏠 Local Development Setup

### Step 1: Clone Repository
```bash
# Clone the repository
git clone https://github.com/wppool/flexorder-e2e-automation.git
cd flexorder-e2e-automation

# Create and switch to QA branch
git checkout -b qa
```

### Step 2: Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp tests/utilities/env.example tests/utilities/.env

# Edit the environment file
nano tests/utilities/.env
```

**Configure the following in `.env`:**

```env
# Site Configuration (for local Docker setup)
URL=http://localhost:8080/wp-login.php
ADMIN_PANEL_URL=http://localhost:8080/wp-admin/
SITE_URL=http://localhost:8080/
PLAYWRIGHT_BASE_URL=http://localhost:8080/

# Admin Credentials
USER_NAME=admin
PASSWORD=admin123

# WooCommerce Configuration (will be generated automatically)
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=

# Google Sheets Configuration
GOOGLE_SHEET_ID=1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM
GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM/edit?pli=1&gid=0#gid=0
GOOGLE_SHEET_SCOPES=https://www.googleapis.com/auth/spreadsheets
SHEET_NAME=Orders
SHEET_RANGE=Orders!A1:Z1000

# Google Account Configuration
GOOGLE_ACCOUNT_EMAIL=rakibul1@wppool.dev
GOOGLE_ACCOUNT_PASSWORD=nwsv gnkp dwyx xwjd

# Service Account Configuration
SERVICE_ACCOUNT_UPLOAD_FILE=./tests/utilities/upload_key.json

# Test Configuration
CI=false
USE_FRESH_WORDPRESS=true
FRESH_SITE_URL=http://localhost:8080
TEST_TIMEOUT=300000
RETRY_ATTEMPTS=2
PARALLEL_WORKERS=1
HEADLESS=false
SLOW_MO=1000
```

---

## 🐳 Docker Setup

### Step 1: Create Required Files

**Create `uploads.ini` file:**
```bash
# Create uploads.ini for PHP configuration
cat > uploads.ini << 'EOF'
file_uploads = On
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 3000
EOF
```

**Create `mysql-init` directory:**
```bash
# Create MySQL initialization directory
mkdir -p mysql-init
```

### Step 2: Start Docker Services
```bash
# Start WordPress environment
docker-compose -f docker-compose.fresh-wordpress.yml up -d

# Verify services are running
docker-compose -f docker-compose.fresh-wordpress.yml ps
```

**Expected Output:**
```
Name                    Command               State           Ports         
--------------------------------------------------------------------------------
flexorder-mailhog      MailHog               Up       0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
flexorder-mysql        docker-entrypoint.sh mysqld      Up       0.0.0.0:3306->3306/tcp
flexorder-phpmyadmin   /docker-entrypoint.sh apac ...   Up       0.0.0.0:8081->80/tcp
flexorder-wordpress    docker-entrypoint.sh apach ...   Up       0.0.0.0:8080->80/tcp
```

### Step 3: Access Services
- **WordPress**: http://localhost:8080
- **phpMyAdmin**: http://localhost:8081
- **MailHog**: http://localhost:8025

---

## 🌐 WordPress & WooCommerce Setup

### Step 1: WordPress Installation
```bash
# Run the setup script
chmod +x main.sh
./main.sh
```

**What this script does:**
- ✅ Downloads and installs WordPress
- ✅ Creates database configuration
- ✅ Installs WooCommerce
- ✅ Generates API keys
- ✅ Creates test data

### Step 2: Verify Installation
1. **Access WordPress**: http://localhost:8080
2. **Login**: admin / admin123
3. **Check WooCommerce**: Go to WooCommerce → Status
4. **Verify API Keys**: Check WooCommerce → Settings → Advanced → REST API

### Step 3: Manual Setup (if needed)
```bash
# Access WordPress container
docker exec -it flexorder-wordpress bash

# Install WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Install WooCommerce
wp plugin install woocommerce --activate --allow-root

# Generate API keys
wp wc rest generate --user=1 --allow-root
```

---

## 🔌 FlexOrder Plugin Setup

### Step 1: Build Plugin
```bash
# Build the plugin
npm run build:plugin

# Verify build
ls -la build/
```

**Expected Output:**
```
order-sync-with-google-sheets-for-woocommerce.zip
```

### Step 2: Install Plugin
```bash
# Install plugin via WP-CLI
docker exec -it flexorder-wordpress wp plugin install /var/www/html/build/order-sync-with-google-sheets-for-woocommerce.zip --activate --allow-root

# Or install manually via WordPress admin
# 1. Go to Plugins → Add New → Upload Plugin
# 2. Upload the zip file
# 3. Activate the plugin
```

### Step 3: Configure Plugin
1. **Go to**: FlexOrder → Settings
2. **Configure Google Sheets**:
   - Sheet ID: Your Google Sheet ID
   - Service Account: Upload your JSON key file
3. **Test Connection**: Verify Google Sheets integration

---

## 🧪 Testing Setup

### Step 1: Run Smoke Tests
```bash
# Run smoke tests
npm run test:smoke

# Run with UI
npm run test:ui
```

### Step 2: Run Full Test Suite
```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/testcase/createNewOrder.spec.js

# Run with headed mode
npm run test:headed
```

### Step 3: Generate Test Reports
```bash
# Generate HTML report
npm run test:report

# Open report
npx playwright show-report
```

---

## 🔗 GitHub Repository Setup

### Step 1: Repository Organization
```
flexorder-e2e-automation/
├── .github/
│   └── workflows/
│       └── ci-workflow.yml          # Main CI/CD pipeline
├── config/
│   └── environment.ts               # Environment configuration
├── scripts/
│   ├── build-plugin.js              # Plugin build script
│   ├── generate-test-data.js        # Test data generator
│   └── setup-ci-environment.js      # CI environment setup
├── tests/
│   ├── testcase/                    # Test files
│   ├── pages/                       # Page objects
│   └── utilities/                   # Test utilities
├── docker-compose.fresh-wordpress.yml
├── main.sh                          # Setup script
└── package.json
```

### Step 2: Branch Strategy
```bash
# Main branches
main    # Production-ready code
dev     # Development branch
qa      # Quality assurance branch

# Feature branches
feature/new-feature
bugfix/fix-issue
```

### Step 3: Push Code to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Initial setup: FlexOrder CI/CD pipeline"

# Push to GitHub
git push origin qa
```

---

## 🔐 GitHub Secrets & Variables

### Step 1: Repository Secrets
Go to **Settings → Secrets and variables → Actions**

**Required Secrets:**
```
FLEXORDER_PRO_LICENSE_KEY    # Your FlexOrder Pro license key (optional)
```

**Automatically Available:**
```
GITHUB_TOKEN                 # Automatically provided by GitHub
```

### Step 2: Repository Variables
Go to **Settings → Secrets and variables → Actions → Variables**

**Optional Variables:**
```
FLEXORDER_PRO_LICENSE_KEY    # Alternative to secret (less secure)
```

### Step 3: Environment Variables for CI
The workflow uses these environment variables:
```yaml
env:
  NODE_VERSION: '18'
  PHP_VERSION: '8.1'
  WORDPRESS_VERSION: '6.4'
  WOOCOMMERCE_VERSION: '8.5.0'
  MYSQL_VERSION: '8.0'
```

---

## 🚀 CI/CD Pipeline Configuration

### Step 1: Enable GitHub Actions
1. **Go to**: Repository → Settings → Actions → General
2. **Select**: "Allow all actions and reusable workflows"
3. **Save**: Changes

### Step 2: Branch Protection (Recommended)
1. **Go to**: Settings → Branches
2. **Add rule** for `main` branch:
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Require pull request reviews
   - ✅ Include administrators

### Step 3: Workflow Triggers
The workflow automatically runs on:
- ✅ **Push to main/dev/qa branches**
- ✅ **Pull requests to main/dev/qa branches**
- ✅ **Manual trigger** (workflow_dispatch)

---

## 📊 Database Setup

### Step 1: Database Configuration
**MySQL Settings (already configured in docker-compose.yml):**
```yaml
MYSQL_ROOT_PASSWORD: rootpassword
MYSQL_DATABASE: flexorder_test
MYSQL_USER: flexorder_user
MYSQL_PASSWORD: flexorder_pass
```

### Step 2: Database Access
```bash
# Access MySQL via command line
docker exec -it flexorder-mysql mysql -u flexorder_user -p

# Or access via phpMyAdmin
# URL: http://localhost:8081
# Username: flexorder_user
# Password: flexorder_pass
```

### Step 3: Test Data Generation
```bash
# Generate test data
npm run generate:test-data

# This creates:
# - Sample products
# - Sample orders
# - Sample customers
# - API keys
```

---

## 🎯 Production Deployment

### Step 1: Test the Pipeline
```bash
# Make a test commit
echo "# Test commit" >> README.md
git add README.md
git commit -m "Test: Trigger CI pipeline"
git push origin qa
```

### Step 2: Monitor Pipeline
1. **Go to**: GitHub → Actions tab
2. **Monitor**: Workflow execution
3. **Check**: All jobs pass successfully

### Step 3: Deploy to Production
```bash
# Merge QA to main (when ready)
git checkout main
git merge qa
git push origin main

# This triggers:
# - Full test suite
# - Plugin build
# - GitHub release creation
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. Docker Issues
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# Restart services
docker-compose -f docker-compose.fresh-wordpress.yml down
docker-compose -f docker-compose.fresh-wordpress.yml up -d
```

#### 2. WordPress Issues
```bash
# Reset WordPress
docker exec -it flexorder-wordpress wp db reset --yes --allow-root
docker exec -it flexorder-wordpress wp core install --url=http://localhost:8080 --title="FlexOrder Test" --admin_user=admin --admin_password=admin123 --admin_email=admin@test.com --allow-root
```

#### 3. Test Issues
```bash
# Clear test cache
npm run clean

# Reinstall browsers
npx playwright install --with-deps

# Run with debug
npx playwright test --debug
```

#### 4. CI/CD Issues
```bash
# Check workflow syntax
yamllint .github/workflows/ci-workflow.yml

# Test locally
act -j setup-wordpress
```

### Debug Commands
```bash
# Check Docker logs
docker-compose -f docker-compose.fresh-wordpress.yml logs

# Check WordPress logs
docker exec -it flexorder-wordpress tail -f /var/www/html/wp-content/debug.log

# Check test results
npx playwright show-report
```

---

## 📋 Quick Start Checklist

### Local Setup
- [ ] Install Docker Desktop
- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Copy and configure `.env` file
- [ ] Start Docker services
- [ ] Run setup script
- [ ] Build plugin
- [ ] Run tests

### GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to repository
- [ ] Enable GitHub Actions
- [ ] Set up branch protection
- [ ] Configure secrets (if needed)
- [ ] Test workflow trigger

### Production Ready
- [ ] All tests passing
- [ ] Plugin builds successfully
- [ ] CI/CD pipeline working
- [ ] Documentation complete
- [ ] Team trained on workflow

---

## 📞 Support & Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Documentation](https://playwright.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [WordPress Development](https://developer.wordpress.org/)

### Contact
- **Repository**: https://github.com/wppool/flexorder-e2e-automation
- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions

---

## 🎉 Success Criteria

Your setup is complete when:
- ✅ **Local environment** runs tests successfully
- ✅ **GitHub Actions** workflow passes all jobs
- ✅ **Plugin builds** are created automatically
- ✅ **Releases** are generated on main branch
- ✅ **Team can** run tests locally and in CI
- ✅ **Documentation** is complete and up-to-date

---

**🎯 You're now ready to develop, test, and deploy FlexOrder with confidence!**
