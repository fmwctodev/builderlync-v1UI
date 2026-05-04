import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Copy, QrCode, Code, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';
import { instantEstimatorSettingsApi } from '../services/instantEstimatorSettingsApi';
import Toast from '../../../shared/components/Toast';
import { StagingBanner } from '../components/common';
import MaterialsTable from '../components/estimator/MaterialsTable';
import MaterialFormModal from '../components/estimator/MaterialFormModal';
import ContactCardPreview from '../components/estimator/ContactCardPreview';
import { useCurrentOrganization } from '../../../shared/context/OrgContext';
import type {
  InstantEstimatorMaterial,
  CreateMaterialData,
  OrganizationProfile,
  StaffMember,
} from '../types/instantEstimatorSettings';

const InstantEstimatorManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentOrganization } = useCurrentOrganization();
  const [estimatorName, setEstimatorName] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);

  const [materials, setMaterials] = useState<InstantEstimatorMaterial[]>([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<InstantEstimatorMaterial | null>(null);

  const [restrictMaterials, setRestrictMaterials] = useState(false);
  const [pricingType, setPricingType] = useState<'per-square-foot' | 'per-square'>('per-square-foot');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [lowerRange, setLowerRange] = useState('0');
  const [upperRange, setUpperRange] = useState('0');
  const [termLength, setTermLength] = useState('1');
  const [interestRate, setInterestRate] = useState('0');
  const [financingLink, setFinancingLink] = useState('');

  const [defaultJobOwnerId, setDefaultJobOwnerId] = useState<string>('');
  const [schedulingLink, setSchedulingLink] = useState('');
  const [showCustomerReviews, setShowCustomerReviews] = useState(false);
  const [showProjectShowcase, setShowProjectShowcase] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEstimatorData();
  }, [id]);

  useEffect(() => {
    if (currentOrganization?.id && id) {
      fetchMaterials();
      fetchOrganizationData();
      fetchEstimatorConfig();
    }
  }, [currentOrganization?.id, id]);

  const fetchEstimatorData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimator(parseInt(id));
      if (response && response.data) {
        setEstimatorName(response.data.name);
        setPublicUrl(response.data.public_url || '');
        setSelectedQuestions(response.data.questions || []);

        const pricingSettings = response.data.pricing_settings || {};
        setRestrictMaterials(pricingSettings.restrict_materials || false);
        setPricingType(pricingSettings.pricing_type || 'per-square-foot');
        setShowPriceRange(pricingSettings.show_price_range || false);
        setShowFinancing(pricingSettings.show_financing || false);
        setLowerRange(pricingSettings.lower_range || '0');
        setUpperRange(pricingSettings.upper_range || '0');
        setTermLength(pricingSettings.term_length || '1');
        setInterestRate(pricingSettings.interest_rate || '0');

        const additionalSettings = response.data.additional_settings || {};
        setShowProjectShowcase(additionalSettings.show_project_showcase || false);
        setShowSocialMedia(additionalSettings.show_social_media || false);
      } else {
        setEstimatorName('Estimator Not Found');
      }
    } catch (error) {
      console.error('Failed to fetch estimator:', error);
      try {
        const listResponse = await apiService.getInstantEstimators();
        const responseData = listResponse.data || listResponse;
        const estimators = Array.isArray(responseData.data) ? responseData.data : responseData;
        const estimator = estimators.find((est: any) => est.id.toString() === id);
        if (estimator) {
          setEstimatorName(estimator.name);
        } else {
          setEstimatorName('Estimator Not Found');
        }
      } catch (fallbackError) {
        console.error('Fallback fetch failed:', fallbackError);
        setEstimatorName('Error Loading Estimator');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    if (!currentOrganization?.id || !id) return;
    try {
      const data = await instantEstimatorSettingsApi.getMaterials(currentOrganization.id, id);
      setMaterials(data);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    }
  };

  const fetchOrganizationData = async () => {
    if (!currentOrganization?.id) return;
    try {
      setLoadingProfile(true);
      const [profile, staff] = await Promise.all([
        instantEstimatorSettingsApi.getOrganizationProfile(currentOrganization.id),
        instantEstimatorSettingsApi.getStaffMembers(currentOrganization.id),
      ]);
      setOrganizationProfile(profile);
      setStaffMembers(staff);
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchEstimatorConfig = async () => {
    if (!currentOrganization?.id || !id) return;
    try {
      const config = await instantEstimatorSettingsApi.getEstimatorConfig(currentOrganization.id, id);
      if (config) {
        setDefaultJobOwnerId(config.default_job_owner_id || '');
        setSchedulingLink(config.scheduling_link || '');
        setFinancingLink(config.financing_link || '');
        setShowCustomerReviews(config.show_customer_reviews);
        setShowProjectShowcase(config.show_project_showcase);
        setShowSocialMedia(config.show_social_media);

        if (config.pricing_settings) {
          setRestrictMaterials(config.pricing_settings.restrict_materials);
          setPricingType(config.pricing_settings.pricing_type);
          setShowPriceRange(config.pricing_settings.show_price_range);
          setShowFinancing(config.pricing_settings.show_financing);
          setLowerRange(config.pricing_settings.lower_range);
          setUpperRange(config.pricing_settings.upper_range);
          setTermLength(config.pricing_settings.term_length);
          setInterestRate(config.pricing_settings.interest_rate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch estimator config:', error);
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !id) return;
    try {
      await apiService.renameInstantEstimator(parseInt(id), { name: renameName.trim() });
      setEstimatorName(renameName.trim());
      setShowRenameModal(false);
      setRenameName('');
    } catch (error) {
      console.error('Failed to rename estimator:', error);
    }
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (material: InstantEstimatorMaterial) => {
    setEditingMaterial(material);
    setShowMaterialModal(true);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await instantEstimatorSettingsApi.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      setToast({ message: 'Material deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to delete material:', error);
      setToast({ message: 'Failed to delete material', type: 'error' });
    }
  };

  const handleSaveMaterial = async (materialData: CreateMaterialData) => {
    if (!currentOrganization?.id || !id) return;
    try {
      if (editingMaterial) {
        const updated = await instantEstimatorSettingsApi.updateMaterial(editingMaterial.id, materialData);
        setMaterials((prev) => prev.map((m) => (m.id === editingMaterial.id ? updated : m)));
        setToast({ message: 'Material updated successfully', type: 'success' });
      } else {
        const created = await instantEstimatorSettingsApi.createMaterial(
          currentOrganization.id,
          id,
          materialData
        );
        setMaterials((prev) => [...prev, created]);
        setToast({ message: 'Material added successfully', type: 'success' });
      }
      setShowMaterialModal(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Failed to save material:', error);
      setToast({ message: 'Failed to save material', type: 'error' });
    }
  };

  const saveAllSettings = async () => {
    if (!id || !currentOrganization?.id) return;
    try {
      await instantEstimatorSettingsApi.upsertEstimatorConfig(currentOrganization.id, id, {
        default_job_owner_id: defaultJobOwnerId || null,
        scheduling_link: schedulingLink || null,
        financing_link: financingLink || null,
        show_customer_reviews: showCustomerReviews,
        show_project_showcase: showProjectShowcase,
        show_social_media: showSocialMedia,
        pricing_settings: {
          restrict_materials: restrictMaterials,
          pricing_type: pricingType,
          show_price_range: showPriceRange,
          show_financing: showFinancing,
          lower_range: lowerRange,
          upper_range: upperRange,
          term_length: termLength,
          interest_rate: interestRate,
        },
      });

      await apiService.updateInstantEstimatorPricingSettings(parseInt(id), {
        restrict_materials: restrictMaterials,
        pricing_type: pricingType,
        show_price_range: showPriceRange,
        show_financing: showFinancing,
        lower_range: lowerRange,
        upper_range: upperRange,
        term_length: termLength,
        interest_rate: interestRate,
      });

      await apiService.updateInstantEstimatorAdditionalSettings(parseInt(id), {
        show_project_showcase: showProjectShowcase,
        show_social_media: showSocialMedia,
      });

      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-paper dark:bg-canvas">
      <StagingBanner variant="estimator" />
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/instant-estimator')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all estimators
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {loading ? 'Loading...' : estimatorName || 'Estimator'}
          </h1>
          {!loading && (
            <Edit
              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={() => {
                setRenameName(estimatorName);
                setShowRenameModal(true);
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveAllSettings}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Save All
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share and embed</h2>

            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <input
                type="text"
                value={`${window.location.origin}/estimator/${publicUrl}`}
                readOnly
                className="flex-1 bg-transparent text-gray-600 dark:text-gray-300 text-sm"
              />
              <button
                onClick={async () => {
                  const url = `${window.location.origin}/estimator/${publicUrl}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    setToast({ message: 'Link copied to clipboard!', type: 'success' });
                  } catch {
                    const textArea = document.createElement('textarea');
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setToast({ message: 'Link copied to clipboard!', type: 'success' });
                  }
                }}
                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy link
              </button>
            </div>

            <div className="flex gap-4">
              <button disabled className="flex items-center gap-2 text-gray-400 cursor-not-allowed text-sm">
                <Edit className="w-4 h-4" />
                Edit link
              </button>
              <button disabled className="flex items-center gap-2 text-gray-400 cursor-not-allowed text-sm">
                <QrCode className="w-4 h-4" />
                QR code
              </button>
              <button disabled className="flex items-center gap-2 text-gray-400 cursor-not-allowed text-sm">
                <Code className="w-4 h-4" />
                Embed code
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead questionnaire</h2>
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage/questions`)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Manage questions
              </button>
            </div>

            <div className="mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Questions ({selectedQuestions.length})
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {selectedQuestions.length > 0
                ? selectedQuestions.map((q) => q.name || q).join(', ')
                : 'No questions selected'}
            </p>
          </div>

          <MaterialsTable
            materials={materials}
            onAdd={handleAddMaterial}
            onEdit={handleEditMaterial}
            onDelete={handleDeleteMaterial}
            pricingType={pricingType}
          />

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pricing settings</h2>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restrictMaterials}
                  onChange={(e) => setRestrictMaterials(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Restrict customer to the materials I've configured pricing for
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Choose how you would like to specify your pricing
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPricingType('per-square-foot')}
                    className={`flex-1 py-3 px-4 text-sm border rounded-lg ${
                      pricingType === 'per-square-foot'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Per square foot
                  </button>
                  <button
                    onClick={() => setPricingType('per-square')}
                    className={`flex-1 py-3 px-4 text-sm border rounded-lg ${
                      pricingType === 'per-square'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Per square
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={showPriceRange}
                    onChange={(e) => setShowPriceRange(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show prices as range</span>
                </div>
                {showPriceRange && (
                  <div className="grid grid-cols-2 gap-4 ml-7">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Lower range (-%)
                      </label>
                      <input
                        type="number"
                        value={lowerRange}
                        onChange={(e) => setLowerRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upper range (+%)
                      </label>
                      <input
                        type="number"
                        value={upperRange}
                        onChange={(e) => setUpperRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={showFinancing}
                    onChange={(e) => setShowFinancing(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show financing options</span>
                </div>
                {showFinancing && (
                  <div className="ml-7 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Term length (months)
                        </label>
                        <input
                          type="number"
                          value={termLength}
                          onChange={(e) => setTermLength(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Interest rate (%)
                        </label>
                        <input
                          type="number"
                          value={interestRate}
                          onChange={(e) => setInterestRate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Add financing link
                </label>
                <input
                  type="text"
                  value={financingLink}
                  onChange={(e) => setFinancingLink(e.target.value)}
                  placeholder="Add link"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Provide a link to your financing page that will appear alongside each estimate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default job owner</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The default assignee will be assigned to every new lead that is created from this estimator
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default job owner
              </label>
              <select
                value={defaultJobOwnerId}
                onChange={(e) => setDefaultJobOwnerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a team member</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your organization profile will be shown to customers. Update your contact information in{' '}
              <button
                onClick={() => navigate('/settings/brand-board')}
                className="text-primary-600 hover:text-primary-700"
              >
                profile & branding settings
              </button>
              .
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point of contact
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organization profile is used for the contact card
                </p>
              </div>
              <ContactCardPreview organization={organizationProfile} loading={loadingProfile} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Scheduling</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add a link to your calendar. Customers will be directed from the link in your contact card.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add a scheduling link
                </label>
                <input
                  type="text"
                  value={schedulingLink}
                  onChange={(e) => setSchedulingLink(e.target.value)}
                  placeholder="Add a link from Calendly, Google Calendar, Doodle, etc"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional content</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tell your customers more about your business with additional content that can help build
                  trust. Manage the content in{' '}
                  <button
                    onClick={() => navigate('/instant-estimator', { state: { activeTab: 'settings' } })}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Instant Estimator settings
                  </button>
                  .
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show customer reviews</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                      Beta
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCustomerReviews(!showCustomerReviews)}
                    className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                      showCustomerReviews ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showCustomerReviews ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show project showcase</span>
                  <button
                    onClick={() => setShowProjectShowcase(!showProjectShowcase)}
                    className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                      showProjectShowcase ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showProjectShowcase ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show social media links</span>
                    <button
                      onClick={() => setShowSocialMedia(!showSocialMedia)}
                      className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                        showSocialMedia ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          showSocialMedia ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage social media links in{' '}
                    <button
                      onClick={() => navigate('/settings/brand-board')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      profile & branding settings
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rename Instant Estimator
                </h3>
                <button
                  onClick={() => {
                    setShowRenameModal(false);
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter new name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && renameName.trim()) {
                      handleRename();
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRenameModal(false);
                    setRenameName('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  disabled={!renameName.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MaterialFormModal
        isOpen={showMaterialModal}
        onClose={() => {
          setShowMaterialModal(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        material={editingMaterial}
        pricingType={pricingType}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default InstantEstimatorManage;
