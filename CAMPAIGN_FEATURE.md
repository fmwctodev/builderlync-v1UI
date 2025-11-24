# Campaign Creation Feature

## Overview

The Campaign Creation feature allows users to create and manage Email and SMS marketing campaigns directly from the Marketing page.

## Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL Editor:

```bash
# Open the file: database-campaigns-schema.sql
# Copy and paste the contents into Supabase SQL Editor
# Execute the script
```

This will create:
- `campaigns` table - stores campaign information
- `campaign_recipients` table - tracks individual recipients
- `campaign_stats` table - aggregates campaign statistics
- Row Level Security policies - ensures user data isolation
- Indexes for performance optimization

### 2. Features

#### Campaign Types
- **Email Campaigns**: Full-featured email builder with subject lines, from name/email, and rich content
- **SMS Campaigns**: SMS composer with character counting and multi-segment detection

#### Campaign Builder
- **Type Selector**: Toggle between Email and SMS with visual indicators
- **Template Library**: Pre-built templates for common scenarios:
  - Database Reactivation
  - Follow-up Sequence
  - Proposal Follow-up
- **Content Editor**:
  - Rich textarea for composing messages
  - Merge fields support: {{first_name}}, {{last_name}}, {{company_name}}
  - Character counter for SMS (shows segments)
  - Subject line for emails

#### Audience Targeting
- **All Contacts**: Send to entire contact list
- **Filter by Status**: Target specific job statuses (New Lead, Qualified, etc.)
- **Filter by Tags**: Target contacts with specific tags
- **Custom Filters**: Advanced filtering options
- **Recipient Count**: Real-time estimated recipient count

#### Scheduling
- **Send Immediately**: Campaign goes out right away
- **Schedule for Later**: Pick a specific date and time
- **Save as Draft**: Save campaign without sending

#### Campaign Management
- **Campaign List**: View all campaigns with status badges
- **Status Tracking**: Draft, Scheduled, Sending, Sent, Paused, Cancelled
- **Delete Campaigns**: Remove campaigns with confirmation
- **Real-time Updates**: List refreshes after actions

## Usage

### Creating a Campaign

1. Navigate to **Marketing** > **Campaigns** tab
2. Click the **"New Campaign"** button
3. Choose campaign type (Email or SMS)
4. (Optional) Select a template
5. Fill in campaign details:
   - Campaign name (required)
   - Subject line (for email only)
   - From name and email (for email)
   - Message content (required)
6. Select target audience
7. (Optional) Schedule send time
8. Click **"Send Now"** or **"Save as Draft"**

### Email Campaign Fields
- Campaign Name
- Subject Line
- From Name
- From Email
- Email Content (with merge fields)

### SMS Campaign Fields
- Campaign Name
- SMS Message (160 characters = 1 segment)
- Character counter shows current length and segments

### Merge Fields

Personalize your campaigns with merge fields:
- `{{first_name}}` - Contact's first name
- `{{last_name}}` - Contact's last name
- `{{company_name}}` - Your company name

Example:
```
Hi {{first_name}},

Thanks for your interest in {{company_name}}.
We'd love to help with your roofing project!

Best regards,
{{company_name}} Team
```

## Templates

### Database Reactivation
Re-engage cold leads and past customers with a special offer.

### Follow-up Sequence
Automated follow-up for new leads who haven't responded.

### Proposal Follow-up
Follow up with contacts who received a proposal.

## API Service

The campaign feature includes a comprehensive API service (`campaignsApi`) with:

- `createCampaign()` - Create new campaigns
- `updateCampaign()` - Edit existing campaigns
- `deleteCampaign()` - Remove campaigns
- `getCampaigns()` - List all campaigns
- `getCampaign()` - Get single campaign
- `getCampaignStats()` - Get campaign statistics
- `sendCampaign()` - Send a draft campaign
- `pauseCampaign()` - Pause active campaign
- `duplicateCampaign()` - Duplicate existing campaign

## Next Steps

To enhance this feature:

1. **Email Service Integration**: Connect to SendGrid, Mailgun, or AWS SES
2. **SMS Service Integration**: Connect to Twilio, MessageBird, or similar
3. **Rich Text Editor**: Add formatting toolbar (bold, italic, lists, links)
4. **A/B Testing**: Test different subject lines and content
5. **Analytics Dashboard**: Track opens, clicks, and conversions
6. **Campaign Automation**: Trigger campaigns based on events
7. **Contact Segmentation**: Advanced audience filtering
8. **Unsubscribe Management**: Handle opt-outs automatically
9. **Template Builder**: Visual email template designer
10. **Campaign Scheduling**: Recurring campaigns and drip sequences

## Troubleshooting

### Modal not appearing
- Check browser console for errors
- Verify React state is updating correctly

### Campaigns not saving
- Verify Supabase connection
- Check database schema is created
- Ensure user is authenticated
- Check RLS policies

### Character count issues
- SMS segments: 160 chars = 1 segment, 153 chars for each additional
- Unicode characters may use more space

## File Structure

```
src/
├── modules/roof-runner/
│   ├── components/
│   │   ├── CampaignModal.tsx          # Main modal component
│   │   └── Toast.tsx                   # Toast notification
│   ├── pages/
│   │   └── Marketing.tsx               # Marketing page with campaigns
│   └── types/
│       └── campaigns.ts                # Campaign type definitions
└── shared/
    └── services/
        └── campaignsApi.ts             # Campaign API service

database-campaigns-schema.sql           # Database schema
```

## Support

For issues or questions about the campaign feature, check:
1. Database schema is properly created
2. Supabase connection is working
3. User authentication is active
4. Browser console for error messages
