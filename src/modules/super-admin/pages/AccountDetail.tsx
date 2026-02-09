import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AccountsProvider, useAccounts } from '../contexts/AccountsContext';
import { AccountHeader } from '../components/accounts/AccountHeader';
import { AccountSummaryCard } from '../components/accounts/AccountSummaryCard';
import { AccountModulesCard } from '../components/accounts/AccountModulesCard';
import { AccountUsageCard } from '../components/accounts/AccountUsageCard';
import { AccountBillingCard } from '../components/accounts/AccountBillingCard';
import { AccountIntegrationsCard } from '../components/accounts/AccountIntegrationsCard';
import { AccountAuditLog } from '../components/accounts/AccountAuditLog';
import { AccountEditModal } from '../components/accounts/AccountEditModal';
import { EnterpriseAccount } from '../types';

const AccountDetailContent: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const {
    getAccount,
    updateAccount,
    suspendAccount,
    reactivateAccount,
    toggleModule,
    showToast,
  } = useAccounts();

  const [account, setAccount] = useState<EnterpriseAccount | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountId) {
      const foundAccount = getAccount(accountId);
      setAccount(foundAccount);
      setLoading(false);

      if (!foundAccount) {
        showToast('Account not found', 'error');
      }
    }
  }, [accountId, getAccount, showToast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Not Found</h2>
        <p className="text-gray-600">The account you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleEdit = () => {
    setModalOpen(true);
  };

  const handleSuspend = async () => {
    if (window.confirm(`Are you sure you want to suspend ${account.name}?`)) {
      await suspendAccount(account.id);
      const updated = getAccount(account.id);
      if (updated) setAccount(updated);
    }
  };

  const handleReactivate = async () => {
    if (window.confirm(`Are you sure you want to reactivate ${account.name}?`)) {
      await reactivateAccount(account.id);
      const updated = getAccount(account.id);
      if (updated) setAccount(updated);
    }
  };

  const handleImpersonate = () => {
    console.log('Impersonate account:', account.id);
    showToast('Impersonation would open tenant app in real system', 'info');
  };

  const handleModuleToggle = async (moduleName: string, enabled: boolean) => {
    await toggleModule(account.id, moduleName, enabled);
  };

  const handleModalSave = async (data: any) => {
    await updateAccount(account.id, data, 'Account details updated');
    const updated = getAccount(account.id);
    if (updated) setAccount(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AccountHeader
        account={account}
        onEdit={handleEdit}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onImpersonate={handleImpersonate}
      />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AccountSummaryCard account={account} />
            <AccountModulesCard
              accountId={account.id}
              onToggle={handleModuleToggle}
            />
            <AccountUsageCard accountId={account.id} />
          </div>

          <div className="space-y-6">
            <AccountBillingCard account={account} onChangePlan={handleEdit} />
            <AccountIntegrationsCard accountId={account.id} />
            <AccountAuditLog accountId={account.id} />
          </div>
        </div>
      </div>

      <AccountEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="edit"
        account={account}
        onSave={handleModalSave}
      />
    </div>
  );
};

export const AccountDetail: React.FC = () => {
  return (
    <AccountsProvider>
      <AccountDetailContent />
    </AccountsProvider>
  );
};
