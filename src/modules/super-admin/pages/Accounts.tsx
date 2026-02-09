import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { AccountsProvider, useAccounts } from '../contexts/AccountsContext';
import { AccountFilters } from '../components/accounts/AccountFilters';
import { AccountsTable } from '../components/accounts/AccountsTable';
import { AccountEditModal } from '../components/accounts/AccountEditModal';
import { Card } from '../components/ui/Card';
import { EnterpriseAccount } from '../types';

const AccountsContent: React.FC = () => {
  const {
    accounts,
    loading,
    updateAccount,
    createAccount,
    deleteAccount,
    suspendAccount,
    reactivateAccount,
    syncAllAccounts,
    showToast,
  } = useAccounts();

  const [syncing, setSyncing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<EnterpriseAccount | undefined>();

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesSearch =
        searchQuery === '' ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
      const matchesPlan = planFilter === 'all' || account.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [accounts, searchQuery, statusFilter, planFilter]);

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedAccount(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (account: EnterpriseAccount) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleSuspendClick = async (account: EnterpriseAccount) => {
    if (window.confirm(`Are you sure you want to suspend ${account.name}?`)) {
      await suspendAccount(account.id);
    }
  };

  const handleReactivateClick = async (account: EnterpriseAccount) => {
    if (window.confirm(`Are you sure you want to reactivate ${account.name}?`)) {
      await reactivateAccount(account.id);
    }
  };

  const handleImpersonateClick = (account: EnterpriseAccount) => {
    console.log('Impersonate account:', account.id);
    showToast('Impersonation would open tenant app in real system', 'info');
  };

  const handleDeleteClick = async (account: EnterpriseAccount) => {
    const confirmText = window.prompt(
      `⚠️ WARNING: This will permanently delete "${account.name}" and all associated data.\n\n` +
      `This action CANNOT be undone and will remove:\n` +
      `• Account and organization data\n` +
      `• All users and their profiles\n` +
      `• Billing history and subscriptions\n` +
      `• Pipelines, modules, and settings\n\n` +
      `Type "DELETE" (in capital letters) to confirm:`
    );

    if (confirmText === 'DELETE') {
      const finalConfirm = window.confirm(
        `Final confirmation: Delete "${account.name}"?\n\n` +
        `Owner: ${account.ownerName} (${account.ownerEmail})\n` +
        `Plan: ${account.plan}\n` +
        `Status: ${account.status}\n\n` +
        `Click OK to permanently delete this account.`
      );

      if (finalConfirm) {
        try {
          await deleteAccount(account.id);
          setModalOpen(false);
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    } else if (confirmText !== null) {
      showToast('Deletion cancelled: confirmation text did not match', 'error');
    }
  };

  const handleModalSave = async (data: any) => {
    if (modalMode === 'create') {
      await createAccount(data);
    } else if (selectedAccount) {
      await updateAccount(selectedAccount.id, data, `Account details updated`);
    }
  };

  const handleModalDelete = () => {
    if (selectedAccount) {
      handleDeleteClick(selectedAccount);
    }
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    try {
      await syncAllAccounts();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage all contractor accounts and subscriptions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync all organizations to enterprise accounts"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Accounts'}
          </button>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Account
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAccounts.length} of {accounts.length} accounts
        </p>
      </div>

      <AccountFilters
        search={searchQuery}
        status={statusFilter}
        plan={planFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onPlanChange={setPlanFilter}
      />

      <Card>
        <AccountsTable
          accounts={filteredAccounts}
          onEdit={handleEditClick}
          onSuspend={handleSuspendClick}
          onReactivate={handleReactivateClick}
          onImpersonate={handleImpersonateClick}
          onDelete={handleDeleteClick}
        />
      </Card>

      <AccountEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        account={selectedAccount}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />
    </div>
  );
};

export const Accounts: React.FC = () => {
  return (
    <AccountsProvider>
      <AccountsContent />
    </AccountsProvider>
  );
};
