import React, { useEffect, useRef, useState } from 'react';
import { Send, Plus, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';
import { MessageBubble } from './MessageBubble';

const SUGGESTED_PROMPTS = [
  "What's on my schedule today?",
  "Show me open opportunities",
  "Create a follow-up task for my last contact",
  "How many contacts do I have?",
  "Draft a follow-up email for a lead",
];

export function SierraAssistantChatView() {
  const {
    threads,
    activeThread,
    setActiveThread,
    messages,
    isLoading,
    isStreaming,
    streamingContent,
    sendMessage,
    startNewThread,
    userId,
  } = useSierraAssistant();

  const [input, setInput] = useState('');
  const [threadDropdownOpen, setThreadDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThreadDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isStreaming) return;
    setInput('');
    await sendMessage(trimmed);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const isBusy = isLoading || isStreaming;
  const showEmpty = messages.length === 0 && !isStreaming && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {/* Thread selector */}
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <div className="relative flex-1" ref={dropdownRef}>
          <button
            onClick={() => setThreadDropdownOpen(!threadDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="truncate">{activeThread?.title ?? 'No conversation'}</span>
            <ChevronDown size={12} className="flex-shrink-0 text-gray-400" />
          </button>

          {threadDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              {threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => { setActiveThread(thread); setThreadDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    activeThread?.id === thread.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="truncate font-medium">{thread.title}</div>
                  <div className="text-gray-400 mt-0.5">
                    {new Date(thread.last_message_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {threads.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">No conversations yet</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={startNewThread}
          title="New conversation"
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {showEmpty && userId && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <Sparkles size={22} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">How can I help?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Ask me anything about your contacts, schedule, pipeline, or let me take action for you.
            </p>
            <div className="flex flex-col gap-1.5 w-full">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 transition-colors border border-gray-100 dark:border-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator */}
        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200">
              {streamingContent}
              <span className="inline-block w-1.5 h-3.5 bg-gray-400 dark:bg-gray-500 ml-0.5 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {/* Loading dots */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className={`flex items-end gap-2 rounded-xl border transition-colors ${
          isBusy
            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus-within:border-primary-500 dark:focus-within:border-primary-400'
        }`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isBusy ? 'Sierra is thinking...' : 'Ask Sierra anything...'}
            disabled={isBusy}
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none max-h-32 overflow-y-auto"
            style={{ minHeight: '2.5rem' }}
          />
          <button
            onClick={handleSend}
            disabled={isBusy || !input.trim()}
            className="flex-shrink-0 m-1.5 p-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 text-white disabled:text-gray-400 transition-colors"
          >
            {isBusy
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1.5 text-center">
          Sierra can make mistakes. Verify important actions.
        </p>
      </div>
    </div>
  );
}
