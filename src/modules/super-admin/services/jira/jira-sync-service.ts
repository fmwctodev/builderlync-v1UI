import {
  isJiraConfigured,
  getJiraConfig,
  searchJiraIssues,
  getJiraIssue,
  createJiraIssue,
  updateJiraIssue,
  addJiraComment,
  getJiraComments,
  transitionJiraIssue,
  getJiraTransitions,
  mapJiraStatusToTicketStatus,
  mapJiraPriorityToTicketPriority,
  mapTicketStatusToJiraStatus,
  mapTicketPriorityToJiraPriority,
  JiraIssue,
  JiraComment,
} from './jira-client';
import { supabase } from '../supabase-client';

export interface SyncResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
}

export async function syncAllJiraData(): Promise<{
  issues: SyncResult;
  comments: SyncResult;
}> {
  if (!isJiraConfigured()) {
    throw new Error('Jira is not configured');
  }

  await logSyncStart('full', 'pull');

  try {
    const issues = await syncJiraIssues();
    const comments = await syncJiraComments();

    await logSyncComplete('full', 'pull', 'success', { issues, comments });

    return { issues, comments };
  } catch (error: any) {
    await logSyncComplete('full', 'pull', 'error', null, error.message);
    throw error;
  }
}

export async function syncJiraIssues(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    const config = getJiraConfig();

    // Query for issues created in last 90 days or updated recently
    const jql = `project = ${config.projectKey} AND (created >= -90d OR updated >= -7d) ORDER BY updated DESC`;

    const issues = await searchJiraIssues(jql);

    for (const issue of issues) {
      try {
        result.totalProcessed++;
        await syncSingleJiraIssue(issue, result);
      } catch (error: any) {
        result.errors++;
        result.errorMessages?.push(`Issue ${issue.key}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync issues: ${error.message}`);
  }

  return result;
}

async function syncSingleJiraIssue(issue: JiraIssue, result: SyncResult): Promise<void> {
  // Check if ticket already exists
  const { data: existingTicket } = await supabase
    .from('support_tickets')
    .select('id, ticket_number')
    .eq('jira_issue_id', issue.id)
    .maybeSingle();

  // Find or create enterprise account by reporter email
  const accountId = await findAccountByEmail(issue.fields.reporter.emailAddress);

  const ticketData = {
    jira_issue_id: issue.id,
    jira_issue_key: issue.key,
    jira_project_key: issue.key.split('-')[0],
    subject: issue.fields.summary,
    description: extractTextFromJiraContent(issue.fields.description),
    status: mapJiraStatusToTicketStatus(issue.fields.status.name),
    priority: mapJiraPriorityToTicketPriority(issue.fields.priority.name),
    contact_email: issue.fields.reporter.emailAddress,
    contact_name: issue.fields.reporter.displayName,
    assigned_to: issue.fields.assignee?.emailAddress || null,
    tags: issue.fields.labels || [],
    jira_metadata: {
      status_id: issue.fields.status.id,
      priority_id: issue.fields.priority.id,
      custom_fields: extractCustomFields(issue.fields),
    },
    jira_sync_status: 'synced',
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (accountId) {
    (ticketData as any).account_id = accountId;
  }

  if (existingTicket) {
    // Update existing ticket
    await supabase
      .from('support_tickets')
      .update(ticketData)
      .eq('id', existingTicket.id);
    result.updated++;
  } else {
    // Create new ticket
    const ticketNumber = await generateTicketNumber();
    await supabase
      .from('support_tickets')
      .insert({
        ...ticketData,
        ticket_number: ticketNumber,
        created_at: issue.fields.created,
      });
    result.created++;
  }
}

export async function syncJiraComments(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    errorMessages: [],
  };

  try {
    // Get all tickets with Jira issue IDs
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('id, jira_issue_id, jira_issue_key')
      .not('jira_issue_id', 'is', null);

    if (!tickets) return result;

    for (const ticket of tickets) {
      try {
        if (!ticket.jira_issue_key) continue;

        const comments = await getJiraComments(ticket.jira_issue_key);
        result.totalProcessed += comments.length;

        for (const comment of comments) {
          await syncSingleComment(ticket.id, comment, result);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        result.errors++;
        result.errorMessages?.push(`Ticket ${ticket.jira_issue_key}: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.success = false;
    result.errorMessages?.push(`Failed to sync comments: ${error.message}`);
  }

  return result;
}

async function syncSingleComment(ticketId: string, comment: JiraComment, result: SyncResult): Promise<void> {
  const { data: existing } = await supabase
    .from('support_ticket_comments')
    .select('id')
    .eq('jira_comment_id', comment.id)
    .maybeSingle();

  const isInternal = comment.visibility?.type === 'role';

  const commentData = {
    ticket_id: ticketId,
    jira_comment_id: comment.id,
    author_type: 'internal',
    author_name: comment.author.displayName,
    author_email: comment.author.emailAddress,
    body: extractTextFromJiraContent(comment.body),
    is_internal_note: isInternal,
    created_at: comment.created,
    last_synced_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase
      .from('support_ticket_comments')
      .update(commentData)
      .eq('id', existing.id);
    result.updated++;
  } else {
    await supabase
      .from('support_ticket_comments')
      .insert(commentData);
    result.created++;
  }
}

export async function pushTicketToJira(ticketId: string): Promise<string> {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  if (ticket.jira_issue_id) {
    throw new Error('Ticket already synced to Jira');
  }

  const issue = await createJiraIssue({
    summary: ticket.subject,
    description: ticket.description || '',
    issuetype: 'Bug',
    priority: mapTicketPriorityToJiraPriority(ticket.priority),
    labels: ticket.tags || [],
  });

  // Update ticket with Jira IDs
  await supabase
    .from('support_tickets')
    .update({
      jira_issue_id: issue.id,
      jira_issue_key: issue.key,
      jira_project_key: issue.key.split('-')[0],
      jira_sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', ticketId);

  await logSyncComplete('issue', 'push', 'success', { created: 1 });

  return issue.key;
}

export async function updateJiraFromTicket(ticketId: string): Promise<void> {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (!ticket || !ticket.jira_issue_key) {
    throw new Error('Ticket not synced to Jira');
  }

  await updateJiraIssue(ticket.jira_issue_key, {
    summary: ticket.subject,
    description: ticket.description || '',
    priority: mapTicketPriorityToJiraPriority(ticket.priority),
    labels: ticket.tags || [],
  });

  await supabase
    .from('support_tickets')
    .update({
      jira_sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', ticketId);

  await logSyncComplete('issue', 'push', 'success', { updated: 1 });
}

export async function syncTicketStatus(ticketId: string, newStatus: string): Promise<void> {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('jira_issue_key')
    .eq('id', ticketId)
    .single();

  if (!ticket || !ticket.jira_issue_key) {
    return;
  }

  const targetJiraStatus = mapTicketStatusToJiraStatus(newStatus);
  const transitions = await getJiraTransitions(ticket.jira_issue_key);

  const transition = transitions.find(t => t.to.name === targetJiraStatus);

  if (transition) {
    await transitionJiraIssue(ticket.jira_issue_key, transition.id);

    await supabase
      .from('support_tickets')
      .update({
        jira_sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', ticketId);
  }
}

export async function pushCommentToJira(commentId: string): Promise<void> {
  const { data: comment } = await supabase
    .from('support_ticket_comments')
    .select(`
      *,
      support_tickets!inner(jira_issue_key)
    `)
    .eq('id', commentId)
    .single();

  if (!comment || !comment.support_tickets?.jira_issue_key) {
    throw new Error('Cannot sync comment - ticket not linked to Jira');
  }

  const jiraComment = await addJiraComment(
    comment.support_tickets.jira_issue_key,
    comment.body,
    comment.is_internal_note
  );

  await supabase
    .from('support_ticket_comments')
    .update({
      jira_comment_id: jiraComment.id,
      last_synced_at: new Date().toISOString(),
    })
    .eq('id', commentId);
}

async function findAccountByEmail(email: string): Promise<string | null> {
  const { data: account } = await supabase
    .from('enterprise_accounts')
    .select('id')
    .eq('owner_email', email)
    .maybeSingle();

  return account?.id || null;
}

async function generateTicketNumber(): Promise<string> {
  const { count } = await supabase
    .from('support_tickets')
    .select('id', { count: 'exact', head: true });

  const nextNumber = (count || 0) + 1;
  return `TKT-${String(nextNumber).padStart(6, '0')}`;
}

function extractTextFromJiraContent(content: any): string {
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

function extractCustomFields(fields: any): Record<string, any> {
  const customFields: Record<string, any> = {};

  Object.keys(fields).forEach(key => {
    if (key.startsWith('customfield_')) {
      customFields[key] = fields[key];
    }
  });

  return customFields;
}

async function logSyncStart(syncType: string, direction: string): Promise<void> {
  await supabase
    .from('jira_sync_log')
    .insert({
      sync_type: syncType,
      direction: direction,
      status: 'started',
      started_at: new Date().toISOString(),
    });
}

async function logSyncComplete(
  syncType: string,
  direction: string,
  status: string,
  results: any,
  errorMessage?: string
): Promise<void> {
  const recordsProcessed = results?.totalProcessed || results?.created || results?.updated || 0;
  const recordsCreated = results?.created || results?.issues?.created || 0;
  const recordsUpdated = results?.updated || results?.issues?.updated || 0;
  const recordsFailed = results?.errors || results?.issues?.errors || 0;

  await supabase
    .from('jira_sync_log')
    .insert({
      sync_type: syncType,
      direction: direction,
      status: status,
      records_processed: recordsProcessed,
      records_created: recordsCreated,
      records_updated: recordsUpdated,
      records_failed: recordsFailed,
      error_message: errorMessage || null,
      metadata: results || {},
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
}
