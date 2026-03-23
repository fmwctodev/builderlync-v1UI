# BuilderLync Integration Quick Start Guide

Get your integration up and running in **under 30 minutes** with this step-by-step guide.

---

## Table of Contents

1. [5-Minute Setup](#5-minute-setup)
2. [Integration Patterns](#integration-patterns)
3. [Example Integrations](#example-integrations)
4. [Testing Your Integration](#testing-your-integration)
5. [Going to Production](#going-to-production)
6. [Common Recipes](#common-recipes)

---

## 5-Minute Setup

### Step 1: Get Your Credentials (2 minutes)

1. **Create Supabase Account**: Visit [supabase.com](https://supabase.com)
2. **Get API Keys**: Project Settings → API → Copy `anon` key and `URL`
3. **Request Organization ID**: Contact support@builderlync.com

### Step 2: Install SDK (1 minute)

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

### Step 3: Initialize Client (1 minute)

```javascript
// supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)
```

### Step 4: Make Your First API Call (1 minute)

```javascript
// app.js
import { supabase } from './supabase'

async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Contacts:', data)
  }
}

getContacts()
```

**Done!** You've just made your first API call to BuilderLync. 🎉

---

## Integration Patterns

Choose the pattern that best fits your use case:

### Pattern 1: Read-Only Data Sync

**Use Case**: Display BuilderLync data in your application

```javascript
// Sync contacts to your system
async function syncContacts() {
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .gte('updated_at', lastSyncTime)

  for (const contact of contacts) {
    await yourDatabase.upsert({
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      email: contact.email,
      phone: contact.phone,
      // Map other fields as needed
    })
  }
}

// Run sync every hour
setInterval(syncContacts, 60 * 60 * 1000)
```

### Pattern 2: Two-Way Data Sync

**Use Case**: Keep BuilderLync and your system in sync

```javascript
// Listen for changes in real-time
const subscription = supabase
  .channel('contacts-changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'contacts'
    },
    (payload) => {
      handleContactChange(payload)
    }
  )
  .subscribe()

async function handleContactChange(payload) {
  const { eventType, new: newRecord, old: oldRecord } = payload

  switch (eventType) {
    case 'INSERT':
      await yourDatabase.create(newRecord)
      break
    case 'UPDATE':
      await yourDatabase.update(newRecord.id, newRecord)
      break
    case 'DELETE':
      await yourDatabase.delete(oldRecord.id)
      break
  }
}
```

### Pattern 3: Webhook-Based Integration

**Use Case**: React to events in BuilderLync

```javascript
// Express server example
const express = require('express')
const crypto = require('crypto')
const app = express()

app.post('/webhooks/builderlync', express.json(), (req, res) => {
  // Verify signature
  const signature = req.headers['x-builderlync-signature']
  const isValid = verifySignature(req.body, signature, process.env.WEBHOOK_SECRET)

  if (!isValid) {
    return res.status(401).send('Invalid signature')
  }

  // Handle event
  const { event, data } = req.body

  switch (event) {
    case 'contact.created':
      handleNewContact(data)
      break
    case 'job.status_changed':
      handleJobUpdate(data)
      break
    // Add more events as needed
  }

  res.status(200).send('OK')
})

function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

app.listen(3000)
```

### Pattern 4: Edge Function Integration

**Use Case**: Add custom business logic without managing servers

```javascript
// Supabase Edge Function
Deno.serve(async (req) => {
  const { contactId } = await req.json()

  // Your custom logic
  const contact = await getContact(contactId)
  const enrichedData = await enrichContactData(contact)

  return new Response(
    JSON.stringify({ success: true, data: enrichedData }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## Example Integrations

### Example 1: Sync Contacts to Your CRM

**Goal**: Keep your CRM in sync with BuilderLync contacts

```javascript
import { supabase } from './supabase'
import { yourCRM } from './your-crm-api'

async function syncToCRM() {
  // Get contacts updated in last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      tags,
      custom_fields,
      updated_at
    `)
    .gte('updated_at', yesterday)

  if (error) {
    console.error('Error fetching contacts:', error)
    return
  }

  console.log(`Syncing ${contacts.length} contacts...`)

  for (const contact of contacts) {
    try {
      // Check if contact exists in your CRM
      const existingContact = await yourCRM.findByEmail(contact.email)

      if (existingContact) {
        // Update existing contact
        await yourCRM.update(existingContact.id, {
          firstName: contact.first_name,
          lastName: contact.last_name,
          phone: contact.phone,
          address: contact.address,
          // Map other fields
        })
        console.log(`✓ Updated ${contact.email}`)
      } else {
        // Create new contact
        await yourCRM.create({
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email,
          phone: contact.phone,
          // Map other fields
        })
        console.log(`✓ Created ${contact.email}`)
      }
    } catch (err) {
      console.error(`✗ Failed to sync ${contact.email}:`, err)
    }
  }

  console.log('Sync complete!')
}

// Run sync
syncToCRM()

// Or schedule it
setInterval(syncToCRM, 60 * 60 * 1000) // Every hour
```

### Example 2: Create Jobs from External Source

**Goal**: Automatically create jobs in BuilderLync from your system

```javascript
import { supabase } from './supabase'

async function createJobFromExternalOrder(order) {
  // 1. Find or create contact
  let contact
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', order.customerEmail)
    .maybeSingle()

  if (existingContact) {
    contact = existingContact
  } else {
    // Create new contact
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        first_name: order.customerFirstName,
        last_name: order.customerLastName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.address,
        organization_id: 'YOUR_ORG_ID'
      })
      .select()
      .single()

    if (error) throw error
    contact = newContact
  }

  // 2. Create job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      title: order.projectName,
      contact_id: contact.id,
      job_type: order.jobType,
      status: 'quoted',
      description: order.description,
      estimated_value: order.estimatedCost,
      start_date: order.desiredStartDate,
      organization_id: 'YOUR_ORG_ID',
      custom_fields: {
        external_order_id: order.id,
        source: 'external_system'
      }
    })
    .select()
    .single()

  if (jobError) throw jobError

  // 3. Create opportunity
  const { data: opportunity } = await supabase
    .from('opportunities')
    .insert({
      contact_id: contact.id,
      pipeline_id: 'YOUR_PIPELINE_ID',
      stage_id: 'YOUR_STAGE_ID',
      value: order.estimatedCost,
      title: order.projectName,
      organization_id: 'YOUR_ORG_ID'
    })
    .select()
    .single()

  console.log('Created job:', job.id)
  console.log('Created opportunity:', opportunity.id)

  return { job, opportunity, contact }
}

// Usage
const order = {
  customerFirstName: 'John',
  customerLastName: 'Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+15551234567',
  address: '123 Main St',
  projectName: 'Roof Replacement',
  jobType: 'residential',
  description: 'Replace existing shingles',
  estimatedCost: 15000,
  desiredStartDate: '2025-12-01'
}

await createJobFromExternalOrder(order)
```

### Example 3: Send SMS Notifications

**Goal**: Send SMS when job status changes

```javascript
import { supabase } from './supabase'

// Listen for job status changes
const subscription = supabase
  .channel('job-changes')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'jobs'
    },
    async (payload) => {
      const { new: newJob, old: oldJob } = payload

      // Check if status changed
      if (newJob.status !== oldJob.status) {
        await sendStatusNotification(newJob)
      }
    }
  )
  .subscribe()

async function sendStatusNotification(job) {
  // Get contact info
  const { data: contact } = await supabase
    .from('contacts')
    .select('first_name, phone')
    .eq('id', job.contact_id)
    .single()

  if (!contact?.phone) {
    console.log('Contact has no phone number')
    return
  }

  // Send SMS via Twilio edge function
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/send-sms`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: contact.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Hi ${contact.first_name}, your job status has been updated to: ${job.status}`
      })
    }
  )

  const result = await response.json()
  console.log('SMS sent:', result.sid)
}
```

### Example 4: Aggregate Reporting Data

**Goal**: Generate daily reports from BuilderLync data

```javascript
import { supabase } from './supabase'

async function generateDailyReport(date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  // Get new contacts
  const { data: newContacts, count: contactCount } = await supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())

  // Get new jobs
  const { data: newJobs, count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())

  // Get completed jobs
  const { data: completedJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'completed')
    .gte('updated_at', startOfDay.toISOString())
    .lte('updated_at', endOfDay.toISOString())

  // Calculate revenue
  const totalRevenue = completedJobs?.reduce(
    (sum, job) => sum + (job.actual_value || 0),
    0
  ) || 0

  // Get opportunities won
  const { data: wonOpportunities, count: wonCount } = await supabase
    .from('opportunities')
    .select('*', { count: 'exact' })
    .eq('status', 'won')
    .gte('updated_at', startOfDay.toISOString())
    .lte('updated_at', endOfDay.toISOString())

  const report = {
    date: date.toISOString().split('T')[0],
    newContacts: contactCount,
    newJobs: jobCount,
    completedJobs: completedJobs?.length || 0,
    revenue: totalRevenue,
    opportunitiesWon: wonCount
  }

  console.log('Daily Report:', report)
  return report
}

// Generate today's report
await generateDailyReport(new Date())

// Schedule daily reports
const schedule = require('node-schedule')
schedule.scheduleJob('0 0 * * *', () => {
  generateDailyReport(new Date())
})
```

---

## Testing Your Integration

### 1. Unit Tests

```javascript
// integration.test.js
import { describe, it, expect, beforeAll } from 'vitest'
import { supabase } from './supabase'

describe('BuilderLync Integration', () => {
  let testContactId

  beforeAll(async () => {
    // Create test contact
    const { data } = await supabase
      .from('contacts')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        organization_id: 'test-org'
      })
      .select()
      .single()

    testContactId = data.id
  })

  it('should fetch contacts', async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeInstanceOf(Array)
    expect(data.length).toBeGreaterThan(0)
  })

  it('should create a job', async () => {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: 'Test Job',
        contact_id: testContactId,
        status: 'quoted',
        organization_id: 'test-org'
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.id).toBeDefined()
    expect(data.title).toBe('Test Job')
  })

  // Add more tests...
})
```

### 2. Integration Tests

```javascript
// integration-flow.test.js
import { describe, it, expect } from 'vitest'
import { createJobFromExternalOrder } from './integration'

describe('End-to-End Integration', () => {
  it('should create job from external order', async () => {
    const order = {
      customerFirstName: 'Jane',
      customerLastName: 'Smith',
      customerEmail: 'jane@example.com',
      projectName: 'New Construction',
      jobType: 'commercial',
      estimatedCost: 50000
    }

    const result = await createJobFromExternalOrder(order)

    expect(result.contact).toBeDefined()
    expect(result.job).toBeDefined()
    expect(result.opportunity).toBeDefined()
    expect(result.job.title).toBe('New Construction')
  })
})
```

### 3. Manual Testing

Use these cURL commands to test your endpoints:

```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/contacts?limit=1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Test webhook endpoint
curl -X POST "https://your-domain.com/webhooks/builderlync" \
  -H "Content-Type: application/json" \
  -H "X-BuilderLync-Signature: test-signature" \
  -d '{
    "event": "contact.created",
    "data": {
      "id": "test-id",
      "email": "test@example.com"
    }
  }'

# Test edge function
curl -X POST "https://your-project.supabase.co/functions/v1/send-sms" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "from": "+15559876543",
    "body": "Test message"
  }'
```

---

## Going to Production

### Pre-Launch Checklist

- [ ] **Environment Variables**: All production keys configured
- [ ] **Error Handling**: Comprehensive error handling implemented
- [ ] **Logging**: Error logging and monitoring set up
- [ ] **Rate Limiting**: Backoff strategy implemented
- [ ] **Webhook Signatures**: Signature verification enabled
- [ ] **SSL Certificates**: Valid SSL for all endpoints
- [ ] **Database Migrations**: All migrations applied
- [ ] **RLS Policies**: Row Level Security enabled and tested
- [ ] **Load Testing**: System tested under expected load
- [ ] **Monitoring**: Alerts configured for errors/downtime
- [ ] **Documentation**: Internal docs updated
- [ ] **Backup Strategy**: Database backups configured

### Deployment Steps

**1. Update Environment Variables**:

```bash
# Production environment
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod_key_here
VITE_API_BASE_URL=https://api.yourdomain.com
```

**2. Deploy Database Migrations**:

```bash
supabase link --project-ref your-prod-ref
supabase db push
```

**3. Deploy Edge Functions**:

```bash
# Set production secrets
supabase secrets set TWILIO_ACCOUNT_SID=prod_sid
supabase secrets set TWILIO_AUTH_TOKEN=prod_token

# Deploy functions
supabase functions deploy
```

**4. Update Webhook URLs**:

Update all third-party services with production webhook URLs:

- Twilio: Update SMS/Voice webhook URLs
- QuickBooks: Update OAuth redirect URI
- Stripe: Update webhook endpoint
- Meta: Update OAuth redirect URI

**5. Test Production**:

```bash
# Run smoke tests
npm run test:integration

# Manual verification
curl https://api.yourdomain.com/health
```

### Monitoring

Set up monitoring for:

1. **API Errors**: Track 4xx and 5xx responses
2. **Webhook Failures**: Monitor webhook delivery success rate
3. **Database Performance**: Query execution times
4. **Integration Health**: Third-party API availability

```javascript
// Example: Sentry integration
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: 'production'
})

// Capture errors
try {
  await supabase.from('contacts').select('*')
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

---

## Common Recipes

### Recipe 1: Batch Create Contacts

```javascript
async function batchCreateContacts(contacts) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contacts.map(c => ({
      first_name: c.firstName,
      last_name: c.lastName,
      email: c.email,
      phone: c.phone,
      organization_id: 'YOUR_ORG_ID'
    })))
    .select()

  if (error) throw error
  return data
}

// Usage
const contacts = [
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
]

const created = await batchCreateContacts(contacts)
console.log(`Created ${created.length} contacts`)
```

### Recipe 2: Search Contacts

```javascript
async function searchContacts(query) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20)

  if (error) throw error
  return data
}

// Usage
const results = await searchContacts('john')
```

### Recipe 3: Update Job Status with History

```javascript
async function updateJobStatus(jobId, newStatus, reason) {
  // Update job
  const { data: job, error } = await supabase
    .from('jobs')
    .update({ status: newStatus })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error

  // Log status change
  await supabase
    .from('job_status_history')
    .insert({
      job_id: jobId,
      old_status: job.status,
      new_status: newStatus,
      reason: reason,
      changed_by: 'integration-user'
    })

  return job
}

// Usage
await updateJobStatus('job-123', 'in_progress', 'Work started on site')
```

### Recipe 4: Calculate Job Value

```javascript
async function calculateJobValue(jobId) {
  // Get all line items
  const { data: lineItems } = await supabase
    .from('job_line_items')
    .select('quantity, unit_price, tax_rate')
    .eq('job_id', jobId)

  if (!lineItems) return 0

  const subtotal = lineItems.reduce(
    (sum, item) => sum + (item.quantity * item.unit_price),
    0
  )

  const tax = lineItems.reduce(
    (sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate / 100),
    0
  )

  const total = subtotal + tax

  // Update job
  await supabase
    .from('jobs')
    .update({
      subtotal: subtotal,
      tax: tax,
      total: total
    })
    .eq('id', jobId)

  return total
}
```

### Recipe 5: Real-Time Notifications

```javascript
// Listen for appointments assigned to you
const subscription = supabase
  .channel('my-appointments')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'appointments',
      filter: `staff_id=eq.${currentUserId}`
    },
    (payload) => {
      showNotification(`New appointment: ${payload.new.title}`)
    }
  )
  .subscribe()

function showNotification(message) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('BuilderLync', { body: message })
  }
}
```

---

## Next Steps

Now that you have your integration running, explore:

1. **Advanced Features**:
   - Real-time subscriptions
   - Complex filtering and sorting
   - Batch operations
   - File uploads

2. **Optimization**:
   - Caching strategies
   - Query optimization
   - Rate limit handling
   - Error recovery

3. **Documentation**:
   - Full [API Reference](./API_INTEGRATION_GUIDE.md)
   - [Environment Setup](./INTEGRATION_ENVIRONMENT_SETUP.md)
   - Database schema documentation

4. **Support**:
   - Join our [Discord](https://discord.gg/builderlync)
   - Email: integrations@builderlync.com
   - Status: https://status.builderlync.com

---

**Happy Integrating!** 🚀

---

**Document Version**: 1.0.0
**Last Updated**: November 29, 2025
**Maintained By**: BuilderLync Integration Team
