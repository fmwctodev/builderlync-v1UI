import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EnterpriseAccount } from '../types';
import {
  getAccounts,
  getAccountById,
  updateAccount as updateAccountService,
  createAccount as createAccountService,
  deleteAccount as deleteAccountService,
  getAccountModules,
  updateAccountModules,
  syncAllAccounts as syncAllAccountsService,
  recalculateHealthScore as recalculateHealthScoreService
} from '../services/accounts-service';
import { logAuditEvent } from '../services/audit-service';
import { getSuperAdminUser } from '../utils/super-admin-auth';
import {
  sendAccountSuspensionNotification,
  sendAccountReactivationNotification,
  sendNewAccountWelcomeNotification
} from '../services/email-service';

interface AccountsContextValue {
  accounts: EnterpriseAccount[];
  loading: boolean;
  error: string | null;
  refreshAccounts: () => Promise<void>;
  getAccount: (id: string) => EnterpriseAccount | undefined;
  updateAccount: (id: string, updates: Partial<EnterpriseAccount>, auditMessage?: string) => Promise<void>;
  createAccount: (data: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'healthScore' | 'lastLoginAt'>) => Promise<string>;
  deleteAccount: (id: string) => Promise<void>;
  suspendAccount: (id: string) => Promise<void>;
  reactivateAccount: (id: string) => Promise<void>;
  toggleModule: (accountId: string, moduleName: string, enabled: boolean) => Promise<void>;
  syncAllAccounts: () => Promise<void>;
  recalculateHealthScore: (accountId: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within AccountsProvider');
  }
  return context;
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<EnterpriseAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const refreshAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load accounts';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const getAccount = useCallback((id: string) => {
    return accounts.find(acc => acc.id === id);
  }, [accounts]);

  const logAudit = async (accountId: string, action: string, details?: string) => {
    const user = getSuperAdminUser();
    if (!user) return;

    try {
      await logAuditEvent({
        actorType: 'super_admin',
        actorId: user.id,
        actorName: user.name,
        action,
        targetType: 'account',
        targetId: accountId,
        targetName: accounts.find(a => a.id === accountId)?.name || 'Unknown',
        metadata: details ? { details } : undefined,
      });
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
  };

  const updateAccount = useCallback(async (
    id: string,
    updates: Partial<EnterpriseAccount>,
    auditMessage?: string
  ) => {
    try {
      await updateAccountService(id, updates);

      setAccounts(prev => prev.map(acc =>
        acc.id === id ? { ...acc, ...updates } : acc
      ));

      if (auditMessage) {
        await logAudit(id, 'update', auditMessage);
      }

      showToast('Account updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update account';
      showToast(message, 'error');
      throw err;
    }
  }, [accounts, showToast]);

  const createAccount = useCallback(async (
    data: Omit<EnterpriseAccount, 'id' | 'createdAt' | 'healthScore' | 'lastLoginAt'>
  ): Promise<string> => {
    try {
      const newId = await createAccountService(data);

      await refreshAccounts();
      await logAudit(newId, 'create', `Created new account: ${data.name}`);

      try {
        await sendNewAccountWelcomeNotification({
          accountName: data.name,
          accountEmail: data.ownerEmail,
          planName: data.plan
        });
      } catch (err) {
        console.error('Failed to send welcome notification:', err);
      }

      showToast('Account created successfully');
      return newId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      showToast(message, 'error');
      throw err;
    }
  }, [refreshAccounts, showToast]);

  const suspendAccount = useCallback(async (id: string) => {
    const account = getAccount(id);
    if (!account) {
      showToast('Account not found', 'error');
      return;
    }

    await updateAccount(id, { status: 'suspended' }, 'Account suspended');

    try {
      await sendAccountSuspensionNotification({
        accountName: account.name,
        accountEmail: account.ownerEmail,
        reason: 'Administrative action'
      });
    } catch (err) {
      console.error('Failed to send suspension notification:', err);
    }
  }, [updateAccount, getAccount, showToast]);

  const reactivateAccount = useCallback(async (id: string) => {
    const account = getAccount(id);
    if (!account) {
      showToast('Account not found', 'error');
      return;
    }

    await updateAccount(id, { status: 'active' }, 'Account reactivated');

    try {
      await sendAccountReactivationNotification({
        accountName: account.name,
        accountEmail: account.ownerEmail
      });
    } catch (err) {
      console.error('Failed to send reactivation notification:', err);
    }
  }, [updateAccount, getAccount, showToast]);

  const deleteAccount = useCallback(async (id: string) => {
    const account = getAccount(id);
    if (!account) {
      showToast('Account not found', 'error');
      return;
    }

    try {
      await logAudit(id, 'delete', `Account deleted: ${account.name}`);

      const result = await deleteAccountService(id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete account');
      }

      setAccounts(prev => prev.filter(acc => acc.id !== id));
      showToast(`Account "${account.name}" has been permanently deleted`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      showToast(message, 'error');
      throw err;
    }
  }, [getAccount, showToast]);

  const toggleModule = useCallback(async (accountId: string, moduleName: string, enabled: boolean) => {
    try {
      await updateAccountModules(accountId, [{ moduleName, enabled }]);

      setAccounts(prev => prev.map(acc => {
        if (acc.id === accountId) {
          return acc;
        }
        return acc;
      }));

      await logAudit(
        accountId,
        'update',
        `Module '${moduleName}' ${enabled ? 'enabled' : 'disabled'}`
      );

      showToast(`Module ${enabled ? 'enabled' : 'disabled'} successfully`);
      await refreshAccounts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle module';
      showToast(message, 'error');
      throw err;
    }
  }, [showToast, refreshAccounts]);

  const syncAllAccounts = useCallback(async () => {
    try {
      showToast('Syncing accounts...', 'info');
      const result = await syncAllAccountsService();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sync accounts');
      }

      await refreshAccounts();

      showToast(
        `Sync complete: ${result.created || 0} created, ${result.updated || 0} updated${result.errors ? `, ${result.errors} errors` : ''}`,
        'success'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync accounts';
      showToast(message, 'error');
      throw err;
    }
  }, [refreshAccounts, showToast]);

  const recalculateHealthScore = useCallback(async (accountId: string) => {
    try {
      const result = await recalculateHealthScoreService(accountId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to recalculate health score');
      }

      setAccounts(prev => prev.map(acc =>
        acc.id === accountId ? { ...acc, healthScore: result.healthScore || acc.healthScore } : acc
      ));

      showToast(`Health score updated: ${result.healthScore}`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to recalculate health score';
      showToast(message, 'error');
      throw err;
    }
  }, [showToast]);

  const value: AccountsContextValue = {
    accounts,
    loading,
    error,
    refreshAccounts,
    getAccount,
    updateAccount,
    createAccount,
    deleteAccount,
    suspendAccount,
    reactivateAccount,
    toggleModule,
    syncAllAccounts,
    recalculateHealthScore,
    showToast,
  };

  return (
    <AccountsContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </AccountsContext.Provider>
  );
};
