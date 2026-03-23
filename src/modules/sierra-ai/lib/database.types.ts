export type SierraStatus = 'active' | 'paused';
export type FormalityLevel = 'casual' | 'neutral' | 'formal';
export type ContentStatus = 'draft' | 'published';
export type PriorityLevel = 'low' | 'normal' | 'high';
export type EmbeddingSourceType = 'article' | 'qapair';
export type SierraChannelType = 'webchat' | 'sms' | 'voice';
export type SessionStatus = 'open' | 'closed';

export interface DatabaseSierraConfig {
  id: string;
  user_id: string;
  status: SierraStatus;
  time_zone: string;
  business_hours: BusinessHours;
  default_pipeline_id?: string;
  default_calendar_id?: string;
  draft_version: Record<string, any>;
  published_version: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  enabled: boolean;
}

export interface DatabaseBehaviorProfile {
  id: string;
  user_id: string;
  name: string;
  persona_description: string;
  tone_tags: string[];
  formality_level: FormalityLevel;
  operating_toggles: OperatingToggles;
  custom_instructions: string;
  escalation_triggers: EscalationTrigger[];
  forbidden_topics: string[];
  banned_phrases: string[];
  default_escalation_target_user_id?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface OperatingToggles {
  introduce_with_business_name: boolean;
  capture_contact_info: boolean;
  offer_appointments: boolean;
  handle_pricing_questions: boolean;
  describe_services: boolean;
}

export interface EscalationTrigger {
  trigger: string;
  action: string;
}

export interface DatabaseKBCollection {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKBArticle {
  id: string;
  user_id: string;
  collection_id?: string;
  title: string;
  content: string;
  tags: string[];
  status: ContentStatus;
  priority: PriorityLevel;
  allow_verbatim: boolean;
  is_high_priority_fact: boolean;
  source_url?: string;
  web_source_id?: string;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKBQAPair {
  id: string;
  user_id: string;
  collection_id?: string;
  question_pattern: string;
  intent: string;
  answer: string;
  priority: PriorityLevel;
  offer_to_book: boolean;
  allow_ranges: boolean;
  status: ContentStatus;
  created_by_user_id?: string;
  updated_by_user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKBEmbedding {
  id: string;
  user_id: string;
  source_type: EmbeddingSourceType;
  source_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  created_at: string;
}

export interface DatabaseChannelConfig {
  id: string;
  user_id: string;
  channel_type: SierraChannelType;
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSMSTemplate {
  id: string;
  user_id: string;
  name: string;
  trigger_type: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSierraAppointment {
  id: string;
  user_id: string;
  contact_id: string;
  opportunity_id?: string;
  conversation_id?: string;
  calendar_id?: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  location: string;
  external_event_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAuditLog {
  id: string;
  user_id: string;
  changed_by_user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  diff: Record<string, any>;
  created_at: string;
}

export interface DatabaseWebchatSession {
  id: string;
  user_id: string;
  session_token: string;
  contact_id?: string;
  conversation_id?: string;
  ip_address?: string;
  user_agent?: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWebSource {
  id: string;
  user_id: string;
  url: string;
  title?: string;
  collection_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  last_scraped_at?: string;
  error_message?: string;
  metadata: Record<string, any>;
  auto_refresh: boolean;
  refresh_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface ConversationResponse {
  reply_text: string;
  actions: SierraAction[];
  confidence: number;
}

export interface SierraAction {
  type: 'create_contact' | 'create_opportunity' | 'book_appointment' | 'escalate' | 'capture_info';
  data: Record<string, any>;
}

export interface SemanticSearchResult {
  id: string;
  source_type: EmbeddingSourceType;
  source_id: string;
  content: string;
  similarity: number;
}

export interface ColumnDefinition {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  selected: boolean;
}

export interface DatabaseKBTable {
  id: string;
  organization_id: string;
  collection_id?: string;
  name: string;
  description: string;
  source_file_name: string;
  column_definitions: ColumnDefinition[];
  row_count: number;
  status: ContentStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseKBTableRow {
  id: string;
  table_id: string;
  row_index: number;
  row_data: Record<string, any>;
  created_at: string;
}
