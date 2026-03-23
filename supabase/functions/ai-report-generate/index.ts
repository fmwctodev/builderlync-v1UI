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

function resolveTimeframe(timeframe: { type: string; preset?: string; customStart?: string; customEnd?: string }) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  if (timeframe.type === "custom" && timeframe.customStart && timeframe.customEnd) {
    return { start: timeframe.customStart, end: timeframe.customEnd };
  }

  const preset = timeframe.preset ?? "last_30_days";
  const msPerDay = 86400000;

  const map: Record<string, { start: string; end: string }> = {
    last_7_days: {
      start: new Date(now.getTime() - 7 * msPerDay).toISOString(),
      end: now.toISOString(),
    },
    last_30_days: {
      start: new Date(now.getTime() - 30 * msPerDay).toISOString(),
      end: now.toISOString(),
    },
    this_month: {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end: now.toISOString(),
    },
    last_month: {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
    },
    this_quarter: {
      start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString(),
      end: now.toISOString(),
    },
    last_quarter: (() => {
      const q = Math.floor(now.getMonth() / 3);
      const startMonth = (q - 1) * 3;
      const year = q === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const adjStartMonth = q === 0 ? 9 : startMonth;
      return {
        start: new Date(year, adjStartMonth, 1).toISOString(),
        end: new Date(year, adjStartMonth + 3, 0, 23, 59, 59).toISOString(),
      };
    })(),
    this_year: {
      start: new Date(now.getFullYear(), 0, 1).toISOString(),
      end: now.toISOString(),
    },
  };

  return map[preset] ?? map["last_30_days"];
}

