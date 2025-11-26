# Conversations Module Implementation Guide

## Overview

The Conversations module provides a comprehensive communication system with three main tabs:
1. **Conversations Tab** - Customer-facing communications via SMS/MMS, Email, and Internal Comments
2. **Team Messaging Tab** - Internal team communication between staff and sub-contractors
3. **Snippets Tab** - Reusable message templates (coming soon)

## Features Implemented

### ✅ Customer Conversations (Conversations Tab)

- **SMS/MMS Support**
  - Two-way SMS communication via Twilio API
  - Outbound SMS sending through `send-sms` edge function
  - Inbound SMS receiving through `twilio-incoming-sms` webhook
  - MMS support with media attachments
  - Message delivery status tracking (pending, sent, delivered, read)
  - Real-time message updates using Supabase subscriptions

- **Internal Comments**
  - Add private notes to conversations visible only to staff
  - Distinct visual styling with yellow badge
  - Saved directly to database without external API calls

- **Email Integration (Prepared)**
  - Database schema ready for Gmail and Outlook integration
  - `send-email` edge function created for sending emails
  - Support for CC, BCC, subject lines, and HTML content
  - OAuth token management in `email_accounts` table
  - **Note**: Email OAuth setup required to activate

- **Real-time Features**
  - Live conversation list updates
  - Instant message delivery
  - Unread message count badges
  - Auto-scroll to new messages

- **UI Components**
  - ConversationsList - Displays all customer conversations with search and filtering
  - ChatArea - Shows message thread with contact header and channel tabs
  - MessageInputSMS - SMS composition with character count
  - MessageInputEmail - Email composition with CC/BCC support
  - MessageInputInternalComment - Quick internal note input
  - ChannelTabs - Switch between SMS, Email, and Internal Comments

### ✅ Team Messaging (Team Messaging Tab)

- **Internal Communication**
  - Direct messages between team members
  - Group conversations with multiple participants
  - Real-time message delivery
  - Message read tracking
  - Participant management

- **UI Components**
  - ConversationList - Shows team conversations with unread counts
  - MessageThread - Displays team messages
  - NewMessageModal - Create new direct or group messages

### 📋 Database Schema

All tables are created with Row Level Security (RLS) enabled:

**Customer Conversations:**
- `conversations` - Conversation threads
- `conversation_messages` - All messages (SMS, Email, Internal Comments)
- `message_attachments` - File attachments for MMS/Email
- `email_accounts` - Connected Gmail/Outlook accounts
- `twilio_phone_numbers` - Organization phone numbers

**Team Messaging:**
- `team_conversations` - Team conversation metadata
- `team_conversation_participants` - Conversation participants
- `team_messages` - Team messages
- `team_message_reads` - Read status tracking

**Settings:**
- `twilio_settings` - Twilio API credentials

## Setup Instructions

### 1. Twilio Configuration

#### A. Set Up Twilio Account

1. Create a Twilio account at https://www.twilio.com/
2. Get your Account SID, API Key, and API Secret from the Twilio Console
3. Purchase a phone number with SMS capabilities

#### B. Configure in Database

```sql
-- Insert Twilio credentials (replace with your actual credentials)
INSERT INTO twilio_settings (user_id, account_sid, api_key, api_secret)
VALUES (
  'your-user-id',
  'ACxxxxxxxxxxxxx',
  'SKxxxxxxxxxxxxx',
  'your-api-secret'
);

-- Add Twilio phone number
INSERT INTO twilio_phone_numbers (user_id, phone_number, friendly_name, is_default, capabilities)
VALUES (
  'your-user-id',
  '+1234567890',
  'Main Business Line',
  true,
  '{"sms": true, "mms": true, "voice": true}'::jsonb
);
```

#### C. Configure Webhook

1. Deploy the `twilio-incoming-sms` edge function:
   ```bash
   supabase functions deploy twilio-incoming-sms
   ```

2. In Twilio Console, configure webhook URL for your phone number:
   ```
   https://your-project.supabase.co/functions/v1/twilio-incoming-sms
   ```

3. Set webhook method to `POST`

### 2. Email Integration (Optional)

#### A. Gmail Setup

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URI: `https://your-app.com/oauth/gmail/callback`
3. Enable Gmail API
4. Store access token and refresh token in `email_accounts` table

#### B. Outlook Setup

1. Register app in Azure AD
2. Configure OAuth redirect URI: `https://your-app.com/oauth/outlook/callback`
3. Grant Mail.Send and Mail.Read permissions
4. Store access token and refresh token in `email_accounts` table

#### C. Deploy Email Edge Function

```bash
supabase functions deploy send-email
```

### 3. Frontend Integration

The module is already integrated into the application. To access:

**CRM Module:**
```
/crm/conversations
```

