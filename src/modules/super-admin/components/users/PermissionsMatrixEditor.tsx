import React from 'react';
import { clsx } from 'clsx';
import { RolePermissions, PermissionLevel } from '../../types';
import { MODULES } from '../../services/roles-service';

interface PermissionsMatrixEditorProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
}

const PERMISSION_LEVELS: PermissionLevel[] = ['none', 'read', 'write', 'admin'];

export const PermissionsMatrixEditor: React.FC<PermissionsMatrixEditorProps> = ({
  permissions,
  onChange,
}) => {
  const handlePermissionChange = (moduleKey: string, level: PermissionLevel) => {
    onChange({
      ...permissions,
      [moduleKey]: level,
    });
  };

  const setAllPermissions = (level: PermissionLevel) => {
    const newPermissions: RolePermissions = {};
    MODULES.forEach(module => {
      newPermissions[module.key] = level;
    });
    onChange(newPermissions);
  };

  const getLevelColor = (level: PermissionLevel) => {
    switch (level) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'write':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'read':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'none':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Module Permissions</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAllPermissions('admin')}
            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200"
          >
            All Admin
          </button>
          <button
            type="button"
            onClick={() => setAllPermissions('read')}
            className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded border border-green-200"
          >
            All Read
          </button>
          <button
            type="button"
            onClick={() => setAllPermissions('none')}
            className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-50 rounded border border-gray-200"
          >
            All None
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-4 text-xs font-medium text-gray-700 border-b">
                Module
              </th>
              {PERMISSION_LEVELS.map(level => (
                <th key={level} className="text-center py-2 px-2 text-xs font-medium text-gray-700 border-b capitalize">
                  {level}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((module, index) => {
              const currentLevel = permissions[module.key] || 'none';
              return (
                <tr key={module.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {module.label}
                  </td>
                  {PERMISSION_LEVELS.map(level => (
                    <td key={level} className="text-center py-3 px-2">
                      <button
                        type="button"
                        onClick={() => handlePermissionChange(module.key, level)}
                        className={clsx(
                          'w-6 h-6 rounded-full border-2 transition-all',
                          currentLevel === level
                            ? getLevelColor(level) + ' scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        )}
                        aria-label={`Set ${module.label} to ${level}`}
                      >
                        {currentLevel === level && (
                          <span className="text-xs">✓</span>
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>None:</strong> No access to this module</p>
        <p><strong>Read:</strong> View-only access</p>
        <p><strong>Write:</strong> Create and edit capabilities</p>
        <p><strong>Admin:</strong> Full control including delete and settings</p>
      </div>
    </div>
  );
};
