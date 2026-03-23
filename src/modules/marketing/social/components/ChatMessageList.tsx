import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import type { SocialAIMessage, SocialAccount, PlatformDraft } from '../types';
import PostDraftCard from './PostDraftCard';

interface ChatMessageListProps {
  messages: SocialAIMessage[];
  accounts: SocialAccount[];
  loading: boolean;
  sending: boolean;
  onPublish: (draft: PlatformDraft, postId: string | undefined, accountIds: string[], mode: 'draft' | 'schedule' | 'post_now', scheduledAt?: string, mediaAssetIds?: string[]) => Promise<void>;
}

function parseDraftBlocks(content: string): { text: string; drafts: PlatformDraft[] } {
  const draftRegex = /---DRAFT---\n([\s\S]*?)\n---END_DRAFT---/g;
  const drafts: PlatformDraft[] = [];
  let text = content;

  let match;
  while ((match = draftRegex.exec(content)) !== null) {
    try {
      const draft = JSON.parse(match[1]);
      drafts.push(draft);
    } catch {
      // ignore malformed draft block
    }
    text = text.replace(match[0], '').trim();
  }

  return { text, drafts };
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MessageText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-semibold text-white mt-1">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <p key={i} className="ml-4 before:content-['•'] before:mr-2 before:text-cyan-500">{line.slice(2)}</p>;
        }
        if (!line) return <br key={i} />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  accounts,
  loading,
  sending,
  onPublish,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-sm">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (!messages.length && !sending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
            <Bot size={28} className="text-cyan-500" />
          </div>
          <h3 className="text-white font-semibold mb-2">Sierra Social AI</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ask me to create social content for any platform, repurpose your existing content, or suggest ideas based on your brand.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {[
              'Create 3 LinkedIn posts about our storm damage services',
              'Repurpose this YouTube video into Instagram content',
              'Write a Google Business post about our 5-star reviews',
            ].map((suggestion) => (
              <button
                key={suggestion}
                className="text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[70%]">
                <div className="bg-cyan-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                  {msg.content}
                </div>
                <p className="text-xs text-slate-600 text-right mt-1">{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          );
        }

        const { text, drafts } = parseDraftBlocks(msg.content);
        const autoDraftIds: string[] = msg.metadata?.auto_draft_ids ?? [];

        return (
          <div key={msg.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={14} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                {text && <MessageText content={text} />}
              </div>
              {drafts.length > 0 && (
                <div className="mt-3 space-y-3">
                  {drafts.map((draft, i) => (
                    <PostDraftCard
                      key={i}
                      draft={draft}
                      existingPostId={autoDraftIds[i]}
                      accounts={accounts}
                      onPublish={onPublish}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600 mt-1 ml-1">{formatRelativeTime(msg.created_at)}</p>
            </div>
          </div>
        );
      })}

      {sending && (
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-cyan-400" />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessageList;
