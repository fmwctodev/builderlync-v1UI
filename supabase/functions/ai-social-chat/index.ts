import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      thread_id,
      content,
      message_type = "text",
      attachments = [],
      auto_generate_media = true,
      video_model_id = "gen3",
      video_mode = "std",
      aspect_ratio = "9:16",
    } = body;

    if (!thread_id || !content) {
      return new Response(JSON.stringify({ error: "thread_id and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          response: "AI Social Chat is not configured yet. Please set OPENAI_API_KEY in your edge function secrets.",
          drafts: [],
          media_jobs: [],
          model_used: "none",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: prevMessages } = await supabase
      .from("sierra_social_ai_messages")
      .select("role, content")
      .eq("thread_id", thread_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const systemPrompt = `You are Sierra, an expert social media content strategist for a roofing/construction company.
You help create engaging, platform-specific social media content that drives leads and builds brand authority.

When asked to create social posts, respond with a brief explanation followed by structured draft blocks.
Each draft block must be valid JSON in this exact format:
---DRAFT---
{"platform":"facebook","hook":"Attention-grabbing opening line","body":"Main content of the post","cta":"Call to action","hashtags":["#roofing","#stormrepair"],"visual_style_suggestion":"Photo of completed roof repair"}
---END_DRAFT---

Supported platforms: facebook, instagram, linkedin, google_business, tiktok, youtube, reddit

Keep content professional yet approachable. Focus on value, trust, and local community connection.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(prevMessages ?? []).slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error: ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const responseText = openaiData.choices?.[0]?.message?.content ?? "";

    const draftRegex = /---DRAFT---\n([\s\S]*?)\n---END_DRAFT---/g;
    const drafts: unknown[] = [];
    let match;
    while ((match = draftRegex.exec(responseText)) !== null) {
      try {
        drafts.push(JSON.parse(match[1]));
      } catch {
        // ignore parse errors
      }
    }

    const cleanResponse = responseText.replace(/---DRAFT---[\s\S]*?---END_DRAFT---/g, "").trim();

    return new Response(
      JSON.stringify({
        response: cleanResponse,
        drafts,
        media_jobs: [],
        media_skipped_reason: auto_generate_media ? "Media generation not configured" : "Disabled",
        model_used: "gpt-4o-mini",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("ai-social-chat error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
