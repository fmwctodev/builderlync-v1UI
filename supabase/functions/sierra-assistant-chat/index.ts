import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ============================================================
// Types
// ============================================================
interface ITSAction {
  action_id: string;
  action: string;
  module: string;
  payload: Record<string, unknown>;
  depends_on?: string[];
  requires_confirmation?: boolean;
  reason?: string;
}

interface ITSRequest {
  intent: string;
  response_to_user: string;
  actions: ITSAction[];
  clarification_needed?: string;
  read_only?: boolean;
}

interface ExecutionResult {
  action_id: string;
  action: string;
  status: "success" | "failed" | "skipped";
  resource_id?: string;
  data?: unknown;
  error?: string;
}

// ============================================================
// System prompt builder
// ============================================================
function buildSystemPrompt(
  userName: string,
  currentDate: string,
  shortTermMemories: Array<{ memory_key: string; memory_value: string; category: string }>,
  semanticMemories: Array<{ content: string; memory_type: string }>,
  confirmAllWrites: boolean,
  systemPromptOverride?: string,
  pageContext?: { module?: string; record_id?: string }
): string {
  const shortTermBlock = shortTermMemories.length > 0
    ? shortTermMemories.map(m => `[${m.category}] ${m.memory_key}: ${m.memory_value}`).join("\n")
    : "No memories stored yet.";

  const semanticBlock = semanticMemories.length > 0
    ? semanticMemories.map(m => `[${m.memory_type}] ${m.content}`).join("\n")
    : "No semantic memories yet.";

  const pageContextBlock = pageContext?.module
    ? `Current page: ${pageContext.module}${pageContext.record_id ? ` (record: ${pageContext.record_id})` : ""}`
    : "No specific page context.";

  const confirmNote = confirmAllWrites
    ? "ALWAYS present a confirmation plan for ALL write actions before executing. Never execute writes without confirmation."
    : "You may execute low-risk writes (create_task, remember) without confirmation, but always confirm destructive or high-value actions.";

  return `You are Sierra, an AI executive assistant built into BuilderLynk — a roofing and construction business management platform. You help ${userName} manage their business efficiently by answering questions, retrieving data, and taking actions on their behalf.

TODAY'S DATE: ${currentDate}

## YOUR CAPABILITIES
You can read data (contacts, opportunities, jobs, appointments, tasks, proposals) and write data (create contacts, move opportunities, schedule appointments, create tasks, draft proposals). You can also send emails and SMS, and remember important facts about the user's preferences.

## RESPONSE FORMAT
You MUST respond in one of two formats:

**FORMAT A — Pure Conversation** (no actions needed):
Respond with plain text. Use markdown for formatting. Be concise and helpful.

**FORMAT B — ITS Action Request** (when actions are needed):
Respond with a JSON object ONLY — no markdown fences, no surrounding text:
{
  "intent": "brief description of what you're doing",
  "response_to_user": "friendly message to show the user (may include markdown)",
  "actions": [
    {
      "action_id": "a1",
      "action": "ACTION_TYPE",
      "module": "MODULE_NAME",
      "payload": { ...fields },
      "depends_on": [],
      "requires_confirmation": true,
      "reason": "why this action is needed"
    }
  ],
  "read_only": false
}

## AVAILABLE ACTION TYPES

### Write Actions (always require confirmation unless confirmAllWrites is off):
- create_contact: {first_name, last_name, email?, phone?, company?}
- update_contact: {contact_id, ...fields}
- create_opportunity: {opportunity_name, value?, pipeline_id?, stage_id?, source?}
- move_opportunity: {opportunity_id, stage_id, reason?}
- create_task: {title, description?, due_date?, assigned_to?, opportunity_id?}
- update_task: {task_id, ...fields}
- create_event: {title, appointment_time, end_time, contact_id?, location?, notes?}
- update_event: {event_id, ...fields}
- cancel_event: {event_id, reason?}
- draft_email: {to, subject, body, contact_id?}
- send_email: {to, subject, body, contact_id?}
- send_sms: {to_phone, message, contact_id?}
- remember: {key, value, category}
- store_memory: {content, memory_type}

### Read Actions (no confirmation needed, read_only: true):
- query_contacts: {search?, limit?}
- query_opportunities: {status?, stage_id?, limit?}
- query_schedule: {date_from?, date_to?, limit?}
- query_tasks: {status?, assigned_to?, limit?}
- query_jobs: {status?, contact_id?, limit?}
- query_analytics: {metric, date_from?, date_to?}

## BEHAVIORAL RULES
1. ${confirmNote}
2. For read-only queries, set read_only: true and requires_confirmation: false on all actions.
3. Use depends_on to chain actions (e.g. create_contact before create_opportunity for that contact).
4. Use action_id values like "a1", "a2", etc. Reference them in depends_on arrays.
5. NEVER fabricate contact IDs, opportunity IDs, or stage IDs — only use values from query results.
6. When the user asks for a "report" or analytics, use query_analytics with the appropriate metric.
7. Be proactive: if the user says "follow up with John", offer to create both a task and a calendar event.
8. Keep response_to_user concise and friendly. Avoid technical jargon in user-facing messages.
9. If you need clarification, include clarification_needed in your JSON and keep actions empty.
10. Always infer dates relative to TODAY'S DATE: ${currentDate}.
11. Phone numbers should be formatted as E.164 (+1XXXXXXXXXX).
12. If a query returns no results, say so clearly — do not invent data.
13. For draft_email, never auto-send — always present for review first.
14. Use remember action to store facts about the user's preferences for future conversations.
15. Format currency values as numbers (not strings): 15000, not "$15,000".
16. When creating appointments, end_time defaults to start_time + 1 hour if not specified.

## SHORT-TERM MEMORIES (Key facts about ${userName}):
${shortTermBlock}

## LONG-TERM MEMORIES (Semantic context):
${semanticBlock}

## PAGE CONTEXT:
${pageContextBlock}

${systemPromptOverride ? `## CUSTOM INSTRUCTIONS FROM ${userName.toUpperCase()}:\n${systemPromptOverride}` : ""}`;
}

