import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Package, RefreshCw } from 'lucide-react';
import { BillingTabs, BillingTab } from '../components/billing/BillingTabs';
import { PlanCard } from '../components/billing/PlanCard';
import { PlanEditorDrawer } from '../components/billing/PlanEditorDrawer';
import { MetricsTab } from '../components/billing/MetricsTab';
import { AccountsTab } from '../components/billing/AccountsTab';
import { InvoicesTab } from '../components/billing/InvoicesTab';
import { SubscriptionsTab } from '../components/billing/SubscriptionsTab';
import { SubscriptionPlansTab } from '../components/billing/SubscriptionPlansTab';
import { Plan } from '../types/billing';
import { getPlans, createPlan, updatePlan, togglePlanActive } from '../services/plans-service';
import { syncAllStripeData } from '../services/stripe/stripe-sync-service';

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BillingTab>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (activeTab === 'plans') {
      loadPlans();
    }
  }, [activeTab]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
      showToast('Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setDrawerOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setDrawerOpen(true);
  };

  const handleSavePlan = async (planData: any) => {
    try {
      if (selectedPlan) {
        await updatePlan(selectedPlan.id, planData);
        showToast('Plan updated successfully');
      } else {
        await createPlan(planData);
        showToast('Plan created successfully');
      }
      await loadPlans();
    } catch (error) {
      console.error('Failed to save plan:', error);
      showToast('Failed to save plan', 'error');
      throw error;
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    const action = plan.active ? 'deactivate' : 'activate';
    const message = plan.active
      ? `Are you sure you want to deactivate the "${plan.name}" plan? This will prevent new accounts from signing up for this plan.`
      : `Are you sure you want to activate the "${plan.name}" plan?`;

    const confirmed = window.confirm(message);
    if (!confirmed) return;

    try {
      await togglePlanActive(plan.id, !plan.active);
      await loadPlans();
      showToast(`Plan ${!plan.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle plan:', error);
      showToast('Failed to update plan', 'error');
    }
  };

  const handleSyncStripeData = async () => {
    if (!window.confirm('Sync all data from Stripe? This will update customers, subscriptions, invoices, and payments. This may take a few minutes.')) {
      return;
    }

    setSyncing(true);
    try {
      const result = await syncAllStripeData();

      const summary = [
        `Customers: ${result.customers.created} created, ${result.customers.updated} updated`,
        `Products: ${result.products.created} created, ${result.products.updated} updated`,
        `Subscriptions: ${result.subscriptions.created} created, ${result.subscriptions.updated} updated`,
        `Invoices: ${result.invoices.created} created, ${result.invoices.updated} updated`,
        `Payments: ${result.payments.created} created, ${result.payments.updated} updated`,
      ].join(' | ');

      showToast(`Stripe sync complete: ${summary}`);

      if (activeTab === 'plans') {
        await loadPlans();
      }
    } catch (error: any) {
      console.error('Failed to sync Stripe data:', error);
      showToast(error.message || 'Failed to sync Stripe data', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
            <p className="text-gray-600 mt-1">
              Manage pricing plans, subscriptions, and platform revenue
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncStripeData}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync all data from Stripe"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Stripe Data'}
          </button>
          {activeTab === 'plans' && (
            <button
              onClick={handleCreatePlan}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Plan
            </button>
          )}
        </div>
      </div>

      <BillingTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'plans' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
              <p className="text-gray-600 mb-4">Create your first pricing plan to get started</p>
              <button
                onClick={handleCreatePlan}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEditPlan}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscription-plans' && <SubscriptionPlansTab />}

      {activeTab === 'subscriptions' && <SubscriptionsTab />}

      {activeTab === 'accounts' && <AccountsTab />}

      {activeTab === 'invoices' && <InvoicesTab />}

      {activeTab === 'metrics' && <MetricsTab />}

      <PlanEditorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        plan={selectedPlan}
        onSave={handleSavePlan}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};
