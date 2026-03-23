import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReplyRequest {
  orgId: string;
  reviewId: string;
  lateReviewId: string;
  accountId: string;
  message?: string;
  action: "publish" | "delete";
  userId: string;
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

async function publishReply(
  apiKey: string,
  lateReviewId: string,
  accountId: string,
  message: string
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://getlate.dev/api/v1/inbox/reviews/${encodeURIComponent(lateReviewId)}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId, message }),
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error("LATE_AUTH_ERROR");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Late API error ${response.status}: ${body}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

async function deleteReply(
  apiKey: string,
  lateReviewId: string,
  accountId: string
): Promise<Record<string, unknown>> {
  const response = await fetch(
    `https://getlate.dev/api/v1/inbox/reviews/${encodeURIComponent(lateReviewId)}/reply`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accountId }),
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error("LATE_AUTH_ERROR");
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Late API error ${response.status}: ${body}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ReplyRequest = await req.json();
    const { orgId, reviewId, lateReviewId, accountId, message, action, userId } = body;

    if (!orgId || !reviewId || !lateReviewId || !accountId || !action || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: review, error: reviewError } = await supabase
      .from("reputation_reviews")
      .select("id, platform, has_reply")
      .eq("id", reviewId)
      .eq("org_id", orgId)
      .maybeSingle();

    if (reviewError || !review) {
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete" && review.platform !== "googlebusiness") {
      return new Response(
        JSON.stringify({
          error: "Deleting replies is only supported for Google Business.",
          code: "PLATFORM_NOT_SUPPORTED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = await getLateApiKey(supabase, orgId);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Late integration not connected.",
          code: "LATE_NOT_CONNECTED",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    if (action === "publish") {
      if (!message) {
        return new Response(
          JSON.stringify({ error: "message is required for publish action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const lateReply = await publishReply(apiKey, lateReviewId, accountId, message);

      const { data: existingReply } = await supabase
        .from("reputation_review_replies")
        .select("id")
        .eq("review_id", reviewId)
        .eq("status", "published")
        .maybeSingle();

      if (existingReply) {
        await supabase
          .from("reputation_review_replies")
          .update({
            reply_text: message,
            reply_created_at: now,
            created_by_user_id: userId,
            source: "manual",
            status: "published",
            last_updated_at: now,
            late_reply_id: (lateReply?.id as string) ?? null,
          })
          .eq("id", existingReply.id);
      } else {
        await supabase.from("reputation_review_replies").insert({
          org_id: orgId,
          review_id: reviewId,
          late_reply_id: (lateReply?.id as string) ?? null,
          reply_text: message,
          reply_created_at: now,
          created_by_user_id: userId,
          source: "manual",
          status: "published",
          last_updated_at: now,
        });
      }

      await supabase
        .from("reputation_reviews")
        .update({ has_reply: true, last_synced_at: now })
        .eq("id", reviewId);

      await supabase.from("reputation_actions_audit").insert({
        org_id: orgId,
        user_id: userId,
        action: "publish_reply",
        entity_type: "review",
        entity_id: reviewId,
        metadata: { account_id: accountId, late_review_id: lateReviewId, message_preview: message.slice(0, 100) },
      });

      return new Response(
        JSON.stringify({ success: true, action: "published", reply: lateReply }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      const lateResult = await deleteReply(apiKey, lateReviewId, accountId);

      await supabase
        .from("reputation_review_replies")
        .update({ status: "deleted", last_updated_at: now })
        .eq("review_id", reviewId)
        .eq("status", "published");

      await supabase
        .from("reputation_reviews")
        .update({ has_reply: false, last_synced_at: now })
        .eq("id", reviewId);

      await supabase.from("reputation_actions_audit").insert({
        org_id: orgId,
        user_id: userId,
        action: "delete_reply",
        entity_type: "reply",
        entity_id: reviewId,
        metadata: { account_id: accountId, late_review_id: lateReviewId, late_result: lateResult },
      });

      return new Response(
        JSON.stringify({ success: true, action: "deleted", result: lateResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reputation-reply error:", message);

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
      JSON.stringify({ error: "Operation failed", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
