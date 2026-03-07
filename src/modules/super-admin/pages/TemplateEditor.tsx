import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TemplateBuilder } from '../../roof-runner/components/proposals';

export const TemplateEditor: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();

  if (!templateId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Template Editor</h1>
        <p className="text-sm text-red-600">Template ID is missing.</p>
      </div>
    );
  }

  return (
    <TemplateBuilder
      templateId={templateId}
      onClose={() => navigate('/super-admin/templates')}
    />
  );
};
