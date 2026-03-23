# Integration Environment Setup Guide

## Overview

This document provides complete environment variable configuration and setup instructions for all BuilderLync integrations.

---

## Table of Contents

1. [Core Environment Variables](#core-environment-variables)
2. [Third-Party Service Configuration](#third-party-service-configuration)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [Security Best Practices](#security-best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Core Environment Variables

### Required Variables

These variables are required for BuilderLync to function:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration (REQUIRED)
VITE_APP_URL=https://your-domain.com
VITE_API_BASE_URL=https://builderlyncapi.testenvapp.com/api

# Node Environment
NODE_ENV=production
```

### Optional Core Variables

```bash
# Google Services
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
```

---

## Third-Party Service Configuration

### Twilio (SMS/Voice)

**Required for**: SMS messaging, voice calls, phone number management

```bash
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef
TWILIO_API_KEY=SK1234567890abcdef1234567890abcdef
TWILIO_API_SECRET=1234567890abcdef1234567890abcdef

# Twilio Phone Numbers
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_MESSAGING_SERVICE_SID=MG1234567890abcdef1234567890abcdef

# Twilio TwiML App (for voice)
TWILIO_TWIML_APP_SID=AP1234567890abcdef1234567890abcdef

# Webhook URLs
TWILIO_SMS_WEBHOOK_URL=${VITE_SUPABASE_URL}/functions/v1/twilio-incoming-sms
TWILIO_VOICE_WEBHOOK_URL=${VITE_SUPABASE_URL}/functions/v1/twilio-incoming-call
TWILIO_STATUS_WEBHOOK_URL=${VITE_SUPABASE_URL}/functions/v1/twilio-call-status
```

**Setup Instructions**:

1. Create Twilio account at https://www.twilio.com/console
2. Navigate to Account Dashboard
3. Copy Account SID and Auth Token
4. Generate API Key/Secret in Settings → API Keys
5. Purchase phone number in Phone Numbers → Buy a Number
6. Configure webhooks in Phone Numbers → Active Numbers → [Your Number] → Configure

**Testing**:

```bash
# Test SMS sending
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json \
  --data-urlencode "To=+15551234567" \
  --data-urlencode "From=$TWILIO_PHONE_NUMBER" \
  --data-urlencode "Body=Test message" \
  -u $TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN
```

---

### QuickBooks Online

**Required for**: Accounting sync, invoice management, customer sync

```bash
# QuickBooks OAuth Credentials
QUICKBOOKS_CLIENT_ID=AB1234567890abcdef1234567890abcdef
QUICKBOOKS_CLIENT_SECRET=1234567890abcdef1234567890abcdef
QUICKBOOKS_REDIRECT_URI=${VITE_APP_URL}/oauth/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=production  # or 'sandbox'

# QuickBooks API
QUICKBOOKS_API_BASE_URL=https://quickbooks.api.intuit.com/v3
QUICKBOOKS_DISCOVERY_URL=https://developer.api.intuit.com/.well-known/openid_configuration
```

**Setup Instructions**:

1. Create Intuit Developer account at https://developer.intuit.com
2. Create new app in My Apps
3. Select QuickBooks Online API
4. Add redirect URI: `${VITE_APP_URL}/oauth/quickbooks/callback`
5. Set scopes: `com.intuit.quickbooks.accounting`
6. Get Client ID and Client Secret from Keys & OAuth

**Testing**:

```bash
# Test OAuth flow (browser)
https://appcenter.intuit.com/connect/oauth2?client_id=${QUICKBOOKS_CLIENT_ID}&scope=com.intuit.quickbooks.accounting&redirect_uri=${QUICKBOOKS_REDIRECT_URI}&response_type=code&state=security_token
```

---

### EagleView (Aerial Measurements)

**Required for**: Property measurements, roof reports

```bash
# EagleView API Credentials
EAGLEVIEW_API_KEY=ev_live_1234567890abcdef
EAGLEVIEW_API_SECRET=1234567890abcdef1234567890abcdef
EAGLEVIEW_USERNAME=your-eagleview-username
EAGLEVIEW_PASSWORD=your-eagleview-password

# EagleView API Endpoints
EAGLEVIEW_API_BASE_URL=https://eagleview-backend-7pe3.onrender.com/api
EAGLEVIEW_ENVIRONMENT=production  # or 'sandbox'

# Product Configuration
EAGLEVIEW_DEFAULT_PRODUCT_ID=1  # Premium Report
EAGLEVIEW_DEFAULT_DELIVERY_PRODUCT_ID=1
```

**Setup Instructions**:

1. Contact EagleView sales to create account
2. Request API access
3. Receive API credentials via secure channel
4. Configure callback URL for report notifications

**Testing**:

```bash
# Test API connection
curl -X GET ${EAGLEVIEW_API_BASE_URL}/products \
  -H "Authorization: Bearer $EAGLEVIEW_API_KEY"
```

---

### ABC Supply

**Required for**: Material ordering, inventory checking, branch management

```bash
# ABC Supply API Credentials
ABC_SUPPLY_API_KEY=abc_prod_1234567890abcdef
ABC_SUPPLY_API_SECRET=1234567890abcdef1234567890abcdef
ABC_SUPPLY_ACCOUNT_NUMBER=1234567890

# ABC Supply API
ABC_SUPPLY_API_BASE_URL=https://api.abcsupply.com/v1
ABC_SUPPLY_ENVIRONMENT=production  # or 'sandbox'

# Branch Configuration
ABC_SUPPLY_DEFAULT_BRANCH_CODE=12345
ABC_SUPPLY_DELIVERY_CUTOFF_TIME=15:00
```

**Setup Instructions**:

1. Contact ABC Supply B2B team
2. Request API integration access
3. Provide callback URLs for webhooks
4. Complete account verification
5. Receive API credentials

**Testing**:

```bash
# Test branch lookup
curl -X GET ${ABC_SUPPLY_API_BASE_URL}/branches \
  -H "Authorization: Bearer $ABC_SUPPLY_API_KEY" \
  -H "X-Account-Number: $ABC_SUPPLY_ACCOUNT_NUMBER"
```

---

### Google Services

#### Google Maps API

**Required for**: Address autocomplete, geocoding, distance calculation

```bash
# Google Maps Platform
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA1234567890abcdefghijklmnopqrstuv
GOOGLE_MAPS_LIBRARIES=places,geometry,geocoding

# Restrictions (Optional)
GOOGLE_MAPS_RESTRICTION_IP=xxx.xxx.xxx.xxx
GOOGLE_MAPS_RESTRICTION_DOMAIN=yourdomain.com
```

**Setup Instructions**:

1. Create project in Google Cloud Console
2. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Distance Matrix API
3. Create API credentials
4. Set application restrictions
5. Add allowed domains/IPs

#### Google Business Profile API

**Required for**: Review management, business listing updates

```bash
# Google Business OAuth
GOOGLE_BUSINESS_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_BUSINESS_CLIENT_SECRET=GOCSPX-1234567890abcdefghij
GOOGLE_BUSINESS_REDIRECT_URI=${VITE_APP_URL}/oauth/google-business/callback

# Google Business API
GOOGLE_BUSINESS_API_BASE_URL=https://mybusiness.googleapis.com/v4
GOOGLE_BUSINESS_SCOPES=https://www.googleapis.com/auth/business.manage
```

**Setup Instructions**:

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Enable Google My Business API
3. Configure OAuth consent screen
4. Add authorized redirect URIs
5. Set scopes for Business Profile access

---

### Social Media Platforms

#### Meta (Facebook & Instagram)

**Required for**: Social posting, ad management, message handling

```bash
# Meta App Configuration
META_APP_ID=1234567890123456
META_APP_SECRET=1234567890abcdef1234567890abcdef
META_REDIRECT_URI=${VITE_APP_URL}/oauth/meta/callback

# Meta API
META_API_VERSION=v18.0
META_API_BASE_URL=https://graph.facebook.com/${META_API_VERSION}

# Permissions
META_PERMISSIONS=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish
```

**Setup Instructions**:

1. Create Meta Developer account
2. Create new app in App Dashboard
3. Add Facebook Login product
4. Add Instagram Basic Display
5. Configure OAuth redirect URIs
6. Submit for app review (if needed)

#### LinkedIn

**Required for**: B2B posting, lead generation

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=1234567890
LINKEDIN_CLIENT_SECRET=1234567890abcdef
LINKEDIN_REDIRECT_URI=${VITE_APP_URL}/oauth/linkedin/callback

# LinkedIn API
LINKEDIN_API_BASE_URL=https://api.linkedin.com/v2
LINKEDIN_SCOPES=r_liteprofile,w_member_social,r_organization_social
```

#### TikTok

**Required for**: Video content posting, ad campaigns

```bash
# TikTok OAuth
TIKTOK_CLIENT_KEY=aw1234567890abcdef
TIKTOK_CLIENT_SECRET=1234567890abcdef1234567890abcdef
TIKTOK_REDIRECT_URI=${VITE_APP_URL}/oauth/tiktok/callback

# TikTok API
TIKTOK_API_BASE_URL=https://open-api.tiktok.com
TIKTOK_SCOPES=user.info.basic,video.upload,video.publish
```

---

### Email Service Providers

#### SMTP Configuration

**Required for**: Transactional emails, notifications

```bash
# Primary SMTP Server
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASSWORD=SG.1234567890abcdef
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=BuilderLync

# Backup SMTP Server (Optional)
SMTP_BACKUP_HOST=smtp.mailgun.org
SMTP_BACKUP_PORT=587
SMTP_BACKUP_USER=postmaster@yourdomain.com
SMTP_BACKUP_PASSWORD=1234567890abcdef
```

**Provider-Specific Setup**:

**SendGrid**:
```bash
SENDGRID_API_KEY=SG.1234567890abcdef
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_TEMPLATE_ID=d-1234567890abcdef  # Optional
```

**Mailgun**:
```bash
MAILGUN_API_KEY=key-1234567890abcdef
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_HOST=api.mailgun.net  # or api.eu.mailgun.net
```

**Amazon SES**:
```bash
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=1234567890abcdef1234567890abcdef
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@yourdomain.com
```

---

### Stripe (Payments)

**Required for**: Payment processing, subscriptions

```bash
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_live_1234567890abcdef
STRIPE_SECRET_KEY=sk_live_1234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# Stripe API
STRIPE_API_VERSION=2023-10-16
STRIPE_WEBHOOK_URL=${VITE_APP_URL}/api/webhooks/stripe
```

**Setup Instructions**:

1. Create Stripe account
2. Get API keys from Dashboard → Developers → API keys
3. Create webhook endpoint
4. Configure webhook events:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted

---

## Development Setup

### Local Development Environment

**1. Clone Repository**:

```bash
git clone https://github.com/your-org/builderlync.git
cd builderlync
```

**2. Install Dependencies**:

```bash
npm install
```

**3. Create Environment File**:

```bash
cp .env.example .env
```

**4. Configure Core Variables**:

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3000/api  # For local API
```

**5. Start Development Server**:

```bash
npm run dev
```

**6. Start Supabase Locally** (Optional):

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

### Testing Integrations Locally

Use ngrok to expose local webhooks:

```bash
# Install ngrok
npm install -g ngrok

# Expose local port
ngrok http 3000

# Update webhook URLs with ngrok URL
TWILIO_SMS_WEBHOOK_URL=https://abc123.ngrok.io/webhooks/twilio-sms
```

---

## Production Deployment

### Environment Variable Management

**Never commit secrets to git!**

Use environment variable management services:

- **Vercel**: Environment Variables in Project Settings
- **Netlify**: Build Environment Variables
- **AWS**: Systems Manager Parameter Store
- **Google Cloud**: Secret Manager
- **Azure**: Key Vault

### Deployment Checklist

- [ ] All required environment variables set
- [ ] API keys are production keys (not test/sandbox)
- [ ] Webhook URLs point to production domain
- [ ] SSL certificates are valid
- [ ] Rate limits are configured appropriately
- [ ] Error tracking is enabled (Sentry, etc.)
- [ ] Logging is configured
- [ ] Database migrations are applied
- [ ] RLS policies are enabled
- [ ] Backup strategy is in place

### Supabase Edge Functions Deployment

```bash
# Set secrets for edge functions
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
supabase secrets set QUICKBOOKS_CLIENT_ID=...
supabase secrets set QUICKBOOKS_CLIENT_SECRET=...

# Deploy functions
supabase functions deploy

# Verify deployment
supabase functions list
```

### Database Configuration

```bash
# Run migrations
supabase db push

# Enable RLS
supabase db rls enable

# Verify policies
supabase db rls list
```

---

## Security Best Practices

### Secrets Management

**DO:**
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/staging/production
- ✅ Encrypt sensitive data at rest
- ✅ Use secrets management services
- ✅ Implement least privilege access
- ✅ Monitor for leaked credentials

**DON'T:**
- ❌ Commit secrets to version control
- ❌ Log sensitive information
- ❌ Share production credentials
- ❌ Use production keys in development
- ❌ Store secrets in client-side code
- ❌ Use default/example credentials

### API Key Security

```javascript
// Good: Server-side only
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Bad: Exposed in client
const stripe = Stripe('sk_live_...') // Never do this!

// Good: Public key in client
const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
```

### Webhook Security

Always verify webhook signatures:

```javascript
const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const expectedSignature = hmac.update(payload).digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

### Database Security

Enable Row Level Security on all tables:

```sql
-- Enable RLS
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their org data"
  ON your_table FOR ALL
  TO authenticated
  USING (organization_id = (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));
```

---

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading

**Problem**: Environment variables are undefined

**Solutions**:

1. Restart development server after changing `.env`
2. Ensure variables start with `VITE_` for client-side access
3. Check `.env` file is in project root
4. Verify no syntax errors in `.env` file

```bash
# Test variable loading
npm run dev -- --debug
```

#### OAuth Redirect Mismatch

**Problem**: OAuth flow fails with redirect URI mismatch

**Solutions**:

1. Verify redirect URI exactly matches provider settings
2. Include protocol (https://)
3. Check for trailing slashes
4. Ensure domain matches (including www. if applicable)

```bash
# Correct format
QUICKBOOKS_REDIRECT_URI=https://app.yourdomain.com/oauth/quickbooks/callback

# Common mistakes
# Missing protocol: app.yourdomain.com/oauth/quickbooks/callback
# Trailing slash: https://app.yourdomain.com/oauth/quickbooks/callback/
# Wrong subdomain: https://yourdomain.com/oauth/quickbooks/callback
```

#### Webhook Delivery Failures

**Problem**: Webhooks not received or timing out

**Solutions**:

1. Verify webhook URL is publicly accessible
2. Ensure endpoint responds within 30 seconds
3. Check SSL certificate is valid
4. Verify webhook signature validation is correct
5. Check firewall rules

```bash
# Test webhook endpoint
curl -X POST https://yourdomain.com/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### API Rate Limiting

**Problem**: 429 Too Many Requests errors

**Solutions**:

1. Implement exponential backoff
2. Cache responses when possible
3. Batch requests when supported
4. Request rate limit increase

```javascript
// Exponential backoff example
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}
```

#### Supabase Connection Issues

**Problem**: Cannot connect to Supabase

**Solutions**:

1. Verify `VITE_SUPABASE_URL` is correct
2. Check `VITE_SUPABASE_ANON_KEY` is valid
3. Ensure RLS policies allow access
4. Verify network connectivity
5. Check Supabase service status

```javascript
// Test Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase.from('contacts').select('count')
if (error) {
  console.error('Connection error:', error)
} else {
  console.log('Connection successful!')
}
```

### Debug Mode

Enable debug logging:

```bash
# .env
VITE_ENABLE_DEBUG=true
DEBUG=supabase:*
```

### Getting Help

- **Documentation**: https://docs.builderlync.com
- **Support Email**: integrations@builderlync.com
- **Discord**: https://discord.gg/builderlync
- **Status Page**: https://status.builderlync.com

---

## Environment Variables Reference Sheet

### Quick Copy Template

```bash
# Core Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
VITE_API_BASE_URL=
VITE_GOOGLE_MAPS_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# QuickBooks
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_REDIRECT_URI=

# EagleView
EAGLEVIEW_API_KEY=
EAGLEVIEW_API_SECRET=

# ABC Supply
ABC_SUPPLY_API_KEY=
ABC_SUPPLY_ACCOUNT_NUMBER=

# Meta
META_APP_ID=
META_APP_SECRET=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

# Stripe
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

**Document Version**: 1.0.0
**Last Updated**: November 29, 2025
**Maintained By**: BuilderLync Integration Team
