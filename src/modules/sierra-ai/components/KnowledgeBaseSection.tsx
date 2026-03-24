import { useState, useEffect } from 'react';
import { Globe, Library, HelpCircle, Table, Trash2, File, Link } from 'lucide-react';
import { useAppSelector } from '../../roof-runner/store/hooks';
import { ImportFromUrlModal } from './ImportFromUrlModal';
import { UploadFilesModal } from './UploadFilesModal';
import { AddFAQModal } from './AddFAQModal';
import { AddTableModal } from './AddTableModal';
import { VapiKnowledgeBase } from './VapiKnowledgeBase';
import { mockKbCollections } from '../lib/mockData';
import { knowledgeBaseApi } from '../services/knowledgeBaseApi';

interface KnowledgeBaseSectionProps {
  agentId?: string;
  organizationId?: string;
}

export function KnowledgeBaseSection({ agentId, organizationId }: KnowledgeBaseSectionProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [qaPairs, setQaPairs] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [scrapedWebsites, setScrapedWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAppSelector((state: any) => state.auth);
  const orgId = organizationId && organizationId.includes('-') && organizationId.length > 20
    ? (user?.companySlug || localStorage.getItem('currentOrganizationSlug') || organizationId)
    : (organizationId || user?.companySlug || localStorage.getItem('currentOrganizationSlug') || localStorage.getItem('currentOrganizationId') || '');

  const fetchKnowledgeBaseData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      if (agentId) {
        // Fetch agent-specific knowledge base
        const response = await knowledgeBaseApi.getKnowledgeBaseByAgent(agentId, orgId);
        setQaPairs(response?.data?.qaPairs || []);
        setArticles(response?.data?.articles || []);
        setTables(response?.data?.tables || []);
        setDocuments(response?.data?.documents || []);
        setScrapedWebsites(response?.data?.scrapedWebsites || []);
      } else {
        // Fetch all knowledge base for organization
        const [qaData, articlesData, tablesData, documentsData, scrapedWebsitesData] = await Promise.all([
          knowledgeBaseApi.getQAPairs(orgId),
          knowledgeBaseApi.getArticles(orgId),
          knowledgeBaseApi.getTables(orgId),
          knowledgeBaseApi.getDocuments(orgId),
          knowledgeBaseApi.getScrapedWebsites(orgId)
        ]);

        setQaPairs(qaData?.data || []);
        setArticles(articlesData?.data || []);
        setTables(tablesData?.data || []);
        setDocuments(documentsData?.data || []);
        setScrapedWebsites(scrapedWebsitesData?.data || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge base data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQaPairs([]);
    setArticles([]);
    setTables([]);
    setDocuments([]);
    setScrapedWebsites([]);
    fetchKnowledgeBaseData();
  }, [orgId, agentId]);

  const handleDelete = async (type: string, id: string) => {
    try {
      if (type === 'faq') await knowledgeBaseApi.deleteQAPair(id);
      else if (type === 'article') await knowledgeBaseApi.deleteArticle(id);
      else if (type === 'table') await knowledgeBaseApi.deleteTable(id);
      else if (type === 'document') await knowledgeBaseApi.deleteDocument(id);
      else if (type === 'scrapedWebsite') await knowledgeBaseApi.deleteScrapedWebsite(id);
      fetchKnowledgeBaseData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const allItems = [
    ...qaPairs.map(item => ({ ...item, type: 'faq', icon: HelpCircle, label: 'FAQ' })),
    ...articles.map(item => ({ ...item, type: 'article', icon: item.source_url ? Link : File, label: item.source_url ? 'URL' : 'File' })),
    ...tables.map(item => ({ ...item, type: 'table', icon: Table, label: 'Table' })),
    ...documents.map(item => ({ ...item, type: 'document', icon: File, label: 'Document' })),
    ...scrapedWebsites.map(item => ({ ...item, type: 'scrapedWebsite', icon: Globe, label: 'Scraped Website' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Knowledge Base</h2>
            {agentId && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Auto-syncing to Vapi
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <Globe className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add URL</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <File className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Files</span>
          </button>

          <button
            onClick={() => setShowFAQModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <HelpCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add FAQ</span>
          </button>

          <button
            onClick={() => setShowTableModal(true)}
            className="flex flex-col items-center justify-center w-32 h-32 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
              <Table className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Add Table</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading...</div>
        ) : allItems.length === 0 ? (
          <div className="p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Library className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No knowledge base items found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click one of the buttons above to add items.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {allItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={`${item.type}-${item.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            {item.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {item.type === 'faq' && (
                          <>
                            <div className="flex items-start gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">Q:</span>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.question_pattern}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">A:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.answer}</p>
                            </div>
                          </>
                        )}

                        {item.type === 'article' && (
                          <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {item.title || (item.source_url ? new URL(item.source_url).hostname : 'Untitled')}
                            </p>
                            {item.source_url && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{item.source_url}</p>
                            )}
                          </>
                        )}

                        {item.type === 'table' && (
                          <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.row_count || 0} rows</p>
                          </>
                        )}

                        {item.type === 'document' && (
                          <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{item.title || item.file_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
                            </p>
                          </>
                        )}

                        {item.type === 'scrapedWebsite' && (
                          <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                              {new URL(item.domain_url || item.url).hostname}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">{item.domain_url || item.url}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.type, item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {agentId && (
        <div className="mb-6">
          <VapiKnowledgeBase agentId={agentId} />
        </div>
      )}

      <ImportFromUrlModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        collections={mockKbCollections}
        agentId={agentId}
        onSuccess={() => {
          fetchKnowledgeBaseData();
          setShowImportModal(false);
        }}
      />

      <UploadFilesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        collections={mockKbCollections}
        organizationId={orgId}
        agentId={agentId}
        onSuccess={() => {
          fetchKnowledgeBaseData();
          setShowUploadModal(false);
        }}
      />

      <AddFAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        collections={mockKbCollections}
        organizationId={orgId}
        agentId={agentId}
        onSuccess={() => {
          fetchKnowledgeBaseData();
          setShowFAQModal(false);
        }}
      />

      <AddTableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        collections={mockKbCollections}
        organizationId={orgId}
        agentId={agentId}
        onSuccess={() => {
          fetchKnowledgeBaseData();
          setShowTableModal(false);
        }}
      />
    </div>
  );
}
