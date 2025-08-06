#!/bin/bash

# FlexOrder GitHub Repository Setup Script
# This script helps you set up your GitHub repository for CI/CD

set -e

echo "🚀 FlexOrder GitHub Repository Setup"
echo "====================================="

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

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    print_status "Remote origin already configured"
    ORIGIN_URL=$(git remote get-url origin)
    print_info "Current origin: $ORIGIN_URL"
else
    print_warning "No remote origin configured"
    echo ""
    print_info "Please create a repository on GitHub first:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: flexorder-e2e-automation"
    echo "3. Make it Private (recommended)"
    echo "4. Don't initialize with README"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        print_error "Repository URL is required"
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    print_status "Remote origin added: $REPO_URL"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

# Add all files
print_info "Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    print_status "No changes to commit"
else
    print_info "Committing changes..."
    git commit -m "feat: Initial FlexOrder E2E automation setup"
    print_status "Changes committed"
fi

# Set up main branch
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_info "Renaming branch to main..."
    git branch -M main
    print_status "Branch renamed to main"
fi

# Push to main
print_info "Pushing to main branch..."
git push -u origin main
print_status "Pushed to main branch"

# Create dev branch
print_info "Creating dev branch..."
git checkout -b dev
git push -u origin dev
print_status "Dev branch created and pushed"

# Create qa branch
print_info "Creating qa branch..."
git checkout -b qa
git push -u origin qa
print_status "QA branch created and pushed"

# Return to main
git checkout main
print_status "Returned to main branch"

echo ""
echo "🎉 GitHub Repository Setup Complete!"
echo "===================================="
print_status "Repository initialized and pushed"
print_status "Branches created: main, dev, qa"
echo ""
print_info "Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Set up branch protection rules"
echo "3. Configure GitHub secrets"
echo "4. Monitor your first CI run"
echo ""
print_info "See GITHUB_SETUP_GUIDE.md for detailed instructions"
echo ""
print_warning "Don't forget to:"
echo "- Set up branch protection rules"
echo "- Add GitHub secrets for API keys"
echo "- Configure team access"
echo ""
print_status "Setup complete! 🚀" 