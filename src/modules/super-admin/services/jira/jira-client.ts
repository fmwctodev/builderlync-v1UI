export interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description: string;
    status: {
      name: string;
      id: string;
    };
    priority: {
      name: string;
      id: string;
    };
    assignee?: {
      displayName: string;
      emailAddress: string;
    };
    reporter: {
      displayName: string;
      emailAddress: string;
    };
    created: string;
    updated: string;
    resolutiondate?: string;
    labels: string[];
    comment?: {
      comments: JiraComment[];
    };
    [key: string]: any;
  };
}

export interface JiraComment {
  id: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  body: string;
  created: string;
  updated: string;
  visibility?: {
    type: string;
    value: string;
  };
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    name: string;
    id: string;
  };
}

let jiraConfig: JiraConfig | null = null;

export function configureJira(config: JiraConfig): void {
  jiraConfig = config;
}

export function getJiraConfig(): JiraConfig {
  if (!jiraConfig) {
    const domain = import.meta.env.VITE_JIRA_DOMAIN;
    const email = import.meta.env.VITE_JIRA_EMAIL;
    const apiToken = import.meta.env.VITE_JIRA_API_TOKEN;
    const projectKey = import.meta.env.VITE_JIRA_PROJECT_KEY || 'SUPPORT';

    if (!domain || !email || !apiToken) {
      throw new Error('Jira is not configured. Please set VITE_JIRA_DOMAIN, VITE_JIRA_EMAIL, and VITE_JIRA_API_TOKEN in your environment.');
    }

    jiraConfig = { domain, email, apiToken, projectKey };
  }

  return jiraConfig;
}

export function isJiraConfigured(): boolean {
  try {
    getJiraConfig();
    return true;
  } catch {
    return false;
  }
}

function getAuthHeader(): string {
  const config = getJiraConfig();
  const credentials = btoa(`${config.email}:${config.apiToken}`);
  return `Basic ${credentials}`;
}

function getJiraApiUrl(endpoint: string): string {
  const config = getJiraConfig();
  return `https://${config.domain}/rest/api/3${endpoint}`;
}

export async function testJiraConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isJiraConfigured()) {
      return {
        success: false,
        error: 'Jira is not configured. Please set API credentials in environment variables.',
      };
    }

    const config = getJiraConfig();
    const response = await fetch(getJiraApiUrl(`/project/${config.projectKey}`), {
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Failed to connect: ${response.status} ${error}`,
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to Jira',
    };
  }
}

export async function searchJiraIssues(jql: string, fields: string[] = []): Promise<JiraIssue[]> {
  const config = getJiraConfig();

  const defaultFields = [
    'summary',
    'description',
    'status',
    'priority',
    'assignee',
    'reporter',
    'created',
    'updated',
    'resolutiondate',
    'labels',
    'comment',
  ];

  const requestFields = fields.length > 0 ? fields : defaultFields;

  let allIssues: JiraIssue[] = [];
  let startAt = 0;
  const maxResults = 100;
  let hasMore = true;

  while (hasMore) {
    const url = getJiraApiUrl('/search');
    const body = JSON.stringify({
      jql,
      startAt,
      maxResults,
      fields: requestFields,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jira API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    allIssues = allIssues.concat(data.issues || []);

    hasMore = data.startAt + data.maxResults < data.total;
    startAt += maxResults;

    // Rate limiting: wait 100ms between requests
    if (hasMore) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allIssues;
}

export async function getJiraIssue(issueIdOrKey: string): Promise<JiraIssue> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}`);

  const response = await fetch(url, {
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Jira issue: ${response.status} ${error}`);
  }

  return await response.json();
}

export async function createJiraIssue(fields: {
  summary: string;
  description: string;
  issuetype: string;
  priority?: string;
  labels?: string[];
  customFields?: Record<string, any>;
}): Promise<JiraIssue> {
  const config = getJiraConfig();
  const url = getJiraApiUrl('/issue');

  const issueData: any = {
    fields: {
      project: { key: config.projectKey },
      summary: fields.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: fields.description,
              },
            ],
          },
        ],
      },
      issuetype: { name: fields.issuetype },
    },
  };

  if (fields.priority) {
    issueData.fields.priority = { name: fields.priority };
  }

  if (fields.labels && fields.labels.length > 0) {
    issueData.fields.labels = fields.labels;
  }

  if (fields.customFields) {
    Object.assign(issueData.fields, fields.customFields);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issueData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Jira issue: ${response.status} ${error}`);
  }

  const result = await response.json();
  return await getJiraIssue(result.key);
}

export async function updateJiraIssue(issueIdOrKey: string, fields: {
  summary?: string;
  description?: string;
  priority?: string;
  labels?: string[];
}): Promise<void> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}`);

  const updateData: any = { fields: {} };

  if (fields.summary) {
    updateData.fields.summary = fields.summary;
  }

  if (fields.description) {
    updateData.fields.description = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: fields.description,
            },
          ],
        },
      ],
    };
  }

  if (fields.priority) {
    updateData.fields.priority = { name: fields.priority };
  }

  if (fields.labels) {
    updateData.fields.labels = fields.labels;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update Jira issue: ${response.status} ${error}`);
  }
}

export async function getJiraTransitions(issueIdOrKey: string): Promise<JiraTransition[]> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}/transitions`);

  const response = await fetch(url, {
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get transitions: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.transitions || [];
}

export async function transitionJiraIssue(issueIdOrKey: string, transitionId: string): Promise<void> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}/transitions`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transition: { id: transitionId },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to transition issue: ${response.status} ${error}`);
  }
}

export async function addJiraComment(issueIdOrKey: string, body: string, isInternal: boolean = false): Promise<JiraComment> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}/comment`);

  const commentData: any = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: body,
            },
          ],
        },
      ],
    },
  };

  if (isInternal) {
    commentData.visibility = {
      type: 'role',
      value: 'Administrators',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add comment: ${response.status} ${error}`);
  }

  return await response.json();
}

export async function getJiraComments(issueIdOrKey: string): Promise<JiraComment[]> {
  const url = getJiraApiUrl(`/issue/${issueIdOrKey}/comment`);

  const response = await fetch(url, {
    headers: {
      'Authorization': getAuthHeader(),
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get comments: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.comments || [];
}

export function mapJiraStatusToTicketStatus(jiraStatus: string): string {
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

export function mapTicketStatusToJiraStatus(ticketStatus: string): string {
  const statusMap: Record<string, string> = {
    'open': 'To Do',
    'in_progress': 'In Progress',
    'waiting': 'Waiting',
    'resolved': 'Done',
    'closed': 'Closed',
  };

  return statusMap[ticketStatus] || 'To Do';
}

export function mapJiraPriorityToTicketPriority(jiraPriority: string): string {
  const priorityMap: Record<string, string> = {
    'Highest': 'urgent',
    'High': 'high',
    'Medium': 'medium',
    'Low': 'low',
    'Lowest': 'low',
  };

  return priorityMap[jiraPriority] || 'medium';
}

export function mapTicketPriorityToJiraPriority(ticketPriority: string): string {
  const priorityMap: Record<string, string> = {
    'urgent': 'Highest',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
  };

  return priorityMap[ticketPriority] || 'Medium';
}
