import React, { useState, useEffect } from 'react';
import { BarChart, Grid, Thermometer, Star, Plus, Loader2 } from 'lucide-react';
import AddCompetitorModal, { CompetitorFormData } from './AddCompetitorModal';
import CompetitorCard from './CompetitorCard';
import {
  getCompetitors,
  addCompetitor,
  updateCompetitor,
  deleteCompetitor,
  Competitor,
} from '../../../../shared/store/services/competitorsApi';

const CompetitorAnalysisTab: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_COMPETITORS = 3;

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCompetitors();
      setCompetitors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitors');
      console.error('Error loading competitors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompetitor = async (formData: CompetitorFormData) => {
    try {
      if (formData.id) {
        await updateCompetitor(formData.id, formData);
      } else {
        await addCompetitor(formData);
      }
      await loadCompetitors();
      setIsModalOpen(false);
      setEditingCompetitor(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setIsModalOpen(true);
  };

  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this competitor?')) {
      return;
    }

    try {
      await deleteCompetitor(id);
      await loadCompetitors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete competitor');
    }
  };

  const handleOpenModal = () => {
    setEditingCompetitor(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompetitor(null);
  };

  const canAddMore = competitors.length < MAX_COMPETITORS;

  return (
    <div className="p-6">
      <AddCompetitorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddCompetitor}
        editingCompetitor={
          editingCompetitor
            ? {
                id: editingCompetitor.id,
                company_name: editingCompetitor.company_name,
                website_url: editingCompetitor.website_url || '',
                google_business_url: editingCompetitor.google_business_url || '',
                facebook_url: editingCompetitor.facebook_url || '',
                yelp_url: editingCompetitor.yelp_url || '',
                notes: editingCompetitor.notes || '',
              }
            : null
        }
      />

      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics Chart</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">Compare Your Business With Competitors</p>
            <p className="text-sm text-gray-500 mb-4">
              You can add up to 3 Competitors ({competitors.length}/{MAX_COMPETITORS} added)
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            disabled={!canAddMore}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            title={canAddMore ? 'Add competitor' : 'Maximum competitors reached'}
          >
            <Plus size={20} />
            Competitor
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Compare your business's online reputation with top competitors across Google, Yelp, Facebook, and more.
          Uncover insights that help you stand out and win trust.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-gray-500">Loading competitors...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <>
          {competitors.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Competitors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {competitors.map((competitor) => (
                  <CompetitorCard
                    key={competitor.id}
                    competitor={competitor}
                    onEdit={handleEditCompetitor}
                    onDelete={handleDeleteCompetitor}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart size={48} className="mx-auto mb-2" />
                <p>Analytics Chart Placeholder</p>
                {competitors.length === 0 && (
                  <p className="text-sm mt-2">Add competitors to start comparing</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Insights You Can't Ignore 🚀
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <BarChart size={20} className="text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Score</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get a detailed breakdown of your website's performance load time, mobile optimisation, and web vitals
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Grid size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Competitive Grid</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Competitive Grid</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visualize and compare key reputation metrics in one easy grid. Build unlimited reports to monitor and outperform
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Thermometer size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Sentiment Heat-map</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sentiment Heat-map</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Quickly visualize customer sentiment by category. Use this to fine-tune your messaging and customer experience
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star size={20} className="text-yellow-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Rating by Source</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating by Source</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See how your ratings differ by platform. Identify trends and discover which channels need attention to improve your reputation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisTab;