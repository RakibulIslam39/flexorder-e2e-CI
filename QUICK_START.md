# 🚀 Quick Start: GitHub Repository Setup

## **Step 1: Create GitHub Repository**

1. Go to [GitHub.com](https://github.com) and sign in
2. Click **"New repository"**
3. Fill in:
   - **Repository name**: `flexorder-e2e-automation`
   - **Description**: `FlexOrder Plugin E2E Testing & CI/CD Pipeline`
   - **Visibility**: Private (recommended)
   - **Don't** initialize with README (we have existing code)

## **Step 2: Run Setup Script**

```bash
# Make script executable (if on Linux/Mac)
chmod +x setup-github.sh

# Run the setup script
./setup-github.sh
```

**Or manually:**
```bash
git init
git add .
git commit -m "feat: Initial FlexOrder E2E automation setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flexorder-e2e-automation.git
git push -u origin main

# Create branches
git checkout -b dev && git push -u origin dev
git checkout -b qa && git push -u origin qa
git checkout main
```

## **Step 3: Configure GitHub Secrets**

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_SHEET_ID` | `1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM` |
| `GOOGLE_SHEET_URL` | `https://docs.google.com/spreadsheets/d/1Q_DuF-dWj9cH0AN8TzIhoHW07BVy1Akj4LbkHDigeQM/edit?pli=1&gid=0` |
| `GOOGLE_ACCOUNT_EMAIL` | `rakibul1@wppool.dev` |
| `GOOGLE_ACCOUNT_PASSWORD` | `WpPool#03029#` |
| `WP_ADMIN_USERNAME` | `admin` |
| `WP_ADMIN_PASSWORD` | `admin123` |
| `WP_ADMIN_EMAIL` | `admin@flexorder.test` |
| `FLEXORDER_PRO_LICENSE_KEY` | `[Your Pro license key - optional]` |

## **Step 4: Set Up Branch Protection**

Go to **Settings** → **Branches** → **Add rule**

**For `main`, `dev`, `qa` branches:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ✅ Require status checks to pass before merging

## **Step 5: Test CI Pipeline**

```bash
# Make a test commit
echo "# Test CI" >> README.md
git add README.md
git commit -m "test: Trigger CI pipeline"
git push origin main
```

## **Step 6: Monitor Results**

1. Go to **Actions** tab in your repository
2. Watch the workflow run
3. Check for any errors in the logs

## **✅ Success Indicators**

- [ ] Repository created and code pushed
- [ ] All branches created (main, dev, qa)
- [ ] GitHub secrets configured (including Pro license)
- [ ] Branch protection rules set
- [ ] First CI run successful
- [ ] Plugin builds successfully
- [ ] WooCommerce API keys generated
- [ ] Tests passing in Actions tab

## **🔧 Troubleshooting**

### **Issue: Permission Denied**
```bash
# Fix script permissions
chmod +x setup-github.sh
```

### **Issue: Remote Already Exists**
```bash
# Remove and re-add remote
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/flexorder-e2e-automation.git
```

### **Issue: CI Fails**
1. Check **Actions** tab for error logs
2. Verify GitHub secrets are set correctly
3. Ensure all required files are committed

### **Issue: Plugin Build Fails**
1. Check if your plugin has proper structure
2. Verify `src/` or main plugin directory exists
3. Ensure no build errors in the logs

### **Issue: Pro License Not Working**
1. Verify `FLEXORDER_PRO_LICENSE_KEY` secret is set
2. Check if Pro version code exists in `pro/` directory
3. Review license activation logs

## **📚 Full Documentation**

See `GITHUB_SETUP_GUIDE.md` for complete setup instructions.

## **🔧 Plugin Building Process**

### **What Happens in CI:**
1. **Build**: Plugin is built from main branch code
2. **Free Version**: Always built and installed
3. **Pro Version**: Built if license key is provided
4. **Installation**: Both versions installed on test site
5. **API Keys**: WooCommerce keys generated automatically

### **Plugin Structure:**
```
flexorder-e2e-automation/
├── src/                    # Free version source
├── pro/                    # Pro version source (optional)
├── build/                  # Generated plugin files
└── package.json            # Build scripts
```

---

**🎉 You're ready to go! Monitor your first CI run in the Actions tab!** 