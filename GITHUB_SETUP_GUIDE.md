# GitHub Repository Setup Guide for FlexOrder

This guide will help you set up your GitHub repository for the FlexOrder CI/CD pipeline.

## 📋 **Prerequisites**

- GitHub account
- Repository created on GitHub
- Local code ready to push
- Docker Desktop (for local testing)

## 🎯 **Step 1: Repository Initialization**

### **1.1 Create Repository on GitHub**
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name: `flexorder-e2e-automation`
4. Description: `FlexOrder Plugin E2E Testing & CI/CD Pipeline`
5. Make it **Private** (recommended for security)
6. Don't initialize with README (we'll push our existing code)

### **1.2 Initialize Local Repository**
```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: FlexOrder E2E automation setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flexorder-e2e-automation.git
git push -u origin main
```

## 🔧 **Step 2: Branch Strategy Setup**

### **2.1 Create Development Branches**
```bash
# Create dev branch
git checkout -b dev
git push -u origin dev

# Create qa branch
git checkout -b qa
git push -u origin qa

# Return to main
git checkout main
```

### **2.2 Branch Protection Rules**

**Go to GitHub → Settings → Branches → Add rule:**

#### **For `main` branch:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

#### **For `dev` branch:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging

#### **For `qa` branch:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging

## 🔐 **Step 3: GitHub Secrets Configuration**

### **3.1 Go to Repository Settings**
- Navigate to your repository
- Go to **Settings** → **Secrets and variables** → **Actions**

### **3.2 Add Required Secrets**

#### **Google Sheets API Secrets:**
```
GOOGLE_SHEET_ID
1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM

GOOGLE_SHEET_URL
https://docs.google.com/spreadsheets/d/1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM/edit?pli=1&gid=0

GOOGLE_ACCOUNT_EMAIL
rakibul1@wppool.dev

GOOGLE_ACCOUNT_PASSWORD
WpPool#03029#
```

#### **FlexOrder Pro License Secret:**
```
FLEXORDER_PRO_LICENSE_KEY
[Your Pro license key here - optional]
```

#### **WordPress Admin Secrets:**
```
WP_ADMIN_USERNAME
admin

WP_ADMIN_PASSWORD
admin123

WP_ADMIN_EMAIL
admin@flexorder.test
```

#### **Database Secrets:**
```
DB_HOST
127.0.0.1

DB_NAME
flexorder_test

DB_USER
flexorder_user

DB_PASSWORD
flexorder_pass
```

## 📁 **Step 4: File Structure Verification**

Ensure these files are in your repository:

```
flexorder-e2e-automation/
├── .github/
│   └── workflows/
│       ├── playwright.yml          # Main CI workflow
│       └── ci-workflow.yml         # Comprehensive CI workflow
├── main.sh                         # rtMedia-style setup script
├── .travis.yml                     # Travis CI configuration
├── pre-commit                      # Git hooks
├── package.json                    # Dependencies
├── playwright.config.ts            # Playwright configuration
├── tests/
│   ├── testcase/                   # Test files
│   ├── pages/                      # Page Object Models
│   └── utilities/                  # Test utilities
├── src/                            # Plugin source code (if exists)
├── pro/                            # Pro version code (if exists)
└── README.md                       # Documentation
```

## 🚀 **Step 5: CI/CD Pipeline Activation**

### **5.1 Enable GitHub Actions**
1. Go to **Actions** tab in your repository
2. Click "Enable Actions"
3. Select "Skip this and set up a workflow yourself"

### **5.2 Verify Workflow Files**
Ensure these workflows are present:
- `.github/workflows/playwright.yml` (rtMedia-style)
- `.github/workflows/ci-workflow.yml` (comprehensive)

### **5.3 Test the Pipeline**
```bash
# Make a small change and push to trigger CI
echo "# Test commit" >> README.md
git add README.md
git commit -m "test: Trigger CI pipeline"
git push origin main
```

## 🔍 **Step 6: Monitoring & Debugging**

### **6.1 Check Workflow Status**
- Go to **Actions** tab
- Monitor workflow runs
- Check logs for any issues

### **6.2 Common Issues & Solutions**

#### **Issue: MySQL Action Not Found**
**Solution**: Already fixed - using Docker commands instead

#### **Issue: Plugin Build Fails**
**Solution**: Ensure your plugin has proper structure and build process

