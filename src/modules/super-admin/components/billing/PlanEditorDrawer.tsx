import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Plan } from '../../types/billing';

interface PlanEditorDrawerProps {
  open: boolean;
  onClose: () => void;
  plan?: Plan | null;
  onSave: (data: any) => Promise<void>;
}

export const PlanEditorDrawer: React.FC<PlanEditorDrawerProps> = ({
  open,
  onClose,
  plan,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: '',
    price_annual: '',
    active: true,
    display_order: 0,
    features: [''],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && plan) {
      const features = plan.limits?.features || [];
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price_monthly: plan.price_monthly,
        price_annual: plan.price_annual,
        active: plan.active,
        display_order: plan.display_order,
        features: features.length > 0 ? features : [''],
      });
    } else if (open) {
      setFormData({
        name: '',
        description: '',
        price_monthly: '',
        price_annual: '',
        active: true,
        display_order: 0,
        features: [''],
      });
    }
  }, [open, plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const monthlyPrice = parseFloat(formData.price_monthly);
    const annualPrice = parseFloat(formData.price_annual);

    if (isNaN(monthlyPrice) || monthlyPrice < 0) {
      alert('Monthly price must be a valid positive number');
      return;
    }

    if (isNaN(annualPrice) || annualPrice < 0) {
      alert('Annual price must be a valid positive number');
      return;
    }

    if (monthlyPrice > 0 && annualPrice > 0 && annualPrice > monthlyPrice * 12) {
      const confirmed = window.confirm(
        'Annual price is higher than 12x the monthly price. This means no discount for annual billing. Continue anyway?'
      );
      if (!confirmed) return;
    }

    setSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price_monthly: formData.price_monthly,
        price_annual: formData.price_annual,
        active: formData.active,
        display_order: formData.display_order,
        limits: {
          features: formData.features.filter(f => f.trim() !== ''),
        },
      });
      onClose();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{plan ? 'Edit Plan' : 'Create New Plan'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_annual}
                onChange={(e) => setFormData({ ...formData, price_annual: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData({ ...formData, features: newFeatures });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFeatures = formData.features.filter((_, i) => i !== index);
                    setFormData({ ...formData, features: newFeatures });
                  }}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              + Add Feature
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
            />
            <label htmlFor="active" className="text-sm text-gray-700">Active</label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : plan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
