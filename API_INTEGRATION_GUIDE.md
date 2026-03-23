# BuilderLync API and Third-Party Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Authentication & Security](#authentication--security)
4. [Core API Reference](#core-api-reference)
5. [Third-Party Integrations](#third-party-integrations)
6. [Webhook Configuration](#webhook-configuration)
7. [Database Schema](#database-schema)
8. [Edge Functions](#edge-functions)
9. [Testing & Sandbox](#testing--sandbox)
10. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
11. [Code Examples](#code-examples)

---

## Overview

BuilderLync is a comprehensive construction management platform that provides robust APIs and supports multiple third-party integrations. This guide is designed for:

- **External Integration Partners**: Companies integrating their services with BuilderLync
- **Internal Development Teams**: Backend engineers implementing integrations
- **Third-Party Developers**: Building applications on top of BuilderLync

### Integration Categories

| Category | Integrations | Status |
|----------|-------------|--------|
| **Accounting** | QuickBooks Online | Active |
| **Communication** | Twilio (SMS/Voice) | Active |
| **Supply Chain** | ABC Supply, SRS Distribution, QXO | Active / Beta |
| **Imaging** | EagleView | Active |
| **Marketing** | Meta (Facebook/Instagram), Google Business, LinkedIn, TikTok | Active / Beta |
| **Productivity** | Google Drive, Notion | Planned |
| **Email** | SMTP Providers | Active |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     BuilderLync Platform                     │
├─────────────────────────────────────────────────────────────┤
│  React Frontend  →  Supabase  →  Edge Functions  →  APIs   │
│                         ↓                                     │
│                  PostgreSQL Database                         │
│                         ↓                                     │
│              Row Level Security (RLS)                        │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              Third-Party Integration Layer                   │
├─────────────────────────────────────────────────────────────┤
│  • OAuth 2.0 Providers (QuickBooks, Google, Meta)          │
│  • REST API Services (Twilio, EagleView, ABC Supply)       │
│  • Webhook Receivers (Incoming events)                      │
│  • Webhook Dispatchers (Outgoing events)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Base URLs

- **Production API**: `https://builderlyncapi.testenvapp.com/api`
- **Supabase API**: `${VITE_SUPABASE_URL}/rest/v1/`
- **Edge Functions**: `${VITE_SUPABASE_URL}/functions/v1/`

### Prerequisites

1. **Supabase Account**: Required for data access
2. **Organization ID**: Obtained during onboarding
3. **API Keys**: Generated from Settings → Integrations
4. **OAuth Credentials**: For services requiring OAuth

### Quick Start

```bash
# 1. Install dependencies
npm install @supabase/supabase-js

# 2. Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

# 3. Make your first API call
const { data, error } = await supabase
  .from('contacts')
  .select('*')
  .limit(10)
```

---

## Authentication & Security

### Authentication Methods

BuilderLync supports multiple authentication methods depending on the integration type:

#### 1. Supabase JWT Authentication (Primary)

Used for all direct database access and edge function calls.

```javascript
// Client-side authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Include token in requests
const token = data.session.access_token
```

#### 2. API Key Authentication

Used for server-to-server integrations.

```bash
curl -X GET "https://builderlyncapi.testenvapp.com/api/contacts" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Generating API Keys:**

1. Navigate to Settings → Integrations → API Keys
2. Click "Create New API Key"
3. Set permissions and expiration
4. Store securely (not reversible)

#### 3. OAuth 2.0 (Third-Party Integrations)

Used for QuickBooks, Google, Meta, and other OAuth providers.

**OAuth Flow:**

```
1. User initiates connection → Frontend
2. Redirect to provider → OAuth authorization page
3. User approves → Provider redirects with code
4. Exchange code for tokens → Backend
5. Store encrypted tokens → Database
6. Use tokens for API calls → Integration layer
```

### Security Best Practices

#### Token Storage

All tokens are encrypted before storage in the database:

```sql
-- Integration connections table stores encrypted tokens
CREATE TABLE integration_connections (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  integration_name text NOT NULL,
  access_token text,  -- Encrypted
  refresh_token text, -- Encrypted
  token_expires_at timestamptz,
  ...
);
```

#### Row Level Security (RLS)

All database tables enforce organization-level isolation:

```sql
-- Example RLS policy
CREATE POLICY "Users can only access their organization data"
  ON integration_connections FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

#### Webhook Signature Verification

All incoming webhooks must include a signature for verification:

```javascript
// Verify webhook signature
import crypto from 'crypto'

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
```

### Rate Limiting

| Endpoint Type | Rate Limit | Burst |
|--------------|------------|-------|
| Authentication | 10/minute | 20 |
| Read Operations | 100/minute | 200 |
| Write Operations | 50/minute | 100 |
| Webhook Delivery | 1000/hour | - |
| Edge Functions | 500/minute | 1000 |

---

## Core API Reference

### Base Resources

BuilderLync provides RESTful APIs for the following core resources:

#### Contacts

```javascript
// List contacts
GET /api/contacts
Query: ?page=1&limit=50&status=active&search=john

// Get single contact
GET /api/contacts/:id

// Create contact
POST /api/contacts
Body: {
  first_name: string,
  last_name: string,
  email: string,
  phone: string,
  organization_id: uuid
}

// Update contact
PATCH /api/contacts/:id

// Delete contact
DELETE /api/contacts/:id
```

#### Jobs

```javascript
// List jobs
GET /api/jobs
Query: ?status=in_progress&assigned_to=uuid

// Create job
POST /api/jobs
Body: {
  title: string,
  contact_id: uuid,
  status: string,
  job_type: string,
  start_date: datetime,
  ...
}
```

#### Opportunities

```javascript
// List opportunities
GET /api/opportunities
Query: ?pipeline_id=uuid&stage_id=uuid

// Move opportunity stage
PATCH /api/opportunities/:id/stage
Body: {
  stage_id: uuid,
  reason: string
}
```

#### Appointments

```javascript
// Create appointment
POST /api/appointments
Body: {
  contact_id: uuid,
  staff_id: uuid,
  start_time: datetime,
  end_time: datetime,
  title: string,
  description: string
}
```

### Supabase Direct Access

For direct database access using Supabase client:

```javascript
// Query with filters
const { data, error } = await supabase
  .from('contacts')
  .select('id, first_name, last_name, email, phone')
  .eq('organization_id', organizationId)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 49)

// Insert record
const { data, error } = await supabase
  .from('contacts')
  .insert({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    organization_id: orgId
  })
  .select()
  .single()

// Update record
const { data, error } = await supabase
  .from('contacts')
  .update({ status: 'inactive' })
  .eq('id', contactId)

// Delete record
const { error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', contactId)
```

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... } or [ ... ],
  "message": "Operation successful",
  "metadata": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "timestamp": "2025-11-29T12:00:00Z"
  }
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `INTEGRATION_ERROR` | Third-party service error | 502 |

---

## Third-Party Integrations

### QuickBooks Online Integration

**Purpose**: Sync accounting data, invoices, payments, and customer information.

**Authentication**: OAuth 2.0

**Setup Steps:**

1. **Register Application** with Intuit Developer Portal
2. **Configure OAuth Settings**:
   - Redirect URI: `${APP_URL}/oauth/quickbooks/callback`
   - Scopes: `com.intuit.quickbooks.accounting`
3. **Store Credentials** in environment variables
4. **Implement OAuth Flow**

**Implementation:**

```javascript
// Initiate connection
import { connectQuickBooks } from './services/quickbooksApi'

async function handleConnect() {
  const response = await connectQuickBooks()
  if (response.success) {
    window.location.href = response.data.authUrl
  }
}

// Handle callback
async function handleCallback(code, state, realmId) {
  await processQuickBooksCallback(code, state, realmId)
}

// Get connection status
const status = await getQuickBooksStatus()
console.log(status.connected, status.companyInfo)
```

**Available Operations:**

- Sync customers ↔ contacts
- Create invoices
- Record payments
- Sync chart of accounts
- Generate financial reports

**API Endpoints:**

```
POST /api/quickbooks/connect       - Initiate OAuth
POST /api/quickbooks/disconnect    - Remove connection
GET  /api/quickbooks/status        - Check connection
POST /api/quickbooks/sync-customers - Sync customer data
POST /api/quickbooks/create-invoice - Create QB invoice
```

---

### Twilio Integration (SMS/Voice)

**Purpose**: Send SMS, make calls, receive calls, and manage phone numbers.

**Authentication**: Account SID + Auth Token

**Setup Steps:**

1. **Create Twilio Account**
2. **Purchase Phone Numbers**
3. **Configure Webhooks** for incoming messages/calls
4. **Store Credentials** in Supabase

**Database Schema:**

```sql
CREATE TABLE twilio_phone_numbers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  phone_number text NOT NULL,
  friendly_name text,
  capabilities jsonb,
  is_default boolean DEFAULT false
);

CREATE TABLE call_logs (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  call_sid text NOT NULL,
  direction text, -- 'inbound' | 'outbound'
  from_number text,
  to_number text,
  status text,
  duration integer,
  recording_url text,
  contact_id uuid REFERENCES contacts(id)
);
```

**Edge Functions:**

```typescript
// Send SMS
POST /functions/v1/send-sms
Body: {
  to: "+1234567890",
  from: "+1987654321",
  body: "Your message here",
  mediaUrls: ["https://..."] // Optional
}

// Generate access token for voice calls
POST /functions/v1/generate-twilio-token
Body: {
  identity: "user@example.com"
}

// Incoming SMS webhook
POST /functions/v1/twilio-incoming-sms
// Receives Twilio webhook payload

// Incoming call webhook
POST /functions/v1/twilio-incoming-call
// Returns TwiML instructions

// Call status webhook
POST /functions/v1/twilio-call-status
// Receives call status updates
```

**Client Implementation:**

```javascript
import { twilioService } from './services/twilioService'

// Send SMS
await twilioService.sendSMS({
  to: '+1234567890',
  from: '+1987654321',
  body: 'Hello from BuilderLync!'
})

// Get phone numbers
const numbers = await twilioService.getTwilioPhoneNumbers()

// Log call
await twilioService.logCall({
  call_sid: 'CA123...',
  direction: 'inbound',
  from_number: '+1234567890',
  to_number: '+1987654321',
  status: 'completed',
  duration: 120,
  contact_id: 'uuid'
})
```

---

### EagleView Integration

**Purpose**: Order aerial property measurements and reports.

**Authentication**: API Key

**Backend Service**: `https://eagleview-backend-7pe3.onrender.com/api`

**Setup Steps:**

1. **Obtain EagleView API Credentials**
2. **Configure Backend Proxy** (already implemented)
3. **Test with Sandbox Environment**

**Implementation:**

```javascript
import { eagleViewService } from './services/eagleViewService'

// Create order
const orderData = eagleViewService.createOrderData({
  address: '123 Main St, City, ST 12345',
  buildingId: 'building-123',
  productId: 1, // Product type
  claimInfo: {
    claimNumber: 'CLM-001',
    dateOfLoss: '2025-01-15'
  },
  paymentInfo: {
    firstName: 'John',
    lastName: 'Doe',
    cardNumber: '4111111111111111',
    expiryMonth: '12',
    expiryYear: '2026',
    cvv: '123'
  }
})

const result = await eagleViewService.submitOrder(orderData)

// Check order status
const report = await eagleViewService.getOrderStatus(orderId)

// Download report
const pdfBlob = await eagleViewService.downloadReport(reportId, 'pdf')
```

**Product Types:**

| ID | Product | Turnaround |
|----|---------|------------|
| 1 | Premium Report | 24-48 hours |
| 2 | QuickSquares | 24 hours |
| 3 | Comprehensive Report | 48-72 hours |

---

### ABC Supply Integration

**Purpose**: Order construction materials, check inventory, and track deliveries.

**Authentication**: Account credentials + API key

**Database Schema:**

```sql
CREATE TABLE suppliers (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  supplier_type text, -- 'abc_supply', 'srs', etc.
  name text NOT NULL,
  account_number text,
  is_integration_enabled boolean,
  api_credentials jsonb -- Encrypted
);

CREATE TABLE abc_supply_branches (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  branch_code text,
  branch_name text NOT NULL,
  address text,
  phone text,
  latitude numeric,
  longitude numeric,
  is_preferred boolean
);

CREATE TABLE abc_supply_products_cache (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  abc_product_id text NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  category text,
  unit_price numeric,
  availability text,
  last_synced_at timestamptz
);
```

**Features:**

- Branch locator with distance calculation
- Product catalog search
- Real-time inventory check
- Order placement and tracking
- Delivery scheduling
- Account balance management

**Implementation Notes:**

ABC Supply integration requires:
1. Account number from ABC Supply
2. API credentials (contact ABC Supply developer team)
3. Preferred branch configuration
4. Delivery address verification

---

### Google Services Integration

#### Google Places API

**Purpose**: Address autocomplete, geocoding, and location services.

**Setup:**

```javascript
// Enable Google Places API in component
import GooglePlacesAutocomplete from './components/GooglePlacesAutocomplete'

<GooglePlacesAutocomplete
  onAddressSelect={(address) => {
    console.log(address) // Structured address data
  }}
  placeholder="Enter property address"
/>
```

**API Key**: Set `VITE_GOOGLE_MAPS_API_KEY` in environment variables

#### Google Business Profile

**Purpose**: Manage business listings, reviews, and analytics.

**Authentication**: OAuth 2.0

**Features:**

- View and respond to reviews
- Update business information
- Post updates
- View insights and analytics
- Manage locations

#### Google Drive

**Purpose**: Store and sync files to Google Drive.

**Status**: Planned

---

### Social Media Integrations

#### Meta (Facebook & Instagram)

**Purpose**: Post content, manage ads, respond to messages, sync leads.

**Authentication**: OAuth 2.0

**Database Schema:**

```sql
CREATE TABLE social_media_accounts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  platform text, -- 'facebook', 'instagram', etc.
  account_name text NOT NULL,
  account_id text,
  access_token text,
  refresh_token text,
  is_connected boolean
);

CREATE TABLE social_posts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  content text NOT NULL,
  media_urls jsonb,
  platforms jsonb, -- Array of platforms
  status text, -- 'draft', 'scheduled', 'posted'
  scheduled_at timestamptz,
  posted_at timestamptz
);
```

**API Implementation:**

```javascript
import { socialMediaApi } from './services/socialMediaApi'

// Connect account
await socialMediaApi.connectAccount({
  platform: 'facebook',
  account_name: 'My Business Page',
  account_id: 'fb-page-id',
  access_token: 'token',
  is_connected: true
})

// Create and schedule post
await socialMediaApi.schedulePost({
  content: 'Check out our latest project!',
  platforms: ['facebook', 'instagram'],
  media_urls: ['https://...'],
  tags: ['roofing', 'construction']
}, '2025-12-01T10:00:00Z')

// Get analytics
const analytics = await socialMediaApi.getAnalytics(postId)
```

#### LinkedIn

**Purpose**: B2B marketing, professional networking, lead generation.

**Status**: Beta

#### TikTok

**Purpose**: Short-form video content, lead generation ads.

**Status**: Planned

---

### Email Service Integration

**Purpose**: Send transactional emails, marketing campaigns, and notifications.

**Supported Providers:**

- SMTP (Any provider)
- SendGrid
- Mailgun
- Amazon SES
- Custom SMTP servers

**Database Schema:**

```sql
CREATE TABLE email_service_configs (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  config_name text NOT NULL,
  provider text NOT NULL,
  smtp_host text,
  smtp_port integer,
  smtp_username text,
  smtp_password text,
  from_email text NOT NULL,
  is_default boolean
);

CREATE TABLE email_sending_domains (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  domain text NOT NULL,
  verification_status text, -- 'pending', 'verified', 'failed'
  dkim_verified boolean,
  spf_verified boolean,
  dmarc_verified boolean
);
```

**Edge Function:**

```typescript
// Send email
POST /functions/v1/send-email
Body: {
  to: "recipient@example.com",
  from: "sender@yourdomain.com",
  subject: "Email subject",
  html: "<html>Email content</html>",
  text: "Plain text version",
  attachments: [...]
}
```

---

## Webhook Configuration

### Overview

BuilderLync supports both incoming and outgoing webhooks for real-time event notifications.

### Incoming Webhooks (From Third-Parties)

**Supported Events:**

| Service | Events |
|---------|--------|
| Twilio | SMS received, Call status, Message status |
| QuickBooks | Customer created, Invoice paid, Payment received |
| Stripe | Payment succeeded, Subscription updated |
| Meta | Lead created, Message received |

**Webhook Endpoints:**

```
POST /functions/v1/twilio-incoming-sms
POST /functions/v1/twilio-incoming-call
POST /functions/v1/twilio-call-status
POST /api/webhooks/quickbooks
POST /api/webhooks/stripe
POST /api/webhooks/meta
```

### Outgoing Webhooks (To Your Systems)

**Database Schema:**

```sql
CREATE TABLE integration_webhooks (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL,
  integration_name text NOT NULL,
  webhook_url text NOT NULL,
  events text[] NOT NULL,
  secret_key text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  failure_count integer DEFAULT 0
);
```

**Configuring Webhooks:**

```javascript
// Register webhook
POST /api/webhooks/register
Body: {
  integration_name: "my-integration",
  webhook_url: "https://your-domain.com/webhooks/builderlync",
  events: [
    "contact.created",
    "contact.updated",
    "job.status_changed",
    "opportunity.stage_changed",
    "appointment.created"
  ],
  secret_key: "your-secret-key"
}

// List webhooks
GET /api/webhooks

// Update webhook
PATCH /api/webhooks/:id

// Delete webhook
DELETE /api/webhooks/:id
```

**Available Events:**

```
# Contacts
- contact.created
- contact.updated
- contact.deleted

# Jobs
- job.created
- job.updated
- job.status_changed
- job.completed

# Opportunities
- opportunity.created
- opportunity.updated
- opportunity.stage_changed
- opportunity.won
- opportunity.lost

# Appointments
- appointment.created
- appointment.updated
- appointment.cancelled
- appointment.completed

# Payments
- payment.received
- payment.failed
- invoice.created
- invoice.paid
```

**Webhook Payload Format:**

```json
{
  "event": "contact.created",
  "timestamp": "2025-11-29T12:00:00Z",
  "organization_id": "uuid",
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "created_at": "2025-11-29T12:00:00Z"
  },
  "metadata": {
    "delivery_attempt": 1,
    "webhook_id": "uuid"
  }
}
```

**Signature Verification:**

All webhook payloads include an `X-BuilderLync-Signature` header:

```javascript
const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  )
}

// Express middleware example
app.post('/webhooks/builderlync', (req, res) => {
  const signature = req.headers['x-builderlync-signature']
  const isValid = verifyWebhook(req.body, signature, SECRET_KEY)

  if (!isValid) {
    return res.status(401).send('Invalid signature')
  }

  // Process webhook
  handleWebhookEvent(req.body)
  res.status(200).send('OK')
})
```

**Retry Policy:**

- Initial delivery attempt
- Retry after 1 minute
- Retry after 5 minutes
- Retry after 15 minutes
- Retry after 1 hour
- Retry after 6 hours
- Maximum 6 retries

**Failure Handling:**

After 6 failed attempts, the webhook is marked as failed and requires manual intervention. You'll receive an email notification.

---

## Database Schema

### Core Tables

#### integration_connections

Stores OAuth connections and API credentials for third-party services.

```sql
CREATE TABLE integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  integration_name text NOT NULL,
  connection_type text NOT NULL,
  status text DEFAULT 'connected',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  external_account_id text,
  external_account_name text,
  configuration jsonb DEFAULT '{}'::jsonb,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### integration_webhooks

Manages webhook subscriptions and delivery tracking.

```sql
CREATE TABLE integration_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  integration_name text NOT NULL,
  webhook_url text NOT NULL,
  events text[] NOT NULL,
  secret_key text,
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  trigger_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
```

#### integration_api_keys

Manages API keys for programmatic access.

```sql
CREATE TABLE integration_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  key_name text NOT NULL,
  api_key text NOT NULL UNIQUE,
  permissions jsonb DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  last_used_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
```

### Entity Relationship Diagram

```
organizations
    ↓
    ├── integration_connections
    │       ├── QuickBooks
    │       ├── Twilio
    │       ├── EagleView
    │       └── Social Media
    │
    ├── integration_webhooks
    │       └── Event subscriptions
    │
    ├── integration_api_keys
    │       └── API access tokens
    │
    ├── suppliers (ABC Supply, SRS, etc.)
    │       ├── abc_supply_branches
    │       ├── abc_supply_products_cache
    │       └── supplier_contacts
    │
    ├── twilio_phone_numbers
    │       └── call_logs
    │
    ├── social_media_accounts
    │       ├── social_posts
    │       └── social_post_analytics
    │
    └── email_service_configs
            └── email_sending_domains
```

### Row Level Security (RLS)

All integration tables enforce strict organization-level isolation:

```sql
-- Example: Only allow users to access their organization's integrations
CREATE POLICY "Users can only access their organization integrations"
  ON integration_connections FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Example: Only admins can manage integrations
CREATE POLICY "Admins can manage integrations"
  ON integration_connections FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

---

## Edge Functions

### Overview

Supabase Edge Functions provide serverless endpoints for integration logic, webhook processing, and external API calls.

### Available Functions

#### 1. send-sms

Send SMS messages via Twilio.

```typescript
POST /functions/v1/send-sms
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

Request:
{
  "to": "+1234567890",
  "from": "+1987654321",
  "body": "Your message here",
  "mediaUrls": ["https://example.com/image.jpg"] // Optional
}

Response:
{
  "sid": "SM...",
  "status": "sent"
}
```

#### 2. send-email

Send emails via configured SMTP provider.

```typescript
POST /functions/v1/send-email
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

Request:
{
  "to": "recipient@example.com",
  "from": "sender@yourdomain.com",
  "subject": "Email subject",
  "html": "<p>Email content</p>",
  "text": "Plain text version"
}

Response:
{
  "success": true,
  "messageId": "msg-123"
}
```

#### 3. generate-twilio-token

Generate Twilio access token for voice calls.

```typescript
POST /functions/v1/generate-twilio-token
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

Request:
{
  "identity": "user@example.com"
}

Response:
{
  "token": "eyJ..."
}
```

#### 4. twilio-incoming-sms

Webhook receiver for incoming SMS messages.

```typescript
POST /functions/v1/twilio-incoming-sms
Content-Type: application/x-www-form-urlencoded

// Twilio webhook payload (automatic)
```

#### 5. twilio-incoming-call

Webhook receiver for incoming calls, returns TwiML.

```typescript
POST /functions/v1/twilio-incoming-call
Content-Type: application/x-www-form-urlencoded

Response: TwiML XML
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling BuilderLync.</Say>
  <Dial>...</Dial>
</Response>
```

#### 6. twilio-call-status

Webhook receiver for call status updates.

```typescript
POST /functions/v1/twilio-call-status
Content-Type: application/x-www-form-urlencoded

// Twilio webhook payload (automatic)
```

#### 7. scrape-website

Web scraping service for Sierra AI knowledge base.

```typescript
POST /functions/v1/scrape-website
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

Request:
{
  "url": "https://example.com"
}

Response:
{
  "content": "Extracted text content...",
  "metadata": {
    "title": "Page title",
    "description": "Meta description"
  }
}
```

### Deployment

Edge functions are automatically deployed via Supabase CLI:

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy send-sms

# View logs
supabase functions logs send-sms
```

### Environment Variables

All edge functions have access to these pre-configured variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Additional secrets can be set:

```bash
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=...
```

---

## Testing & Sandbox

### Test Environment

- **API Base**: `https://builderlyncapi-staging.testenvapp.com/api`
- **Supabase**: Separate test project
- **Data**: Automatically reset nightly

### Test Credentials

```
Test Organization ID: test-org-123
Test API Key: test_key_abc123xyz
Test User: test@builderlync.com
Test Password: TestPassword123!
```

### Postman Collection

Download the BuilderLync API collection:

```bash
# Import collection
curl -O https://builderlync.com/api/postman-collection.json

# Or use direct link in Postman:
https://www.postman.com/builderlync-api/workspace/public
```

### Test Webhooks

Use webhook.site for testing incoming webhooks:

```javascript
// Register test webhook
{
  "webhook_url": "https://webhook.site/your-unique-id",
  "events": ["contact.created"],
  "integration_name": "test-integration"
}
```

### Sample Data

Generate test data using seed functions:

```sql
-- Seed sample contacts
SELECT seed_sample_contacts(50);

-- Seed sample jobs
SELECT seed_sample_jobs(20);

-- Seed sample opportunities
SELECT seed_sample_opportunities(30);
```

---

## Monitoring & Troubleshooting

### Integration Health Check

```javascript
GET /api/integrations/health

Response:
{
  "integrations": [
    {
      "name": "quickbooks",
      "status": "connected",
      "last_sync": "2025-11-29T11:55:00Z",
      "error_count": 0
    },
    {
      "name": "twilio",
      "status": "connected",
      "last_activity": "2025-11-29T12:00:00Z"
    }
  ]
}
```

### Error Logging

All integration errors are logged in the `integration_error_logs` table:

```sql
SELECT
  integration_name,
  error_message,
  error_details,
  occurred_at
FROM integration_error_logs
WHERE organization_id = 'your-org-id'
ORDER BY occurred_at DESC
LIMIT 50;
```

### Common Issues

#### OAuth Token Expired

**Symptom**: 401 Unauthorized errors

**Solution**: Refresh access token using refresh token

```javascript
// Automatic token refresh is handled by the system
// Manual refresh:
POST /api/integrations/refresh-token
{
  "integration_id": "uuid"
}
```

#### Webhook Delivery Failures

**Symptom**: Webhooks not received

**Checklist**:
- ✓ Webhook URL is publicly accessible
- ✓ SSL certificate is valid
- ✓ Webhook endpoint returns 200 status
- ✓ Response time < 30 seconds
- ✓ Signature verification is correct

#### Rate Limiting

**Symptom**: 429 Too Many Requests

**Solution**: Implement exponential backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 5) {
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

### Support

For integration support:

- **Email**: integrations@builderlync.com
- **Discord**: https://discord.gg/builderlync
- **Documentation**: https://docs.builderlync.com
- **Status Page**: https://status.builderlync.com

---

## Code Examples

### Complete Integration Example

Here's a complete example of integrating with BuilderLync:

```javascript
import { createClient } from '@supabase/supabase-js'

// Initialize client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Authenticate
const { data: authData } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Create contact
const { data: contact } = await supabase
  .from('contacts')
  .insert({
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    organization_id: authData.user.user_metadata.organization_id
  })
  .select()
  .single()

// Create job for contact
const { data: job } = await supabase
  .from('jobs')
  .insert({
    title: 'Roof Replacement',
    contact_id: contact.id,
    job_type: 'residential',
    status: 'quoted',
    organization_id: authData.user.user_metadata.organization_id
  })
  .select()
  .single()

// Send SMS notification
await fetch(`${process.env.SUPABASE_URL}/functions/v1/send-sms`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: contact.phone,
    from: process.env.TWILIO_PHONE_NUMBER,
    body: `Hi ${contact.first_name}, your quote for ${job.title} is ready!`
  })
})

// Create appointment
const { data: appointment } = await supabase
  .from('appointments')
  .insert({
    contact_id: contact.id,
    title: 'Site Inspection',
    start_time: '2025-12-01T10:00:00Z',
    end_time: '2025-12-01T11:00:00Z',
    organization_id: authData.user.user_metadata.organization_id
  })
  .select()
  .single()

console.log('Integration complete!', {
  contact,
  job,
  appointment
})
```

### Webhook Handler Example

```javascript
const express = require('express')
const crypto = require('crypto')
const app = express()

app.use(express.json())

// Verify webhook signature
function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const calculatedSignature = hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  )
}

// Webhook endpoint
app.post('/webhooks/builderlync', async (req, res) => {
  const signature = req.headers['x-builderlync-signature']
  const secret = process.env.WEBHOOK_SECRET

  // Verify signature
  if (!verifySignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature')
  }

  // Handle event
  const { event, data } = req.body

  switch (event) {
    case 'contact.created':
      await handleContactCreated(data)
      break
    case 'job.status_changed':
      await handleJobStatusChanged(data)
      break
    case 'payment.received':
      await handlePaymentReceived(data)
      break
    default:
      console.log('Unhandled event:', event)
  }

  res.status(200).send('OK')
})

async function handleContactCreated(contact) {
  console.log('New contact created:', contact)
  // Your logic here
}

async function handleJobStatusChanged(job) {
  console.log('Job status changed:', job)
  // Your logic here
}

async function handlePaymentReceived(payment) {
  console.log('Payment received:', payment)
  // Your logic here
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000')
})
```

### React Integration Example

```typescript
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function ContactsList() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContacts()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('contacts-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Change received!', payload)
          loadContacts() // Reload data
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error loading contacts:', error)
    } else {
      setContacts(data)
    }
    setLoading(false)
  }

  async function createContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single()

    if (error) {
      console.error('Error creating contact:', error)
      return null
    }
    return data
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Contacts ({contacts.length})</h1>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            {contact.first_name} {contact.last_name} - {contact.email}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ContactsList
```

---

## Appendix

### Glossary

- **RLS**: Row Level Security - PostgreSQL security feature for data isolation
- **OAuth**: Open Authorization - Industry-standard authorization protocol
- **Webhook**: HTTP callback for real-time event notifications
- **Edge Function**: Serverless function running close to users
- **HMAC**: Hash-based Message Authentication Code for signature verification

### Migration Scripts

For migrating data from other systems to BuilderLync, refer to:
- `/supabase/migrations/` - Database migration files
- Contact support for custom migration assistance

### Rate Limits Summary

| Resource | Free Tier | Pro Tier | Enterprise |
|----------|-----------|----------|------------|
| API Requests | 1,000/day | 100,000/day | Unlimited |
| Webhooks | 100/day | 10,000/day | Unlimited |
| SMS Messages | 10/month | 1,000/month | Custom |
| Storage | 1 GB | 100 GB | Custom |

### Changelog

- **v1.0.0** (2025-11-29): Initial API documentation
- Future updates will be tracked here

### Support & Resources

- **Documentation**: https://docs.builderlync.com
- **API Status**: https://status.builderlync.com
- **GitHub**: https://github.com/builderlync
- **Support Email**: integrations@builderlync.com
- **Discord Community**: https://discord.gg/builderlync

---

**Document Version**: 1.0.0
**Last Updated**: November 29, 2025
**Maintained By**: BuilderLync Integration Team
