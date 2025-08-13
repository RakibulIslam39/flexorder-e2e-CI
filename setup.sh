#!/usr/bin/env bash

# FlexOrder CI/CD Pipeline - Quick Setup Script
# This script automates the initial setup process

set -e

echo "🚀 FlexOrder CI/CD Pipeline - Quick Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop first."
    exit 1
fi
print_status "Docker is installed"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi
print_status "Docker Compose is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
print_status "Node.js is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_status "npm is installed"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_status "Git is installed"

echo ""
print_info "All prerequisites are satisfied!"

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install
print_status "Node.js dependencies installed"

# Install Playwright browsers
echo ""
echo "🌐 Installing Playwright browsers..."
npx playwright install --with-deps
print_status "Playwright browsers installed"

# Create required files
echo ""
echo "📁 Creating required files..."

# Create uploads.ini
cat > uploads.ini << 'EOF'
file_uploads = On
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
max_input_vars = 3000
EOF
print_status "Created uploads.ini"

# Create mysql-init directory
mkdir -p mysql-init
print_status "Created mysql-init directory"

# Setup environment file
echo ""
echo "⚙️  Setting up environment configuration..."

if [ ! -f "tests/utilities/.env" ]; then
    cp tests/utilities/env.example tests/utilities/.env
    print_status "Created .env file from template"
    print_warning "Please edit tests/utilities/.env with your configuration"
else
    print_info ".env file already exists"
fi

# Start Docker services
echo ""
echo "🐳 Starting Docker services..."
docker-compose -f docker-compose.fresh-wordpress.yml up -d
print_status "Docker services started"

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if WordPress is accessible
echo ""
echo "🔍 Checking WordPress accessibility..."
timeout=300
counter=0
while ! curl -f http://localhost:8080 >/dev/null 2>&1; do
    echo "Waiting for WordPress... (${counter}s)"
    sleep 10
    counter=$((counter + 10))
    if [ $counter -ge $timeout ]; then
        print_error "WordPress failed to start within ${timeout} seconds"
        docker-compose -f docker-compose.fresh-wordpress.yml logs
        exit 1
    fi
done
print_status "WordPress is accessible"

# Run setup script
echo ""
echo "🔧 Running WordPress setup script..."
chmod +x main.sh
./main.sh
print_status "WordPress setup completed"

# Build plugin
echo ""
echo "🔨 Building FlexOrder plugin..."
npm run build:plugin
print_status "Plugin build completed"

# Run smoke tests
echo ""
echo "🧪 Running smoke tests..."
npm run test:smoke || {
    print_warning "Smoke tests failed, but setup is complete"
    print_info "You can run tests manually with: npm run test"
}

echo ""
echo "🎉 Setup completed successfully!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo "1. Edit tests/utilities/.env with your configuration"
echo "2. Configure Google Sheets integration"
echo "3. Run tests: npm run test"
echo "4. Access services:"
echo "   - WordPress: http://localhost:8080"
echo "   - phpMyAdmin: http://localhost:8081"
echo "   - MailHog: http://localhost:8025"
echo ""
echo "📖 For detailed instructions, see FLEXORDER_SETUP_GUIDE.md"
echo ""
print_status "Setup complete! Happy testing! 🚀"
