import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  crumbs: Crumb[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs }) => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  return (
    <nav className="flex items-center gap-1.5 text-sm flex-wrap">
      <Link
        to={`${orgPrefix}/support/knowledge-base`}
        className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
      >
        <Home className="w-3.5 h-3.5" />
        Knowledge Base
      </Link>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          {c.to ? (
            <Link
              to={c.to}
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              {c.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium truncate">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
