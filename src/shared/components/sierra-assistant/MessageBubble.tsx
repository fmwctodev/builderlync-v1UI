import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ExecutionPlanCard } from './ExecutionPlanCard';
import { ExecutionResultCard } from './ExecutionResultCard';
import type { AssistantMessage } from '../../types/sierraAssistant';
import { useSierraAssistant } from '../../context/SierraAssistantContext';

interface Props {
  message: AssistantMessage;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-gray-800 dark:text-gray-100">{line.slice(4)}</h3>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100">{line.slice(3)}</h2>;
        if (line.startsWith('# ')) return <h1 key={i} className="text-sm font-bold text-gray-800 dark:text-gray-100">{line.slice(2)}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <div key={i} className="flex gap-1.5 text-sm">
            <span className="text-gray-400 flex-shrink-0 mt-px">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\. (.*)/);
          if (match) return (
            <div key={i} className="flex gap-1.5 text-sm">
              <span className="text-gray-400 flex-shrink-0 min-w-[1.5rem]">{match[1]}.</span>
              <span>{renderInline(match[2])}</span>
            </div>
          );
        }
        if (line.startsWith('```')) return <div key={i} />;
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export function MessageBubble({ message }: Props) {
  const { confirmPlan, rejectPlan, isLoading } = useSierraAssistant();
  const isUser = message.role === 'user';
  const isError = message.message_type === 'error';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%]">
          <div className="bg-primary-600 text-white rounded-2xl rounded-tr-md px-3.5 py-2.5 text-sm">
            {message.content}
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">{formatTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl rounded-tl-md px-3.5 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{message.content}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  if (message.message_type === 'plan' && message.metadata.actions) {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[95%]">
          <ExecutionPlanCard
            executionRequestId={message.metadata.execution_request_id ?? ''}
            responseToUser={message.content}
            actions={message.metadata.actions}
            intent={message.metadata.intent ?? ''}
            onConfirm={(approvedIds) => confirmPlan(message.metadata.execution_request_id ?? '', approvedIds)}
            onReject={() => rejectPlan(message.metadata.execution_request_id ?? '')}
            isLoading={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1">{formatTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  if (message.message_type === 'execution_result' && message.metadata.results) {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-[95%] space-y-2">
          {message.content && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-gray-800 dark:text-gray-200">
              <MarkdownText content={message.content} />
            </div>
          )}
          <ExecutionResultCard results={message.metadata.results} />
          <p className="text-xs text-gray-400">{formatTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md px-3.5 py-2.5">
          <MarkdownText content={message.content} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{formatTime(message.created_at)}</p>
      </div>
    </div>
  );
}
