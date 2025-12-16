# Sierra AI Module

A comprehensive AI agent management interface for Voice, SMS, and Webchat interactions.

## Overview

Sierra AI is an intelligent virtual assistant module designed for contractor businesses. It handles inbound calls, SMS messages, and webchat conversations, automatically capturing lead information and booking appointments.

## Features

### 1. Overview Dashboard
- Real-time agent status monitoring
- Connected phone numbers overview
- Today's activity metrics (calls, SMS, appointments)
- Lead capture quality scoring
- Quick action buttons for testing
- Live webchat widget preview

### 2. Knowledge Base (Core Feature)
- **Three-column layout** for efficient content management
- **Collections**: Organize knowledge by category
- **Articles**: Detailed information Sierra can reference
- **Q&A Pairs**: Intent-based question/answer matching
- **Import from URL**: Automatically scrape and import website content
  - Paste any website URL to extract and import content
  - Automatic text chunking for long pages
  - Auto-generate vector embeddings for semantic search
  - Optional auto-refresh to keep content up-to-date
- **Agent Behavior**: Configure persona, tone, operating rules, escalation triggers, and guardrails
- Live preview of how Sierra interprets content
- Draft/publish workflow

### 3. Numbers & Routing
- Manage Twilio phone numbers
- Configure call handling (Sierra answers all, after-hours, backup)
- Set up missed call recovery
- Assign default pipelines and owners
- Enable/disable channels per number (Voice, SMS, MMS)

### 4. Agent Script & Flow
- Customize greeting and identification messages
- Configure lead data capture prompts
- Manage qualifying questions (draggable/sortable)
- Set booking pitch and closing language
- Live script preview for different scenarios

### 5. Channels Configuration
- **Voice**: Business hours, after-hours behavior
- **SMS & MMS**: Inbound greeting, photo handling, templates
- **Webchat**: Widget customization, install snippet, live preview

### 6. Booking & Calendars
- Connect calendar providers (Google, Microsoft, Apple)
- Configure appointment types (duration, location, enabled status)
- Set booking rules (min notice, max days out, max per day)
- Preview available time slots

### 7. Logs & Testing
- **Test Console**: Simulate phone calls and SMS scenarios
- **Conversation Logs**: Review past interactions with filters
- Detailed conversation view with transcript and captured lead data
- Search and filter by channel, outcome, date range

### 8. Settings
- Business profile (name, service areas, services offered)
- Lead routing rules (default stages, notification recipients)
- High-level agent behavior toggles

## Access

Navigate to: `/sierra-ai`

## Technology Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Mock data** for development (see `lib/mockData.ts`)

## File Structure

```
src/modules/sierra-ai/
├── SierraAiModule.tsx          # Main module entry point
├── components/
│   ├── SierraModuleLayout.tsx  # Layout wrapper with topbar and tabs
│   ├── ModuleTopBar.tsx        # Top bar with status and actions
│   ├── TabNavigation.tsx       # Horizontal tab navigation
│   ├── Card.tsx                # Reusable card component
│   ├── StatusChip.tsx          # Status indicator badges
│   └── ChannelBadge.tsx        # Channel type badges
├── pages/
│   ├── OverviewPage.tsx        # Tab 1: Overview dashboard
│   ├── KnowledgeBasePage.tsx   # Tab 2: Knowledge base management
│   ├── NumbersRoutingPage.tsx  # Tab 3: Phone numbers
│   ├── AgentScriptPage.tsx     # Tab 4: Script configuration
│   ├── ChannelsPage.tsx        # Tab 5: Channel settings
│   ├── BookingCalendarsPage.tsx # Tab 6: Appointments
│   ├── LogsTestingPage.tsx     # Tab 7: Logs and testing
│   └── SettingsPage.tsx        # Tab 8: General settings
└── lib/
    ├── types.ts                # TypeScript type definitions
    └── mockData.ts             # Mock data for development
```

## Key Components

### ModuleTopBar
- Agent status toggle (synced across tabs)
- Channel health indicators (Voice, SMS, Webchat)
- Save Changes and Publish to Live buttons
- Pending changes indicator

### TabNavigation
- 8 tabs with icons
- Active tab highlighting
- Smooth transitions

### Knowledge Base
- **Collections sidebar**: Filter and organize content
- **Content list**: Switch between Articles and Q&A Pairs
- **Editor panel**: Three-tab editor for Articles, Q&A, and Behavior
- Real-time preview of Sierra's interpretation

## Backend Integration Points

All backend integration points are marked with TODO comments:

- Load/save Sierra configuration
- Twilio phone number management
- Knowledge base CRUD operations
- LLM/RAG service connections
- Calendar API integration
- Conversation log data fetching
- Real-time status updates

## Mock Data

The module includes comprehensive mock data in `lib/mockData.ts`:

