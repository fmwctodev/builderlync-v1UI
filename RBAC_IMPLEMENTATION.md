# Role-Based Access Control (RBAC) Implementation

## Overview
This document explains the role-based access control system implemented in BuilderLync.

## Architecture

### 1. Permission Structure
Users have roles with granular permissions across different modules:

```typescript
{
  "jobs": {
    "edit": false,
    "view": true,
    "create": false,
    "delete": false,
    "manage_status": false
  },
  "staff": {
    "add": false,
    "edit": false,
    "view": false,
    "delete": false,
    "assign_roles": false
  },
  "contacts": {
    "edit": false,
    "view": true,
    "create": true,
    "delete": false,
    "export": true
  },
  // ... other modules
}
```

### 2. Key Files

#### `/src/shared/utils/permissions.ts`
Core permission checking utilities:
- `getUserPermissions()` - Gets current user's permissions from localStorage
- `hasPermission(module, action)` - Checks if user has specific permission
- `canAccessModule(module)` - Checks if user has any permission in a module

#### `/src/shared/utils/usePermissions.ts`
React hook for permission checking:
```typescript
const { can, canAccess, permissions } = usePermissions();

// Check specific permission
if (can('staff', 'add')) {
  // Show add button
}

// Check module access
if (canAccess('contacts')) {
  // Show contacts module
}
```

#### `/src/shared/utils/routes.ts`
Route configuration with permission requirements:
```typescript
{
  name: 'CRM',
  href: '/crm',
  icon: Users,
  requiredPermission: {
    module: 'contacts'
  }
}
```

#### `/src/shared/components/Navigation.tsx`
Automatically filters navigation based on user permissions.

### 3. User Data Structure

When a user logs in, their data includes role information:
```typescript
{
  id: 123,
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  role: {
    id: "role-uuid",
    name: "Sales Manager",
    permissions: { /* permission object */ }
  }
}
```

### 4. Usage Examples

#### In Components
```typescript
import { usePermissions } from '../shared/utils/usePermissions';

const MyComponent = () => {
  const { can, canAccess } = usePermissions();

  return (
    <>
      {can('staff', 'add') && (
        <button onClick={handleAdd}>Add Staff</button>
      )}
      
      {can('staff', 'edit') && (
        <button onClick={handleEdit}>Edit</button>
      )}
      
      {can('staff', 'delete') && (
        <button onClick={handleDelete}>Delete</button>
      )}
    </>
  );
};
```

#### Route Protection
Routes are automatically filtered in the Navigation component based on `requiredPermission` in route config.

### 5. Permission Modules

Available permission modules:
- `contacts` - Contact management
- `jobs` - Job/project management
- `financial` - Billing and payments
- `staff` - Staff management
- `system` - System settings
- `communications` - Messaging
- `marketing` - Marketing campaigns
- `scheduling` - Calendar and appointments
- `estimates` - Estimates and quotes
- `reporting` - Reports and analytics
- `field_operations` - Field work
- `integrations` - Third-party integrations
- `automation` - Automation and AI

### 6. Implementation Checklist

✅ Permission utility functions created
✅ User interface updated to include role data
✅ Route configuration with permissions
✅ Navigation component filters routes
✅ Staff component uses permission checks
✅ React hook for easy permission checking

### 7. Next Steps

To add permission checks to other components:

1. Import the hook:
```typescript
import { usePermissions } from '../shared/utils/usePermissions';
```

2. Use in component:
```typescript
const { can } = usePermissions();
```

3. Check permissions:
```typescript
{can('module_name', 'action_name') && <YourComponent />}
```

### 8. API Integration

The system expects the login API to return user data with role information:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": {
        "id": "role-uuid",
        "name": "Sales Manager",
        "permissions": { /* full permissions object */ }
      }
    },
    "token": "jwt-token"
  }
}
```

The permissions are stored in localStorage with the user object and accessed throughout the application.
