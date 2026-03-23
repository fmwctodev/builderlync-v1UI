import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EscalationRequest {
  orgId: string;
  reviewIds: string[];
}

interface ReviewRow {
  id: string;
  platform: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string | null;
  sla_breached: boolean;
}

interface EscalationSettings {
  escalation_email: string | null;
  escalation_user_id: string | null;
}

const SENSITIVE_TOPICS = [
  "refund", "lawsuit", "attorney", "scam", "legal", "court",
  "medical", "doctor", "injury", "safety",
];

function buildEscalationEmailHtml(reviews: ReviewRow[], orgId: string): string {
  const rows = reviews
    .map((r) => {
      const platform = r.platform === "googlebusiness" ? "Google Business" : "Facebook";
      const stars = "★".repeat(r.rating) + "☆".repeat(5 - r.rating);
      const text = r.review_text
        ? r.review_text.length > 200
          ? r.review_text.slice(0, 200) + "…"
          : r.review_text
        : "(No text)";
      const reasons: string[] = [];
      if (r.rating <= 2) reasons.push("Low rating");
      if (r.sla_breached) reasons.push("SLA breached");
      const isSensitive = SENSITIVE_TOPICS.some((t) =>
        (r.review_text ?? "").toLowerCase().includes(t)
      );
      if (isSensitive) reasons.push("Sensitive topic detected");
      return `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 8px;font-size:13px;color:#374151;">${r.reviewer_name ?? "Anonymous"}</td>
          <td style="padding:12px 8px;font-size:13px;color:#374151;">${platform}</td>
          <td style="padding:12px 8px;font-size:13px;color:#374151;">${stars} (${r.rating}/5)</td>
          <td style="padding:12px 8px;font-size:13px;color:#6b7280;max-width:300px;">${text}</td>
          <td style="padding:12px 8px;font-size:12px;color:#dc2626;">${reasons.join(", ")}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;margin:0;padding:0;">
  <div style="max-width:700px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin-bottom:4px;">
      Reputation Escalation Alert
    </h1>
    <p style="font-size:14px;color:#6b7280;margin-bottom:24px;">
      ${reviews.length} review${reviews.length !== 1 ? "s" : ""} require${reviews.length === 1 ? "s" : ""} your attention.
    </p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Reviewer</th>
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Platform</th>
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Rating</th>
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Review</th>
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Reason</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
      Organization ID: ${orgId} &mdash; Sent by your Reputation Management system.
    </p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: EscalationRequest = await req.json();
    const { orgId, reviewIds } = body;

    if (!orgId || !reviewIds?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orgId, reviewIds" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reputation_reviews")
      .select("id, platform, rating, review_text, reviewer_name, sla_breached")
      .eq("org_id", orgId)
      .in("id", reviewIds);

    if (reviewsError || !reviews?.length) {
      return new Response(
        JSON.stringify({ success: true, escalated: 0, message: "No matching reviews found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: settingsRow } = await supabase
      .from("reputation_settings")
      .select("escalation_email, escalation_user_id")
      .eq("org_id", orgId)
      .maybeSingle();

    const settings = settingsRow as EscalationSettings | null;

    await supabase
      .from("reputation_reviews")
      .update({ priority: "urgent" })
      .eq("org_id", orgId)
      .in("id", reviewIds);

    const now = new Date().toISOString();
    const auditRows = (reviews as ReviewRow[]).map((r) => ({
      org_id: orgId,
      user_id: settings?.escalation_user_id ?? orgId,
      action: "escalation_triggered",
      entity_type: "review",
      entity_id: r.id,
      metadata: {
        review_id: r.id,
        platform: r.platform,
        rating: r.rating,
        sla_breached: r.sla_breached,
        escalated_at: now,
      },
    }));

    await supabase.from("reputation_actions_audit").insert(auditRows);

    if (settings?.escalation_email) {
      const htmlBody = buildEscalationEmailHtml(reviews as ReviewRow[], orgId);
      const subject = `Reputation Alert: ${reviews.length} review${reviews.length !== 1 ? "s" : ""} need attention`;

      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          conversation_id: "00000000-0000-0000-0000-000000000000",
          to_emails: [settings.escalation_email],
          subject,
          message: htmlBody,
        }),
      }).catch((err) => console.error("Escalation email send failed:", err));
    }

    return new Response(
      JSON.stringify({ success: true, escalated: reviews.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reputation-escalation error:", message);
    return new Response(
      JSON.stringify({ error: "Escalation failed", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