**Roof Runner Module:**
```
/conversations (use ConversationsNew.tsx)
```

### 4. Environment Variables

Ensure these are set in your Supabase project:

```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Usage Guide

### Sending SMS

1. Navigate to Conversations tab
2. Select a contact or conversation
3. Click SMS channel tab
4. Type your message
5. Click Send

The message will:
- Send via Twilio API
- Save to `conversation_messages` table
- Update conversation timestamp
- Trigger real-time update in UI

### Receiving SMS

When a customer sends an SMS:
1. Twilio receives the message
2. Calls webhook at `twilio-incoming-sms` edge function
3. Edge function:
   - Finds or creates contact by phone number
   - Finds or creates conversation
   - Saves message to database
   - Saves any media attachments
4. Frontend receives real-time update via Supabase subscription
5. Message appears instantly in conversation

### Adding Internal Comments

1. Select a conversation
2. Click "Internal Comment" channel tab
3. Type your note
4. Click Send

Internal comments:
- Are saved with `is_internal = true`
- Display with yellow badge
- Only visible to authenticated users
- Don't send any external notifications

### Sending Team Messages

1. Navigate to Team Messaging tab
2. Click "New Message" button
3. Select recipients (staff/sub-contractors)
4. Type message and send
5. Creates conversation if needed
6. Sends message to all participants

## API Reference

### conversationsApi.ts

```typescript
// Get all conversations
getConversations(): Promise<Conversation[]>

// Get single conversation
getConversation(id: string): Promise<Conversation>

// Get conversation messages
getConversationMessages(id: string): Promise<ConversationMessage[]>

// Send SMS
sendSMS(request: SendSMSRequest): Promise<{success: boolean}>

// Send internal comment
sendInternalComment(request: SendInternalCommentRequest): Promise<ConversationMessage>

// Mark as read
markConversationAsRead(id: string): Promise<void>

// Real-time subscription
subscribeToConversationMessages(id: string, callback: Function)
subscribeToConversations(userId: string, callback: Function)
```

### Edge Functions

**send-sms**
- Sends SMS via Twilio API
- Saves message to database
- Returns message ID and status

**twilio-incoming-sms**
- Receives Twilio webhooks
- Creates contacts and conversations automatically
- Saves messages and attachments

**send-email** (prepared)
- Sends emails via Gmail or Outlook API
- Supports CC, BCC, attachments
- Saves sent emails to database

## Testing

### Test SMS Flow

1. **Outbound SMS:**
   ```typescript
   // In browser console
   await sendSMS({
     conversation_id: 'conv-id',
     to_number: '+1234567890',
     message: 'Test message'
   })
   ```

2. **Inbound SMS:**
   - Send SMS to your Twilio number
   - Check webhook logs in Supabase
   - Verify message appears in conversation

### Test Real-time Updates

1. Open conversation in two browser windows
2. Send message from one window
3. Verify it appears instantly in both windows

### Test Internal Comments

1. Add internal comment to conversation
2. Verify yellow "Internal Comment" badge
3. Check database: `is_internal = true`

## Troubleshooting

### SMS not sending

1. Check Twilio credentials in `twilio_settings` table
2. Verify phone number in `twilio_phone_numbers` table
3. Check edge function logs
4. Verify account balance in Twilio console

### SMS not receiving

1. Verify webhook URL configured in Twilio
2. Check edge function is deployed
3. Test webhook with Twilio's webhook testing tool
4. Check edge function logs for errors

### Real-time updates not working

1. Verify Supabase real-time is enabled
2. Check browser console for subscription errors
3. Verify RLS policies allow reading messages
4. Check network tab for websocket connection

### Conversations not loading

1. Check RLS policies on `conversations` table
2. Verify user is authenticated
3. Check browser console for errors
4. Verify `user_id` matches in database

## Security Considerations

- All tables have RLS enabled
- Users can only access their own conversations
- Internal comments isolated from customers
- Twilio credentials encrypted in database
- Email tokens expire and require refresh
- Webhook endpoints validate incoming requests

## Performance Optimization

- Indexes on foreign keys and frequently queried fields
- Pagination for large conversation lists
- Lazy loading of message history
- Real-time subscriptions instead of polling
- Message batching for bulk operations

## Future Enhancements

- [ ] Email OAuth flow UI
- [ ] Voice call integration
- [ ] SMS scheduling
- [ ] Message templates/snippets
- [ ] File attachments for internal comments
- [ ] Message search across all conversations
- [ ] Conversation tagging and categorization
- [ ] Auto-responders and chatbots
- [ ] Analytics and reporting
- [ ] Message export functionality

## Support

For issues or questions:
1. Check Supabase logs for edge function errors
2. Verify database schema matches migration files
3. Check browser console for frontend errors
4. Review RLS policies for access issues
