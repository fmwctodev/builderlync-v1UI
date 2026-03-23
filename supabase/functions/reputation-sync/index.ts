import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SyncRequest {
  orgId: string;
  platform?: "facebook" | "googlebusiness";
  cursor?: string;
  limit?: number;
}

interface LateReviewer {
  name: string;
  profileImage?: string;
}

interface LateReply {
  id: string;
  text: string;
  created: string;
}

interface LateReview {
  id: string;
  platform: "facebook" | "googlebusiness";
  accountId: string;
  accountUsername?: string;
  reviewer: LateReviewer;
  rating: number;
  text?: string;
  created: string;
  hasReply: boolean;
  reply?: LateReply;
  reviewUrl?: string;
}

interface LateListResponse {
  data: LateReview[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
  };
  meta: {
    accountsQueried: number;
    accountsFailed: number;
    failedAccounts: Array<{ accountId: string; error: string; retryAfter?: number }>;
    lastUpdated: string;
  };
  summary: {
    totalReviews: number;
    averageRating: number;
  };
}

interface ReputationSettings {
  sla_hours_positive: number;
  sla_hours_negative: number;
}

interface RoutingRule {
  platform: string | null;
  min_rating: number;
  max_rating: number;
  assign_to_user_id: string | null;
  assign_to_role: string | null;
  priority: string;
}

async function getLateApiKey(
  supabase: ReturnType<typeof createClient>,
  orgId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("integration_connections")
    .select("configuration")
    .eq("organization_id", orgId)
    .eq("integration_name", "late")
    .eq("status", "connected")
    .maybeSingle();

  if (error || !data) return null;

  const config = data.configuration as Record<string, string> | null;
  return config?.api_key ?? null;
}

