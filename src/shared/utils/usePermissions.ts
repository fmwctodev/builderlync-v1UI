import { useMemo } from 'react';
import { RolePermissions } from '../store/services/rolesApi';
import { getUserPermissions, hasPermission, canAccessModule } from './permissions';

export const usePermissions = () => {
  const permissions = useMemo(() => getUserPermissions(), []);

  const can = (module: keyof RolePermissions, action: string): boolean => {
    return hasPermission(module, action);
  };

  const canAccess = (module: keyof RolePermissions): boolean => {
    return canAccessModule(module);
  };

  return {
    permissions,
    can,
    canAccess
  };
};
