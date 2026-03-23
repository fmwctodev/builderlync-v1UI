/*
  # Update Plan Definitions to Match Website Pricing

  Updates plan names, pricing, descriptions, and features to match the BuilderLync website.

  ## Changes
  - Starter: $497/month, DIY setup, full system access
  - Pro: $997/month, DFY onboarding, 100+ templates
  - Enterprise: Custom pricing, white label, custom integrations
  - All plans get unlimited users (seats: -1)
*/

-- Update Starter Plan
UPDATE plan_definitions
SET
  name = 'Starter',
  price_monthly = 497.00,
  price_annual = 5964.00,
  description = 'For contractors who want full control — they''ll build their own automations, templates, and workflows at their own pace.',
  included_modules = ARRAY[
    'Dashboard', 'Contacts', 'Conversations', 'Calendars', 'Jobs', 'Opportunities',
    'Proposals', 'Invoices', 'Payments', 'Material_Orders', 'Work_Orders', 'Job_Photos',
    'Marketing', 'Automation', 'Reputation', 'Reporting', 'File_Manager', 'Sierra_AI',
    'Team_Messaging', 'Integrations'
  ],
  limits = jsonb_build_object(
    'sms_messages', 5000,
    'mms_messages', 1000,
    'call_minutes', 2000,
    'ai_minutes', 500,
    'emails_sent', 10000,
    'storage_gb', 50,
    'seats', -1,
    'api_calls_per_month', 50000,
    'features', jsonb_build_array(
      'Full system access — CRM, AI Agent builder, automation tools, and integrations',
      'Unlimited users',
      'Manual setup and configuration (DIY)',
      'Access to our knowledge base & community support',
      'Integrations with QuickBooks, Google, EagleView, and Twilio',
      'Reporting dashboard templates (manual setup required)',
      'Pay-as-you-go usage for EagleView and Twilio'
    ),
    'optional_addons', jsonb_build_array(
      'DFY Setup & AI Agent Configuration (one-time fee)',
      'Pre-built Funnel Templates Pack ($250 one-time add-on)'
    )
  )
WHERE name = 'Starter';

-- Update Pro Plan (was Professional)
UPDATE plan_definitions
SET
  name = 'Pro',
  price_monthly = 997.00,
  price_annual = 11964.00,
  description = 'For contractors ready to scale — they want automation, pre-built workflows, and AI tools fully configured for their business from day one.',
  included_modules = ARRAY[
    'Dashboard', 'Contacts', 'Conversations', 'Calendars', 'Jobs', 'Opportunities',
    'Proposals', 'Invoices', 'Payments', 'Material_Orders', 'Work_Orders', 'Job_Photos',
    'Marketing', 'Automation', 'Reputation', 'Reporting', 'File_Manager', 'Sierra_AI',
    'Team_Messaging', 'Integrations'
  ],
  limits = jsonb_build_object(
    'sms_messages', 15000,
    'mms_messages', 3000,
    'call_minutes', 6000,
    'ai_minutes', 2000,
    'emails_sent', 50000,
    'storage_gb', 200,
    'seats', -1,
    'api_calls_per_month', 200000,
    'features', jsonb_build_array(
      'Done-For-You Onboarding (AI agent, workflows, automations preconfigured)',
      '100+ DFY templates for AI prompts, Email/SMS automations, Proposal & estimate templates',
      'Job pipelines and lead nurture sequences',
      'Dedicated Success Manager (first 60 days)',
      'Priority onboarding & support',
      'Pre-built reporting dashboards for ROI, revenue, and lead performance',
      '15+ turnkey automations ready for immediate use'
    )
  )
WHERE name IN ('Pro', 'Professional');

-- Insert or Update Enterprise Plan
INSERT INTO plan_definitions (
  name, 
  price_monthly, 
  price_annual, 
  description, 
  included_modules, 
  limits,
  display_order,
  active
)
VALUES (
  'Enterprise',
  0.00,
  0.00,
  'For multi-location, franchise, or enterprise contractors. Custom pricing based on needs.',
  ARRAY[
    'Dashboard', 'Contacts', 'Conversations', 'Calendars', 'Jobs', 'Opportunities',
    'Proposals', 'Invoices', 'Payments', 'Material_Orders', 'Work_Orders', 'Job_Photos',
    'Marketing', 'Automation', 'Reputation', 'Reporting', 'File_Manager', 'Sierra_AI',
    'Team_Messaging', 'Integrations'
  ],
  jsonb_build_object(
    'sms_messages', 50000,
    'mms_messages', 10000,
    'call_minutes', 20000,
    'ai_minutes', 10000,
    'emails_sent', 200000,
    'storage_gb', 500,
    'seats', -1,
    'api_calls_per_month', -1,
    'white_label_domains', 5,
    'features', jsonb_build_array(
      'Everything in Pro, plus:',
      'White-labeled dashboards & custom domains',
      'API / custom integrations',
      'Advanced reporting & analytics engine',
      'Priority SLAs (4-hour response, 24/7 support)',
      'Dedicated account manager (ongoing)',
      'Volume pricing for EagleView + Twilio integration',
      'Custom development hours included',
      'Quarterly business reviews',
      'Custom training sessions',
      'Priority feature requests',
      'Direct access to engineering team'
    )
  ),
  3,
  true
)
ON CONFLICT (name) 
DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  description = EXCLUDED.description,
  included_modules = EXCLUDED.included_modules,
  limits = EXCLUDED.limits,
  display_order = EXCLUDED.display_order,
  active = EXCLUDED.active;

-- Add Custom plan entry
INSERT INTO plan_definitions (
  name,
  price_monthly,
  price_annual,
  description,
  included_modules,
  limits,
  display_order,
  active
)
VALUES (
  'Custom',
  0.00,
  0.00,
  'Tailored solution for enterprise needs. Talk to sales for custom quote.',
  ARRAY[
    'Dashboard', 'Contacts', 'Conversations', 'Calendars', 'Jobs', 'Opportunities',
    'Proposals', 'Invoices', 'Payments', 'Material_Orders', 'Work_Orders', 'Job_Photos',
    'Marketing', 'Automation', 'Reputation', 'Reporting', 'File_Manager', 'Sierra_AI',
    'Team_Messaging', 'Integrations'
  ],
  jsonb_build_object(
    'custom', true,
    'features', jsonb_build_array(
      'Fully customized to your workflow',
      'Unlimited everything',
      'Bespoke integrations and development',
      'Dedicated infrastructure',
      'SLA guarantees',
      'On-premise deployment options'
    )
  ),
  4,
  true
)
ON CONFLICT (name)
DO UPDATE SET
  description = EXCLUDED.description,
  limits = EXCLUDED.limits;