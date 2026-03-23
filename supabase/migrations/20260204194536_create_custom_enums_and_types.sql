/*
  # Create Custom Enums and Types
  
  1. New Types
    - stripe_subscription_status: Stripe subscription states
    - stripe_order_status: Stripe order states
    - sierra_status: Sierra AI status
    - formality_level: AI formality levels
    - content_status: Content states
    - priority_level: Priority levels
    - embedding_source_type: Embedding source types
    - sierra_channel_type: AI channel types
    - session_status: Session states
    - social_platform: Social platforms
    - file_status: File processing states
    - cloud_provider: Cloud storage providers
    - conversation_channel: Communication channels
    - message_direction: Message direction
    - work_order_status: Work order states
    - material_order_status: Material order states
    
  2. Purpose
    - Provide type-safe enums for various status fields
    - Ensure data consistency across the application
*/

-- Stripe subscription status enum
DO $$ BEGIN
  CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started', 'incomplete', 'incomplete_expired', 'trialing',
    'active', 'past_due', 'canceled', 'unpaid', 'paused'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Stripe order status enum
DO $$ BEGIN
  CREATE TYPE stripe_order_status AS ENUM ('pending', 'completed', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra AI status enum
DO $$ BEGIN
  CREATE TYPE sierra_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Formality level enum
DO $$ BEGIN
  CREATE TYPE formality_level AS ENUM ('formal', 'casual', 'professional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Content status enum
DO $$ BEGIN
  CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Priority level enum
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Embedding source type enum
DO $$ BEGIN
  CREATE TYPE embedding_source_type AS ENUM ('article', 'qa_pair', 'web_page');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Sierra channel type enum
DO $$ BEGIN
  CREATE TYPE sierra_channel_type AS ENUM ('sms', 'email', 'webchat', 'voice');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Session status enum
DO $$ BEGIN
  CREATE TYPE session_status AS ENUM ('active', 'ended', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Social platform enum
DO $$ BEGIN
  CREATE TYPE social_platform AS ENUM ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- File status enum
DO $$ BEGIN
  CREATE TYPE file_status AS ENUM ('uploading', 'processing', 'ready', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Cloud provider enum
DO $$ BEGIN
  CREATE TYPE cloud_provider AS ENUM ('google_drive', 'dropbox', 'onedrive', 'box');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Conversation channel enum (if not exists)
DO $$ BEGIN
  CREATE TYPE conversation_channel AS ENUM ('email', 'sms', 'phone', 'webchat', 'social');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Message direction enum
DO $$ BEGIN
  CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Work order status enum
DO $$ BEGIN
  CREATE TYPE work_order_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Material order status enum
DO $$ BEGIN
  CREATE TYPE material_order_status AS ENUM ('draft', 'pending', 'ordered', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ticket status enum
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting', 'resolved', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ticket priority enum
DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
