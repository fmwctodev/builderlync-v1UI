import React from 'react';
import { Check, Users } from 'lucide-react';
import type { SocialAccount, SocialAccountGroup, SocialProvider } from '../types';
import ProviderIcon from './ProviderIcon';

interface AccountSelectorProps {
  accounts: SocialAccount[];
  groups: SocialAccountGroup[];
  selected: string[];
  onChange: (ids: string[]) => void;
  filterProvider?: SocialProvider;
  compact?: boolean;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  groups,
  selected,
  onChange,
  filterProvider,
  compact = false,
}) => {
  const filtered = filterProvider
    ? accounts.filter((a) => a.provider === filterProvider)
    : accounts;

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const toggleGroup = (group: SocialAccountGroup) => {
    const allSelected = group.account_ids.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !group.account_ids.includes(id)));
    } else {
      const toAdd = group.account_ids.filter((id) => !selected.includes(id));
      onChange([...selected, ...toAdd]);
    }
  };

  if (!filtered.length) {
    return (
      <p className="text-xs text-slate-500 italic">No connected accounts</p>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((acc) => {
          const isSelected = selected.includes(acc.id);
          return (
            <button
              key={acc.id}
              onClick={() => toggle(acc.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-colors ${
                isSelected
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <ProviderIcon provider={acc.provider} size={12} />
              <span className="max-w-[100px] truncate">{acc.account_name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-medium mb-1.5">Groups</p>
          <div className="space-y-1">
            {groups.map((group) => {
              const allSelected = group.account_ids.every((id) => selected.includes(id));
              const someSelected = group.account_ids.some((id) => selected.includes(id));
              return (
                <label
                  key={group.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                >
                  <div
                    onClick={() => toggleGroup(group)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      allSelected
                        ? 'bg-cyan-600 border-cyan-600'
                        : someSelected
                        ? 'bg-cyan-600/40 border-cyan-600/40'
                        : 'border-slate-600 bg-slate-700'
                    }`}
                  >
                    {(allSelected || someSelected) && <Check size={10} className="text-white" />}
                  </div>
                  <Users size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{group.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">{group.account_ids.length} accounts</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {groups.length > 0 && (
          <p className="text-xs text-slate-500 font-medium mb-1.5">Individual Accounts</p>
        )}
        <div className="space-y-1">
          {filtered.map((acc) => {
            const isSelected = selected.includes(acc.id);
            return (
              <label
                key={acc.id}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
              >
                <div
                  onClick={() => toggle(acc.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 bg-slate-700'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>
                <ProviderIcon provider={acc.provider} size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{acc.account_name}</p>
                  <p className="text-xs text-slate-500 capitalize">{acc.provider}</p>
                </div>
                {acc.status !== 'connected' && (
                  <span className="text-xs text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                    {acc.status}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;
