import { RolePermissions } from '../store/services/rolesApi';

export const getUserPermissions = (): RolePermissions | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('🔍 getUserPermissions - user:', user);
    console.log('🔍 getUserPermissions - role:', user.role);
    console.log('🔍 getUserPermissions - permissions:', user.role?.permissions);
    return user.role?.permissions || null;
  } catch (error) {
    console.error('❌ getUserPermissions error:', error);
    return null;
  }
};

export const hasPermission = (module: keyof RolePermissions, action: string): boolean => {
  const permissions = getUserPermissions();
  console.log(`🔐 hasPermission(${module}, ${action})`);
  console.log('  permissions:', permissions);
  
  if (!permissions) {
    console.log('  ✅ No permissions found, returning true (full access)');
    return true;
  }
  
  const modulePermissions = permissions[module] as any;
  console.log(`  ${module} permissions:`, modulePermissions);
  
  if (!modulePermissions) {
    console.log('  ✅ Module not found, returning true');
    return true;
  }
  
  const result = modulePermissions[action] === true;
  console.log(`  ${result ? '✅' : '❌'} ${module}.${action} = ${result}`);
  return result;
};

export const canAccessModule = (module: keyof RolePermissions): boolean => {
  const permissions = getUserPermissions();
  console.log(`🔐 canAccessModule(${module})`);
  
  if (!permissions) {
    console.log('  ✅ No permissions found, returning true');
    return true;
  }
  
  const modulePermissions = permissions[module] as any;
  if (!modulePermissions) {
    console.log('  ✅ Module not found, returning true');
    return true;
  }
  
  const result = Object.values(modulePermissions).some(value => value === true);
  console.log(`  ${result ? '✅' : '❌'} canAccessModule(${module}) = ${result}`);
  return result;
};
