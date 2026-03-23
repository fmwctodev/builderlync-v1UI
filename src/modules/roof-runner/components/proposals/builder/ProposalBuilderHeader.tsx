import React, { useState } from 'react';
import { ArrowLeft, Save, Send, FileDown, Loader2, Check, CreditCard as Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Proposal } from '../../../types/proposalIntegration';

interface ProposalBuilderHeaderProps {
  proposal: Proposal;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => Promise<boolean>;
  onTitleChange: (title: string) => void;
}

export function ProposalBuilderHeader({
  proposal,
  isSaving,
  isDirty,
  onSave,
  onTitleChange,
}: ProposalBuilderHeaderProps) {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(proposal.title);

  const handleTitleSubmit = () => {
    if (titleValue.trim()) {
      onTitleChange(titleValue.trim());
    } else {
      setTitleValue(proposal.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleValue(proposal.title);
      setIsEditingTitle(false);
    }
  };

  const handleBack = async () => {
    if (isDirty) {
      const saved = await onSave();
      if (!saved) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
        if (!confirmed) return;
      }
    }
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold bg-transparent border-b-2 border-primary-500 outline-none text-gray-900 dark:text-white px-1"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-2 group"
              >
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {proposal.title}
                </h1>
                <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : isDirty ? (
              <span className="text-amber-600 dark:text-amber-400">Unsaved changes</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>

          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </header>
  );
}
