import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { TemplateBuilder } from '../components/proposals';

export default function TemplateBuilderPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  if (!templateId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 dark:text-gray-400">Template ID not found</div>
      </div>
    );
  }

  return (
    <TemplateBuilder 
      templateId={templateId}
      onClose={() => {
        if (from === 'templates') {
          navigate('/proposals', { state: { activeTab: 'Templates' } });
        } else {
          navigate('/proposals');
        }
      }}
    />
  );
}
