# Super Admin Dashboard

A comprehensive platform administration dashboard for managing the BuilderLync SaaS platform.

## Features

### Authentication System
- **Dedicated Login**: Separate login page at `/super-admin/login`
- **Mock Authentication**: Uses localStorage-based sessions
- **Route Protection**: All routes protected with authentication guard
- **Session Management**: 8-hour session duration with automatic expiration

### Demo Credentials
- **Owner**: owner@builderlync.io / password123
- **Operations**: ops@builderlync.io / password123
- **Admin**: admin@builderlync.io / password123

## Pages & Features

### 1. Overview Dashboard (`/super-admin`)
- Platform KPIs (Active Accounts, MRR, ARR, Users, etc.)
- Accounts at Risk table
- System Status monitoring
- Recent Admin Actions audit log

### 2. Accounts Management (`/super-admin/accounts`)
- View all enterprise accounts
- Filter by status, plan, tags
- Account health scoring
- Module management per account

### 3. Users & Roles (`/super-admin/users`)
- User directory across all accounts
- Role management
- Permission templates

### 4. Billing & Plans (`/super-admin/billing`)
- Plan definitions management
- Revenue metrics (MRR, ARR)
- Account billing status

### 5. Usage & Limits (`/super-admin/usage`)
- Usage tracking per account
- Limit monitoring
- Usage override capabilities

### 6. Feature Flags (`/super-admin/features`)
- Platform feature flag management
- Rollout strategies (all, beta, percentage, specific accounts)

### 7. Integrations & API (`/super-admin/integrations`)
- Global integration health monitoring
- Per-account integration status
- API key management

### 8. Security & Audit (`/super-admin/security`)
- Complete audit trail
- Security insights
- Policy management

### 9. Support & Feedback (`/super-admin/support`)
- Support ticket tracking
- Customer health scores
- NPS feedback management

### 10. System Health (`/super-admin/system`)
- System metrics and diagnostics
- Background job monitoring
- Maintenance mode controls

## Database Schema

The super admin system uses 13 Supabase tables:

- `super_admin_users` - Admin authentication
- `enterprise_accounts` - Contractor accounts
- `account_modules` - Enabled modules per account
- `account_integrations` - Integration connections
- `usage_tracking` - Usage metrics
- `usage_limits` - Custom limits per account
- `feature_flags` - Platform features
- `plan_definitions` - Subscription plans
- `audit_events` - Complete audit trail
- `billing_snapshots` - Billing information
- `integration_health` - Global integration status
- `support_tickets` - Support tracking
- `nps_feedback` - Customer feedback

All tables include proper RLS policies and are seeded with realistic mock data.

## Technology Stack

- **React** 18.3.1 with TypeScript
- **React Router** 6.23.0 for routing
- **Supabase** for database and authentication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

## Project Structure

```
src/modules/super-admin/
├── components/
│   ├── ui/              # Reusable UI components (Badge, Card)
│   ├── layout/          # Layout components (Sidebar, TopBar, AuthGuard)
│   └── StatCard.tsx     # KPI card component
├── pages/               # Page components for each route
│   ├── Login.tsx
│   ├── Logout.tsx
│   ├── Overview.tsx
│   └── ... (other pages)
├── services/            # Supabase API service layer
│   ├── accounts-service.ts
│   ├── billing-service.ts
│   ├── usage-service.ts
│   └── ... (other services)
├── utils/               # Utility functions
│   └── super-admin-auth.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── constants/           # Constants and configuration
│   └── auth.ts
└── SuperAdminModule.tsx # Main module component with routing
```

## Usage

### Accessing the Dashboard

1. Navigate to `/super-admin/login`
2. Enter credentials (see Demo Credentials above)
3. You'll be redirected to the Overview dashboard
4. Session lasts 8 hours

### Logout

- Click "Logout" in the sidebar
- Or navigate to `/super-admin/logout`

### Navigation

All routes are accessible via the fixed sidebar on the left. The dashboard is fully responsive and works on desktop, tablet, and mobile devices.

## Development

### Adding New Features

1. Create new page component in `pages/`
2. Add route in `SuperAdminModule.tsx`
3. Add navigation item in `SuperAdminSidebar.tsx`
4. Create service methods in appropriate service file
5. Update types in `types/index.ts` if needed

### Data Services

All data operations go through the service layer in `services/`. Each service file exports functions that interact with Supabase and return typed data.

Example:
```typescript
import { getAccounts } from '../services/accounts-service';

const accounts = await getAccounts({ status: 'active' });
```

## Security

- All routes except login/logout are protected by `SuperAdminAuthGuard`
- Sessions expire after 8 hours
- All database operations use Supabase RLS policies
- Audit logging tracks all admin actions

## Future Enhancements

- Replace mock authentication with real Supabase auth
- Add more detailed pages for each section
- Implement search command palette (Cmd+K)
- Add data export functionality
- Build advanced filtering and sorting
- Add real-time updates with Supabase subscriptions
- Implement user impersonation feature
- Add email notifications for critical events
