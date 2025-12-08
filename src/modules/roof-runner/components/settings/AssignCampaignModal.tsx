import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { getBrands, getCampaigns, assignNumberToCampaign, Brand, Campaign } from '../../../../shared/store/services/twilioApi';

interface AssignCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  phoneNumberSid: string;
  onSuccess: () => void;
}

const AssignCampaignModal: React.FC<AssignCampaignModalProps> = ({
  isOpen,
  onClose,
  phoneNumber,
  phoneNumberSid,
  onSuccess
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBrands();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedBrand) {
      loadCampaigns(selectedBrand);
    } else {
      setCampaigns([]);
      setSelectedCampaign('');
    }
  }, [selectedBrand]);

  const loadBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBrands();
      if (response.success && response.data) {
        setBrands(response.data);
      } else {
        setError(response.message || 'Failed to load brands');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading brands');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async (brandSid: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCampaigns(brandSid);
      if (response.success && response.data) {
        setCampaigns(response.data);
      } else {
        setError(response.message || 'Failed to load campaigns');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCampaign) return;

    setAssigning(true);
    setError(null);
    try {
      const response = await assignNumberToCampaign(phoneNumberSid, selectedCampaign);
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to assign number to campaign');
      }
    } catch (err: any) {
      setError(err.message || 'Error assigning number');
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Assign to Campaign
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Assign <span className="font-mono font-semibold">{phoneNumber}</span> to an A2P/10DLC campaign
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              disabled={loading || brands.length === 0}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">Select a brand...</option>
              {brands.map((brand) => (
                <option key={brand.sid} value={brand.sid}>
                  {brand.brandType} - {brand.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Campaign
            </label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              disabled={loading || !selectedBrand || campaigns.length === 0}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">Select a campaign...</option>
              {campaigns.map((campaign) => (
                <option key={campaign.sid} value={campaign.sid}>
                  {campaign.description || campaign.campaignType} - {campaign.status}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={assigning}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedCampaign || assigning}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{assigning ? 'Assigning...' : 'Assign'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCampaignModal;
