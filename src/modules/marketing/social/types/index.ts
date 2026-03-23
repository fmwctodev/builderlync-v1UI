export type SocialProvider =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'google_business'
  | 'tiktok'
  | 'youtube'
  | 'reddit';

export type SocialPostStatus =
  | 'draft'
  | 'pending_approval'
  | 'scheduled'
  | 'queued'
  | 'posting'
  | 'posted'
  | 'failed'
  | 'cancelled'
  | 'denied';

export type SocialAIThreadStatus = 'active' | 'archived';
export type SocialAIMessageRole = 'user' | 'assistant' | 'system';
export type SocialAIMessageType =
  | 'text'
  | 'url_scrape'
  | 'youtube_transcript'
  | 'file_upload'
  | 'post_draft'
  | 'campaign_request'
  | 'image_suggestion';

export type SocialCampaignFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type SocialCampaignStatus = 'active' | 'paused' | 'completed';
export type HookStylePreset = 'question' | 'statistic' | 'story' | 'bold_claim' | 'educational';
export type EmojiFrequency = 'none' | 'minimal' | 'moderate' | 'heavy';
export type PublishMode = 'draft' | 'schedule' | 'post_now';

export interface PlatformDraft {
  platform: SocialProvider;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  visual_style_suggestion: string;
  engagement_prediction: number;
  character_count: number;
}

export interface SocialAIThread {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  status: SocialAIThreadStatus;
  created_at: string;
  updated_at: string;
  last_message?: SocialAIMessage | null;
  owner_name?: string;
}

export interface SocialAIAttachment {
  type: 'url' | 'youtube' | 'file' | 'image';
  url?: string;
  filename?: string;
  title?: string;
  content?: string;
}

export interface MediaJobInfo {
  job_id: string;
  model_id: string;
  model_name: string;
  media_type: 'image' | 'video';
  prompt: string;
  status: string;
  draft_index: number;
  message_id?: string;
  preloadedAssets?: MediaAsset[];
  error?: string;
}

export interface SocialAIMessage {
  id: string;
  thread_id: string;
  role: SocialAIMessageRole;
  content: string;
  message_type: SocialAIMessageType;
  attachments: SocialAIAttachment[];
  generated_posts: PlatformDraft[] | null;
  metadata: {
    model_used?: string;
    media_jobs?: MediaJobInfo[];
    media_skipped_reason?: string;
    auto_draft_ids?: string[];
  };
  created_at: string;
}

export interface MediaPreferences {
  video_model_id?: string;
  video_mode?: string;
  aspect_ratio?: string;
  auto_generate_media?: boolean;
  style_preset_id?: string;
}

export interface MediaAsset {
  id: string;
  public_url: string;
  media_type: 'image' | 'video';
  thumbnail_url?: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  thumbnail_url?: string;
}

