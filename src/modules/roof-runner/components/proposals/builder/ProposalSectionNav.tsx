import React from 'react';
import { FileText, List, AlertCircle, ClipboardList, DollarSign } from 'lucide-react';

const sections = [
  { id: 'summary', label: 'Project Summary', icon: FileText },
  { id: 'materials', label: 'Materials & Line Items', icon: List },
  { id: 'assumptions', label: 'Assumptions', icon: AlertCircle },
  { id: 'scope', label: 'Scope of Work', icon: ClipboardList },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
];

export function ProposalSectionNav() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Sections
      </h3>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
          >
            <Icon className="w-4 h-4 text-gray-400" />
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
