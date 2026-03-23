import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

async function callAnthropic(systemPrompt: string, userPrompt: string, maxTokens = 4096): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: userPrompt }],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text ?? "";
}

interface GeneratedSection {
  section_type: string;
  title: string;
  content: string;
}

function parseSections(rawText: string): GeneratedSection[] {
  // Tier 1: JSON array parse
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as GeneratedSection[];
      }
    }
  } catch {
    // fall through
  }

  // Tier 2: JSON object with sections key
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.sections && Array.isArray(parsed.sections)) {
        return parsed.sections as GeneratedSection[];
      }
    }
  } catch {
    // fall through
  }

  // Tier 3: Markdown heading fallback — split on ## headings
  const sections: GeneratedSection[] = [];
  const headingRegex = /^##\s+(.+)$/gm;
  let match;
  const positions: { title: string; start: number }[] = [];

  while ((match = headingRegex.exec(rawText)) !== null) {
    positions.push({ title: match[1].trim(), start: match.index + match[0].length });
  }

  if (positions.length > 0) {
    for (let i = 0; i < positions.length; i++) {
      const start = positions[i].start;
      const end = i + 1 < positions.length ? positions[i + 1].start - positions[i + 1].title.length - 4 : rawText.length;
      const rawContent = rawText.slice(start, end).trim();
      const htmlContent = rawContent
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
      sections.push({
        section_type: "custom",
        title: positions[i].title,
        content: htmlContent,
      });
    }
    return sections;
  }

  // Tier 4: Single section fallback
  const htmlContent = rawText
    .trim()
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return [
    {
      section_type: "custom",
      title: "Proposal Content",
      content: htmlContent,
    },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: { message: "Missing authorization" } }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: { message: "Unauthorized" } }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      organization_id,
      proposal_id,
      contact_id,
      job_id,
      snapshot_id,
      sections_to_generate,
      custom_instructions,
    } = body;

    if (!organization_id || !proposal_id) {
      return new Response(JSON.stringify({ success: false, error: { message: "Missing required fields: organization_id and proposal_id" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather context in parallel
    const [contactResult, jobResult, snapshotResult] = await Promise.all([
      contact_id
        ? adminClient.from("contacts").select("full_name,email,phone,company,address").eq("id", contact_id).maybeSingle()
        : Promise.resolve({ data: null }),
      job_id
        ? adminClient.from("jobs").select("title,address,job_type,notes,status").eq("id", job_id).maybeSingle()
        : Promise.resolve({ data: null }),
      snapshot_id
        ? adminClient.from("estimate_snapshots").select("address_text,roof_area_sqft,pitch_effective,materials_calc_inputs,materials_calc_outputs,assumptions,notes").eq("id", snapshot_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const contact = contactResult.data;
    const job = jobResult.data;
    const snapshot = snapshotResult.data;

    const sectionList = (sections_to_generate as string[] | undefined) ?? [
      "intro",
      "scope",
      "materials",
      "timeline",
      "terms",
    ];

    const sectionDescriptions: Record<string, string> = {
      intro: "Introduction / Executive Summary - Welcome the customer and summarize the project",
      scope: "Scope of Work - Detail what work will be performed",
      materials: "Materials & Products - List the materials that will be used",
      timeline: "Project Timeline - Outline the expected schedule",
      terms: "Terms & Conditions - Standard roofing contractor terms",
      damage_assessment: "Damage Assessment - Description of observed roof damage (for insurance claims)",
      custom: "Additional Notes / Custom Section",
    };

    const sectionsRequested = sectionList
      .map((s) => `- ${sectionDescriptions[s] ?? s}`)
      .join("\n");

    const contextParts: string[] = [];

    if (contact) {
      contextParts.push(`CUSTOMER INFORMATION:
Name: ${contact.full_name ?? "N/A"}
Email: ${contact.email ?? "N/A"}
Phone: ${contact.phone ?? "N/A"}
Company: ${contact.company ?? "N/A"}
Address: ${contact.address ?? "N/A"}`);
    }

    if (job) {
      contextParts.push(`JOB INFORMATION:
Title: ${job.title ?? "N/A"}
Address: ${job.address ?? "N/A"}
Type: ${job.job_type ?? "N/A"}
Status: ${job.status ?? "N/A"}
Notes: ${job.notes ?? "N/A"}`);
    }

    if (snapshot) {
      const inputs = snapshot.materials_calc_inputs as Record<string, unknown> ?? {};
      const outputs = snapshot.materials_calc_outputs as Record<string, unknown> ?? {};
      contextParts.push(`ROOF MEASUREMENT DATA:
Address: ${snapshot.address_text ?? "N/A"}
Roof Area: ${snapshot.roof_area_sqft ?? "N/A"} sq ft
Pitch: ${snapshot.pitch_effective ?? "N/A"}/12
Squares: ${outputs.squares ?? "N/A"}
Adjusted Squares (with waste): ${outputs.adjustedSquares ?? "N/A"}
Bundles Required: ${outputs.bundlesRequired ?? "N/A"}
Underlayment Rolls: ${outputs.underlaymentRolls ?? "N/A"}
Shingle Type: ${inputs.shingleType ?? "N/A"}
Underlayment Type: ${inputs.underlaymentType ?? "N/A"}
Assumptions: ${Array.isArray(snapshot.assumptions) ? snapshot.assumptions.join("; ") : "N/A"}
Notes: ${snapshot.notes ?? "N/A"}`);
    }

    if (custom_instructions) {
      contextParts.push(`ADDITIONAL INSTRUCTIONS FROM USER:\n${custom_instructions}`);
    }

    const contextBlock = contextParts.length > 0
      ? contextParts.join("\n\n")
      : "No specific project context provided. Generate professional placeholder content.";

    const systemPrompt = `You are an expert roofing contractor proposal writer. Your job is to generate professional, compelling proposal sections for roofing projects.

Generate content that is:
- Professional and customer-facing
- Specific to the roofing industry
- Detailed and informative without being overly technical
- Written in a warm yet professional tone
- Formatted as clean HTML using <p>, <ul>, <li>, <strong>, <h3> tags as appropriate

IMPORTANT: You MUST respond with a valid JSON array only. No markdown, no explanation, no preamble.
Each element must have exactly these fields:
{
  "section_type": "intro|scope|materials|timeline|terms|damage_assessment|custom",
  "title": "Section Title Here",
  "content": "<p>HTML content here...</p>"
}`;

    const userPrompt = `Generate the following proposal sections for a roofing project.

PROJECT CONTEXT:
${contextBlock}

SECTIONS TO GENERATE:
${sectionsRequested}

Return a JSON array with one object per section in the order listed above. Use proper HTML formatting in the content field.`;

    const rawText = await callAnthropic(systemPrompt, userPrompt, 4096);
    const sections = parseSections(rawText);

    // Persist to staging table
    const stagingRows = sections.map((s, i) => ({
      organization_id,
      proposal_id,
      section_type: s.section_type,
      title: s.title,
      content: s.content,
      sort_order: i,
      ai_generated: true,
    }));

    await adminClient.from("ai_proposal_sections_staging").insert(stagingRows);

    // Merge into proposal content
    const { data: existingProposal } = await adminClient
      .from("proposals")
      .select("content")
      .eq("id", proposal_id)
      .maybeSingle();

    const existingContent = (existingProposal?.content as Record<string, unknown>) ?? {};
    const existingSections = (existingContent.sections as unknown[]) ?? [];

    const newSections = sections.map((s, i) => ({
      id: crypto.randomUUID(),
      type: s.section_type as string,
      title: s.title,
      content: s.content,
      order: existingSections.length + i,
    }));

    const mergedSections = [...existingSections, ...newSections];

    await adminClient
      .from("proposals")
      .update({
        content: { ...existingContent, sections: mergedSections },
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposal_id);

    return new Response(
      JSON.stringify({
        success: true,
        sections_generated: sections.length,
        sections: newSections,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: { message } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
