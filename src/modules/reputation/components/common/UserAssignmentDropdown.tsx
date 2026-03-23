import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../shared/lib/supabase';

interface OrgMember {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
}

interface Props {
  orgId: string;
  value: string | null;
  onChange: (userId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const UserAssignmentDropdown: React.FC<Props> = ({
  orgId,
  value,
  onChange,
  disabled,
  placeholder = 'Select a user…',
}) => {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);

    supabase
      .from('organization_members')
      .select('user_id, role, user_profiles(display_name, email)')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        const rows: OrgMember[] = (data ?? []).map((m) => {
          const profile = Array.isArray(m.user_profiles)
            ? m.user_profiles[0]
            : m.user_profiles;
          return {
            user_id: m.user_id as string,
            display_name: (profile as { display_name?: string } | null)?.display_name ?? 'Unknown',
            email: (profile as { email?: string } | null)?.email ?? '',
            role: m.role as string,
          };
        });
        setMembers(rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orgId]);

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled || loading}
      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {members.map((m) => (
        <option key={m.user_id} value={m.user_id}>
          {m.display_name} ({m.role})
        </option>
      ))}
    </select>
  );
};
