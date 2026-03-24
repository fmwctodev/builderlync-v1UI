import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  loadThreads,
  createThread,
  loadMessages,
  loadProfile,
  upsertProfile,
} from '../services/sierraAssistantService';
import { parseSSEStream, buildSSERequest } from '../utils/sierraSSEStream';
import type {
  AssistantThread,
  AssistantMessage,
  AssistantProfile,
  ITSAction,
  ExecutionResult,
  PageContext,
  SSEStreamEvent,
} from '../types/sierraAssistant';

type PanelTab = 'chat' | 'activity' | 'settings';

interface PlanPayload {
  executionRequestId: string;
  messageId: string;
  responseToUser: string;
  actions: ITSAction[];
  intent: string;
}

interface SierraAssistantContextValue {
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  activeTab: PanelTab;
  setActiveTab: (tab: PanelTab) => void;
  threads: AssistantThread[];
  activeThread: AssistantThread | null;
  setActiveThread: (thread: AssistantThread | null) => void;
  messages: AssistantMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  pendingPlan: PlanPayload | null;
  profile: AssistantProfile | null;
  pageContext: PageContext;
  sendMessage: (content: string) => Promise<void>;
  confirmPlan: (executionRequestId: string, approvedActionIds?: string[]) => Promise<void>;
  rejectPlan: (executionRequestId: string) => Promise<void>;
  openWithContext: (module: string, recordId?: string) => void;
  startNewThread: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (updates: Partial<AssistantProfile>) => Promise<void>;
  userId: string | null;
}

const SierraAssistantContext = createContext<SierraAssistantContextValue | null>(null);

export function useSierraAssistant(): SierraAssistantContextValue {
  const ctx = useContext(SierraAssistantContext);
  if (!ctx) throw new Error('useSierraAssistant must be used within SierraAssistantProvider');
  return ctx;
}

