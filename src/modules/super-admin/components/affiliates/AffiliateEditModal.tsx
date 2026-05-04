import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Affiliate, CreateAffiliateInput } from '../../types/affiliate';
import {
  generateReferralCode,
  isReferralCodeAvailable,
} from '../../services/affiliates-service';
import { AffiliateLinkButton } from './AffiliateLinkButton';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  affiliate?: Affiliate;
  onSave: (data: CreateAffiliateInput) => Promise<void>;
  onDelete?: () => void;
}

const emptyForm: CreateAffiliateInput = {
  name: '',
  email: '',
  phone: '',
  company: '',
  referralCode: '',
  commissionRate: 0.20,
  commissionWindowMonths: 12,
  payoutMethod: 'paypal',
  payoutEmail: '',
  status: 'active',
  notes: '',
  tags: [],
};

export const AffiliateEditModal: React.FC<Props> = ({
  open,
  onOpenChange,
  mode,
  affiliate,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<CreateAffiliateInput>(emptyForm);
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [codeChecking, setCodeChecking] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && affiliate) {
      setForm({
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone || '',
        company: affiliate.company || '',
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        commissionWindowMonths: affiliate.commissionWindowMonths,
        payoutMethod: affiliate.payoutMethod,
        payoutEmail: affiliate.payoutEmail || '',
        status: affiliate.status,
        notes: affiliate.notes || '',
        tags: affiliate.tags,
      });
      setTagsInput((affiliate.tags || []).join(', '));
    } else {
      setForm(emptyForm);
      setTagsInput('');
    }
    setErrors({});
    setServerError('');
  }, [open, mode, affiliate]);

  const update = <K extends keyof CreateAffiliateInput>(key: K, value: CreateAffiliateInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegenerateCode = () => {
    update('referralCode', generateReferralCode(form.name));
  };

  const validate = async (): Promise<boolean> => {
    const next: Record<string, string> = {};
    if (!form.name?.trim()) next.name = 'Name is required';
    if (!form.email?.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Invalid email';
    }
    if (form.commissionRate === undefined || form.commissionRate < 0 || form.commissionRate > 1) {
      next.commissionRate = 'Rate must be between 0 and 1 (e.g., 0.20 = 20%)';
    }
    if (
      form.commissionWindowMonths !== undefined &&
      (form.commissionWindowMonths < 0 || form.commissionWindowMonths > 120)
    ) {
      next.commissionWindowMonths = 'Window must be 0–120 months (0 = lifetime)';
    }

    if (form.referralCode && form.referralCode.trim()) {
      if (!/^[a-zA-Z0-9_-]{3,64}$/.test(form.referralCode)) {
        next.referralCode = '3–64 chars: letters, numbers, dashes, underscores';
      } else {
        setCodeChecking(true);
        const ok = await isReferralCodeAvailable(form.referralCode, affiliate?.id);
        setCodeChecking(false);
        if (!ok) next.referralCode = 'This referral code is already in use';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setServerError('');
    const ok = await validate();
    if (!ok) return;
    setSaving(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onSave({ ...form, tags });
      onOpenChange(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div>
          <DialogTitle>{mode === 'create' ? 'Add Affiliate' : 'Edit Affiliate'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new partner who can refer customers via a tracked link.'
              : 'Update affiliate details and commission settings.'}
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogContent className="space-y-4">
        {serverError && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
            placeholder="Jane Smith"
          />
          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            error={errors.email}
            placeholder="jane@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={form.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+1 555 123 4567"
          />
          <Input
            label="Company"
            value={form.company || ''}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Acme Marketing LLC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referral code</label>
          <div className="flex items-stretch gap-2">
            <input
              value={form.referralCode || ''}
              onChange={(e) => update('referralCode', e.target.value)}
              placeholder="auto-generated if blank"
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm ${
                errors.referralCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleRegenerateCode}
              className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" /> Generate
            </button>
          </div>
          {codeChecking && (
            <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking availability…
            </p>
          )}
          {errors.referralCode && (
            <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>
          )}
          {form.referralCode && !errors.referralCode && (
            <div className="mt-2">
              <AffiliateLinkButton referralCode={form.referralCode} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Commission rate"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={form.commissionRate ?? 0}
            onChange={(e) => update('commissionRate', parseFloat(e.target.value) || 0)}
            error={errors.commissionRate}
          />
          <Input
            label="Window (months)"
            type="number"
            min="0"
            max="120"
            value={form.commissionWindowMonths ?? 12}
            onChange={(e) => update('commissionWindowMonths', parseInt(e.target.value) || 0)}
            error={errors.commissionWindowMonths}
          />
          <Select
            label="Status"
            value={form.status || 'active'}
            onChange={(e) => update('status', e.target.value as any)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          Rate is a decimal: <code>0.20</code> = 20%. Window 0 = lifetime.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payout method"
            value={form.payoutMethod || 'paypal'}
            onChange={(e) => update('payoutMethod', e.target.value as any)}
            options={[
              { value: 'paypal', label: 'PayPal' },
              { value: 'ach', label: 'ACH / Bank' },
              { value: 'wire', label: 'Wire transfer' },
              { value: 'check', label: 'Check' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Payout email / reference"
            value={form.payoutEmail || ''}
            onChange={(e) => update('payoutEmail', e.target.value)}
            placeholder="payouts@example.com"
          />
        </div>

        <Input
          label="Tags (comma-separated)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="vip, agency, podcast"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            placeholder="Internal notes, contract terms, etc."
          />
        </div>
      </DialogContent>

      <DialogFooter>
        {mode === 'edit' && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mr-auto px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create affiliate' : 'Save changes'}
        </button>
      </DialogFooter>
    </Dialog>
  );
};
