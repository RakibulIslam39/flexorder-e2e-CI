# 🚀 GitHub Actions Setup Guide

## 📋 Quick Setup Checklist

### 1. Repository Setup
- [ ] Create GitHub repository
- [ ] Push code to repository
- [ ] Enable GitHub Actions
- [ ] Configure branch protection

### 2. Secrets & Variables
- [ ] Set up repository secrets
- [ ] Configure environment variables

### 3. Test Pipeline
- [ ] Trigger workflow manually
- [ ] Monitor execution
- [ ] Verify all jobs pass

---

## 🔧 Step-by-Step Setup

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Click**: "New repository"
3. **Repository name**: `flexorder-e2e-automation`
4. **Description**: `FlexOrder Plugin CI/CD Pipeline with E2E Testing`
5. **Visibility**: Choose Public or Private
6. **Initialize**: Don't initialize with README (we'll push existing code)
7. **Click**: "Create repository"

### Step 2: Push Code to Repository

```bash
# Initialize git (if not already done)
git init

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/flexorder-e2e-automation.git

# Create and switch to qa branch
git checkout -b qa

# Add all files
git add .

# Commit changes
git commit -m "Initial setup: FlexOrder CI/CD pipeline"

# Push to GitHub
git push -u origin qa
```

### Step 3: Enable GitHub Actions

1. **Go to**: Your repository → Settings
2. **Click**: Actions → General
3. **Select**: "Allow all actions and reusable workflows"
4. **Scroll down**: Click "Save"

### Step 4: Configure Branch Protection

1. **Go to**: Settings → Branches
2. **Click**: "Add rule"
3. **Branch name pattern**: `main`
4. **Check these options**:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
5. **Click**: "Create"

### Step 5: Set Up Secrets

1. **Go to**: Settings → Secrets and variables → Actions
2. **Click**: "New repository secret"

**Add these secrets:**

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `FLEXORDER_PRO_LICENSE_KEY` | Your FlexOrder Pro license key | Optional |

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub.

### Step 6: Test the Pipeline

1. **Make a test commit**:
```bash
echo "# Test commit" >> README.md
git add README.md
git commit -m "Test: Trigger CI pipeline"
git push origin qa
```

2. **Monitor the workflow**:
   - Go to Actions tab
   - Click on the running workflow
   - Monitor each job

---

## 🔍 Understanding the Workflow

### Workflow Structure

```yaml
name: FlexOrder CI/CD Pipeline

on:
  push:
    branches: [main, dev, qa]
  pull_request:
    branches: [main, dev, qa]

jobs:
  setup-wordpress:    # Sets up WordPress environment
  e2e-tests:         # Runs tests across browsers
  build-deploy:      # Creates releases (main branch only)
  cleanup:           # Cleans up resources
```

### Job Dependencies

```
setup-wordpress
    ↓
e2e-tests ──┐
    ↓       ↓
build-deploy  cleanup
```

### Matrix Strategy

The E2E tests run across multiple browsers:
- **Chromium** (Chrome)
- **Firefox**
- **WebKit** (Safari)

---

## 📊 Monitoring & Debugging

### Viewing Workflow Runs

1. **Go to**: Actions tab
2. **Click**: On a workflow run
3. **View**: Individual job logs
4. **Download**: Artifacts (test results, screenshots)

### Common Issues

#### 1. Workflow Not Triggering
- **Check**: Branch name matches workflow triggers
- **Verify**: GitHub Actions is enabled
- **Ensure**: Code is pushed to correct branch

#### 2. Docker Issues
- **Check**: Docker service logs
- **Verify**: Port conflicts (8080, 8081, 3306)
- **Ensure**: Docker has enough resources

#### 3. Test Failures
- **Download**: Screenshots and videos
- **Check**: Test logs for specific errors
- **Verify**: Environment configuration

### Debug Commands

```bash
# Check workflow syntax locally
yamllint .github/workflows/ci-workflow.yml

# Test workflow locally (requires act)
act -j setup-wordpress

# Check Docker status
docker-compose -f docker-compose.fresh-wordpress.yml ps
```

---

## 🎯 Production Deployment

### Branch Strategy

```
feature/branch → qa → main
```

1. **Development**: Work on feature branches
2. **Testing**: Merge to `qa` branch
3. **Production**: Merge `qa` to `main`

### Release Process

1. **Merge to main**: Triggers full pipeline
2. **Tests pass**: All E2E tests must pass
3. **Build created**: Plugin packages generated
4. **Release created**: GitHub release with artifacts
5. **Deployment**: Manual or automated deployment

### Release Artifacts

Each release includes:
- ✅ Plugin ZIP file (Free version)
- ✅ Plugin ZIP file (Pro version, if license available)
- ✅ Test results
- ✅ Build information

---

## 🔐 Security Best Practices

### Repository Security

1. **Branch Protection**: Require PR reviews
2. **Status Checks**: Require CI to pass
3. **Code Review**: Mandatory reviews for main branch
4. **Secrets Management**: Use repository secrets for sensitive data

### CI/CD Security

1. **Token Permissions**: Minimal required permissions
2. **Secret Rotation**: Regular secret updates
3. **Dependency Scanning**: Regular security audits
4. **Access Control**: Limit who can trigger workflows

---

## 📈 Performance Optimization

### Workflow Optimization

1. **Caching**: npm and Docker layer caching
2. **Parallel Jobs**: Independent jobs run in parallel
3. **Resource Limits**: Appropriate timeouts and resource limits
4. **Cleanup**: Proper resource cleanup after jobs

### Monitoring Metrics

- **Execution Time**: Target < 30 minutes
- **Success Rate**: Target > 95%
- **Resource Usage**: Monitor Docker and GitHub Actions usage
- **Cost**: Monitor GitHub Actions minutes usage

---

## 🆘 Troubleshooting Guide

### Common Error Messages

#### "Workflow not found"
- **Solution**: Check workflow file path and syntax
- **Verify**: `.github/workflows/ci-workflow.yml` exists

#### "Docker service failed to start"
- **Solution**: Check Docker configuration
- **Verify**: Port availability and resource limits

#### "Tests failed"
- **Solution**: Check test logs and artifacts
- **Verify**: Environment configuration and dependencies

#### "Build failed"
- **Solution**: Check build script and dependencies
- **Verify**: Node.js version and npm packages

### Getting Help

1. **Check Logs**: Detailed logs in GitHub Actions
2. **Download Artifacts**: Screenshots and test results
3. **Create Issue**: Use GitHub Issues for bugs
4. **Community**: Check GitHub Discussions

---

## 📞 Support Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Documentation](https://docs.docker.com/)

### Tools
- [GitHub Actions Visualizer](https://github.com/actions/visualizer)
- [act](https://github.com/nektos/act) - Run GitHub Actions locally
- [yamllint](https://yamllint.readthedocs.io/) - YAML linting

### Community
- [GitHub Community](https://github.community/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/github-actions)

---

## 🎉 Success Criteria

Your GitHub Actions setup is complete when:

- ✅ **Workflow triggers** on push/PR to main/dev/qa
- ✅ **All jobs pass** consistently
- ✅ **Tests run** across all browsers
- ✅ **Releases created** on main branch
- ✅ **Artifacts uploaded** correctly
- ✅ **Team can** monitor and debug issues
- ✅ **Documentation** is complete and accessible

---

**🚀 Your CI/CD pipeline is now ready for production use!**
