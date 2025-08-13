@echo off
REM FlexOrder CI/CD Pipeline - Quick Setup Script for Windows
REM This script automates the initial setup process

echo 🚀 FlexOrder CI/CD Pipeline - Quick Setup
echo ==========================================

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)
echo ✅ Docker is installed

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)
echo ✅ Docker Compose is installed

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
echo ✅ Node.js is installed

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    exit /b 1
)
echo ✅ npm is installed

REM Check Git
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    exit /b 1
)
echo ✅ Git is installed

echo.
echo ℹ️  All prerequisites are satisfied!

REM Install Node.js dependencies
echo.
echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    exit /b 1
)
echo ✅ Node.js dependencies installed

REM Install Playwright browsers
echo.
echo 🌐 Installing Playwright browsers...
call npx playwright install --with-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install Playwright browsers
    exit /b 1
)
echo ✅ Playwright browsers installed

REM Create required files
echo.
echo 📁 Creating required files...

REM Create uploads.ini
(
echo file_uploads = On
echo memory_limit = 256M
echo upload_max_filesize = 64M
echo post_max_size = 64M
echo max_execution_time = 300
echo max_input_vars = 3000
) > uploads.ini
echo ✅ Created uploads.ini

REM Create mysql-init directory
if not exist mysql-init mkdir mysql-init
echo ✅ Created mysql-init directory

REM Setup environment file
echo.
echo ⚙️  Setting up environment configuration...

if not exist "tests\utilities\.env" (
    copy "tests\utilities\env.example" "tests\utilities\.env" >nul
    echo ✅ Created .env file from template
    echo ⚠️  Please edit tests\utilities\.env with your configuration
) else (
    echo ℹ️  .env file already exists
)

REM Start Docker services
echo.
echo 🐳 Starting Docker services...
docker-compose -f docker-compose.fresh-wordpress.yml up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start Docker services
    exit /b 1
)
echo ✅ Docker services started

REM Wait for services to be ready
echo.
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check if WordPress is accessible
echo.
echo 🔍 Checking WordPress accessibility...
set timeout=300
set counter=0

:check_wordpress
curl -f http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ WordPress is accessible
    goto :setup_wordpress
)

echo Waiting for WordPress... (%counter%s)
timeout /t 10 /nobreak >nul
set /a counter+=10

if %counter% geq %timeout% (
    echo ❌ WordPress failed to start within %timeout% seconds
    docker-compose -f docker-compose.fresh-wordpress.yml logs
    exit /b 1
)

goto :check_wordpress

:setup_wordpress
REM Run setup script
echo.
echo 🔧 Running WordPress setup script...
call main.sh
if %errorlevel% neq 0 (
    echo ❌ Failed to run WordPress setup
    exit /b 1
)
echo ✅ WordPress setup completed

REM Build plugin
echo.
echo 🔨 Building FlexOrder plugin...
call npm run build:plugin
if %errorlevel% neq 0 (
    echo ❌ Failed to build plugin
    exit /b 1
)
echo ✅ Plugin build completed

REM Run smoke tests
echo.
echo 🧪 Running smoke tests...
call npm run test:smoke
if %errorlevel% neq 0 (
    echo ⚠️  Smoke tests failed, but setup is complete
    echo ℹ️  You can run tests manually with: npm run test
) else (
    echo ✅ Smoke tests passed
)

echo.
echo 🎉 Setup completed successfully!
echo ==========================================
echo.
echo 📋 Next steps:
echo 1. Edit tests\utilities\.env with your configuration
echo 2. Configure Google Sheets integration
echo 3. Run tests: npm run test
echo 4. Access services:
echo    - WordPress: http://localhost:8080
echo    - phpMyAdmin: http://localhost:8081
echo    - MailHog: http://localhost:8025
echo.
echo 📖 For detailed instructions, see FLEXORDER_SETUP_GUIDE.md
echo.
echo ✅ Setup complete! Happy testing! 🚀

pause
