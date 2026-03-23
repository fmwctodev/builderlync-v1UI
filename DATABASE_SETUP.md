# Database Setup Guide

This project uses **hosted Supabase** (not local Supabase CLI). All database operations are performed through the Supabase Dashboard.

## Quick Start

### 1. Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Set Up Required Tables

Navigate to **Settings → Database Migrations** in the application to:

- View which tables exist in your database
- See which tables are missing
- Get ready-to-use SQL scripts
- Copy SQL and run in Supabase Dashboard

## Database Migration Workflow

### Option A: Using the Migration Manager (Recommended)

1. Log into your application
2. Go to **Settings → Database Migrations**
3. Review the table status dashboard
4. Click **"Copy SQL for Staff Table"** to get SQL for essential staff table
5. Or click **"Open Supabase SQL Editor"** to open your Supabase dashboard
6. Paste the SQL in the SQL Editor and click **"Run"**
7. Return to the Migration Manager and click **"Refresh Status"**
8. Verify all tables show green checkmarks

### Option B: Running Migrations Manually

1. Open your Supabase Dashboard: `https://supabase.com/dashboard`
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the migration SQL from `supabase/migrations/` files
5. Paste and execute in SQL Editor
6. Verify tables were created in **Table Editor**

## Required Tables

The following tables are essential for the platform:

- `staff` - Staff/team member management
- `roles` - Role definitions and permissions
- `staff_roles` - Staff-to-role assignments (junction)
- `staff_role_assignments` - Role assignment tracking
- `contacts` - Customer/contact management
- `pipelines` - Sales pipeline definitions
- `pipeline_stages` - Stages within pipelines
- `opportunities` - Sales opportunities/deals
- `appointments` - Calendar appointments

## Migration Files

All migration files are stored in `supabase/migrations/` for reference. These files contain:

- Complete table definitions
- Row Level Security (RLS) policies
- Indexes for performance
- Default data seeds

You can review these files to understand the database schema, but they should be executed through the Supabase Dashboard SQL Editor.

## Troubleshooting

### "Could not find the table in schema cache" Error

This means a required table doesn't exist in your database yet.

**Solution**: Use the Database Migration Manager to create missing tables.

### GitHub Supabase Preview Errors

This project doesn't use Supabase CLI for local development. If you see errors about `config.toml`, they can be safely ignored. The app connects directly to your hosted Supabase instance.

### RLS Policy Errors

If you get permission errors when accessing data:

1. Check that RLS policies were created with the table migrations
2. Verify you're authenticated (logged in)
3. Review policies in Supabase Dashboard → Authentication → Policies

## Architecture

```
Application (Frontend)
    ↓
Environment Variables (.env)
    ↓
Supabase Client (@supabase/supabase-js)
    ↓
Hosted Supabase Database
```

The application connects directly to hosted Supabase using the JavaScript client. No local Supabase instance is required.

## Edge Functions

Edge Functions are deployed separately through the Supabase Dashboard or via the MCP Supabase tools. They are located in `supabase/functions/`.

## Support

If you encounter database issues:

1. Check the Database Migration Manager for table status
2. Review error messages in browser console
3. Verify environment variables are set correctly
4. Check Supabase Dashboard logs for detailed errors
