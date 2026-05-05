import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, BookOpen } from 'lucide-react';
import { KbSearchInput } from '../components/KbSearchInput';

export const KnowledgeBaseTopBar: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  return (
    <header className="h-14 shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-4 px-6">
      <Link
        to={`${orgPrefix}/support`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Support
      </Link>

      <div className="hidden md:flex items-center gap-2 px-3 border-l border-gray-200 dark:border-gray-700">
        <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Knowledge Base</span>
      </div>

      <div className="flex-1 max-w-xl">
        <KbSearchInput size="md" placeholder="Search articles, videos, guides…" />
      </div>

      <Link
        to={`${orgPrefix}/support`}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shrink-0"
      >
        <Mail className="w-4 h-4" />
        Contact Support
      </Link>
    </header>
  );
};