export interface SocialPost {
  id: string;
  organization_id: string;
  created_by: string | null;
  body: string;
  media: MediaItem[];
  targets: string[];
  status: SocialPostStatus;
  scheduled_at_utc: string | null;
  scheduled_timezone: string;
  requires_approval: boolean;
  approved_by: string | null;
  approved_at: string | null;
  posted_at: string | null;
  published_at: string | null;
  provider_post_ids: Record<string, string>;
  ai_generated: boolean;
  hook_text: string | null;
  cta_text: string | null;
  hashtags: string[] | null;
  visual_style_suggestion: string | null;
  engagement_prediction: number | null;
  campaign_id: string | null;
  thread_id: string | null;
  approval_token: string | null;
  late_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  organization_id: string;
  provider: SocialProvider;
  external_account_id: string;
  display_name: string;
  profile_image_url: string | null;
  token_expiry: string | null;
  status: 'connected' | 'disconnected' | 'error';
  last_error: string | null;
  connected_by: string | null;
  unipile_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialAccountGroup {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  account_ids: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialCampaign {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  description: string;
  theme: string;
  frequency: SocialCampaignFrequency;
  platforms: SocialProvider[];
  content_type: string;
  hook_style_preset: HookStylePreset;
  approval_required: boolean;
  autopilot_mode: boolean;
  status: SocialCampaignStatus;
  next_generation_at: string | null;
  last_generated_at: string | null;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuidelineBlock {
  content: string;
}

export interface TonePreferences {
  formality: number;
  friendliness: number;
  energy: number;
  confidence: number;
}

export interface HashtagPreferences {
  preferred: string[];
  banned: string[];
}

export interface EmojiRules {
  frequency: EmojiFrequency;
  banned: string[];
}

export interface PlatformTweak {
  tone_override?: string;
  additional_rules?: string;
  hashtag_limit?: number;
}

export interface SocialGuideline {
  id: string;
  organization_id: string;
  user_id: string | null;
  content_themes: GuidelineBlock[];
  image_style: GuidelineBlock[];
  writing_style: GuidelineBlock[];
  tone_preferences: TonePreferences;
  words_to_avoid: string[];
  hashtag_preferences: HashtagPreferences;
  cta_rules: string[];
  emoji_rules: EmojiRules;
  industry_positioning: string;
  visual_style_rules: string[];
  platform_tweaks: Record<string, PlatformTweak>;
  created_at: string;
  updated_at: string;
}

export interface SocialPostMetrics {
  id: string;
  post_id: string;
  organization_id: string;
  platform: string;
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  video_views: number;
  watch_time_seconds: number;
  engagement_score: number;
  reach_score: number;
  fetched_at: string;
}

export interface SocialPostComment {
  id: string;
  organization_id: string;
  comment_post_id: string | null;
  late_comment_id: string;
  late_post_id: string;
  late_account_id: string;
  platform: string;
  author_id: string | null;
  author_name: string | null;
  author_handle: string | null;
  author_avatar_url: string | null;
  text: string | null;
  like_count: number;
  reply_count: number;
  is_reply: boolean;
  parent_comment_id: string | null;
  hidden: boolean;
  has_private_reply: boolean;
  actioned_at: string | null;
  actioned_by: string | null;
  synced_at: string;
  comment_created_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPostCommentPost {
  id: string;
  organization_id: string;
  late_post_id: string;
  late_account_id: string;
  platform: string;
  post_body_preview: string | null;
  platform_post_url: string | null;
  comment_count: number;
  last_comment_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPostFilters {
  status?: SocialPostStatus[];
  startDate?: string;
  endDate?: string;
  search?: string;
  campaignId?: string;
}

export interface AggregatedMetrics {
  impressions: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  engagementRate: number;
}

export interface PublishDraftParams {
  orgId: string;
  userId: string;
  draft: {
    platform: string;
    hook: string;
    body: string;
    cta: string;
    hashtags: string[];
    visual_style_suggestion?: string;
    engagement_prediction?: number;
  };
  accountIds: string[];
  mode: PublishMode;
  scheduledAtUtc?: string;
  media?: MediaItem[];
  mediaAssetIds?: string[];
  threadId?: string;
  existingPostId?: string;
}

export interface SendMessageResult {
  userMessage: SocialAIMessage;
  aiMessage: SocialAIMessage;
  mediaJobs: MediaJobInfo[];
  mediaSkippedReason?: string;
}

export const PLATFORM_CHARACTER_LIMITS: Record<SocialProvider, number> = {
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  google_business: 1500,
  tiktok: 2200,
  youtube: 5000,
  reddit: 40000,
};

export const PROVIDER_CONFIG: Record<SocialProvider, { label: string; color: string; bgColor: string }> = {
  facebook:        { label: 'Facebook',        color: '#1877F2', bgColor: 'bg-blue-600' },
  instagram:       { label: 'Instagram',       color: '#E4405F', bgColor: 'bg-pink-600' },
  linkedin:        { label: 'LinkedIn',        color: '#0A66C2', bgColor: 'bg-blue-700' },
  google_business: { label: 'Google Business', color: '#4285F4', bgColor: 'bg-blue-500' },
  tiktok:          { label: 'TikTok',          color: '#000000', bgColor: 'bg-black' },
  youtube:         { label: 'YouTube',         color: '#FF0000', bgColor: 'bg-red-600' },
  reddit:          { label: 'Reddit',          color: '#FF4500', bgColor: 'bg-orange-600' },
};

export const STATUS_STYLES: Record<SocialPostStatus, string> = {
  draft:            'bg-slate-500/20 text-slate-300',
  pending_approval: 'bg-amber-500/20 text-amber-400',
  scheduled:        'bg-blue-500/20 text-blue-400',
  queued:           'bg-yellow-500/20 text-yellow-400',
  posting:          'bg-yellow-500/20 text-yellow-400',
  posted:           'bg-green-500/20 text-green-400',
  failed:           'bg-red-500/20 text-red-400',
  cancelled:        'bg-slate-500/20 text-slate-400',
  denied:           'bg-red-500/20 text-red-400',
};
