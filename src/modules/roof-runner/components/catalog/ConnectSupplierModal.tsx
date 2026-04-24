import React from 'react';
import { X, ExternalLink, ShieldCheck, Info } from 'lucide-react';
import SRSConnection from './SRSConnection';
import QxoConnection from './QxoConnection';
import { useFeatureFlag } from '../../../../shared/hooks/useFeatureFlag';

interface ConnectSupplierModalProps {
  supplier: 'abc' | 'srs' | 'qxo' | null;
  onClose: () => void;
  onSuccess: (supplier: string) => void;
}

const ConnectSupplierModal: React.FC<ConnectSupplierModalProps> = ({ supplier, onClose, onSuccess }) => {
  const isSrsEnabled = useFeatureFlag('srs-distribution');
  if (!supplier) return null;
  if (supplier === 'srs' && !isSrsEnabled) return null;

  const handleAbcConnect = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100/api';
    // Redirect to ABC Supply OAuth flow
    window.location.href = `${baseUrl}/abc-supply/connect?token=${token}`;
  };

  const renderContent = () => {
    switch (supplier) {
      case 'abc':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect ABC Supply</h2>
                <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <ExternalLink size={32} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    To connect your ABC Supply account, we will redirect you to their secure login portal.
                  </p>
                  <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3 text-left text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    <Info size={18} className="flex-shrink-0" />
                    <p>Once authenticated, you'll be automatically returned here to start managing your catalog.</p>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAbcConnect}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to ABC <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'srs':
        return <SRSConnection onConnectionSuccess={() => onSuccess('srs')} onClose={onClose} />;
      case 'qxo':
        return <QxoConnection onConnectionSuccess={() => onSuccess('qxo')} onClose={onClose} />;
      default:
        return null;
    }
  };

  return renderContent();
};

export default ConnectSupplierModal;