// ============================================================
// Parse ITS JSON from LLM response
// ============================================================
function parseITSFromLLM(content: string): ITSRequest | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) return null;
    const jsonStr = trimmed.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonStr);
    if (!parsed.intent || !Array.isArray(parsed.actions)) return null;
    return parsed as ITSRequest;
  } catch {
    return null;
  }
}

// ============================================================
// Execute a single action
// ============================================================
async function executeAction(
  action: ITSAction,
  supabase: ReturnType<typeof createClient>,
  userId: string,
  resolvedIds: Map<string, string>
): Promise<ExecutionResult> {
  const start = Date.now();
  const payload = { ...action.payload };

  // Resolve dependency IDs
  if (action.depends_on) {
    for (const depId of action.depends_on) {
      const resolved = resolvedIds.get(depId);
      if (resolved) {
        // inject resolved id into payload fields that reference parent
        for (const key of Object.keys(payload)) {
          if (String(payload[key]) === depId) {
            payload[key] = resolved;
          }
        }
      }
    }
  }

  try {
    switch (action.action) {
      case "create_contact": {
        const { data, error } = await supabase.from("contacts").insert({
          user_id: userId,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          phone: payload.phone,
          full_name: `${payload.first_name ?? ""} ${payload.last_name ?? ""}`.trim(),
          company: payload.company,
        }).select("id").single();
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: data.id };
      }

      case "update_contact": {
        const { contact_id, ...fields } = payload;
        const { error } = await supabase.from("contacts").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", contact_id).eq("user_id", userId);
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(contact_id) };
      }

      case "create_opportunity": {
        const { data, error } = await supabase.from("opportunities").insert({
          user_id: userId,
          opportunity_name: payload.opportunity_name,
          value: payload.value,
          pipeline_id: payload.pipeline_id,
          stage_id: payload.stage_id,
          source: payload.source,
          status: "open",
        }).select("id").single();
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(data.id) };
      }

      case "move_opportunity": {
        const { error } = await supabase.from("opportunities").update({ stage_id: payload.stage_id, updated_at: new Date().toISOString() }).eq("id", payload.opportunity_id).eq("user_id", userId);
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(payload.opportunity_id) };
      }

      case "create_task": {
        const { data, error } = await supabase.from("opportunity_tasks").insert({
          user_id: userId,
          opportunity_id: payload.opportunity_id,
          title: payload.title,
          description: payload.description,
          due_date: payload.due_date,
          assigned_to: payload.assigned_to ?? userId,
          status: "pending",
          priority: payload.priority ?? "medium",
        }).select("id").single();
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: data.id };
      }

      case "update_task": {
        const { task_id, ...fields } = payload;
        const { error } = await supabase.from("opportunity_tasks").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", task_id).eq("user_id", userId);
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(task_id) };
      }

      case "create_event": {
        const appointmentTime = new Date(String(payload.appointment_time));
        const endTime = payload.end_time
          ? new Date(String(payload.end_time))
          : new Date(appointmentTime.getTime() + 60 * 60 * 1000);
        const { data, error } = await supabase.from("appointments").insert({
          owner_id: userId,
          contact_id: payload.contact_id,
          title: payload.title,
          appointment_time: appointmentTime.toISOString(),
          end_time: endTime.toISOString(),
          location: payload.location,
          notes: payload.notes,
          status: "scheduled",
        }).select("id").single();
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: data.id };
      }

      case "update_event": {
        const { event_id, ...fields } = payload;
        const { error } = await supabase.from("appointments").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", event_id).eq("owner_id", userId);
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(event_id) };
      }

      case "cancel_event": {
        const { error } = await supabase.from("appointments").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", payload.event_id).eq("owner_id", userId);
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", resource_id: String(payload.event_id) };
      }

      case "draft_email": {
        return {
          action_id: action.action_id, action: action.action, status: "success",
          resource_id: `draft_${Date.now()}`,
          data: { to: payload.to, subject: payload.subject, body: payload.body, contact_id: payload.contact_id, is_draft: true },
        };
      }

      case "remember": {
        const { error } = await supabase.from("assistant_user_memory").upsert({
          user_id: userId,
          memory_key: payload.key,
          memory_value: payload.value,
          category: payload.category ?? "general",
          last_accessed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,memory_key" });
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success" };
      }

      case "store_memory": {
        const { error } = await supabase.from("sierra_memories").insert({
          user_id: userId,
          content: payload.content,
          memory_type: payload.memory_type ?? "general",
          importance_score: 1.0,
        });
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success" };
      }

      case "query_contacts": {
        let query = supabase.from("contacts").select("id, full_name, first_name, last_name, email, phone, company").eq("user_id", userId);
        if (payload.search) {
          query = query.or(`full_name.ilike.%${payload.search}%,email.ilike.%${payload.search}%,phone.ilike.%${payload.search}%`);
        }
        const { data, error } = await query.limit(Number(payload.limit ?? 20));
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", data };
      }

      case "query_opportunities": {
        let query = supabase.from("opportunities").select("id, opportunity_name, value, status, stage_id, pipeline_id, created_at").eq("user_id", userId);
        if (payload.status) query = query.eq("status", payload.status);
        if (payload.stage_id) query = query.eq("stage_id", payload.stage_id);
        const { data, error } = await query.order("created_at", { ascending: false }).limit(Number(payload.limit ?? 20));
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", data };
      }

      case "query_schedule": {
        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const dateFrom = String(payload.date_from ?? now);
        const dateTo = String(payload.date_to ?? futureDate);
        const { data, error } = await supabase.from("appointments")
          .select("id, title, appointment_time, end_time, location, status, contact_id")
          .eq("owner_id", userId)
          .gte("appointment_time", dateFrom)
          .lte("appointment_time", dateTo)
          .order("appointment_time", { ascending: true })
          .limit(Number(payload.limit ?? 20));
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", data };
      }

      case "query_tasks": {
        let query = supabase.from("opportunity_tasks").select("id, title, description, status, priority, due_date, assigned_to, opportunity_id").eq("user_id", userId);
        if (payload.status) query = query.eq("status", payload.status);
        const { data, error } = await query.order("due_date", { ascending: true }).limit(Number(payload.limit ?? 20));
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", data };
      }

      case "query_jobs": {
        const { data, error } = await supabase.from("opportunities")
          .select("id, opportunity_name, value, status, stage_id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(Number(payload.limit ?? 20));
        if (error) throw error;
        return { action_id: action.action_id, action: action.action, status: "success", data };
      }

      case "query_analytics": {
        const metric = String(payload.metric ?? "opportunities");
        if (metric === "opportunities" || metric === "pipeline") {
          const { data, error } = await supabase.from("opportunities")
            .select("id, value, status, stage_id, created_at")
            .eq("user_id", userId);
          if (error) throw error;
          const total = data?.length ?? 0;
          const totalValue = data?.reduce((s: number, o: { value?: number }) => s + (o.value ?? 0), 0) ?? 0;
          return { action_id: action.action_id, action: action.action, status: "success", data: { total_opportunities: total, total_value: totalValue, records: data } };
        }
        if (metric === "contacts") {
          const { count, error } = await supabase.from("contacts").select("*", { count: "exact", head: true }).eq("user_id", userId);
          if (error) throw error;
          return { action_id: action.action_id, action: action.action, status: "success", data: { total_contacts: count } };
        }
        if (metric === "appointments") {
          const { data, error } = await supabase.from("appointments").select("id, title, appointment_time, status").eq("owner_id", userId);
          if (error) throw error;
          return { action_id: action.action_id, action: action.action, status: "success", data: { total_appointments: data?.length ?? 0, records: data } };
        }
        return { action_id: action.action_id, action: action.action, status: "success", data: { metric, note: "No data available for this metric" } };
      }

      default:
        return { action_id: action.action_id, action: action.action, status: "skipped", error: `Unknown action: ${action.action}` };
    }
  } catch (err) {
    return {
      action_id: action.action_id,
      action: action.action,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ============================================================
// Build SSE response
// ============================================================
function sseStream(body: string): Response {
  return new Response(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// ============================================================
// Main handler
// ============================================================
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { thread_id, message, action, execution_request_id, approved_action_ids } = body;

    // ---- Handle confirmation ----
    if (action === "confirm" && execution_request_id) {
      const { data: execReq, error: execErr } = await supabase
        .from("assistant_execution_requests")
        .select("*")
        .eq("id", execution_request_id)
        .eq("user_id", user.id)
        .single();

      if (execErr || !execReq) {
        return new Response(JSON.stringify({ error: "Execution request not found" }), { status: 404, headers: corsHeaders });
      }

      const allActions: ITSAction[] = execReq.actions;
      const approvedIds: string[] = approved_action_ids ?? allActions.map((a: ITSAction) => a.action_id);
      const actionsToRun = allActions.filter((a: ITSAction) => approvedIds.includes(a.action_id));

      await supabase.from("assistant_execution_requests").update({ execution_status: "executing" }).eq("id", execution_request_id);

      const results: ExecutionResult[] = [];
      const resolvedIds = new Map<string, string>();

      for (const act of actionsToRun) {
        const result = await executeAction(act, supabase, user.id, resolvedIds);
        results.push(result);
        if (result.resource_id) resolvedIds.set(act.action_id, result.resource_id);

        await supabase.from("assistant_action_logs").insert({
          execution_request_id,
          thread_id,
          user_id: user.id,
          action_type: act.action,
          target_module: act.module,
          resource_id: result.resource_id,
          payload: act.payload,
          result: result.data ?? {},
          execution_status: result.status,
          error_message: result.error,
          confirmed_by_user: true,
        });
      }

      const allSucceeded = results.every(r => r.status === "success");
      const anyFailed = results.some(r => r.status === "failed");
      const finalStatus = allSucceeded ? "completed" : anyFailed ? "partial" : "completed";

      await supabase.from("assistant_execution_requests").update({
        execution_status: finalStatus,
        results,
        approved_action_ids: approvedIds,
        updated_at: new Date().toISOString(),
      }).eq("id", execution_request_id);

      const successCount = results.filter(r => r.status === "success").length;
      const failCount = results.filter(r => r.status === "failed").length;
      let summary = `Done! ${successCount} action${successCount !== 1 ? "s" : ""} completed successfully.`;
      if (failCount > 0) summary += ` ${failCount} failed.`;

      const { data: savedMsg } = await supabase.from("assistant_messages").insert({
        thread_id,
        user_id: user.id,
        role: "assistant",
        content: summary,
        message_type: "execution_result",
        metadata: { execution_request_id, results },
      }).select("id").single();

      await supabase.from("assistant_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id);

      let output = sseEvent("execution_result", { results, summary, message_id: savedMsg?.id });
      output += sseEvent("done", { message_id: savedMsg?.id });
      output += "data: [DONE]\n\n";
      return sseStream(output);
    }

    // ---- Handle rejection ----
    if (action === "reject" && execution_request_id) {
      await supabase.from("assistant_execution_requests").update({
        execution_status: "rejected",
        updated_at: new Date().toISOString(),
      }).eq("id", execution_request_id).eq("user_id", user.id);

      const { data: savedMsg } = await supabase.from("assistant_messages").insert({
        thread_id,
        user_id: user.id,
        role: "assistant",
        content: "Got it — I've cancelled those actions.",
        message_type: "text",
        metadata: { execution_request_id, rejected: true },
      }).select("id").single();

      let output = sseEvent("done", { message_id: savedMsg?.id });
      output += "data: [DONE]\n\n";
      return sseStream(output);
    }

    // ---- Handle chat message ----
    if (!message || !thread_id) {
      return new Response(JSON.stringify({ error: "message and thread_id are required" }), { status: 400, headers: corsHeaders });
    }

    // Persist user message
    const { data: userMsg } = await supabase.from("assistant_messages").insert({
      thread_id,
      user_id: user.id,
      role: "user",
      content: message,
      message_type: "text",
    }).select("id").single();

    // Load profile
    const { data: profile } = await supabase
      .from("assistant_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Load short-term memories
    const { data: shortTermMemories } = await supabase
      .from("assistant_user_memory")
      .select("memory_key, memory_value, category")
      .eq("user_id", user.id)
      .order("importance_score", { ascending: false })
      .limit(20);

    // Load conversation history
    const { data: history } = await supabase
      .from("assistant_messages")
      .select("role, content")
      .eq("thread_id", thread_id)
      .order("created_at", { ascending: true })
      .limit(40);

    // Build conversation for Anthropic (exclude last user message, added separately)
    const conversationHistory = (history ?? [])
      .filter((m: { role: string; content: string }) => !(m.role === "user" && m.content === message))
      .slice(-38)
      .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Resolve user display name
    const userName = user.email?.split("@")[0] ?? "there";

    const systemPrompt = buildSystemPrompt(
      userName,
      new Date().toISOString().split("T")[0],
      shortTermMemories ?? [],
      [],
      profile?.confirm_all_writes ?? true,
      profile?.system_prompt_override,
      body.page_context
    );

    // Call Anthropic with streaming
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      let output = sseEvent("error", { message: "ANTHROPIC_API_KEY not configured" });
      output += "data: [DONE]\n\n";
      return sseStream(output);
    }

    const anthropicMessages = [
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        temperature: 0.2,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      }),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      let output = sseEvent("error", { message: `Anthropic error: ${errText}` });
      output += "data: [DONE]\n\n";
      return sseStream(output);
    }

    // Stream and accumulate the response
    const reader = anthropicResponse.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let outputSSE = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const event = JSON.parse(data);
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              const token = event.delta.text;
              fullContent += token;
              outputSSE += sseEvent("token", { token });
            }
          } catch {
            // skip malformed events
          }
        }
      }
    }

    // Parse ITS from accumulated content
    const itsRequest = parseITSFromLLM(fullContent);

    if (itsRequest && itsRequest.actions.length > 0) {
      const hasWriteActions = itsRequest.actions.some(a => !a.action.startsWith("query_"));
      const confirmAllWrites = profile?.confirm_all_writes ?? true;
      const requiresConfirmation = hasWriteActions && (confirmAllWrites || itsRequest.actions.some(a => a.requires_confirmation));

      if (requiresConfirmation && !itsRequest.read_only) {
        // Store execution request
        const { data: execReq } = await supabase.from("assistant_execution_requests").insert({
          thread_id,
          user_id: user.id,
          actions: itsRequest.actions,
          execution_status: "awaiting_confirmation",
          requires_confirmation: true,
          response_to_user: itsRequest.response_to_user,
        }).select("id").single();

        const { data: savedMsg } = await supabase.from("assistant_messages").insert({
          thread_id,
          user_id: user.id,
          role: "assistant",
          content: itsRequest.response_to_user,
          message_type: "plan",
          metadata: { execution_request_id: execReq?.id, actions: itsRequest.actions, intent: itsRequest.intent },
        }).select("id").single();

        await supabase.from("assistant_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id);

        outputSSE += sseEvent("plan", {
          execution_request_id: execReq?.id,
          message_id: savedMsg?.id,
          response_to_user: itsRequest.response_to_user,
          actions: itsRequest.actions,
          intent: itsRequest.intent,
        });
        outputSSE += "data: [DONE]\n\n";
        return sseStream(outputSSE);
      }

      // Auto-execute read-only or low-risk actions
      const { data: execReq } = await supabase.from("assistant_execution_requests").insert({
        thread_id,
        user_id: user.id,
        actions: itsRequest.actions,
        execution_status: "executing",
        requires_confirmation: false,
        response_to_user: itsRequest.response_to_user,
      }).select("id").single();

      const results: ExecutionResult[] = [];
      const resolvedIds = new Map<string, string>();

      for (const act of itsRequest.actions) {
        const result = await executeAction(act, supabase, user.id, resolvedIds);
        results.push(result);
        if (result.resource_id) resolvedIds.set(act.action_id, result.resource_id);

        await supabase.from("assistant_action_logs").insert({
          execution_request_id: execReq?.id,
          thread_id,
          user_id: user.id,
          action_type: act.action,
          target_module: act.module,
          resource_id: result.resource_id,
          payload: act.payload,
          result: result.data ?? {},
          execution_status: result.status,
          error_message: result.error,
          confirmed_by_user: false,
        });
      }

      const allSucceeded = results.every(r => r.status === "success");
      await supabase.from("assistant_execution_requests").update({
        execution_status: allSucceeded ? "completed" : "partial",
        results,
        updated_at: new Date().toISOString(),
      }).eq("id", execReq?.id);

      // Second LLM pass to summarize results for read queries
      let finalResponse = itsRequest.response_to_user;
      if (itsRequest.read_only && results.length > 0) {
        const summaryData = results.map(r => ({ action: r.action, data: r.data }));
        try {
          const summaryResp = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 1024,
              temperature: 0.3,
              messages: [{
                role: "user",
                content: `Original question: "${message}"\n\nQuery results: ${JSON.stringify(summaryData)}\n\nPlease provide a concise, friendly natural language summary of these results in response to the original question. Use markdown for formatting if helpful.`,
              }],
            }),
          });
          if (summaryResp.ok) {
            const summaryData2 = await summaryResp.json();
            finalResponse = summaryData2.content?.[0]?.text ?? finalResponse;
          }
        } catch {
          // fall back to original response
        }
      }

      const { data: savedMsg } = await supabase.from("assistant_messages").insert({
        thread_id,
        user_id: user.id,
        role: "assistant",
        content: finalResponse,
        message_type: itsRequest.read_only ? "text" : "execution_result",
        metadata: { execution_request_id: execReq?.id, results, intent: itsRequest.intent },
      }).select("id").single();

      await supabase.from("assistant_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id);

      outputSSE += sseEvent("execution_result", { results, summary: finalResponse, message_id: savedMsg?.id, read_only: itsRequest.read_only });
      outputSSE += "data: [DONE]\n\n";
      return sseStream(outputSSE);
    }

    // Pure conversational response
    const { data: savedMsg } = await supabase.from("assistant_messages").insert({
      thread_id,
      user_id: user.id,
      role: "assistant",
      content: fullContent,
      message_type: "text",
    }).select("id").single();

    await supabase.from("assistant_threads").update({ last_message_at: new Date().toISOString() }).eq("id", thread_id);

    outputSSE += sseEvent("done", { message_id: savedMsg?.id, content: fullContent });
    outputSSE += "data: [DONE]\n\n";
    return sseStream(outputSSE);

  } catch (err) {
    console.error("sierra-assistant-chat error:", err);
    let output = sseEvent("error", { message: err instanceof Error ? err.message : String(err) });
    output += "data: [DONE]\n\n";
    return sseStream(output);
  }
});