async function queryDataSource(
  adminClient: ReturnType<typeof createClient>,
  source: string,
  orgId: string,
  userId: string,
  scope: string,
  dateRange: { start: string; end: string },
  limit = 500
): Promise<Record<string, unknown>[]> {
  const sourceConfig: Record<string, { table: string; dateField: string; orgField: string; ownerField?: string }> = {
    contacts: { table: "contacts", dateField: "created_at", orgField: "organization_id", ownerField: "owner_id" },
    opportunities: { table: "opportunities", dateField: "created_at", orgField: "organization_id", ownerField: "owner_id" },
    appointments: { table: "appointments", dateField: "created_at", orgField: "organization_id", ownerField: "assigned_user_id" },
    conversations: { table: "conversations", dateField: "created_at", orgField: "organization_id", ownerField: "assigned_user_id" },
    invoices: { table: "invoices", dateField: "created_at", orgField: "organization_id" },
    payments: { table: "payments", dateField: "created_at", orgField: "organization_id" },
    jobs: { table: "jobs", dateField: "created_at", orgField: "organization_id", ownerField: "assigned_to" },
    reviews: { table: "reviews", dateField: "created_at", orgField: "organization_id" },
    form_submissions: { table: "form_submissions", dateField: "submitted_at", orgField: "organization_id" },
  };

  const config = sourceConfig[source];
  if (!config) return [];

  try {
    let query = adminClient
      .from(config.table)
      .select("*")
      .eq(config.orgField, orgId)
      .gte(config.dateField, dateRange.start)
      .lte(config.dateField, dateRange.end)
      .limit(limit);

    if (scope === "my" && config.ownerField) {
      query = query.eq(config.ownerField, userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error querying ${source}:`, error.message);
      return [];
    }
    return (data ?? []) as Record<string, unknown>[];
  } catch {
    return [];
  }
}

function buildCSV(result: Record<string, unknown>): string {
  const kpis = (result.kpis as Array<{ label: string; value: unknown }>) ?? [];
  if (kpis.length === 0) return "";

  const headers = ["Metric", "Value"];
  const rows = kpis.map((k) => [`"${k.label}"`, `"${k.value}"`]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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
    const { prompt, scope, timeframe, parent_report_id, organization_id } = body;

    if (!prompt || !scope || !organization_id) {
      return new Response(JSON.stringify({ success: false, error: { message: "Missing required fields" } }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: reportRow, error: insertError } = await adminClient
      .from("ai_reports")
      .insert({
        organization_id,
        created_by_user_id: user.id,
        scope,
        report_category: "custom",
        report_name: `Report: ${prompt.substring(0, 60)}${prompt.length > 60 ? "..." : ""}`,
        status: "running",
        prompt,
        parent_report_id: parent_report_id ?? null,
      })
      .select()
      .single();

    if (insertError || !reportRow) {
      return new Response(JSON.stringify({ success: false, error: { message: insertError?.message ?? "Failed to create report" } }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reportId = reportRow.id;

    const immediateResponse = new Response(
      JSON.stringify({ success: true, report_id: reportId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    EdgeRuntime.waitUntil(
      (async () => {
        try {
          const dateRange = resolveTimeframe(timeframe);

          const planSystemPrompt = `You are a business intelligence AI that analyzes CRM and operations data.
Given a user's report request, output a structured JSON report plan.

Respond ONLY with valid JSON matching this exact structure:
{
  "type": "report_plan",
  "report_name": "string",
  "report_category": "sales|marketing|ops|reputation|finance|projects|custom",
  "scope": "${scope}",
  "timeframe": { "preset": "string", "start": "${dateRange.start}", "end": "${dateRange.end}" },
  "data_sources": [{ "module": "contacts|opportunities|appointments|conversations|invoices|payments|jobs|reviews|form_submissions", "entities": [], "fields": [] }],
  "aggregations": [{ "metric": "string", "operation": "count|sum|avg|min|max", "field": "string" }],
  "group_bys": [{ "name": "string", "field": "string", "metric": "string", "limit": 10 }],
  "charts": [{ "chart_id": "chart1", "type": "bar|line|pie|area", "series": [{ "label": "string", "metric": "string" }], "x": "string" }],
  "tables": [{ "table_id": "table1", "type": "summary|breakdown", "columns": [], "limit": 20 }],
  "privacy_rules": { "no_raw_rows": true, "top_n_only": true, "max_groups": 10 }
}`;

          const planUserPrompt = `Generate a report plan for: "${prompt}"\n\nScope: ${scope}\nTimeframe: ${dateRange.start} to ${dateRange.end}`;

          const planText = await callAnthropic(planSystemPrompt, planUserPrompt, 2048);

          let plan: Record<string, unknown>;
          try {
            const jsonMatch = planText.match(/\{[\s\S]*\}/);
            plan = JSON.parse(jsonMatch?.[0] ?? planText);
          } catch {
            throw new Error("Failed to parse report plan from AI");
          }

          const dataSources = (plan.data_sources as Array<{ module: string }> ?? []).map((ds) => ds.module);
          const queryResults: Record<string, unknown[]> = {};

          await Promise.all(
            dataSources.map(async (source) => {
              const rows = await queryDataSource(adminClient, source, organization_id, user.id, scope, dateRange);
              queryResults[source] = rows;
            })
          );

          const dataContext = Object.entries(queryResults)
            .map(([source, rows]) => {
              const count = rows.length;
              if (count === 0) return `${source}: no data found in this timeframe`;
              const sample = rows.slice(0, 10);
              return `${source}: ${count} records\nSample (first 10): ${JSON.stringify(sample, null, 2)}`;
            })
            .join("\n\n---\n\n");

          const composeSystemPrompt = `You are a business intelligence AI. Given raw CRM data and a report plan, compose a complete analytics report.

Respond ONLY with valid JSON matching this exact structure:
{
  "type": "report_compose",
  "title": "string",
  "executive_summary": "string (2-4 paragraphs summarizing findings)",
  "kpis": [{ "label": "string", "value": "number or string", "delta_pct": null, "trend": "up|down|flat", "format": "number|currency|percentage" }],
  "charts": [{ "chart_id": "string", "title": "string", "type": "bar|line|pie|area", "config": {}, "data": [{ "name": "string", "value": number }] }],
  "tables": [{ "table_id": "string", "title": "string", "columns": [{ "key": "string", "label": "string", "format": "string" }], "rows": [] }],
  "insights": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"],
  "dashboard_cards": [{ "card_id": "string", "title": "string", "value": "string or number", "trend": "up|down|flat", "delta_pct": null, "category": "string" }]
}

IMPORTANT:
- Base ALL values on the actual data provided
- If a data source has no records, note it in executive_summary and skip related KPIs/charts
- KPI values should be real aggregates from the data (counts, sums, averages)
- Chart data arrays must have real values from the data
- Be specific and factual — do not invent numbers`;

          const composeUserPrompt = `Report Request: "${prompt}"
Scope: ${scope}
Timeframe: ${dateRange.start} to ${dateRange.end}

Data collected:
${dataContext}

Report Plan:
${JSON.stringify(plan, null, 2)}

Generate the complete report composition.`;

          const composeText = await callAnthropic(composeSystemPrompt, composeUserPrompt, 4096);

          let result: Record<string, unknown>;
          try {
            const jsonMatch = composeText.match(/\{[\s\S]*\}/);
            result = JSON.parse(jsonMatch?.[0] ?? composeText);
          } catch {
            throw new Error("Failed to parse report result from AI");
          }

          const csvData = buildCSV(result);
          const reportName = typeof result.title === "string" ? result.title : plan.report_name as string;
          const reportCategory = (plan.report_category as string) ?? "custom";

          await adminClient
            .from("ai_reports")
            .update({
              status: "complete",
              report_name: reportName,
              report_category: reportCategory,
              plan_json: plan,
              result_json: result,
              csv_data: csvData,
              data_sources_used: dataSources,
              timeframe_start: dateRange.start,
              timeframe_end: dateRange.end,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reportId);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error during report generation";
          await adminClient
            .from("ai_reports")
            .update({
              status: "failed",
              error_message: errorMessage,
              updated_at: new Date().toISOString(),
            })
            .eq("id", reportId);
        }
      })()
    );

    return immediateResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(JSON.stringify({ success: false, error: { message } }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
