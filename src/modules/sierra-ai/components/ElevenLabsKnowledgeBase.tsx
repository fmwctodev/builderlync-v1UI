import { useState, useEffect } from 'react';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { elevenlabsApi } from '../services/elevenlabsApi';

interface ElevenLabsKnowledgeBaseProps {
  agentId: string;
}

export function ElevenLabsKnowledgeBase({ agentId }: ElevenLabsKnowledgeBaseProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledgeBase();
  }, [agentId]);

  const loadKnowledgeBase = async () => {
    if (!agentId) return;
    try {
      setLoading(true);
      const response = await elevenlabsApi.getAgentKnowledgeBase(agentId);
      setItems(response?.data?.documents || []);
    } catch (error) {
      console.error('Error loading ElevenLabs knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          No knowledge base items synced to ElevenLabs yet. Add items above to automatically sync them.
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
            Synced to ElevenLabs ({items.length})
          </h3>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((item: any) => (
          <div key={item.document_id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