#### **Issue: Pro License Not Activating**
**Solution**: Verify the `FLEXORDER_PRO_LICENSE_KEY` secret is set correctly

#### **Issue: WooCommerce API Keys Not Generated**
**Solution**: Check if WooCommerce is properly installed and configured

## 📊 **Step 7: Repository Settings**

### **7.1 General Settings**
- **Repository name**: `flexorder-e2e-automation`
- **Description**: `FlexOrder Plugin E2E Testing & CI/CD Pipeline`
- **Website**: [Your website URL]
- **Topics**: `playwright`, `automation`, `woocommerce`, `wordpress`, `ci-cd`

### **7.2 Features**
- ✅ **Issues**: Enable
- ✅ **Pull requests**: Enable
- ✅ **Wikis**: Disable (use README instead)
- ✅ **Discussions**: Enable (for community)
- ✅ **Sponsorships**: Enable

### **7.3 Security**
- ✅ **Dependency graph**: Enable
- ✅ **Dependabot alerts**: Enable
- ✅ **Dependabot security updates**: Enable
- ✅ **Code scanning**: Enable (if available)

## 🎯 **Step 8: Team Collaboration**

### **8.1 Invite Team Members**
1. Go to **Settings** → **Collaborators and teams**
2. Add team members with appropriate permissions:
   - **Admin**: Full access
   - **Maintain**: Can manage issues, PRs, and releases
   - **Write**: Can push code and create branches
   - **Read**: Can view and comment

### **8.2 Code Review Process**
1. All changes go through PRs
2. Require at least 1 approval
3. Require CI checks to pass
4. Use conventional commit messages

## 📈 **Step 9: Analytics & Insights**

### **9.1 Enable Insights**
- Go to **Insights** tab
- Monitor:
  - **Traffic**: Repository views
  - **Commits**: Activity over time
  - **Contributors**: Team activity
  - **Code frequency**: Development pace

### **9.2 Set Up Notifications**
- Configure email notifications
- Set up Slack/Discord integration (optional)
- Enable webhook notifications

## ✅ **Step 10: Verification Checklist**

- [ ] Repository created and initialized
- [ ] All branches created (main, dev, qa)
- [ ] Branch protection rules configured
- [ ] GitHub secrets added (including Pro license key)
- [ ] Workflow files in place
- [ ] First CI run successful
- [ ] Plugin builds successfully
- [ ] WooCommerce API keys generated
- [ ] Pro version activates (if license provided)
- [ ] Team members invited
- [ ] Documentation updated
- [ ] Security settings configured

## 🚀 **Next Steps**

### **Immediate Actions:**
1. Push your code to GitHub
2. Set up branch protection
3. Configure secrets (including Pro license)
4. Test the CI pipeline
5. Verify plugin building process

### **Future Enhancements:**
1. Set up automated releases
2. Configure deployment pipelines
3. Add performance monitoring
4. Implement security scanning

## 🔧 **Plugin Building Process**

### **How It Works:**
1. **Build Process**: The CI pipeline builds your plugin from the main branch code
2. **Free Version**: Always built and installed
3. **Pro Version**: Built and installed if `FLEXORDER_PRO_LICENSE_KEY` is provided
4. **Installation**: Both versions are installed on the test WordPress site
5. **Activation**: Pro license is automatically activated if key is available

### **Plugin Structure:**
```
flexorder-e2e-automation/
├── src/                    # Free version source
├── pro/                    # Pro version source (optional)
├── build/                  # Generated plugin files
│   ├── order-sync-with-google-sheets-for-woocommerce.zip
│   └── order-sync-with-google-sheets-for-woocommerce-pro.zip
└── package.json            # Build scripts
```

### **WooCommerce API Key Handling:**
1. **Generation**: API keys are generated automatically during CI setup
2. **Storage**: Keys are stored in WordPress options and test environment files
3. **Usage**: Keys are available to both the plugin and test scripts
4. **Security**: Keys are generated fresh for each CI run

---

**🎉 Your GitHub repository is now ready for FlexOrder CI/CD!**

**Quick Start Commands:**
```bash
# Initialize and push
git init
git add .
git commit -m "Initial commit: FlexOrder E2E automation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flexorder-e2e-automation.git
git push -u origin main

# Create branches
git checkout -b dev && git push -u origin dev
git checkout -b qa && git push -u origin qa
git checkout main
```

**Monitor your first CI run in the Actions tab! 🚀** 