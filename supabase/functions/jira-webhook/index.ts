import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const payload = await req.json();

    // Log webhook event for debugging
    console.log('Jira webhook received:', payload.webhookEvent);

    // Handle different Jira webhook events
    const eventType = payload.webhookEvent;

    switch (eventType) {
      case 'jira:issue_created':
      case 'jira:issue_updated': {
        await handleIssueEvent(supabase, payload);
        break;
      }

      case 'jira:issue_deleted': {
        await handleIssueDeleted(supabase, payload);
        break;
      }

      case 'comment_created':
      case 'comment_updated': {
        await handleCommentEvent(supabase, payload);
        break;
      }

      default:
        console.log(`Unhandled Jira event type: ${eventType}`);
    }

    // Log to jira_sync_log
    await supabase.from('jira_sync_log').insert({
      sync_type: 'webhook',
      direction: 'pull',
      status: 'success',
      records_processed: 1,
      records_updated: 1,
      metadata: { event_type: eventType, issue_key: payload.issue?.key },
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Jira webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleIssueEvent(supabase: any, payload: any) {
  const issue = payload.issue;
  if (!issue) return;

  const { data: existingTicket } = await supabase
    .from('support_tickets')
    .select('id, ticket_number')
    .eq('jira_issue_id', issue.id)
    .maybeSingle();

  // Find account by reporter email
  const reporterEmail = issue.fields.reporter?.emailAddress;
  let accountId = null;

  if (reporterEmail) {
    const { data: account } = await supabase
      .from('enterprise_accounts')
      .select('id')
      .eq('owner_email', reporterEmail)
      .maybeSingle();

    accountId = account?.id;
  }

  const ticketData = {
    jira_issue_id: issue.id,
    jira_issue_key: issue.key,
    jira_project_key: issue.key.split('-')[0],
    subject: issue.fields.summary,
    description: extractTextFromDescription(issue.fields.description),
    status: mapJiraStatusToTicketStatus(issue.fields.status.name),
    priority: mapJiraPriorityToTicketPriority(issue.fields.priority.name),
    contact_email: reporterEmail || 'unknown@example.com',
    contact_name: issue.fields.reporter?.displayName || null,
    assigned_to: issue.fields.assignee?.emailAddress || null,
    tags: issue.fields.labels || [],
    jira_metadata: {
      status_id: issue.fields.status.id,
      priority_id: issue.fields.priority.id,
    },
    jira_sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (accountId) {
    (ticketData as any).account_id = accountId;
  }

  if (existingTicket) {
    await supabase
      .from('support_tickets')
      .update(ticketData)
      .eq('id', existingTicket.id);
  } else {
    const { count } = await supabase
      .from('support_tickets')
      .select('id', { count: 'exact', head: true });

    const ticketNumber = `TKT-${String((count || 0) + 1).padStart(6, '0')}`;

    await supabase
      .from('support_tickets')
      .insert({
        ...ticketData,
        ticket_number: ticketNumber,
        created_at: issue.fields.created || new Date().toISOString(),
      });
  }
}

async function handleIssueDeleted(supabase: any, payload: any) {
  const issue = payload.issue;
  if (!issue) return;

  await supabase
    .from('support_tickets')
    .update({
      status: 'closed',
      jira_sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
    })
    .eq('jira_issue_id', issue.id);
}

async function handleCommentEvent(supabase: any, payload: any) {
  const comment = payload.comment;
  const issue = payload.issue;

  if (!comment || !issue) return;

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id')
    .eq('jira_issue_id', issue.id)
    .maybeSingle();

  if (!ticket) return;

  const { data: existingComment } = await supabase
    .from('support_ticket_comments')
    .select('id')
    .eq('jira_comment_id', comment.id)
    .maybeSingle();

  const isInternal = comment.visibility?.type === 'role';

  const commentData = {
    ticket_id: ticket.id,
    jira_comment_id: comment.id,
    author_type: 'internal',
    author_name: comment.author?.displayName || 'Unknown',
    author_email: comment.author?.emailAddress || 'unknown@example.com',
    body: extractTextFromDescription(comment.body),
    is_internal_note: isInternal,
    last_synced_at: new Date().toISOString(),
  };

  if (existingComment) {
    await supabase
      .from('support_ticket_comments')
      .update(commentData)
      .eq('id', existingComment.id);
  } else {
    await supabase
      .from('support_ticket_comments')
      .insert({
        ...commentData,
        created_at: comment.created || new Date().toISOString(),
      });
  }
}

function extractTextFromDescription(content: any): string {
  if (!content) return '';

  if (typeof content === 'string') return content;

  if (content.type === 'doc' && content.content) {
    return content.content
      .map((node: any) => {
        if (node.type === 'paragraph' && node.content) {
          return node.content.map((textNode: any) => textNode.text || '').join('');
        }
        return '';
      })
      .join('\n');
  }

  return JSON.stringify(content);
}

function mapJiraStatusToTicketStatus(jiraStatus: string): string {
  const statusMap: Record<string, string> = {
    'To Do': 'open',
    'Open': 'open',
    'In Progress': 'in_progress',
    'Waiting': 'waiting',
    'Waiting for Support': 'waiting',
    'Waiting for Customer': 'waiting',
    'Done': 'resolved',
    'Resolved': 'resolved',
    'Closed': 'closed',
  };

  return statusMap[jiraStatus] || 'open';
}

function mapJiraPriorityToTicketPriority(jiraPriority: string): string {
  const priorityMap: Record<string, string> = {
    'Highest': 'urgent',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
    'Lowest': 'low',
  };

  return priorityMap[jiraPriority] || 'medium';
}
