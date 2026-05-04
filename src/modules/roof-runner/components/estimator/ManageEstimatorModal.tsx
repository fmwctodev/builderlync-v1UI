import React, { useState, useEffect } from 'react';
import { X, Copy, QrCode, Code, Edit, Plus, Trash2, Save, ExternalLink, MessageSquare, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { instantEstimatorSettingsApi } from '../../services/instantEstimatorSettingsApi';
import { apiService } from '../../store/services/api';
import MaterialFormModal from './MaterialFormModal';
import type { InstantEstimator } from '../../services/instantEstimatorsApi';
import type {
  InstantEstimatorMaterial,
  CreateMaterialData,
  StaffMember,
} from '../../types/instantEstimatorSettings';

interface ManageEstimatorModalProps {
  estimator: InstantEstimator;
  organizationId: string;
  onClose: () => void;
  onSaved: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

const ManageEstimatorModal: React.FC<ManageEstimatorModalProps> = ({
  estimator,
  organizationId,
  onClose,
  onSaved,
  onToast,
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'share' | 'pricing' | 'materials' | 'scheduling' | 'additional'>('share');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [materials, setMaterials] = useState<InstantEstimatorMaterial[]>([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
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
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  const [defaultPipelineType, setDefaultPipelineType] = useState('residential');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [enableWebhookNotifications, setEnableWebhookNotifications] = useState(false);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [estimator.id, organizationId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [materialsData, configData, staffData] = await Promise.all([
        instantEstimatorSettingsApi.getMaterials(organizationId, estimator.id),
        instantEstimatorSettingsApi.getEstimatorConfig(organizationId, estimator.id),
        instantEstimatorSettingsApi.getStaffMembers(organizationId),
      ]);

      setMaterials(materialsData);
      setStaffMembers(staffData);

      if (configData) {
        setDefaultJobOwnerId(configData.default_job_owner_id || '');
        setSchedulingLink(configData.scheduling_link || '');
        setFinancingLink(configData.financing_link || '');
        setShowCustomerReviews(configData.show_customer_reviews);
        setShowSocialMedia(configData.show_social_media);
        setDefaultPipelineType(configData.default_pipeline_type || 'residential');
        setNotificationEmail(configData.notification_email || '');
        setEnableWebhookNotifications(configData.enable_webhook_notifications || false);

        if (configData.pricing_settings) {
          setRestrictMaterials(configData.pricing_settings.restrict_materials);
          setPricingType(configData.pricing_settings.pricing_type);
          setShowPriceRange(configData.pricing_settings.show_price_range);
          setShowFinancing(configData.pricing_settings.show_financing);
          setLowerRange(configData.pricing_settings.lower_range);
          setUpperRange(configData.pricing_settings.upper_range);
          setTermLength(configData.pricing_settings.term_length);
          setInterestRate(configData.pricing_settings.interest_rate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch estimator data:', error);
      onToast('Failed to load estimator settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await instantEstimatorSettingsApi.upsertEstimatorConfig(organizationId, estimator.id, {
        default_job_owner_id: defaultJobOwnerId || null,
        scheduling_link: schedulingLink || null,
        financing_link: financingLink || null,
        show_customer_reviews: showCustomerReviews,
        show_project_showcase: false,
        show_social_media: showSocialMedia,
        default_pipeline_type: defaultPipelineType,
        notification_email: notificationEmail || null,
        enable_webhook_notifications: enableWebhookNotifications,
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

      await apiService.updateInstantEstimatorPricingSettings(parseInt(estimator.id), {
        restrict_materials: restrictMaterials,
        pricing_type: pricingType,
        show_price_range: showPriceRange,
        show_financing: showFinancing,
        lower_range: lowerRange,
        upper_range: upperRange,
        term_length: termLength,
        interest_rate: interestRate,
      });

      await apiService.updateInstantEstimatorAdditionalSettings(parseInt(estimator.id), {
        show_project_showcase: false,
        show_social_media: showSocialMedia,
      });

      onToast('Settings saved successfully!', 'success');
      onSaved();
    } catch (error) {
      console.error('Failed to save settings:', error);
      onToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast('Link copied to clipboard!', 'success');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      onToast('Link copied to clipboard!', 'success');
    }
  };

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setShowMaterialForm(true);
  };

  const handleEditMaterial = (material: InstantEstimatorMaterial) => {
    setEditingMaterial(material);
    setShowMaterialForm(true);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    try {
      await instantEstimatorSettingsApi.deleteMaterial(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      onToast('Material deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete material:', error);
      onToast('Failed to delete material', 'error');
    }
  };

  const handleSaveMaterial = async (materialData: CreateMaterialData) => {
    try {
      if (editingMaterial) {
        const updated = await instantEstimatorSettingsApi.updateMaterial(editingMaterial.id, materialData);
        setMaterials((prev) => prev.map((m) => (m.id === editingMaterial.id ? updated : m)));
        onToast('Material updated successfully', 'success');
      } else {
        const created = await instantEstimatorSettingsApi.createMaterial(
          organizationId,
          estimator.id,
          materialData
        );
        setMaterials((prev) => [...prev, created]);
        onToast('Material added successfully', 'success');
      }
      setShowMaterialForm(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error('Failed to save material:', error);
      onToast('Failed to save material', 'error');
    }
  };

  const publicUrl = `${window.location.origin}/estimator/${estimator.public_url || estimator.id}`;

  const sections = [
    { id: 'share', label: 'Share & Embed' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'materials', label: 'Materials' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'additional', label: 'Additional' },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-gray-400' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Manage: {estimator.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure settings for this instant estimator
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 overflow-x-auto bg-gray-900">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-[#dc2626] text-[#dc2626]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-paper dark:bg-canvas">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]"></div>
            </div>
          ) : (
            <>
              {activeSection === 'share' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Public URL
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <input
                        type="text"
                        value={publicUrl}
                        readOnly
                        className="flex-1 bg-transparent text-gray-600 dark:text-gray-300 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(publicUrl)}
                        className="flex items-center gap-1 text-[#dc2626] hover:text-red-700 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#dc2626] hover:text-red-700 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </a>
                    </div>

                    <div className="flex gap-4 mt-4">
                      <button disabled className="flex items-center gap-2 text-gray-400 cursor-not-allowed text-sm">
                        <QrCode className="w-4 h-4" />
                        QR code (coming soon)
                      </button>
                      <button disabled className="flex items-center gap-2 text-gray-400 cursor-not-allowed text-sm">
                        <Code className="w-4 h-4" />
                        Embed code (coming soon)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'pricing' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                      <input
                        type="checkbox"
                        id="restrictMaterials"
                        checked={restrictMaterials}
                        onChange={(e) => setRestrictMaterials(e.target.checked)}
                        className="w-5 h-5 text-[#dc2626] rounded border-gray-300 focus:ring-[#dc2626]"
                      />
                      <label htmlFor="restrictMaterials" className="text-sm text-gray-700 dark:text-gray-300">
                        Restrict customer to the materials I've configured pricing for
                      </label>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Choose how you would like to specify your pricing
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setPricingType('per-square-foot')}
                          className={`flex-1 py-3 px-4 text-sm border rounded-lg ${
                            pricingType === 'per-square-foot'
                              ? 'border-[#dc2626] bg-red-50 dark:bg-red-900/20 text-[#dc2626]'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                          }`}
                        >
                          Per square foot
                        </button>
                        <button
                          onClick={() => setPricingType('per-square')}
                          className={`flex-1 py-3 px-4 text-sm border rounded-lg ${
                            pricingType === 'per-square'
                              ? 'border-[#dc2626] bg-red-50 dark:bg-red-900/20 text-[#dc2626]'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                          }`}
                        >
                          Per square
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="showPriceRange"
                          checked={showPriceRange}
                          onChange={(e) => setShowPriceRange(e.target.checked)}
                          className="w-5 h-5 text-[#dc2626] rounded border-gray-300 focus:ring-[#dc2626]"
                        />
                        <label htmlFor="showPriceRange" className="text-sm text-gray-700 dark:text-gray-300">
                          Show prices as range
                        </label>
                      </div>
                      {showPriceRange && (
                        <div className="grid grid-cols-2 gap-4 ml-8">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Lower range (%)
                            </label>
                            <input
                              type="number"
                              value={lowerRange}
                              onChange={(e) => setLowerRange(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Upper range (%)
                            </label>
                            <input
                              type="number"
                              value={upperRange}
                              onChange={(e) => setUpperRange(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          id="showFinancing"
                          checked={showFinancing}
                          onChange={(e) => setShowFinancing(e.target.checked)}
                          className="w-5 h-5 text-[#dc2626] rounded border-gray-300 focus:ring-[#dc2626]"
                        />
                        <label htmlFor="showFinancing" className="text-sm text-gray-700 dark:text-gray-300">
                          Show financing options
                        </label>
                      </div>
                      {showFinancing && (
                        <div className="space-y-4 ml-8">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Term length (months)
                              </label>
                              <input
                                type="number"
                                value={termLength}
                                onChange={(e) => setTermLength(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Interest rate (%)
                              </label>
                              <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                              Financing link (optional)
                            </label>
                            <input
                              type="url"
                              value={financingLink}
                              onChange={(e) => setFinancingLink(e.target.value)}
                              placeholder="https://your-financing-portal.com"
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'materials' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configure materials and pricing for this estimator
                      </p>
                      <button
                        onClick={handleAddMaterial}
                        className="flex items-center gap-2 px-3 py-2 bg-[#dc2626] hover:bg-red-700 text-white text-sm rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Add Material
                      </button>
                    </div>

                    {materials.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No materials configured yet. Click "Add Material" to get started.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {materials.map((material) => {
                          const priceLabel = pricingType === 'per-square-foot' ? '/sqft' : '/sq';
                          const prices = [];
                          if (material.low_price) prices.push(`Low: $${material.low_price}${priceLabel}`);
                          if (material.moderate_price) prices.push(`Mod: $${material.moderate_price}${priceLabel}`);
                          if (material.steep_price) prices.push(`Steep: $${material.steep_price}${priceLabel}`);
                          if (material.flat_price) prices.push(`Flat: $${material.flat_price}${priceLabel}`);

                          return (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {material.name}
                                  </p>
                                  {material.material_type && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                                      {material.material_type}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {prices.length > 0 ? prices.join(' | ') : 'No pricing set'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditMaterial(material)}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="p-2 text-red-400 hover:text-red-600"
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
                </div>
              )}

              {activeSection === 'scheduling' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Default job owner
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          The default assignee will be assigned to every new lead that is created from instant estimators.
                        </p>
                      </div>
                      <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default job owner
                        </label>
                        <div className="relative">
                          <select
                            value={defaultJobOwnerId}
                            onChange={(e) => setDefaultJobOwnerId(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm appearance-none cursor-pointer"
                          >
                            <option value="">Select a team member</option>
                            {staffMembers.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.first_name} {staff.last_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Scheduling
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add a link to your calendar. Customers will be directed from the link in your contact card.
                        </p>
                      </div>
                      <div className="flex-1 max-w-md">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Add a scheduling link
                        </label>
                        <input
                          type="url"
                          value={schedulingLink}
                          onChange={(e) => setSchedulingLink(e.target.value)}
                          placeholder="Add a link from Calendly, Google Calendar, Doodle, etc"
                          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'additional' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Additional content
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tell your customers more about your business with additional content that can help build trust. Manage the content in{' '}
                          <button
                            onClick={() => {
                              onClose();
                              navigate('/settings');
                            }}
                            className="text-[#dc2626] hover:underline"
                          >
                            Instant Estimator settings
                          </button>
                          .
                        </p>
                      </div>
                      <div className="flex-1 max-w-md space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-white">Show customer reviews</span>
                            <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                              Beta
                            </span>
                          </div>
                          <Toggle
                            checked={showCustomerReviews}
                            onChange={() => setShowCustomerReviews(!showCustomerReviews)}
                          />
                        </div>

                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm text-gray-900 dark:text-white block">Show social media links</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Manage social media links in{' '}
                              <button
                                onClick={() => {
                                  onClose();
                                  navigate('/settings');
                                }}
                                className="text-[#dc2626] hover:underline"
                              >
                                profile & branding settings
                              </button>
                            </span>
                          </div>
                          <Toggle
                            checked={showSocialMedia}
                            onChange={() => setShowSocialMedia(!showSocialMedia)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                      <div className="flex-1 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Lead notifications & pipeline
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Configure how leads from instant estimators are handled. Leads will automatically create opportunities in the selected pipeline category.
                        </p>
                      </div>
                      <div className="flex-1 max-w-md space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            Default pipeline type
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            New leads will be added as opportunities in this pipeline category
                          </p>
                          <div className="relative">
                            <select
                              value={defaultPipelineType}
                              onChange={(e) => setDefaultPipelineType(e.target.value)}
                              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm appearance-none cursor-pointer"
                            >
                              <option value="residential">Residential</option>
                              <option value="commercial">Commercial</option>
                              <option value="insurance">Insurance</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            Notification email
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Receive email notifications when new leads are generated
                          </p>
                          <div className="relative">
                            <input
                              type="email"
                              value={notificationEmail}
                              onChange={(e) => setNotificationEmail(e.target.value)}
                              placeholder="email@example.com"
                              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#dc2626] hover:bg-red-700 text-white rounded"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="enableWebhook"
                              checked={enableWebhookNotifications}
                              onChange={(e) => setEnableWebhookNotifications(e.target.checked)}
                              className="w-5 h-5 text-[#dc2626] rounded border-gray-300 focus:ring-[#dc2626]"
                            />
                            <label htmlFor="enableWebhook" className="text-sm font-medium text-gray-900 dark:text-white">
                              Enable webhook notifications
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <MaterialFormModal
        isOpen={showMaterialForm}
        onClose={() => {
          setShowMaterialForm(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
        material={editingMaterial}
        pricingType={pricingType}
      />
    </div>
  );
};

export default ManageEstimatorModal;
