# Sierra AI Module Redesign - ElevenLabs Inspired

## Overview

The Sierra AI module has been completely redesigned to match the ElevenLabs agent platform design, featuring a modern, card-based interface with a multi-step wizard for agent creation and management.

## New Features

### 1. **Agent Dashboard** (`/org/{orgSlug}/ai-agents`)
- Visual card-based layout showing all AI agents
- Empty state when no agents exist:
  - Welcoming message with bot icon
  - Clear call-to-action to create first agent
  - Helpful description of agent capabilities
- Each agent card displays:
  - Agent avatar with gradient background
  - Status badge (Active, Paused, Draft)
  - Description
  - Enabled channels (Voice, SMS, Webchat) with badges
  - Stats (Calls handled, Messages, Appointments booked)
  - "Try a call" button for testing
- "Create agent" and "Start from blank" CTAs

### 2. **Multi-Step Agent Creation Wizard** (`/org/{orgSlug}/ai-agents/create`)

#### Step 1: Choose Template
- **Blank Agent**: Start from scratch
- **Personal Assistant**: Pre-configured for task management with conversation preview
- **Business Agent**: Pre-configured for business communications with conversation preview

#### Step 2: Select Industry
Grid of 17 industry options with icons:
- Retail & E-commerce
- Healthcare & Medical
- Finance & Banking
- Real Estate
- Education & Training
- Hospitality & Travel
- Automotive
- Professional Services
- Technology & Software
- Government & Public
- Food & Beverage
- Manufacturing
- Fitness & Wellness
- Legal Services
- Non-Profit
- Media & Entertainment
- Other

#### Step 3: Choose Use Case
Grid of 13 use case options with icons:
- Customer Support
- Outbound Sales
- Learning and Development
- Scheduling
- Lead Qualification
- Answering Service
- Appointment Scheduling
- Product Recommendations
- Order Tracking
- Technical Support
- Reservation Management
- Account Inquiries
- Other

#### Step 4: Complete Agent Details
Form to finalize agent creation:
- **Agent Name** (required, max 50 characters)
- **Website URL** (optional) - for web scraping and personalization
- **Main Goal** (required) - describe what the agent should accomplish
- **Chat Only Toggle** - disable voice processing

### 3. **Agent Builder/Editor** (`/org/{orgSlug}/ai-agents/agent/{agentId}`)
- Top navigation bar with:
  - Back button to agents dashboard
  - Agent name and description
  - Status toggle (Active/Paused)
  - Save button
  - Settings button
- Tabbed interface for:
  - **Overview**: Stats, configuration, and enabled channels
  - **Voice**: Voice-specific settings (when enabled)
  - **SMS**: SMS-specific settings (when enabled)
  - **Webchat**: Webchat widget configuration (when enabled)
  - **Knowledge Base**: Document and FAQ management
  - **Tools & Integrations**: External API connections
  - **Analytics**: Performance metrics and insights

## Technical Implementation

### New Files Created

1. **Types and Models**
   - `src/modules/sierra-ai/lib/agentTypes.ts` - Agent interfaces and types
   - `src/modules/sierra-ai/lib/agentMockData.ts` - Mock data for agents, templates, industries, use cases

2. **Pages**
   - `src/modules/sierra-ai/pages/AgentsDashboard.tsx` - Main agent list view
   - `src/modules/sierra-ai/pages/CreateAgentWizard.tsx` - Multi-step agent creation wizard
   - `src/modules/sierra-ai/pages/AgentBuilder.tsx` - Agent configuration and editing interface

3. **Updated Files**
   - `src/modules/sierra-ai/SierraAiModule.tsx` - Updated routing to use new pages

### Key Design Elements

- **Clean, minimal interface** with lots of white space
- **Card-based layouts** for agent display
- **Gradient backgrounds** for visual appeal
- **Status indicators** with color coding (green=active, yellow=paused, gray=draft)
- **Channel badges** to show enabled communication methods
- **Progress dots** for wizard navigation
- **Smooth animations** with fadeIn effects
- **Dark mode support** throughout

### Routing Structure

```
/org/{orgSlug}/ai-agents/
  ├── /                       → AgentsDashboard (list of agents)
  ├── /create                 → CreateAgentWizard (4-step wizard)
  ├── /agent/{agentId}        → AgentBuilder (configure agent)
  └── /legacy                 → Old SierraModuleLayout (preserved for reference)
```

## Mock Data

The module starts with an empty agent list, encouraging users to create their own custom agents through the creation wizard. The following template types are available for quick start:
1. **Blank Agent** - Start from scratch with no pre-configuration
2. **Personal Assistant** - Pre-configured for task management and personal queries
3. **Business Agent** - Pre-configured for professional business communications

## Next Steps for Full Implementation

1. **Database Integration**: Connect to Supabase for persistent agent storage
2. **Voice Channel Builder**: Detailed call flow configuration UI
3. **SMS Channel Builder**: Conversation templates and keyword triggers
4. **Webchat Widget Builder**: Live preview with customization options
5. **Widget Embed Code Generator**: Copy-paste code for website integration
6. **Knowledge Base Integration**: File upload and web scraping functionality
7. **Agent Testing Interface**: Interactive voice/SMS/chat simulator
8. **Analytics Dashboard**: Conversation logs and performance metrics
9. **Tools Integration Panel**: Connect external APIs and services
10. **Real-time Agent Status**: Live connection monitoring

## Design Philosophy

This redesign follows the ElevenLabs approach:
- **Guided experience**: Step-by-step wizard reduces complexity
- **Visual clarity**: Cards and gradients make agents easy to identify
- **Channel flexibility**: Users can enable voice, SMS, and/or webchat per agent
- **Template-driven**: Pre-built templates speed up agent creation
- **Industry-specific**: Industry and use case selection helps personalize agents
- **Professional aesthetics**: Clean, modern design suitable for business use

## Backward Compatibility

The old Sierra AI interface is preserved at `/org/{orgSlug}/ai-agents/legacy` for reference and can be removed when the new interface is fully validated.
