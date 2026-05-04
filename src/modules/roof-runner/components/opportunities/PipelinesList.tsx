import { useState, useEffect } from 'react';
import { Pencil, Link2, Trash2, Search, Eye } from 'lucide-react';
import { pipelinesApi } from '../../services/pipelinesApi';
import type { PipelineWithStages } from '../../types/opportunities';
import { SeedDataButton } from './SeedDataButton';
import ViewPipelineModal from './ViewPipelineModal';

interface PipelinesListProps {
  onEdit: (pipelineId: string) => void;
  onDelete: (pipelineId: string) => void;
  refreshKey: number;
}

export default function PipelinesList({ onEdit, onDelete, refreshKey }: PipelinesListProps) {
  const [pipelines, setPipelines] = useState<PipelineWithStages[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewPipelineId, setViewPipelineId] = useState<string | null>(null);

  useEffect(() => {
    loadPipelines();
  }, [refreshKey]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const data = await pipelinesApi.getPipelines();
      setPipelines(data);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleViewPipeline = (pipelineId: string) => {
    setViewPipelineId(pipelineId);
    setShowViewModal(true);
  };

  const handleViewModalEdit = (pipelineId: string) => {
    setShowViewModal(false);
    onEdit(pipelineId);
  };

  const handleDeleteClick = async (pipelineId: string, pipelineName: string) => {
    if (confirm(`Are you sure you want to delete the pipeline "${pipelineName}"? This action cannot be undone.`)) {
      try {
        await pipelinesApi.deletePipeline(pipelineId);
        onDelete(pipelineId);
      } catch (error) {
        console.error('Error deleting pipeline:', error);
        alert('Failed to delete pipeline. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading pipelines...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Pipelines</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pipelines help you manage Opportunities step by step, giving you a clear view of progress and sales outcomes.
            </p>
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Link2 className="h-4 w-4 mr-2" />
                    Pipeline Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    # No. of Stages
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    Updated on
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center justify-end">
                    <Search className="h-4 w-4 mr-1" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPipelines.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchTerm
                          ? 'No pipelines found matching your search.'
                          : 'No pipelines created yet.'}
                      </div>
                      {!searchTerm && pipelines.length === 0 && <SeedDataButton />}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {pipeline.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {pipeline.stages?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {pipeline.updated_at
                          ? new Date(pipeline.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }) +
                            ' / ' +
                            new Date(pipeline.updated_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewPipeline(pipeline.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="View pipeline details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(pipeline.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Edit pipeline"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pipeline.id, pipeline.name)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Delete pipeline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredPipelines.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Rows per page: 20
            </div>
            <div className="flex items-center space-x-2">
              <span>1 - {filteredPipelines.length} of {filteredPipelines.length}</span>
              <button className="px-3 py-1 bg-primary-600 text-white rounded-md">1</button>
              <span>Page 1 of 1</span>
            </div>
          </div>
        )}
      </div>
    </div>

    <ViewPipelineModal
      isOpen={showViewModal}
      pipelineId={viewPipelineId}
      onClose={() => {
        setShowViewModal(false);
        setViewPipelineId(null);
      }}
      onEdit={handleViewModalEdit}
    />
  </>
  );
}
