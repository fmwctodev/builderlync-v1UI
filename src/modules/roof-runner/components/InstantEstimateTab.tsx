import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Edit, Copy, Trash2, ChevronLeft, ChevronRight, MapPin, Ruler, Home, Layers, Calendar, DollarSign, Info, Save } from 'lucide-react';
import { apiService } from '../store/services/api';
import type { InstantEstimator } from '../types';
import InstantEstimatorManageModal from './InstantEstimatorManageModal';
import Toast from '../../../shared/components/Toast';

interface InstantEstimateTabProps {
  jobId: number;
  jobAddress: string;
}

const InstantEstimateTab: React.FC<InstantEstimateTabProps> = ({ jobId, jobAddress }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [name, setName] = useState('');
  const [renameName, setRenameName] = useState('');
  const [selectedEstimator, setSelectedEstimator] = useState<InstantEstimator | null>(null);
  const [estimators, setEstimators] = useState<InstantEstimator[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageEstimatorId, setManageEstimatorId] = useState<number | null>(null);
  const [estimatorToDelete, setEstimatorToDelete] = useState<number | null>(null);
  const [materialTemplates, setMaterialTemplates] = useState([]);
  const [businessProfile, setBusinessProfile] = useState<{ friendly_business_name: string; business_logo: string | null } | null>(null);
  const [linkedEstimatorId, setLinkedEstimatorId] = useState<number | null>(null);
  const [linkedEstimator, setLinkedEstimator] = useState<InstantEstimator | null>(null);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [showMaterialTemplateModal, setShowMaterialTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    material_type: 'Asphalt',
    image_url: '',
    lowPitch: '',
    moderatePitch: '',
    steepPitch: '',
    flat: '',
    multiStorySurcharge: ''
  });
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);

  useEffect(() => {
    console.log('InstantEstimateTab loaded for job:', jobId, jobAddress);
  }, [jobId, jobAddress]);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (linkedEstimatorId) {
      fetchLinkedEstimator();
    } else {
      fetchEstimators();
    }

    if (activeTab === 'settings') {
      fetchBusinessProfile();
      fetchMaterialTemplates();
    }
  }, [currentPage, activeTab, linkedEstimatorId]);

  const fetchJobDetails = async () => {
    try {
      console.log('Fetching job details for jobId:', jobId);
      const response = await apiService.getJob(jobId);
      const job = response?.data || response;
      console.log('Fetched job data:', job);

      if (job?.instant_estimate_id || job?.instantEstimateId) {
        setLinkedEstimatorId(job.instant_estimate_id || job.instantEstimateId);
      } else {
        setLinkedEstimatorId(null);
      }

      if (job?.instant_estimator_lead_id || job?.instantEstimatorLeadId) {
        const id = job.instant_estimator_lead_id || job.instantEstimatorLeadId;
        console.log('Found lead link, leadId:', id);
        setLeadId(id);
        fetchLeadDetails(id);
      } else {
        setLeadId(null);
        setLeadData(null);
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    }
  };

  const fetchLinkedEstimator = async () => {
    if (!linkedEstimatorId) return;
    try {
      setLoadingLinked(true);
      const response = await apiService.getInstantEstimator(linkedEstimatorId);
      setLinkedEstimator(response.data || response);
    } catch (error) {
      console.error('Failed to fetch linked estimator:', error);
    } finally {
      setLoadingLinked(false);
    }
  };

  const fetchLeadDetails = async (id: string) => {
    try {
      console.log('Fetching lead details for leadId:', id);
      setLoadingLead(true);
      const response = await apiService.getGeneratedEstimate(id);
      console.log('Fetched lead details response:', response);
      setLeadData(response?.data || response);
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
    } finally {
      setLoadingLead(false);
    }
  };

  const handleSaveLead = async () => {
    if (!leadId || !leadData) return;
    try {
      setLoadingLead(true);
      await apiService.updateLead(leadId, {
        project_details: leadData.estimate.project_details,
        calculations: leadData.estimate.calculations
      });
      setToast({ message: 'Estimate details updated successfully', type: 'success' });
      setIsEditingLead(false);
      fetchLeadDetails(leadId);
    } catch (error) {
      console.error('Failed to update lead:', error);
      setToast({ message: 'Failed to update estimate details', type: 'error' });
    } finally {
      setLoadingLead(false);
    }
  };

  const fetchBusinessProfile = async () => {
    try {
      const response = await apiService.getBusinessProfile();
      setBusinessProfile(response.data || response);
    } catch (error) {
      console.error('Failed to fetch business profile:', error);
    }
  };

  const fetchMaterialTemplates = async () => {
    try {
      const response = await apiService.getMaterialTemplates();
      setMaterialTemplates(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Failed to fetch material templates:', error);
    }
  };

  const handleAddTemplate = async (templateData: any) => {
    try {
      await apiService.addMaterialTemplate(templateData);
      fetchMaterialTemplates();
      setShowMaterialTemplateModal(false);
      setToast({ message: 'Template added successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to add template:', error);
      setToast({ message: 'Failed to add template', type: 'error' });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiService.deleteMaterialTemplate(id);
      fetchMaterialTemplates();
      setToast({ message: 'Template deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to delete template:', error);
      setToast({ message: 'Failed to delete template', type: 'error' });
    }
  };

  const fetchEstimators = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimators(currentPage, limit);
      const responseData = response.data || response;
      setEstimators(Array.isArray(responseData.data) ? responseData.data : []);
      setTotal(responseData.pagination?.total || 0);
      setTotalPages(responseData.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch estimators:', error);
      setEstimators([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await apiService.createInstantEstimator({ name: name.trim() });
      setShowModal(false);
      setName('');
      fetchEstimators();
    } catch (error) {
      console.error('Failed to create estimator:', error);
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !selectedEstimator) return;
    try {
      await apiService.renameInstantEstimator(selectedEstimator.id, { name: renameName.trim() });
      setShowRenameModal(false);
      setRenameName('');
      setSelectedEstimator(null);
      fetchEstimators();
    } catch (error) {
      console.error('Failed to rename estimator:', error);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await apiService.duplicateInstantEstimator(id);
      fetchEstimators();
    } catch (error) {
      console.error('Failed to duplicate estimator:', error);
    }
  };

  const handleDelete = async () => {
    if (!estimatorToDelete) return;
    try {
      await apiService.deleteInstantEstimator(estimatorToDelete);
      setToast({ message: 'Estimator deleted successfully', type: 'success' });
      fetchEstimators();
    } catch (error) {
      console.error('Failed to delete estimator:', error);
      setToast({ message: 'Failed to delete estimator', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setEstimatorToDelete(null);
    }
  };

  const openDeleteModal = (id: number) => {
    setEstimatorToDelete(id);
    setShowDeleteModal(true);
  };

  const openRenameModal = (estimator: InstantEstimator) => {
    setSelectedEstimator(estimator);
    setRenameName(estimator.name);
    setShowRenameModal(true);
  };

  const renderAllTabContent = () => {
    if (loadingLead) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading estimate summary...</p>
        </div>
      );
    }

    if (leadId) {
      if (!leadData) {
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Info className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">Linked to estimate lead #{leadId}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">But could not load the specific estimate details.</p>
            <button
              onClick={() => fetchLeadDetails(leadId!)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        );
      }

      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-red-600" />
                Instant Estimate Summary
              </h2>
              {!isEditingLead ? (
                <button
                  onClick={() => setIsEditingLead(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingLead(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveLead}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Visual Section - Maps & Stats */}
              <div className="lg:col-span-3 space-y-6">
                {/* Property Image Overlay */}
                <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 group h-[300px]">
                  {leadData?.estimate?.calculations?.screenshotUrl ? (
                    <img
                      src={leadData.estimate.calculations.screenshotUrl}
                      alt="Property aerial view"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-700/50 flex flex-col items-center justify-center text-gray-400 italic">
                      <MapPin className="w-12 h-12 mb-2 opacity-20" />
                      <p>No aerial view available</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Property Location</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[300px]">{leadData?.estimate?.customer_info?.address}</p>
                  </div>
                </div>

                {/* Project Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 pt-4">
                  {[
                    { label: 'Building Type', key: 'buildingType', icon: <Home className="w-4 h-4" /> },
                    { label: 'Stories', key: 'stories', icon: <Layers className="w-4 h-4" /> },
                    { label: 'Current Roof', key: 'currentRoof', icon: <Info className="w-4 h-4" /> },
                    { label: 'Age of roof', key: 'ageOfRoof', icon: <Calendar className="w-4 h-4" /> },
                    { label: 'Leaks/Damages', key: 'leaksDamages', icon: <Info className="w-4 h-4" /> },
                    { label: 'Insurance Claim', key: 'insuranceClaim', icon: <Info className="w-4 h-4" /> },
                    { label: 'Desired material', key: 'desiredRoof', icon: <Info className="w-4 h-4" /> },
                    { label: 'Solar', key: 'solar', icon: <Info className="w-4 h-4" /> },
                    { label: 'Timeline', key: 'timeline', icon: <Calendar className="w-4 h-4" /> },
                    { label: 'Financing', key: 'financing', icon: <DollarSign className="w-4 h-4" /> },
                    { label: 'Lead Source', key: 'leadSource', icon: <Info className="w-4 h-4" /> },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        {item.icon}
                        {item.label}
                      </span>
                      {isEditingLead ? (
                        <input
                          type="text"
                          value={leadData?.estimate?.project_details?.[item.key] || '-'}
                          onChange={(e) => setLeadData({
                            ...leadData,
                            estimate: {
                              ...leadData?.estimate,
                              project_details: {
                                ...leadData?.estimate?.project_details,
                                [item.key]: e.target.value
                              }
                            }
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {leadData?.estimate?.project_details?.[item.key] || '-'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes Section */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2">Customer Note</span>
                  {isEditingLead ? (
                    <textarea
                      value={leadData?.estimate?.project_details?.projectDetails || ''}
                      onChange={(e) => setLeadData({
                        ...leadData,
                        estimate: {
                          ...leadData?.estimate,
                          project_details: {
                            ...leadData?.estimate?.project_details,
                            projectDetails: e.target.value
                          }
                        }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                      placeholder="Add customer requirements or notes..."
                    />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 italic">
                      "{leadData?.estimate?.project_details?.projectDetails || 'No specific requirements provided.'}"
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar Stats */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <Ruler className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Total roof size</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Footprint (sqft)</p>
                      {isEditingLead ? (
                        <div className="relative">
                          <input
                            type="number"
                            value={leadData?.estimate?.calculations?.roofArea || 0}
                            onChange={(e) => setLeadData({
                              ...leadData,
                              estimate: {
                                ...leadData?.estimate,
                                calculations: {
                                  ...leadData?.estimate?.calculations,
                                  roofArea: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-2 py-1 text-base font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 outline-none"
                          />
                          <span className="absolute right-2 top-1.5 text-xs text-gray-400">SqFt</span>
                        </div>
                      ) : (
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                          {leadData?.estimate?.calculations?.roofArea?.toLocaleString() || '-'}
                          <span className="text-sm font-normal text-gray-400 ml-1">SqFt</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Pitch</p>
                      <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
                        {leadData?.estimate?.project_details?.roofSteepness || 'N/A'}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Adjusted footprint (sqft)</p>
                      <p className="text-lg font-bold text-gray-400 dark:text-gray-600">
                        {leadData?.estimate?.calculations?.roofArea?.toLocaleString() || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Material Card */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-100 dark:border-red-900/20">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Target Price Estimate</p>
                  <p className="text-3xl font-black text-red-600 dark:text-red-500">
                    ${leadData?.estimate?.calculations?.basePrice?.toLocaleString() || '0'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-red-200/50 dark:border-red-900/30">
                    <p className="text-xs text-red-800 dark:text-red-300 font-medium">{leadData?.estimate?.project_details?.desiredRoof} Material</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Estimate Summary</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
          This job doesn't have an instant estimate summary linked yet. Results from customer-generated estimates will appear here.
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex-shrink-0">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Instant Estimator</h1>
          {/* Hide Add button in job details */}
        </div>

        {/* Hide Tabs in job details block */}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {activeTab === 'all' && (
          <div className="space-y-6">
            {renderAllTabContent()}
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Customer Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer reviews</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Beta</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select Google Reviews you would like to show to your customers to build trust.
                  </p>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to use
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-8 h-8 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Show your Google Reviews to customers
                </p>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect Google Reviews
                </button>
              </div>
            </div>

            {/* Material Options Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Material options</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs. Your customers will have the option to choose the materials they want and will receive estimates based on the information you provide below.
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button className="text-sm text-blue-600 hover:text-blue-700">Materials</button>
                  <button
                    onClick={() => setShowMaterialTemplateModal(true)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NAME</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">LOW</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">MODERATE</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">STEEP</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">FLAT</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialTemplates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No material templates added yet
                          </td>
                        </tr>
                      ) : (
                        materialTemplates.map((template: any) => {
                          const pricing = template.pricing || {};
                          return (
                            <tr key={template.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                  {template.image_url && (
                                    <img src={template.image_url} alt="" className="w-6 h-6 rounded object-cover" />
                                  )}
                                  <span>{template.name}</span>
                                  <span className="text-xs text-gray-500">({template.material_type})</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{pricing.lowPitch || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{pricing.moderatePitch || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{pricing.steepPitch || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{pricing.flat || '-'}</td>
                              <td className="px-4 py-2 text-sm">
                                <button
                                  onClick={() => handleDeleteTemplate(template.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contact information is pulled from your organization's business info. To update, please edit your business info in settings.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company profile
                  </label>
                  <input
                    type="text"
                    value={businessProfile?.friendly_business_name || 'Loading...'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex flex-col items-center">
                      {businessProfile?.business_logo ? (
                        <img
                          src={businessProfile.business_logo}
                          alt={businessProfile.friendly_business_name}
                          className="w-50 h-50 object-contain rounded mb-2"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
                          Logo
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {businessProfile?.friendly_business_name || 'Business Name'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                Save All Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Instant Estimator</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose a name that describes how this estimator will be used (e.g., "Website homepage" or "Direct mailer")
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter estimator name"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Rename Modal */}
      {
        showRenameModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rename Instant Estimator</h3>
                  <button
                    onClick={() => {
                      setShowRenameModal(false);
                      setSelectedEstimator(null);
                      setRenameName('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={renameName}
                    onChange={(e) => setRenameName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#dc2626] focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter new name"
                    onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRenameModal(false);
                      setSelectedEstimator(null);
                      setRenameName('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRename}
                    disabled={!renameName.trim()}
                    className="px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Rename
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Estimator</h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setEstimatorToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this estimator? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setEstimatorToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Material Template Modal */}
      {
        showMaterialTemplateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Material Template</h3>
                  <button
                    onClick={() => setShowMaterialTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="e.g., GAF Timberline HDZ"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Material Type
                      </label>
                      <select
                        value={newTemplate.material_type}
                        onChange={(e) => setNewTemplate({ ...newTemplate, material_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option>Asphalt</option>
                        <option>Metal</option>
                        <option>Tile</option>
                        <option>Slate</option>
                        <option>Wood Shake</option>
                        <option>Synthetic</option>
                        <option>Flat/TPO</option>
                        <option>EPDM</option>
                        <option>Modified Bitumen</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL (optional)
                    </label>
                    <input
                      type="text"
                      value={newTemplate.image_url}
                      onChange={(e) => setNewTemplate({ ...newTemplate, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pricing (per sqft)
                    </label>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Low Pitch</label>
                        <input
                          type="text"
                          value={newTemplate.lowPitch}
                          onChange={(e) => setNewTemplate({ ...newTemplate, lowPitch: e.target.value })}
                          placeholder="-"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Moderate Pitch</label>
                        <input
                          type="text"
                          value={newTemplate.moderatePitch}
                          onChange={(e) => setNewTemplate({ ...newTemplate, moderatePitch: e.target.value })}
                          placeholder="-"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Steep Pitch</label>
                        <input
                          type="text"
                          value={newTemplate.steepPitch}
                          onChange={(e) => setNewTemplate({ ...newTemplate, steepPitch: e.target.value })}
                          placeholder="-"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Flat</label>
                        <input
                          type="text"
                          value={newTemplate.flat}
                          onChange={(e) => setNewTemplate({ ...newTemplate, flat: e.target.value })}
                          placeholder="-"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Multi-story Surcharge</label>
                        <input
                          type="text"
                          value={newTemplate.multiStorySurcharge}
                          onChange={(e) => setNewTemplate({ ...newTemplate, multiStorySurcharge: e.target.value })}
                          placeholder="-"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowMaterialTemplateModal(false)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAddTemplate({
                        name: newTemplate.name,
                        material_type: newTemplate.material_type,
                        image_url: newTemplate.image_url,
                        pricing: {
                          lowPitch: newTemplate.lowPitch,
                          moderatePitch: newTemplate.moderatePitch,
                          steepPitch: newTemplate.steepPitch,
                          flat: newTemplate.flat,
                          multiStorySurcharge: newTemplate.multiStorySurcharge
                        }
                      })}
                      disabled={!newTemplate.name.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Manage Modal */}
      {
        showManageModal && manageEstimatorId && (
          <InstantEstimatorManageModal
            isOpen={showManageModal}
            onClose={() => {
              setShowManageModal(false);
              setManageEstimatorId(null);
            }}
            estimatorId={manageEstimatorId}
            onSaved={fetchEstimators}
          />
        )
      }

      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </div >
  );
};

export default InstantEstimateTab;