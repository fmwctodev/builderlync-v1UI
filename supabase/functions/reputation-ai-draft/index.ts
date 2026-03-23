import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AIDraftRequest {
  orgId: string;
  reviewId: string;
  userId: string;
  tonePreset?: string;
  instructions?: string;
}

interface ReviewRow {
  id: string;
  platform: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string | null;
}

interface BrandBoardRow {
  brand_voice?: string;
  brand_tone?: string;
  company_name?: string;
  support_email?: string;
  support_phone?: string;
}

interface OrgSettings {
  default_ai_tone: string | null;
  default_temperature: number | null;
  auto_append_signature: boolean | null;
  default_signature: string | null;
}

const SENSITIVE_TOPICS = [
  "legal", "lawsuit", "court", "attorney", "lawyer",
  "medical", "doctor", "hospital", "injury", "safety", "hazard", "danger",
];

function hasSensitiveTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return SENSITIVE_TOPICS.some((t) => lower.includes(t));
}

function buildSystemPrompt(brand: BrandBoardRow | null, platform: string): string {
  const companyName = brand?.company_name ?? "our company";
  const voice = brand?.brand_voice ?? "professional and helpful";
  const supportEmail = brand?.support_email ?? null;

  return `You are a reputation management assistant for ${companyName}.
Your task is to write customer-facing review replies for the ${platform === "googlebusiness" ? "Google Business Profile" : "Facebook"} platform.

Brand voice: ${voice}
${brand?.brand_tone ? `Brand tone: ${brand.brand_tone}` : ""}
${supportEmail ? `Support contact: ${supportEmail}` : ""}

STRICT RULES — never violate these:
1. Write in plain text only. No markdown, no bullet points, no headers.
2. Never invent facts, dates, or details not present in the review.
3. Never make promises about refunds, compensation, or specific fixes unless those are standard policy.
4. Never ask the customer to share personal or private information in a public reply.
5. If the review mentions anything involving legal action, medical issues, personal injury, or safety hazards, end the reply by asking the customer to contact us privately to resolve the matter.
6. Keep replies concise — under 150 words per variant.
7. Always thank the reviewer. For negative reviews, acknowledge their experience without being defensive.`;
}

function buildUserPrompt(
  review: ReviewRow,
  tonePreset: string | undefined,
  instructions: string | undefined
): string {
  const isSensitive = hasSensitiveTopic(review.review_text ?? "");

  return `Generate exactly 3 reply variants for the following customer review.

Review platform: ${review.platform === "googlebusiness" ? "Google Business" : "Facebook"}
Reviewer name: ${review.reviewer_name ?? "Customer"}
Star rating: ${review.rating}/5
Review text: "${review.review_text ?? "(No text provided)"}"

${isSensitive ? "IMPORTANT: This review may involve a sensitive topic (legal/medical/safety). Each variant must include a note asking the customer to contact us privately.\n" : ""}
${tonePreset ? `Preferred tone: ${tonePreset}\n` : ""}
${instructions ? `Additional instructions: ${instructions}\n` : ""}

Respond with a JSON object in this exact format (no other text):
{
  "concise": "<Variant 1: concise and professional, under 80 words>",
  "empathetic": "<Variant 2: warm and empathetic, under 120 words>",
  "fixit": "<Variant 3: problem-solving and action-oriented, under 120 words>"
}`;
}

async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  temperature: number
): Promise<{ concise: string; empathetic: string; fixit: string }> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.1",
      temperature,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (response.status === 401) throw new Error("OPENAI_AUTH_ERROR");
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const result = await response.json() as {
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };

  const rawText = result?.output?.[0]?.content?.[0]?.text ?? "";

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("OpenAI did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as { concise: string; empathetic: string; fixit: string };
}

function appendSignature(text: string, signature: string): string {
  if (!signature.trim()) return text;
  return `${text}\n\n${signature.trim()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openAiKey = Deno.env.get("OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AIDraftRequest = await req.json();
    const { orgId, reviewId, userId, tonePreset, instructions } = body;

    if (!orgId || !reviewId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orgId, reviewId, userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured.", code: "OPENAI_NOT_CONFIGURED" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [reviewResult, brandResult, settingsResult] = await Promise.all([
      supabase
        .from("reputation_reviews")
        .select("id, platform, rating, review_text, reviewer_name")
        .eq("id", reviewId)
        .eq("org_id", orgId)
        .maybeSingle(),
      supabase
        .from("brand_boards")
        .select("brand_voice, brand_tone, company_name, support_email, support_phone")
        .eq("organization_id", orgId)
        .maybeSingle(),
      supabase
        .from("reputation_settings")
        .select("default_ai_tone, default_temperature, auto_append_signature, default_signature")
        .eq("org_id", orgId)
        .maybeSingle(),
    ]);

    if (reviewResult.error || !reviewResult.data) {
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const review = reviewResult.data as ReviewRow;
    const brand = brandResult.data as BrandBoardRow | null;
    const orgSettings = settingsResult.data as OrgSettings | null;

    const effectiveTone = tonePreset ?? orgSettings?.default_ai_tone ?? undefined;
    const temperature = orgSettings?.default_temperature ?? 0.4;

    const systemPrompt = buildSystemPrompt(brand, review.platform);
    const userPrompt = buildUserPrompt(review, effectiveTone, instructions);

    const drafts = await callOpenAI(openAiKey, systemPrompt, userPrompt, temperature);

    const shouldAppendSig = orgSettings?.auto_append_signature === true;
    const signature = orgSettings?.default_signature ?? "";

    const finalDrafts = shouldAppendSig
      ? {
          concise: appendSignature(drafts.concise, signature),
          empathetic: appendSignature(drafts.empathetic, signature),
          fixit: appendSignature(drafts.fixit, signature),
        }
      : drafts;

    const now = new Date().toISOString();
    const draftRows = [
      { tone_preset: "concise", draft_text: finalDrafts.concise },
      { tone_preset: "empathetic", draft_text: finalDrafts.empathetic },
      { tone_preset: "fixit", draft_text: finalDrafts.fixit },
    ].map((d) => ({
      org_id: orgId,
      review_id: reviewId,
      draft_text: d.draft_text,
      model: "gpt-5.1",
      tone_preset: d.tone_preset,
      created_by_user_id: userId,
      created_at: now,
      applied: false,
    }));

    const { data: insertedDrafts, error: insertError } = await supabase
      .from("reputation_ai_drafts")
      .insert(draftRows)
      .select();

    if (insertError) {
      throw new Error(`Failed to save drafts: ${insertError.message}`);
    }

    await supabase.from("reputation_actions_audit").insert({
      org_id: orgId,
      user_id: userId,
      action: "generate_ai_reply",
      entity_type: "draft",
      entity_id: reviewId,
      metadata: {
        review_id: reviewId,
        tone_preset: effectiveTone ?? "default",
        temperature,
        model: "gpt-5.1",
        drafts_created: 3,
        signature_appended: shouldAppendSig,
      },
    });

    return new Response(
      JSON.stringify({ success: true, drafts: insertedDrafts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("reputation-ai-draft error:", message);

    if (message === "OPENAI_AUTH_ERROR") {
      return new Response(
        JSON.stringify({ error: "OpenAI authentication failed.", code: "OPENAI_AUTH_ERROR" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate AI drafts", details: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
