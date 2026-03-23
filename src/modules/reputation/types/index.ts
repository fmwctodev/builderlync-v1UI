export type Platform = 'facebook' | 'googlebusiness';

export type ReplyStatus = 'draft' | 'published' | 'deleted';
export type ReplySource = 'late' | 'manual' | 'ai_draft';
export type AuditAction = 'sync_reviews' | 'generate_ai_reply' | 'publish_reply' | 'delete_reply' | 'escalation_triggered';
export type TonePreset = 'concise' | 'empathetic' | 'fixit';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export type SLAStatus = 'on_track' | 'due_soon' | 'overdue';
export type AITone = 'concise' | 'empathetic' | 'fixit' | 'professional' | 'warm' | 'direct' | 'apologetic' | 'brand_voice';

export interface ReputationReview {
  id: string;
  org_id: string;
  late_review_id: string;
  platform: Platform;
  account_id: string;
  account_username: string | null;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_profile_image: string | null;
  rating: number;
  review_text: string | null;
  review_created_at: string;
  has_reply: boolean;
  review_url: string | null;
  last_synced_at: string;
  assigned_to_user_id?: string | null;
  priority?: Priority;
  sla_breached?: boolean;
  replies?: ReputationReviewReply[];
  ai_drafts?: ReputationAIDraft[];
}

export interface ReputationReviewReply {
  id: string;
  org_id: string;
  review_id: string;
  late_reply_id: string | null;
  reply_text: string | null;
  reply_created_at: string | null;
  created_by_user_id: string | null;
  source: ReplySource;
  status: ReplyStatus;
  last_updated_at: string;
}

export interface ReputationAIDraft {
  id: string;
  org_id: string;
  review_id: string;
  draft_text: string;
  model: string;
  tone_preset: TonePreset | null;
  created_by_user_id: string;
  created_at: string;
  applied: boolean;
  applied_at: string | null;
}

export interface ReputationAuditEntry {
  id: string;
  org_id: string;
  user_id: string;
  action: AuditAction;
  entity_type: 'review' | 'reply' | 'draft';
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ReviewFilters {
  platform?: Platform | 'all';
  minRating?: number;
  maxRating?: number;
  hasReply?: boolean | null;
  accountId?: string;
  search?: string;
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewListResult {
  data: ReputationReview[];
  total: number;
  hasMore: boolean;
  nextCursor: string | null;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  pagination: { hasMore: boolean; nextCursor?: string };
  summary: { totalReviews: number; averageRating: number };
  meta: {
    accountsQueried: number;
    accountsFailed: number;
    failedAccounts: Array<{ accountId: string; error: string }>;
    lastUpdated: string;
  };
}

export interface DashboardStats {
  avgRating: number;
  totalReviews: number;
  unrepliedCount: number;
  responseRate: number;
  ratingDistribution: Record<number, number>;
  reviewsOverTime: Array<{ date: string; count: number }>;
}

export interface LateIntegration {
  connected: boolean;
  lastSyncedAt: string | null;
  failedAccounts: Array<{ accountId: string; error: string }>;
}

export interface ReputationSettings {
  id: string;
  org_id: string;
  default_ai_tone: AITone;
  default_signature: string;
  auto_append_signature: boolean;
  default_temperature: number;
  escalation_email: string | null;
  escalation_user_id: string | null;
  sla_hours_positive: number;
  sla_hours_negative: number;
  created_at: string;
  updated_at: string;
}

export type ReputationSettingsInput = Omit<ReputationSettings, 'id' | 'org_id' | 'created_at' | 'updated_at'>;

export interface ReputationRoutingRule {
  id: string;
  org_id: string;
  platform: Platform | null;
  min_rating: number;
  max_rating: number;
  assign_to_user_id: string | null;
  assign_to_role: string | null;
  priority: Priority;
  requires_manual_approval: boolean;
  created_at: string;
}

export type RoutingRuleFormValues = Omit<ReputationRoutingRule, 'id' | 'org_id' | 'created_at'>;

export interface ReputationIntegrationStatus {
  id: string;
  org_id: string;
  connected: boolean;
  last_sync_at: string | null;
  last_error: string | null;
  accounts_connected: Array<{ accountId: string; platform: string; username?: string }>;
  created_at: string;
  updated_at: string;
}