export function SierraAssistantProvider({ children }: { children: React.ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('chat');
  const [threads, setThreads] = useState<AssistantThread[]>([]);
  const [activeThread, setActiveThread] = useState<AssistantThread | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [pendingPlan, setPendingPlan] = useState<PlanPayload | null>(null);
  const [profile, setProfile] = useState<AssistantProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const location = useLocation();
  const realtimeRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Derive page context from current route
  const pageContext: PageContext = (() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const module = segments[segments.length - 2];
      const recordId = segments[segments.length - 1];
      if (recordId && recordId.length > 10) {
        return { module, record_id: recordId };
      }
    }
    if (segments.length >= 1) {
      return { module: segments[segments.length - 1] };
    }
    return {};
  })();

  // Init: load user, profile, threads
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted || !user) return;
      setUserId(user.id);

      const [profileData, threadsData] = await Promise.all([
        loadProfile(user.id),
        loadThreads(user.id),
      ]);
      if (!mounted) return;
      setProfile(profileData);
      setThreads(threadsData);

      if (threadsData.length > 0) {
        setActiveThread(threadsData[0]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load messages when active thread changes
  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      return;
    }
    let mounted = true;
    loadMessages(activeThread.id).then(msgs => {
      if (mounted) setMessages(msgs);
    });
    return () => { mounted = false; };
  }, [activeThread?.id]);

  // Realtime subscription on active thread messages
  useEffect(() => {
    if (!activeThread) return;
    if (realtimeRef.current) {
      supabase.removeChannel(realtimeRef.current);
    }
    const channel = supabase
      .channel(`sierra_messages_${activeThread.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'assistant_messages',
        filter: `thread_id=eq.${activeThread.id}`,
      }, (payload) => {
        const newMsg = payload.new as AssistantMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setIsStreaming(false);
        setStreamingContent('');
      })
      .subscribe();
    realtimeRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeThread?.id]);

  // Keyboard shortcut: Cmd+Shift+K / Ctrl+Shift+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setPanelOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const startNewThread = useCallback(async () => {
    if (!userId) return;
    const thread = await createThread(userId, 'New Conversation');
    setThreads(prev => [thread, ...prev]);
    setActiveThread(thread);
    setMessages([]);
    setPendingPlan(null);
  }, [userId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !content.trim()) return;

    let currentThread = activeThread;
    if (!currentThread) {
      currentThread = await createThread(userId, content.slice(0, 50));
      setThreads(prev => [currentThread!, ...prev]);
      setActiveThread(currentThread);
    }

    const optimisticMsg: AssistantMessage = {
      id: `optimistic_${Date.now()}`,
      thread_id: currentThread.id,
      user_id: userId,
      role: 'user',
      content,
      message_type: 'text',
      tool_calls: [],
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setPendingPlan(null);
    setIsLoading(true);
    setIsStreaming(false);
    setStreamingContent('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const request = buildSSERequest(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        session.access_token,
        { thread_id: currentThread.id, message: content, page_context: pageContext }
      );

      const response = await fetch(request);
      if (!response.ok || !response.body) throw new Error('Request failed');

      setIsLoading(false);
      setIsStreaming(true);

      let accumulated = '';
      const reader = response.body.getReader();

      await parseSSEStream(reader, (event: SSEStreamEvent) => {
        if (event.type === 'token') {
          accumulated += event.token;
          setStreamingContent(accumulated);
        } else if (event.type === 'plan') {
          setIsStreaming(false);
          setStreamingContent('');
          setPendingPlan({
            executionRequestId: event.execution_request_id,
            messageId: event.message_id,
            responseToUser: event.response_to_user,
            actions: event.actions,
            intent: event.intent,
          });
          const planMsg: AssistantMessage = {
            id: event.message_id,
            thread_id: currentThread!.id,
            user_id: userId,
            role: 'assistant',
            content: event.response_to_user,
            message_type: 'plan',
            tool_calls: [],
            metadata: {
              execution_request_id: event.execution_request_id,
              actions: event.actions,
              intent: event.intent,
            },
            created_at: new Date().toISOString(),
          };
          setMessages(prev => {
            const withoutOptimistic = prev.filter(m => !m.id.startsWith('optimistic_'));
            if (withoutOptimistic.some(m => m.id === planMsg.id)) return withoutOptimistic;
            return [...withoutOptimistic, planMsg];
          });
        } else if (event.type === 'execution_result') {
          setIsStreaming(false);
          setStreamingContent('');
          const resultMsg: AssistantMessage = {
            id: event.message_id,
            thread_id: currentThread!.id,
            user_id: userId,
            role: 'assistant',
            content: event.summary,
            message_type: event.read_only ? 'text' : 'execution_result',
            tool_calls: [],
            metadata: { results: event.results as ExecutionResult[] },
            created_at: new Date().toISOString(),
          };
          setMessages(prev => {
            const withoutOptimistic = prev.filter(m => !m.id.startsWith('optimistic_'));
            if (withoutOptimistic.some(m => m.id === resultMsg.id)) return withoutOptimistic;
            return [...withoutOptimistic, resultMsg];
          });
        } else if (event.type === 'done') {
          setIsStreaming(false);
          setStreamingContent('');
          if (event.content) {
            const doneMsg: AssistantMessage = {
              id: event.message_id ?? `done_${Date.now()}`,
              thread_id: currentThread!.id,
              user_id: userId,
              role: 'assistant',
              content: event.content,
              message_type: 'text',
              tool_calls: [],
              metadata: {},
              created_at: new Date().toISOString(),
            };
            setMessages(prev => {
              const withoutOptimistic = prev.filter(m => !m.id.startsWith('optimistic_'));
              if (withoutOptimistic.some(m => m.id === doneMsg.id)) return withoutOptimistic;
              return [...withoutOptimistic, doneMsg];
            });
          }
        } else if (event.type === 'error') {
          setIsStreaming(false);
          setStreamingContent('');
          const errMsg: AssistantMessage = {
            id: `error_${Date.now()}`,
            thread_id: currentThread!.id,
            user_id: userId,
            role: 'assistant',
            content: `Something went wrong: ${event.message}`,
            message_type: 'error',
            tool_calls: [],
            metadata: {},
            created_at: new Date().toISOString(),
          };
          setMessages(prev => {
            const withoutOptimistic = prev.filter(m => !m.id.startsWith('optimistic_'));
            return [...withoutOptimistic, errMsg];
          });
        }
      });

      setIsLoading(false);
      setIsStreaming(false);

      // Update thread list order
      setThreads(prev => {
        const updated = prev.map(t =>
          t.id === currentThread!.id ? { ...t, last_message_at: new Date().toISOString() } : t
        );
        return [...updated].sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      });

    } catch (err) {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
      const errMsg: AssistantMessage = {
        id: `error_${Date.now()}`,
        thread_id: currentThread?.id ?? '',
        user_id: userId,
        role: 'assistant',
        content: `Connection error. Please try again.`,
        message_type: 'error',
        tool_calls: [],
        metadata: {},
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev.filter(m => !m.id.startsWith('optimistic_')), errMsg]);
      console.error('Sierra chat error:', err);
    }
  }, [userId, activeThread, pageContext]);

  const confirmPlan = useCallback(async (executionRequestId: string, approvedActionIds?: string[]) => {
    if (!userId || !activeThread) return;
    setIsLoading(true);
    setPendingPlan(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const request = buildSSERequest(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        session.access_token,
        { action: 'confirm', thread_id: activeThread.id, execution_request_id: executionRequestId, approved_action_ids: approvedActionIds }
      );

      const response = await fetch(request);
      if (!response.ok || !response.body) throw new Error('Confirmation failed');

      const reader = response.body.getReader();
      await parseSSEStream(reader, (event: SSEStreamEvent) => {
        if (event.type === 'execution_result') {
          const resultMsg: AssistantMessage = {
            id: event.message_id,
            thread_id: activeThread.id,
            user_id: userId,
            role: 'assistant',
            content: event.summary,
            message_type: 'execution_result',
            tool_calls: [],
            metadata: { results: event.results as ExecutionResult[], execution_request_id: executionRequestId },
            created_at: new Date().toISOString(),
          };
          setMessages(prev => {
            if (prev.some(m => m.id === resultMsg.id)) return prev;
            return [...prev, resultMsg];
          });
        } else if (event.type === 'done') {
          if (event.content) {
            const doneMsg: AssistantMessage = {
              id: event.message_id ?? `done_${Date.now()}`,
              thread_id: activeThread.id,
              user_id: userId,
              role: 'assistant',
              content: event.content,
              message_type: 'text',
              tool_calls: [],
              metadata: {},
              created_at: new Date().toISOString(),
            };
            setMessages(prev => {
              if (prev.some(m => m.id === doneMsg.id)) return prev;
              return [...prev, doneMsg];
            });
          }
        }
      });
    } catch (err) {
      console.error('Confirm plan error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeThread]);

  const rejectPlan = useCallback(async (executionRequestId: string) => {
    if (!userId || !activeThread) return;
    setIsLoading(true);
    setPendingPlan(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const request = buildSSERequest(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        session.access_token,
        { action: 'reject', thread_id: activeThread.id, execution_request_id: executionRequestId }
      );

      const response = await fetch(request);
      if (!response.ok || !response.body) return;
      const reader = response.body.getReader();
      await parseSSEStream(reader, (event: SSEStreamEvent) => {
        if (event.type === 'done' && event.content) {
          const msg: AssistantMessage = {
            id: event.message_id ?? `done_${Date.now()}`,
            thread_id: activeThread.id,
            user_id: userId,
            role: 'assistant',
            content: event.content,
            message_type: 'text',
            tool_calls: [],
            metadata: {},
            created_at: new Date().toISOString(),
          };
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      });
    } catch (err) {
      console.error('Reject plan error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, activeThread]);

  const openWithContext = useCallback((module: string, recordId?: string) => {
    if (userId) {
      createThread(userId, `${module} — ${new Date().toLocaleDateString()}`, module, recordId).then(thread => {
        setThreads(prev => [thread, ...prev]);
        setActiveThread(thread);
        setMessages([]);
      });
    }
    setPanelOpen(true);
    setActiveTab('chat');
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    const p = await loadProfile(userId);
    setProfile(p);
  }, [userId]);

  const saveProfile = useCallback(async (updates: Partial<AssistantProfile>) => {
    if (!userId) return;
    const updated = await upsertProfile(userId, updates);
    setProfile(updated);
  }, [userId]);

  return (
    <SierraAssistantContext.Provider value={{
      panelOpen, setPanelOpen,
      activeTab, setActiveTab,
      threads, activeThread, setActiveThread,
      messages, isLoading, isStreaming, streamingContent,
      pendingPlan, profile, pageContext,
      sendMessage, confirmPlan, rejectPlan,
      openWithContext, startNewThread,
      refreshProfile, saveProfile,
      userId,
    }}>
      {children}
    </SierraAssistantContext.Provider>
  );
}
