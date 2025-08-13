#!/usr/bin/env node

/**
 * Plugin Build Script
 * Creates optimized plugin packages for different branches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build configuration
const config = {
    pluginName: 'order-sync-with-google-sheets-for-woocommerce',
    buildDir: 'build',
    srcDir: 'src',
    proDir: 'pro',
    excludePatterns: [
        '*.DS_Store',
        '*/node_modules/*',
        '*/tests/*',
        '*/docs/*',
        '*.git*',
        'build/*',
        '*.log',
        '*.tmp'
    ]
};

// Utility functions
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        warning: '\x1b[33m', // Yellow
        error: '\x1b[31m'    // Red
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created directory: ${dirPath}`, 'info');
    }
}

function getExcludeArgs() {
    return config.excludePatterns.map(pattern => `-x "${pattern}"`).join(' ');
}

function buildPlugin(sourceDir, outputName, description) {
    log(`Building ${description}...`, 'info');
    
    if (!fs.existsSync(sourceDir)) {
        log(`Source directory not found: ${sourceDir}`, 'warning');
        return false;
    }
    
    const outputPath = path.join(config.buildDir, outputName);
    const excludeArgs = getExcludeArgs();
    
    try {
        // Create zip file
        const zipCommand = `zip -r "${outputPath}" "${sourceDir}/" ${excludeArgs}`;
        execSync(zipCommand, { stdio: 'inherit' });
        
        // Verify the zip was created
        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            log(`✅ ${description} built successfully: ${outputPath} (${sizeInMB} MB)`, 'success');
            return true;
        } else {
            log(`❌ Failed to create ${description}`, 'error');
            return false;
        }
    } catch (error) {
        log(`❌ Error building ${description}: ${error.message}`, 'error');
        return false;
    }
}

function runNpmBuild() {
    log('Checking for npm build process...', 'info');
    
    if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.build) {
            log('Running npm build process...', 'info');
            try {
                execSync('npm run build', { stdio: 'inherit' });
                log('✅ NPM build completed successfully', 'success');
                return true;
            } catch (error) {
                log(`❌ NPM build failed: ${error.message}`, 'error');
                return false;
            }
        } else {
            log('No build script found in package.json', 'warning');
        }
    } else {
        log('No package.json found', 'warning');
    }
    
    return false;
}

function generateApiKeys() {
    log('Generating WooCommerce API keys...', 'info');
    
    const apiKeysPath = path.join('tests', 'utilities', 'api-keys.json');
    const envPath = path.join('tests', 'utilities', '.env');
    
    // Generate random API keys
    const consumerKey = `ck_${require('crypto').randomBytes(32).toString('hex')}`;
    const consumerSecret = `cs_${require('crypto').randomBytes(32).toString('hex')}`;
    
    // Create API keys JSON file
    const apiKeysData = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        site_url: process.env.SITE_URL || 'http://flexorder.local/',
        generated_at: new Date().toISOString()
    };
    
    ensureDirectoryExists(path.dirname(apiKeysPath));
    fs.writeFileSync(apiKeysPath, JSON.stringify(apiKeysData, null, 2));
    log(`✅ API keys generated: ${apiKeysPath}`, 'success');
    
    // Update .env file if it exists
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Replace or add WooCommerce API keys
        const keyRegex = /WOOCOMMERCE_CONSUMER_KEY=.*/;
        const secretRegex = /WOOCOMMERCE_CONSUMER_SECRET=.*/;
        
        if (keyRegex.test(envContent)) {
            envContent = envContent.replace(keyRegex, `WOOCOMMERCE_CONSUMER_KEY=${consumerKey}`);
        } else {
            envContent += `\nWOOCOMMERCE_CONSUMER_KEY=${consumerKey}`;
        }
        
        if (secretRegex.test(envContent)) {
            envContent = envContent.replace(secretRegex, `WOOCOMMERCE_CONSUMER_SECRET=${consumerSecret}`);
        } else {
            envContent += `\nWOOCOMMERCE_CONSUMER_SECRET=${consumerSecret}`;
        }
        
        fs.writeFileSync(envPath, envContent);
        log(`✅ Updated .env file with new API keys`, 'success');
    }
    
    return { consumerKey, consumerSecret };
}

function main() {
    log('🚀 Starting FlexOrder Plugin Build Process', 'info');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const buildFreeOnly = args.includes('--free-only');
    const buildProOnly = args.includes('--pro-only');
    
    // Ensure build directory exists
    ensureDirectoryExists(config.buildDir);
    
    // Run npm build if available
    runNpmBuild();
    
    // Build Free version
    let freeBuilt = false;
    if (!buildProOnly) {
        if (fs.existsSync(config.srcDir)) {
            freeBuilt = buildPlugin(
                config.srcDir,
                `${config.pluginName}.zip`,
                'Free Version'
            );
        } else {
            log('Source directory not found, building from current directory', 'warning');
            // Build from current directory if src doesn't exist
            freeBuilt = buildPlugin(
                '.',
                `${config.pluginName}.zip`,
                'Free Version'
            );
        }
    }
    
    // Build Pro version if directory exists
    let proBuilt = false;
    if (!buildFreeOnly && fs.existsSync(config.proDir)) {
        proBuilt = buildPlugin(
            config.proDir,
            `${config.pluginName}-pro.zip`,
            'Pro Version'
        );
    } else if (!buildFreeOnly) {
        log('Pro version directory not found, skipping Pro build', 'warning');
    }
    
    // Generate API keys
    const apiKeys = generateApiKeys();
    
    // Summary
    log('\n📋 Build Summary:', 'info');
    log(`Free Version: ${freeBuilt ? '✅ Built' : '❌ Failed'}`, freeBuilt ? 'success' : 'error');
    log(`Pro Version: ${proBuilt ? '✅ Built' : '❌ Skipped'}`, proBuilt ? 'success' : 'warning');
    log(`API Keys: ✅ Generated`, 'success');
    log(`Consumer Key: ${apiKeys.consumerKey}`, 'info');
    log(`Consumer Secret: ${apiKeys.consumerSecret}`, 'info');
    
    // List build artifacts
    log('\n📦 Build Artifacts:', 'info');
    if (fs.existsSync(config.buildDir)) {
        const files = fs.readdirSync(config.buildDir);
        files.forEach(file => {
            const filePath = path.join(config.buildDir, file);
            const stats = fs.statSync(filePath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
            log(`  📄 ${file} (${sizeInMB} MB)`, 'success');
        });
    }
    
    log('\n🎉 Build process completed!', 'success');
}

// Run the build process
if (require.main === module) {
    main();
}

module.exports = {
    buildPlugin,
    generateApiKeys,
    config
}; 