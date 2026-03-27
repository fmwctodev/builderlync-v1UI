import React from 'react';
import { X, Building2, User, Mail, Hash, MapPin, CheckCircle2, Calendar } from 'lucide-react';

interface QxoDetailsModalProps {
  onClose: () => void;
  qxoStatus: {
    connected: boolean;
    email?: string;
    profile?: any;
  };
}

const QxoDetailsModal: React.FC<QxoDetailsModalProps> = ({ onClose, qxoStatus }) => {
  if (!qxoStatus.profile) return null;
  
  // Safely parse profile data which was saved as a JSON string by the Beacon response
  let profileDetails = qxoStatus.profile;
  if (typeof profileDetails === 'string') {
    try {
      profileDetails = JSON.parse(profileDetails);
    } catch (e) {
      console.error("Failed to parse QXO profile details", e);
    }
  }

  const branch = profileDetails?.accountBranch || {};
  const branchAddress = branch.address ? [branch.address.city, branch.address.state].filter(Boolean).join(', ') : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        
        {/* Header hero */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-800 px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-red-200 text-xs font-medium uppercase tracking-wider">QXO / Beacon Pro+</p>
              <h2 className="text-white text-lg font-bold leading-tight">Account Details</h2>
            </div>
          </div>
          {/* Big account display */}
          <div className="bg-white/15 rounded-xl px-4 py-3">
            <p className="text-red-200 text-xs font-medium mb-0.5">Email / Username</p>
            <p className="text-white text-lg font-bold tracking-wide">{qxoStatus.email}</p>
          </div>
          {/* Connected badge */}
          <div className="absolute -bottom-3 right-6 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected
          </div>
        </div>

        {/* Details rows */}
        <div className="flex-1 overflow-y-auto px-6 pt-7 pb-4 space-y-1">
          {[
            { icon: User, label: 'Customer Name', value: [profileDetails?.firstName, profileDetails?.lastName].filter(Boolean).join(' ') || undefined },
            { icon: Building2, label: 'Company', value: profileDetails?.lastSelectedAccount?.accountName || undefined },
            { icon: Hash, label: 'Home Branch', value: branch.branchName ? `${branch.branchName} (#${branch.branchNumber || ''})` : undefined },
            { icon: Mail, label: 'Email', value: qxoStatus.email },
            { icon: MapPin, label: 'Location', value: branchAddress },
            { icon: CheckCircle2, label: 'Role', value: profileDetails?.userType || undefined },
            { icon: Calendar, label: 'Connected', value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].filter(row => row.value).map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default QxoDetailsModal;
