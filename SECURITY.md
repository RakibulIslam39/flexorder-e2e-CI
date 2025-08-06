# 🔒 Security Guide

## **CRITICAL: Protect Your Credentials**

This automation framework contains sensitive credentials and API keys. Follow this security guide to keep your data safe.

## 🚨 **Immediate Actions Required**

### 1. **Check Git History**
```bash
# Check if .env file was ever committed
git log --all --full-history -- tests/utilities/.env

# Check for any committed credentials
git log -p | grep -i "ck_"
git log -p | grep -i "cs_"
```

### 2. **If Credentials Were Committed**
1. **Immediately rotate all credentials**:
   - WooCommerce API keys
   - Google service account keys
   - WordPress admin passwords
   - Google account passwords

2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch tests/utilities/.env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

## 🔐 **Security Best Practices**

### **Environment Variables**
- ✅ `.env` file is in `.gitignore`
- ✅ Use `env.example` as template
- ✅ Never commit real credentials
- ✅ Use different credentials per environment

### **Credential Management**
- 🔄 **Rotate credentials regularly** (every 90 days)
- 🔐 **Use strong, unique passwords**
- 📝 **Document credential sources**
- 🚫 **Never share credentials in chat/email**

### **Access Control**
- 👥 **Limit access to credentials**
- 📊 **Monitor API usage**
- 🔍 **Regular security audits**
- 🚨 **Set up alerts for unusual activity**

## 📋 **Credential Inventory**

### **WooCommerce API**
- Consumer Key: `ck_*`
- Consumer Secret: `cs_*`
- **Risk Level**: HIGH
- **Rotation**: Every 90 days

### **Google Sheets API**
- Service Account Key: `upload_key.json`
- **Risk Level**: HIGH
- **Rotation**: Every 90 days

### **WordPress Admin**
- Username/Email
- Password
- **Risk Level**: HIGH
- **Rotation**: Every 60 days

### **Google Account**
- Email/Username
- Password
- **Risk Level**: HIGH
- **Rotation**: Every 60 days

## 🛡️ **Production Security**

### **Environment Variables**
```bash
# Set credentials as environment variables
export WOOCOMMERCE_CONSUMER_KEY="your_key"
export WOOCOMMERCE_CONSUMER_SECRET="your_secret"
export GOOGLE_ACCOUNT_EMAIL="your_email"
export GOOGLE_ACCOUNT_PASSWORD="your_password"
```

### **CI/CD Security**
- Use encrypted environment variables
- Never log credentials
- Use secrets management services
- Implement least privilege access

## 🔍 **Monitoring & Alerts**

### **What to Monitor**
- API call frequency
- Failed authentication attempts
- Unusual order patterns
- Access from unknown IPs

### **Alert Setup**
- Set up notifications for:
  - Multiple failed logins
  - Unusual API usage
  - Credential changes
  - Security events

## 📞 **Emergency Contacts**

### **If Credentials Are Compromised**
1. **Immediate Actions**:
   - Disable affected accounts
   - Rotate all credentials
   - Review access logs
   - Notify team members

2. **Recovery Steps**:
   - Generate new API keys
   - Update all configurations
   - Test all integrations
   - Document incident

## ✅ **Security Checklist**

- [ ] `.env` file is in `.gitignore`
- [ ] No real credentials in code
- [ ] Credentials rotated recently
- [ ] Access logs monitored
- [ ] Team trained on security
- [ ] Emergency procedures documented
- [ ] Regular security audits scheduled

## 📚 **Additional Resources**

- [WooCommerce API Security](https://woocommerce.com/document/woocommerce-rest-api/)
- [Google API Security](https://developers.google.com/identity/protocols/oauth2)
- [WordPress Security](https://wordpress.org/support/article/hardening-wordpress/)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember**: Security is everyone's responsibility. When in doubt, err on the side of caution! 