async function fetchLateReviews(
  apiKey: string,
  params: {
    platform?: string;
    cursor?: string;
    limit?: number;
  }
): Promise<LateListResponse> {
  const url = new URL("https://getlate.dev/api/v1/inbox/reviews");

  if (params.platform) url.searchParams.set("platform", params.platform);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  url.searchParams.set("limit", String(Math.min(params.limit ?? 25, 50)));
  url.searchParams.set("sortBy", "date");
  url.searchParams.set("sortOrder", "desc");

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") ?? "5", 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      attempt++;
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error("LATE_AUTH_ERROR");
    }

    if (!response.ok) {
      throw new Error(`Late API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as LateListResponse;
  }

  throw new Error("Late API rate limit exceeded after retries");
}

async function getOrgSettings(
  supabase: ReturnType<typeof createClient>,
  orgId: string
): Promise<ReputationSettings> {
  const { data } = await supabase
    .from("reputation_settings")
    .select("sla_hours_positive, sla_hours_negative")
    .eq("org_id", orgId)
    .maybeSingle();

  return {
    sla_hours_positive: (data as ReputationSettings | null)?.sla_hours_positive ?? 48,
    sla_hours_negative: (data as ReputationSettings | null)?.sla_hours_negative ?? 12,
  };
}

async function getRoutingRules(
  supabase: ReturnType<typeof createClient>,
  orgId: string
): Promise<RoutingRule[]> {
  const { data } = await supabase
    .from("reputation_routing_rules")
    .select("platform, min_rating, max_rating, assign_to_user_id, assign_to_role, priority")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });

  return (data ?? []) as RoutingRule[];
}

async function resolveRoleToUser(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  role: string
): Promise<string | null> {
  const { data } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq("role", role)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (data as { user_id: string } | null)?.user_id ?? null;
}

function computeSlaBreached(
  reviewCreatedAt: string,
  rating: number,
  hasReply: boolean,
  settings: ReputationSettings
): boolean {
  if (hasReply) return false;
  const slaHours = rating <= 3 ? settings.sla_hours_negative : settings.sla_hours_positive;
  const deadline = new Date(reviewCreatedAt).getTime() + slaHours * 60 * 60 * 1000;
  return Date.now() > deadline;
}

function matchRoutingRule(review: LateReview, rules: RoutingRule[]): RoutingRule | null {
  for (const rule of rules) {
    const platformMatch = rule.platform === null || rule.platform === review.platform;
    const ratingMatch = review.rating >= rule.min_rating && review.rating <= rule.max_rating;
    if (platformMatch && ratingMatch) return rule;
  }
  return null;
}

async function upsertReviews(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  reviews: LateReview[],
  settings: ReputationSettings,
  rules: RoutingRule[]
): Promise<string[]> {
  if (reviews.length === 0) return [];

  const now = new Date().toISOString();

  const reviewRows = await Promise.all(
    reviews.map(async (r) => {
      const slaBreached = computeSlaBreached(r.created, r.rating, r.hasReply, settings);
      const rule = matchRoutingRule(r, rules);

      let assignedUserId: string | null = null;
      let priority = "normal";

      if (rule) {
        priority = rule.priority;
        if (rule.assign_to_user_id) {
          assignedUserId = rule.assign_to_user_id;
        } else if (rule.assign_to_role) {
          assignedUserId = await resolveRoleToUser(supabase, orgId, rule.assign_to_role);
        }
      }

      return {
        org_id: orgId,
        late_review_id: r.id,
        platform: r.platform,
        account_id: r.accountId,
        account_username: r.accountUsername ?? null,
        reviewer_id: null,
        reviewer_name: r.reviewer?.name ?? null,
        reviewer_profile_image: r.reviewer?.profileImage ?? null,
        rating: r.rating,
        review_text: r.text ?? null,
        review_created_at: r.created,
        has_reply: r.hasReply,
        review_url: r.reviewUrl ?? null,
        last_synced_at: now,
        sla_breached: slaBreached,
        priority,
        assigned_to_user_id: assignedUserId,
      };
    })
  );

  const { data: upserted, error } = await supabase
    .from("reputation_reviews")
    .upsert(reviewRows, { onConflict: "org_id,late_review_id" })
    .select("id, late_review_id, rating, has_reply, review_text, sla_breached");

  if (error) {
    throw new Error(`Failed to upsert reviews: ${error.message}`);
  }

  const SENSITIVE_TOPICS = [
    "refund", "lawsuit", "attorney", "scam", "legal", "court",
    "medical", "doctor", "injury", "safety",
  ];

  const escalationIds: string[] = [];
  for (const row of upserted ?? []) {
    const reviewText = (row.review_text as string | null) ?? "";
    const isSensitive = SENSITIVE_TOPICS.some((t) => reviewText.toLowerCase().includes(t));
    if ((row.rating as number) <= 2 || row.sla_breached || isSensitive) {
      escalationIds.push(row.id as string);
    }
  }

  const reviewIdMap = new Map<string, string>(
    (upserted ?? []).map((r: { id: string; late_review_id: string }) => [r.late_review_id, r.id])
  );

  for (const review of reviews.filter((r) => r.hasReply && r.reply)) {
    const internalId = reviewIdMap.get(review.id);
    if (!internalId || !review.reply) continue;

    await supabase
      .from("reputation_review_replies")
      .upsert(
        {
          org_id: orgId,
          review_id: internalId,
          late_reply_id: review.reply.id,
          reply_text: review.reply.text,
          reply_created_at: review.reply.created,
          source: "late",
          status: "published",
          last_updated_at: now,
        },
        { onConflict: "review_id" }
      );
  }

  return escalationIds;
}

async function updateIntegrationStatus(
  supabase: ReturnType<typeof createClient>,
  orgId: string,
  fields: Record<string, unknown>
): Promise<void> {
  if (!orgId) return;
  await supabase
    .from("reputation_integration_status")
    .upsert(
      { org_id: orgId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "org_id" }
    );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let orgId = "";

  try {
    const body: SyncRequest = await req.json();
    orgId = body.orgId ?? "";
    const { platform, cursor, limit } = body;

    if (!orgId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: orgId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = await getLateApiKey(supabase, orgId);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Late integration not connected. Please add your Late API key in Settings.",
          code: "LATE_NOT_CONNECTED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [lateResponse, settings, rules] = await Promise.all([
      fetchLateReviews(apiKey, { platform, cursor, limit }),
      getOrgSettings(supabase, orgId),
      getRoutingRules(supabase, orgId),
    ]);

    const escalationIds = await upsertReviews(supabase, orgId, lateResponse.data, settings, rules);

    const accountsConnected = lateResponse.data.reduce(
      (acc: Array<{ accountId: string; platform: string; username?: string }>, r) => {
        if (!acc.find((a) => a.accountId === r.accountId)) {
          acc.push({ accountId: r.accountId, platform: r.platform, username: r.accountUsername });
        }
        return acc;
      },
      []
    );

    await updateIntegrationStatus(supabase, orgId, {
      connected: true,
      last_sync_at: new Date().toISOString(),
      last_error: null,
      accounts_connected: accountsConnected,
    });

    await supabase.from("reputation_actions_audit").insert({
      org_id: orgId,
      user_id: orgId,
      action: "sync_reviews",
      entity_type: "review",
      entity_id: "00000000-0000-0000-0000-000000000000",
      metadata: {
        synced_count: lateResponse.data.length,
        platform: platform ?? "all",
        cursor_used: cursor ?? null,
        failed_accounts: lateResponse.meta.failedAccounts,
        last_updated: lateResponse.meta.lastUpdated,
      },
    });

    if (escalationIds.length > 0) {
      EdgeRuntime.waitUntil(
        fetch(`${supabaseUrl}/functions/v1/reputation-escalation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ orgId, reviewIds: escalationIds }),
        }).catch((err) => console.error("Escalation invoke failed:", err))
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: lateResponse.data.length,
        pagination: lateResponse.pagination,
        summary: lateResponse.summary,
        meta: lateResponse.meta,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reputation-sync error:", message);

    await updateIntegrationStatus(supabase, orgId, { last_error: message }).catch(() => {});

    if (message === "LATE_AUTH_ERROR") {
      return new Response(
        JSON.stringify({
          error: "Late API authentication failed. Please reconnect your Late integration.",
          code: "LATE_AUTH_ERROR",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Sync failed", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
