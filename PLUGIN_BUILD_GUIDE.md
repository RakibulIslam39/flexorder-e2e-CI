# 🔧 FlexOrder Plugin Build & Installation Guide

This guide explains how the FlexOrder plugin is built, installed, and configured in the CI/CD pipeline.

## 📋 **Overview**

The CI/CD pipeline automatically:
1. **Builds** the FlexOrder plugin from main branch code
2. **Installs** both Free and Pro versions (if license available)
3. **Generates** WooCommerce API keys dynamically
4. **Activates** Pro license automatically
5. **Runs** comprehensive tests

## 🏗️ **Plugin Building Process**

### **Build Structure**
```
flexorder-e2e-automation/
├── src/                                    # Free version source code
├── pro/                                    # Pro version source code (optional)
├── build/                                  # Generated plugin files
│   ├── order-sync-with-google-sheets-for-woocommerce.zip
│   └── order-sync-with-google-sheets-for-woocommerce-pro.zip
├── scripts/
│   └── build-plugin.js                     # Build script
└── package.json                            # Build configuration
```

### **Build Script Features**
- ✅ **Automatic detection** of source directories
- ✅ **NPM build process** integration
- ✅ **Exclusion patterns** for clean builds
- ✅ **Size reporting** and verification
- ✅ **API key generation** for WooCommerce
- ✅ **Environment file** updates

### **Build Commands**
```bash
# Build both Free and Pro versions
npm run build

# Build Free version only
npm run build:free

# Build Pro version only
npm run build:pro

# Legacy command
npm run build:plugin
```

## 🔐 **Pro License Management**

### **License Key Storage**
- **GitHub Secret**: `FLEXORDER_PRO_LICENSE_KEY`
- **Environment Variable**: `FLEXORDER_PRO_LICENSE_KEY`
- **WordPress Options**: Stored in database for plugin access

### **License Activation Process**
1. **Check**: CI checks if Pro license key is provided
2. **Build**: Pro version is built if license exists
3. **Install**: Pro plugin is installed on test site
4. **Activate**: License is automatically activated
5. **Verify**: License status is confirmed

### **License Key Format**
```
FLEXORDER_PRO_LICENSE_KEY=your-license-key-here
```

## 🔑 **WooCommerce API Key Generation**

### **Automatic Generation**
- **Consumer Key**: `ck_` + 64 random hex characters
- **Consumer Secret**: `cs_` + 64 random hex characters
- **Fresh Keys**: Generated for each CI run

### **Storage Locations**
1. **WordPress Options**: For plugin access
2. **API Keys File**: `tests/utilities/api-keys.json`
3. **Environment File**: `tests/utilities/.env`
4. **CI Output**: Available to subsequent jobs

### **API Key Usage**
```json
{
  "consumer_key": "ck_abc123...",
  "consumer_secret": "cs_def456...",
  "site_url": "http://flexorder.local/",
  "generated_at": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 **Installation Process**

### **Free Version Installation**
```bash
# Always installed
wp plugin install build/order-sync-with-google-sheets-for-woocommerce.zip --activate
```

### **Pro Version Installation**
```bash
# Only if license key is provided
if [ -n "$FLEXORDER_PRO_LICENSE_KEY" ]; then
    wp plugin install build/order-sync-with-google-sheets-for-woocommerce-pro.zip --activate
    wp option update flexorder_pro_license_key "$FLEXORDER_PRO_LICENSE_KEY"
    wp option update flexorder_pro_license_status "active"
fi
```

### **Plugin Configuration**
- **Site URL**: Automatically configured
- **Admin Credentials**: Set via environment variables
- **WooCommerce**: Pre-installed and configured
- **Test Data**: Generated automatically

## 📊 **CI/CD Integration**

### **GitHub Actions Workflow**
```yaml
- name: Build FlexOrder Plugin
  run: |
    mkdir -p build
    npm run build
    
- name: Setup WordPress
  env:
    FLEXORDER_PRO_LICENSE_KEY: ${{ secrets.FLEXORDER_PRO_LICENSE_KEY }}
  run: |
    ./main.sh
```

### **Environment Variables**
```bash
# Required for Pro version
FLEXORDER_PRO_LICENSE_KEY=your-license-key

# Generated automatically
WOOCOMMERCE_CONSUMER_KEY=ck_abc123...
WOOCOMMERCE_CONSUMER_SECRET=cs_def456...

# Site configuration
SITE_URL=http://flexorder.local/
WP_ADMIN_USERNAME=admin
WP_ADMIN_PASSWORD=admin123
```

## 🔍 **Troubleshooting**

### **Build Issues**
```bash
# Check source directories
ls -la src/ pro/

# Verify build script
node scripts/build-plugin.js

# Check build output
ls -la build/
```

### **Installation Issues**
```bash
# Check plugin files
ls -la build/*.zip

# Verify WordPress installation
wp plugin list

# Check license activation
wp option get flexorder_pro_license_status
```

### **API Key Issues**
```bash
# Check API keys file
cat tests/utilities/api-keys.json

# Verify environment file
cat tests/utilities/.env | grep WOOCOMMERCE

# Regenerate keys
node scripts/build-plugin.js
```

## 📈 **Monitoring & Logs**

### **Build Logs**
- **Build Process**: Check CI logs for build steps
- **File Sizes**: Verify plugin zip file sizes
- **API Keys**: Confirm key generation
- **Installation**: Monitor plugin activation

### **Success Indicators**
- ✅ Plugin zip files created in `build/` directory
- ✅ API keys generated and stored
- ✅ WordPress plugins activated
- ✅ Pro license activated (if provided)
- ✅ Tests passing

### **Common Log Messages**
```
[INFO] Building Free Version...
[SUCCESS] Free Version built successfully: build/order-sync-with-google-sheets-for-woocommerce.zip (2.5 MB)
[INFO] Pro version directory not found, skipping Pro build
[SUCCESS] API keys generated: tests/utilities/api-keys.json
[SUCCESS] Build process completed!
```

## 🔧 **Customization**

### **Build Configuration**
Edit `scripts/build-plugin.js` to modify:
- **Exclusion patterns**: Files to exclude from builds
- **Source directories**: Where to find plugin code
- **Output naming**: Plugin file names
- **Build process**: Custom build steps

### **Installation Customization**
Edit `main.sh` to modify:
- **Installation order**: Plugin installation sequence
- **Configuration**: Site setup parameters
- **Test data**: Generated test content
- **License handling**: Pro version activation

### **Environment Customization**
Edit `tests/utilities/.env` to modify:
- **Site URLs**: Test site configuration
- **Credentials**: Admin and API credentials
- **Plugin settings**: Plugin-specific configuration
- **Test parameters**: Test execution settings

## 📚 **Related Files**

- **`main.sh`**: Main setup script
- **`scripts/build-plugin.js`**: Plugin build script
- **`.github/workflows/ci-workflow.yml`**: CI/CD workflow
- **`tests/utilities/api-keys.json`**: Generated API keys
- **`tests/utilities/.env`**: Environment configuration

---

**🎉 Your FlexOrder plugin build and installation process is fully automated!**

**Key Benefits:**
- 🔄 **Automated builds** from main branch code
- 🔐 **Secure license management** via GitHub secrets
- 🔑 **Dynamic API key generation** for each test run
- 🧪 **Comprehensive testing** with both Free and Pro versions
- 📊 **Detailed monitoring** and logging
- 🔧 **Easy customization** for different environments 