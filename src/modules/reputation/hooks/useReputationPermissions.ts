import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase';

export interface ReputationPermissions {
  canRead: boolean;
  canSync: boolean;
  canAIDraft: boolean;
  canReply: boolean;
  canDeleteReply: boolean;
  canReadSettings: boolean;
  canWriteSettings: boolean;
  canManageIntegration: boolean;
  loaded: boolean;
}

export function useReputationPermissions(orgId: string, userId: string): ReputationPermissions {
  const [perms, setPerms] = useState<ReputationPermissions>({
    canRead: false,
    canSync: false,
    canAIDraft: false,
    canReply: false,
    canDeleteReply: false,
    canReadSettings: false,
    canWriteSettings: false,
    canManageIntegration: false,
    loaded: false,
  });

  useEffect(() => {
    if (!orgId || !userId) {
      setPerms(prev => ({ ...prev, loaded: true }));
      return;
    }

    async function load() {
      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      const role = member?.role ?? '';
      const isOwnerOrAdmin = role === 'owner' || role === 'admin';

      const { data: customPerms } = await supabase
        .from('user_permissions')
        .select('permission_key, permission_value')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .in('permission_key', [
          'reputation:read',
          'reputation:sync',
          'reputation:ai_draft',
          'reputation:reply',
          'reputation:delete_reply',
          'reputation:settings:read',
          'reputation:settings:write',
          'reputation:settings:integration',
        ]);

      const permMap: Record<string, boolean> = {};
      for (const p of customPerms ?? []) {
        permMap[p.permission_key] = p.permission_value === true || p.permission_value === 'true';
      }

      const has = (key: string) =>
        isOwnerOrAdmin || (permMap[key] !== undefined ? permMap[key] : false);

      setPerms({
        canRead: isOwnerOrAdmin || has('reputation:read'),
        canSync: isOwnerOrAdmin || has('reputation:sync'),
        canAIDraft: isOwnerOrAdmin || has('reputation:ai_draft'),
        canReply: isOwnerOrAdmin || has('reputation:reply'),
        canDeleteReply: isOwnerOrAdmin || has('reputation:delete_reply'),
        canReadSettings: isOwnerOrAdmin || has('reputation:settings:read'),
        canWriteSettings: isOwnerOrAdmin || has('reputation:settings:write'),
        canManageIntegration: isOwnerOrAdmin || has('reputation:settings:integration'),
        loaded: true,
      });
    }

    load().catch(console.error);
  }, [orgId, userId]);

  return perms;
}
