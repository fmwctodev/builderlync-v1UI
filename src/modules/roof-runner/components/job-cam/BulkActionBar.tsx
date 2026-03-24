import React from 'react';
import { X, Check, AlertTriangle, Briefcase, Shield, Star, EyeOff } from 'lucide-react';
import type { BulkUpdatePayload } from '../../types/jobCam';

interface Props {
  count: number;
  onAction: (patch: BulkUpdatePayload) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const BulkActionBar: React.FC<Props> = ({ count, onAction, onSelectAll, onClear }) => (
  <div className="bg-primary-600 text-white px-6 py-2.5 flex items-center gap-4 sticky top-0 z-20">
    <span className="text-sm font-medium">{count} selected</span>
    <div className="flex gap-2 ml-auto flex-wrap">
      {[
        { label: 'Approve', icon: Check, action: () => onAction({ review_status: 'approved' }) },
        { label: 'Reject', icon: AlertTriangle, action: () => onAction({ review_status: 'rejected' }) },
        { label: 'Claim', icon: Briefcase, action: () => onAction({ is_claim_relevant: true }) },
        { label: 'Shareable', icon: Shield, action: () => onAction({ is_customer_shareable: true }) },
        { label: 'Marketing', icon: Star, action: () => onAction({ is_marketing_approved: true }) },
        { label: 'Hide', icon: EyeOff, action: () => onAction({ is_hidden_from_timeline: true }) },
      ].map(a => (
        <button
          key={a.label}
          onClick={a.action}
          className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors"
        >
          <a.icon size={11} />
          {a.label}
        </button>
      ))}
      <button onClick={onSelectAll} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium">
        Select All
      </button>
      <button onClick={onClear} className="text-xs hover:text-primary-200">
        <X size={14} />
      </button>
    </div>
  </div>
);

export default BulkActionBar;
