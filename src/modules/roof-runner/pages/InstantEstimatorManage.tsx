import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, ExternalLink, Copy, QrCode, Code, Plus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';

const InstantEstimatorManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [estimatorName, setEstimatorName] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<any[]>([]);
  const [restrictMaterials, setRestrictMaterials] = useState(false);
  const [pricingType, setPricingType] = useState('per-square-foot');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [lowerRange, setLowerRange] = useState('0');
  const [upperRange, setUpperRange] = useState('0');
  const [termLength, setTermLength] = useState('1');
  const [interestRate, setInterestRate] = useState('0');
  const [showProjectShowcase, setShowProjectShowcase] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEstimatorData();
  }, [id]);

  const fetchEstimatorData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimator(parseInt(id));
      if (response && response.data) {
        setEstimatorName(response.data.name);
        setPublicUrl(response.data.public_url || '');
        setSelectedQuestions(response.data.questions || []);
        setSelectedMaterials(response.data.materials || []);
        
        // Load pricing settings if they exist
        const pricingSettings = response.data.pricing_settings || {};
        setRestrictMaterials(pricingSettings.restrict_materials || false);
        setPricingType(pricingSettings.pricing_type || 'per-square-foot');
        setShowPriceRange(pricingSettings.show_price_range || false);
        setShowFinancing(pricingSettings.show_financing || false);
        setLowerRange(pricingSettings.lower_range || '0');
        setUpperRange(pricingSettings.upper_range || '0');
        setTermLength(pricingSettings.term_length || '1');
        setInterestRate(pricingSettings.interest_rate || '0');
        
        // Load additional settings
        const additionalSettings = response.data.additional_settings || {};
        setShowProjectShowcase(additionalSettings.show_project_showcase || false);
        setShowSocialMedia(additionalSettings.show_social_media || false);
      } else {
        setEstimatorName('Estimator Not Found');
      }
    } catch (error) {
      console.error('Failed to fetch estimator:', error);
      // Fallback to fetching from list
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

  const saveAllSettings = async () => {
    if (!id) return;
    try {
      // Save pricing settings
      await apiService.updateInstantEstimatorPricingSettings(parseInt(id), {
        restrict_materials: restrictMaterials,
        pricing_type: pricingType,
        show_price_range: showPriceRange,
        show_financing: showFinancing,
        lower_range: lowerRange,
        upper_range: upperRange,
        term_length: termLength,
        interest_rate: interestRate
      });
      
      // Save additional settings
      await apiService.updateInstantEstimatorAdditionalSettings(parseInt(id), {
        show_project_showcase: showProjectShowcase,
        show_social_media: showSocialMedia
      });
      
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
          {/* <button className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
            <ExternalLink className="w-4 h-4" />
            Preview
          </button> */}
          <button onClick={saveAllSettings} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
            Save All
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Share and embed */}
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
                  } catch (err) {
                    // Fallback for browsers that don't support clipboard API
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

          {/* Lead questionnaire */}
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
              <span className="text-sm font-medium text-gray-900 dark:text-white">Questions ({selectedQuestions.length})</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {selectedQuestions.length > 0 
                ? selectedQuestions.map(q => q.name || q).join(', ')
                : 'No questions selected'
              }
            </p>
          </div>

          {/* Material options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Material options</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Add the materials you offer along with their approximate prices, which should include tear-off, waste, and markup costs. Your customers will have the option to choose the materials they want and will receive estimates based on the information you provide below.
            </p>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage/materials`)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Manage materials
              </button>
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            
            {selectedMaterials.length > 0 ? (
              <div className="space-y-3">
                {selectedMaterials.slice(0, 3).map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {material.materialType?.charAt(0) || material.name?.charAt(0) || 'M'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {material.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${material.price?.toFixed(2) || '0.00'}/sqft
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedMaterials.length > 3 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    +{selectedMaterials.length - 3} more materials
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 italic mb-4">
                  No materials added
                </p>
              </div>
            )}
          </div>

          {/* Pricing settings */}
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
                    className={`flex-1 py-3 px-4 text-sm border rounded-lg ${pricingType === 'per-square-foot'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                  >
                    Per square foot
                  </button>
                  <button
                    onClick={() => setPricingType('per-square')}
                    className={`flex-1 py-3 px-4 text-sm border rounded-lg ${pricingType === 'per-square'
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
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Lower range (-%)</label>
                      <input
                        type="number"
                        value={lowerRange}
                        onChange={(e) => setLowerRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Upper range (+%)</label>
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
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Term length (months)</label>
                        <input
                          type="number"
                          value={termLength}
                          onChange={(e) => setTermLength(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Interest rate (%)</label>
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
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Add financing link</label>
                <input
                  type="text"
                  placeholder="Add link"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Provide a link to your financing page that will appear alongside each estimate
                </p>
              </div>
            </div>
          </div>

          {/* Default job owner */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Default job owner</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The default assignee will be assigned to every new lead that is created from this estimator
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default job owner
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option>James Wolfgang Kuntz</option>
              </select>
            </div>
          </div>

          {/* Contact information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a user profile to populate the contact card. To update your contact information please edit your profile in setting. Other users will need to edit their own profile if changes are required.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Profile
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option>James Wolfgang Kuntz</option>
              </select>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 gap-8">
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
                  placeholder="Add a link from Calendly, Google Calendar, Doodle, etc"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Additional content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Additional content</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tell your customers more about your business with additional content that can help build trust. Manage the content in <a href="#" className="text-primary-600 hover:text-primary-700">Instant Estimator settings</a>.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show CompanyCam Project Showcase</span>
                  <button
                    onClick={() => setShowProjectShowcase(!showProjectShowcase)}
                    className={`relative inline-block w-10 h-6 rounded-full transition-colors ${
                      showProjectShowcase ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showProjectShowcase ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
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
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showSocialMedia ? 'translate-x-5' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage social media links in <a href="#" className="text-primary-600 hover:text-primary-700">profile & branding settings</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Rename Instant Estimator</h3>
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default InstantEstimatorManage;