import { X, Check, AlertTriangle, Briefcase, Shield, Star, EyeOff, Trash2, FolderPlus } from 'lucide-react';
import type { BulkUpdatePayload } from '../../types/jobCam';

interface Props {
  count: number;
  onAction: (patch: BulkUpdatePayload) => void;
  onDelete: () => void;
  onAddToGallery: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

const BulkActionBar: React.FC<Props> = ({ count, onAction, onDelete, onAddToGallery, onSelectAll, onClear }) => (
  <div className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-lg animate-in slide-in-from-top duration-300">
    <div className="flex items-center gap-4">
      <button onClick={onClear} className="p-1 rounded-md hover:bg-white/20 transition-colors">
        <X size={18} />
      </button>
      <span className="text-sm font-bold uppercase tracking-wider">{count} selected items</span>
    </div>
    <div className="flex gap-2 flex-wrap items-center">
      {[
        { label: 'Approve', icon: Check, action: () => onAction({ review_status: 'approved' }) },
        { label: 'Reject', icon: AlertTriangle, action: () => onAction({ review_status: 'rejected' }) },
        { label: 'Claim', icon: Briefcase, action: () => onAction({ is_claim_relevant: true }) },
        { label: 'Shareable', icon: Shield, action: () => onAction({ is_customer_shareable: true }) },
        { label: 'Marketing', icon: Star, action: () => onAction({ is_marketing_approved: true }) },
        { label: 'Hide', icon: EyeOff, action: () => onAction({ is_hidden_from_timeline: true }) },
        { label: 'Gallery', icon: FolderPlus, action: onAddToGallery },
      ].map(a => (
        <button
          key={a.label}
          onClick={a.action}
          className="flex items-center gap-1.5 text-[10px] bg-white/20 hover:bg-white text-white hover:text-primary-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest transition-all border border-white/30"
        >
          <a.icon size={11} />
          {a.label}
        </button>
      ))}

      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-[10px] bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest transition-all border border-red-400 shadow-sm"
      >
        <Trash2 size={11} />
        Delete
      </button>

      <div className="w-px h-6 bg-white/30 mx-2" />
      <button onClick={onSelectAll} className="text-xs font-bold hover:underline">
        Select All
      </button>
    </div>
  </div>
);

export default BulkActionBar;
