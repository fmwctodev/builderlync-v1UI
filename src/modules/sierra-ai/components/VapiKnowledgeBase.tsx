import { useState, useEffect } from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { vapiApi } from '../services/vapiApi';

interface VapiKnowledgeBaseProps {
  agentId: string;
}

export function VapiKnowledgeBase({ agentId }: VapiKnowledgeBaseProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems([]);
    loadKnowledgeBase();
  }, [agentId]);

  const loadKnowledgeBase = async () => {
    if (!agentId || agentId === 'undefined') return;
    try {
      setLoading(true);
      const response = await vapiApi.getAgentKnowledgeBase(agentId);
      setItems(response?.data?.documents || []);
    } catch (error) {
      console.error('Error loading Vapi knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          No knowledge base items synced to Vapi yet. Add items above to automatically sync them.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Synced to Vapi ({items.length})
          </h3>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item: any) => (
          <div key={item.id || item.document_id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                {item.created_at && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                )}
                {item.type && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {item.type}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
