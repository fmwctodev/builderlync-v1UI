import React, { useState, useEffect, useCallback } from 'react';
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
import { EnterpriseAccount } from '../../types';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AccountEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  account?: EnterpriseAccount;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => void;
}

export const AccountEditModal: React.FC<AccountEditModalProps> = ({
  open,
  onOpenChange,
  mode,
  account,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    ownerEmail: '',
    plan: 'Starter' as 'Starter' | 'Pro' | 'Enterprise',
    status: 'trial' as 'trial' | 'active' | 'past_due' | 'suspended',
    seatsLimit: 5,
    tags: '',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [nameValidation, setNameValidation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });
  const [emailValidation, setEmailValidation] = useState<{
    status: 'idle' | 'checking' | 'valid' | 'invalid';
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    if (account && mode === 'edit') {
      setFormData({
        name: account.name,
        ownerName: account.ownerName,
        ownerEmail: account.ownerEmail,
        plan: account.plan,
        status: account.status,
        seatsLimit: account.seatsLimit,
        tags: account.tags.join(', '),
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        ownerName: '',
        ownerEmail: '',
        plan: 'Starter',
        status: 'trial',
        seatsLimit: 5,
        tags: '',
      });
    }
    setErrors({});
    setServerError('');
    setNameValidation({ status: 'idle' });
    setEmailValidation({ status: 'idle' });
  }, [account, mode, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }
    if (formData.seatsLimit < 1) {
      newErrors.seatsLimit = 'Seats limit must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setServerError('');
    setSaving(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const planPrices = {
        Starter: { mrr: 497, arr: 5964 },
        Pro: { mrr: 997, arr: 11964 },
        Enterprise: { mrr: 0, arr: 0 },
      };

      const prices = planPrices[formData.plan];

      if (mode === 'create') {
        const newAccount = {
          name: formData.name,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          plan: formData.plan,
          status: formData.status,
          seatsLimit: formData.seatsLimit,
          seatsUsed: 1,
          tags,
          mrr: prices.mrr,
          arr: prices.arr,
          billingCycle: 'monthly' as const,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await onSave(newAccount);
      } else if (account) {
        const updates = {
          name: formData.name,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          plan: formData.plan,
          status: formData.status,
          seatsLimit: formData.seatsLimit,
          tags,
          mrr: prices.mrr,
          arr: prices.arr,
        };
        await onSave(updates);
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to save account:', error);

      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      if (errorMessage.includes('already taken') || errorMessage.includes('already exists')) {
        const newErrors = { ...errors };
        newErrors.name = 'This account name is already taken';
        setErrors(newErrors);
        setServerError('An account with this name already exists. Please choose a different name.');
      } else if (errorMessage.includes('already in use') || errorMessage.includes('email')) {
        const newErrors = { ...errors };
        newErrors.ownerEmail = 'This email is already in use';
        setErrors(newErrors);
        setServerError('This email address is already registered. Please use a different email.');
      } else if (errorMessage.includes('provisioning')) {
        setServerError('Failed to provision account resources. Please contact support if this persists.');
      } else {
        setServerError(errorMessage);
      }

      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div>
          <DialogTitle>
            {mode === 'create' ? 'Create New Account' : 'Edit Account'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new enterprise account to the platform'
              : 'Update account information and settings'}
          </DialogDescription>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">Unable to save account</h4>
                <p className="text-sm text-red-700">{serverError}</p>
                {serverError.includes('already taken') && (
                  <p className="text-xs text-red-600 mt-2">Suggestion: Try adding your location or business type to make the name unique.</p>
                )}
                {serverError.includes('already in use') && (
                  <p className="text-xs text-red-600 mt-2">Suggestion: Use a different email address or check if this account already exists.</p>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Account Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                  setServerError('');
                }}
                error={errors.name}
                placeholder="e.g., Apex Roofing Solutions"
              />
            </div>

            <Input
              label="Owner Name"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              error={errors.ownerName}
              placeholder="John Smith"
            />

            <Input
              label="Owner Email"
              type="email"
              value={formData.ownerEmail}
              onChange={(e) => {
                setFormData({ ...formData, ownerEmail: e.target.value });
                setErrors({ ...errors, ownerEmail: '' });
                setServerError('');
              }}
              error={errors.ownerEmail}
              placeholder="john@company.com"
            />

            <Select
              label="Plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
              options={[
                { value: 'Starter', label: 'Starter - $497/mo' },
                { value: 'Pro', label: 'Pro - $997/mo' },
                { value: 'Enterprise', label: 'Enterprise - Custom' },
              ]}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { value: 'trial', label: 'Trial' },
                { value: 'active', label: 'Active' },
                { value: 'past_due', label: 'Past Due' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />

            <Input
              label="Seats Limit"
              type="number"
              value={formData.seatsLimit}
              onChange={(e) => setFormData({ ...formData, seatsLimit: parseInt(e.target.value) || 0 })}
              error={errors.seatsLimit}
              min={1}
            />

            <div className="col-span-2">
              <Input
                label="Tags (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="VIP, Beta, High Value"
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div>
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                  disabled={saving}
                >
                  Delete Account
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? (mode === 'create' ? 'Creating Account...' : 'Saving...') : (mode === 'create' ? 'Create Account' : 'Save Changes')}
              </button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
