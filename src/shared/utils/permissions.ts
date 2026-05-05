import { RolePermissions } from '../store/services/rolesApi';

export const getUserPermissions = (): RolePermissions | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role) return null;
    return user.role.permissions || null;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return null;
  }
};

export const isParentUser = (): boolean => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return !user.role;
  } catch (error) {
    return false;
  }
};

export const hasPermission = (module: keyof RolePermissions, action: string): boolean => {
  if (isParentUser()) return true;
  
  const permissions = getUserPermissions();
  if (!permissions) return false;
  
  const modulePermissions = permissions[module] as any;
  if (!modulePermissions) return false;
  
  return modulePermissions[action] === true;
};

export const canAccessModule = (module: keyof RolePermissions): boolean => {
  if (isParentUser()) return true;
  
  const permissions = getUserPermissions();
  if (!permissions) return false;
  
  const modulePermissions = permissions[module] as any;
  if (!modulePermissions) return false;
  
  return Object.values(modulePermissions).some(value => value === true);
};