- `mockSierraConfig` - Agent configuration
- `mockTwilioNumbers` - Phone numbers (3 examples)
- `mockKbCollections` - KB collections (6 categories)
- `mockKbArticles` - Sample articles (3 examples)
- `mockKbQaPairs` - Q&A pairs (3 examples)
- `mockBehaviorProfile` - Agent behavior settings
- `mockConversations` - Conversation logs (2 examples)
- `mockAppointmentTypes` - Appointment types (4 examples)
- `mockBookingRules` - Booking constraints
- `mockAgentScript` - Script templates
- `mockBusinessProfile` - Business information
- `mockActivityStats` - Today's metrics
- `mockWidgetConfig` - Webchat widget settings
- `mockCalendarConnections` - Calendar integrations

## State Management

- Agent status is shared between topbar and overview page
- Tab navigation is managed via local React state
- All form inputs use controlled components
- Pending changes are tracked for publish button state

## Responsive Design

- Three-column layouts stack on mobile
- Tables convert to stacked cards on small screens
- Drawers and modals are mobile-optimized
- Horizontal tab navigation scrolls on mobile

## Dark Mode Support

All components support dark mode using Tailwind's `dark:` prefix classes, inheriting from the global theme context.

## Backend Implementation

### Database Schema

**Tables Created:** 12 production-ready tables with RLS
- `sierra_config` - Main configuration per account
- `sierra_behavior_profiles` - AI personality profiles
- `sierra_kb_collections` - KB organization
- `sierra_kb_articles` - Full-text articles (with source URL tracking)
- `sierra_kb_qapairs` - Q&A with intent classification
- `sierra_kb_embeddings` - Vector embeddings (pgvector)
- `sierra_kb_web_sources` - Imported website URLs with scraping status
- `sierra_channels_config` - Channel settings
- `sierra_sms_templates` - Message templates
- `sierra_appointments` - Sierra-booked appointments
- `sierra_audit_logs` - Change tracking
- `sierra_webchat_sessions` - Visitor sessions

### Backend Services

**Core Services:**
- `configService` - Config management with draft/publish workflow
- `behaviorService` - Behavior profile management
- `knowledgeBaseService` - KB CRUD operations
- `channelsService` - Channel configuration

**AI Services:**
- `llmService` - OpenAI GPT-4 integration with function calling
- `conversationEngine` - Main conversation orchestrator
- `embeddingsService` - Vector embedding generation

**Integration Services:**
- `twilioService` - Twilio SMS/Voice wrapper
- `webchatService` - Webchat session management
- `crmAdapter` - CRM integration (contacts, opportunities, appointments)
- `webScraperService` - Website content import and management

**Edge Functions:**
- `scrape-website` - Server-side HTML parsing and content extraction

### React Hooks

```typescript
// Config management
const { config, loading, updateStatus, publish } = useSierraConfig();

// Knowledge base management
const { articles, qapairs, createArticle, reindexAll } = useKnowledgeBase();
```

### API Flow Example (Inbound SMS)

1. Twilio webhook → Edge Function
2. Find/create contact
3. Create/get conversation
4. Semantic search knowledge base
5. Build LLM prompt with context
6. Call GPT-4 with function tools
7. Execute actions (book appointment, etc.)
8. Send reply SMS

### Environment Variables

```bash
# OpenAI (optional - falls back to mock)
VITE_OPENAI_API_KEY=sk-...

# Twilio (configured in Edge Functions)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

### Migrations Applied

- `20251128224516_create_sierra_ai_system.sql` - Core Sierra AI system
- `add_web_sources_to_sierra` - Web URL import functionality

### Usage: Import from Website URL

```typescript
import { webScraperService } from '@/modules/sierra-ai/services';

// Import content from a URL
const result = await webScraperService.importFromUrl(
  'https://example.com/services',
  collectionId,
  {
    autoRefresh: true,
    refreshFrequency: 'weekly'
  }
);

console.log(`Created ${result.articles.length} articles`);

// Refresh content from an existing web source
await webScraperService.refreshWebSource(webSourceId);

// List all imported web sources
const webSources = await webScraperService.getWebSources();
```

**Features:**
- Automatic HTML parsing and content extraction
- Removes navigation, headers, footers, scripts
- Extracts main content from `<article>` or `<main>` tags
- Splits long content into manageable chunks
- Generates vector embeddings automatically
- Optional auto-refresh (daily, weekly, monthly)
- Tracks scraping status and errors

## Future Enhancements

- Background job queue for embeddings (BullMQ + Redis)
- Voice call streaming with real-time LLM
- WebSocket support for webchat
- Multi-language support
- Advanced analytics and reporting
- Voice transcription display
- Sentiment analysis
- A/B testing for behavior profiles
- Auto-escalation based on customer tone
