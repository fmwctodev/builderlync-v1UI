export interface AssistantProfile {
  id: string;
  user_id: string;
  confirm_all_writes: boolean;
  system_prompt_override: string | null;
  preferred_name: string | null;
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AssistantThread {
  id: string;
  user_id: string;
  title: string;
  context_module: string | null;
  context_record_id: string | null;
  is_archived: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageType = 'text' | 'plan' | 'execution_result' | 'draft_preview' | 'error' | 'report';

export interface AssistantMessage {
  id: string;
  thread_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  message_type: MessageType;
  tool_calls: unknown[];
  metadata: MessageMetadata;
  created_at: string;
}

export interface MessageMetadata {
  execution_request_id?: string;
  actions?: ITSAction[];
  results?: ExecutionResult[];
  intent?: string;
  rejected?: boolean;
  read_only?: boolean;
  report_id?: string;
}

export interface ITSAction {
  action_id: string;
  action: string;
  module: string;
  payload: Record<string, unknown>;
  depends_on?: string[];
  requires_confirmation?: boolean;
  reason?: string;
}

export interface ITSRequest {
  intent: string;
  response_to_user: string;
  actions: ITSAction[];
  clarification_needed?: string;
  read_only?: boolean;
}

export interface ExecutionResult {
  action_id: string;
  action: string;
  status: 'success' | 'failed' | 'skipped';
  resource_id?: string;
  data?: unknown;
  error?: string;
}

export interface AssistantExecutionRequest {
  id: string;
  thread_id: string;
  message_id: string | null;
  user_id: string;
  actions: ITSAction[];
  results: ExecutionResult[];
  execution_status: 'pending' | 'awaiting_confirmation' | 'confirmed' | 'rejected' | 'executing' | 'completed' | 'failed' | 'partial';
  requires_confirmation: boolean;
  approved_action_ids: string[];
  rejected_action_ids: string[];
  response_to_user: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantActionLog {
  id: string;
  execution_request_id: string | null;
  thread_id: string | null;
  user_id: string;
  action_type: string;
  target_module: string | null;
  resource_id: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  execution_status: 'pending' | 'success' | 'failed' | 'skipped';
  execution_time_ms: number | null;
  error_message: string | null;
  confirmed_by_user: boolean;
  created_at: string;
}

export type SSEEventType = 'token' | 'plan' | 'execution_result' | 'done' | 'error';

export interface SSETokenEvent {
  type: 'token';
  token: string;
}

export interface SSEPlanEvent {
  type: 'plan';
  execution_request_id: string;
  message_id: string;
  response_to_user: string;
  actions: ITSAction[];
  intent: string;
}

export interface SSEExecutionResultEvent {
  type: 'execution_result';
  results: ExecutionResult[];
  summary: string;
  message_id: string;
  read_only?: boolean;
}

export interface SSEDoneEvent {
  type: 'done';
  message_id?: string;
  content?: string;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
}

export type SSEStreamEvent =
  | SSETokenEvent
  | SSEPlanEvent
  | SSEExecutionResultEvent
  | SSEDoneEvent
  | SSEErrorEvent;

export interface PageContext {
  module?: string;
  record_id?: string;
}

export interface SendMessageOptions {
  threadId: string;
  message: string;
  pageContext?: PageContext;
}

export interface ConfirmOptions {
  threadId: string;
  executionRequestId: string;
  approvedActionIds?: string[];
}

export interface RejectOptions {
  threadId: string;
  executionRequestId: string;
}
