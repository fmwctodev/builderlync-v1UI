import React, { useState, useMemo } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getCategoriesBySection, SECTIONS } from '../data';

export const KnowledgeBaseSidebar: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const location = useLocation();
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';
  const groups = useMemo(() => getCategoriesBySection(), []);

  // Auto-expand the section that contains the active category; default-collapse others
  const activeCategorySlug = location.pathname.match(
    /\/support\/knowledge-base\/([^/]+)/,
  )?.[1];
  const activeSection = useMemo(() => {
    if (!activeCategorySlug) return null;
    for (const g of groups) {
      if (g.categories.some((c) => c.slug === activeCategorySlug)) return g.sectionId;
    }
    return null;
  }, [groups, activeCategorySlug]);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const init = new Set<string>();
    // Default-expand the first section + the active one
    if (groups[0]) init.add(groups[0].sectionId);
    if (activeSection) init.add(activeSection);
    return init;
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <nav className="w-72 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
      <div className="p-4 space-y-2">
        {groups.map((group) => {
          const sectionMeta = SECTIONS.find((s) => s.id === group.sectionId);
          if (!sectionMeta) return null;
          const isOpen = expandedSections.has(group.sectionId);
          return (
            <div key={group.sectionId}>
              <button
                type="button"
                onClick={() => toggleSection(group.sectionId)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>{sectionMeta.name}</span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              {isOpen && (
                <ul className="mt-1 space-y-0.5">
                  {group.categories.map((c) => {
                    const Icon = c.icon;
                    return (
                      <li key={c.slug}>
                        <NavLink
                          to={`${orgPrefix}/support/knowledge-base/${c.slug}`}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{c.name}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
