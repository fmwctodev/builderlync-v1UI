import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import ThreadSidebar from '../components/ThreadSidebar';
import ChatMessageList from '../components/ChatMessageList';
import ChatInput from '../components/ChatInput';
import ChatMediaSettings from '../components/ChatMediaSettings';
import ChatMediaTracker, { type TrackedJob } from '../components/ChatMediaTracker';
import {
  getThreads,
  getThreadMessages,
  createThread,
  archiveThread,
  deleteThread,
  sendMessage,
  publishDraftFromChat,
} from '../services/socialChat';
import { getSocialAccounts } from '../services/socialAccounts';
import { getAccountGroups } from '../services/socialAccountGroups';
import type {
  SocialAIThread,
  SocialAIMessage,
  SocialAccount,
  SocialAccountGroup,
  PlatformDraft,
  MediaPreferences,
  SocialAIMessageType,
  SocialAIAttachment,
} from '../types';

interface SocialChatProps {
  orgId: string;
  userId: string;
}

const DEFAULT_MEDIA_PREFS: MediaPreferences = {
  auto_generate_media: true,
  video_mode: 'std',
  aspect_ratio: '9:16',
};

const SocialChat: React.FC<SocialChatProps> = ({ orgId, userId }) => {
  const [threads, setThreads] = useState<SocialAIThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SocialAIMessage[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [groups, setGroups] = useState<SocialAccountGroup[]>([]);
  const [mediaJobs, setMediaJobs] = useState<TrackedJob[]>([]);
  const [mediaPrefs, setMediaPrefs] = useState<MediaPreferences>(DEFAULT_MEDIA_PREFS);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [orgId, userId]);

  useEffect(() => {
    if (!activeThreadId) return;
    loadMessages(activeThreadId);
  }, [activeThreadId]);

  const loadInitialData = async () => {
    setLoadingThreads(true);
    try {
      const [t, a, g] = await Promise.all([
        getThreads(orgId, userId),
        getSocialAccounts(orgId),
        getAccountGroups(orgId),
      ]);
      setThreads(t);
      setAccounts(a);
      setGroups(g);
      if (t.length > 0) setActiveThreadId(t[0].id);
    } catch (err) {
      console.error('Failed to load chat data', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    setLoadingMessages(true);
    try {
      const msgs = await getThreadMessages(threadId);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewThread = async () => {
    try {
      const thread = await createThread(orgId, userId);
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setMessages([]);
      setMediaJobs([]);
    } catch (err) {
      console.error('Failed to create thread', err);
    }
  };

  const handleArchiveThread = async (id: string) => {
    await archiveThread(id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const next = threads.find((t) => t.id !== id);
      setActiveThreadId(next?.id ?? null);
    }
  };

  const handleDeleteThread = async (id: string) => {
    await deleteThread(id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      const next = threads.find((t) => t.id !== id);
      setActiveThreadId(next?.id ?? null);
    }
  };

  const handleSend = useCallback(
    async (content: string, msgType?: SocialAIMessageType, attachments?: SocialAIAttachment[]) => {
      let threadId = activeThreadId;

      if (!threadId) {
        const thread = await createThread(orgId, userId);
        setThreads((prev) => [thread, ...prev]);
        setActiveThreadId(thread.id);
        threadId = thread.id;
      }

      setSending(true);
      try {
        const result = await sendMessage(threadId, content, msgType, attachments, mediaPrefs);
        setMessages((prev) => [...prev, result.userMessage, result.aiMessage]);
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, updated_at: new Date().toISOString(), title: content.slice(0, 60) } : t
          )
        );
        if (result.mediaJobs?.length) {
          setMediaJobs((prev) => [
            ...prev,
            ...result.mediaJobs.map((j) => ({ ...j, status: 'pending' as const })),
          ]);
        }
      } catch (err) {
        console.error('Send failed', err);
      } finally {
        setSending(false);
      }
    },
    [activeThreadId, orgId, userId, mediaPrefs]
  );

  const handlePublish = useCallback(
    async (
      draft: PlatformDraft,
      existingPostId: string | undefined,
      accountIds: string[],
      mode: 'draft' | 'schedule' | 'post_now',
      scheduledAt?: string,
      mediaAssetIds?: string[]
    ) => {
      await publishDraftFromChat({
        orgId,
        userId,
        draft,
        accountIds,
        mode,
        scheduledAtUtc: scheduledAt,
        mediaAssetIds,
        threadId: activeThreadId ?? undefined,
        existingPostId,
      });
    },
    [orgId, userId, activeThreadId]
  );

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        loading={loadingThreads}
        onSelect={(id) => {
          setActiveThreadId(id);
          setMediaJobs([]);
        }}
        onNew={handleNewThread}
        onArchive={handleArchiveThread}
        onDelete={handleDeleteThread}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-sm font-medium text-slate-200">
            {threads.find((t) => t.id === activeThreadId)?.title ?? 'New conversation'}
          </h2>
          <button
            onClick={handleNewThread}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg transition-colors"
          >
            <Plus size={13} />
            New chat
          </button>
        </div>

        <ChatMessageList
          messages={messages}
          accounts={accounts}
          loading={loadingMessages}
          sending={sending}
          onPublish={handlePublish}
        />

        <ChatMediaTracker jobs={mediaJobs} onJobsUpdated={setMediaJobs} />
        <ChatMediaSettings prefs={mediaPrefs} onChange={setMediaPrefs} />
        <ChatInput
          onSend={handleSend}
          sending={sending}
          disabled={!orgId}
        />
      </div>
    </div>
  );
};

export default SocialChat;
