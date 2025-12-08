import React, { useState, useEffect } from 'react';
import { Plus, Folder, Search } from 'lucide-react';
import { snippetsApi, Snippet, SnippetFolder } from '../../../shared/services/snippetsApi';
import { SnippetsPanel } from '../components/conversations/SnippetsPanel';

export function Snippets() {
  const [showPanel, setShowPanel] = useState(true);

  return (
    <div className="h-full">
      <SnippetsPanel
        isOpen={showPanel}
        onClose={() => {}} // Don't allow closing on this page
        onSelectSnippet={(snippet) => {
          console.log('Selected snippet:', snippet);
        }}
      />
    </div>
  );
}
