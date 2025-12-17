# Seed Dummy Data Instructions

This document explains how to populate your database with dummy pipelines and opportunities for testing.

## What Gets Created

Running the seed script will create:

### 📋 Two Pipelines

1. **Commercial Leads** - For commercial roofing opportunities
2. **Residential Leads** - For residential roofing opportunities (set as default)

### 🎯 Nine Stages per Pipeline

Each pipeline includes these 9 stages in order:
1. New Lead
2. Follow-Up 1
3. Follow-Up 2
4. Follow-Up 3
5. Long Term Follow Up
6. In Convo
7. Inspection/Estimate Booked (Creates Job)
8. Job Qualified
9. Job Unqualified

### 💼 30 Total Opportunities

- **15 Commercial opportunities** distributed across all stages
- **15 Residential opportunities** distributed across all stages
- Each opportunity includes:
  - Realistic names and values
  - Contact information (name, email, phone)
  - Source tracking (Website, Referral, Cold Call, etc.)
  - Tags for categorization
  - Varied statuses (open, won, lost)

## How to Run the Seed Script

### Step 1: Log Into Your Application

**IMPORTANT:** You must be logged into your application first!

1. Open your application in a browser
2. Navigate to the login page
3. Sign in with your user account
4. Keep the browser tab open

### Step 2: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 3: Run the Seed Script

1. Open the file `seed-dummy-data.sql` from your project root
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Cmd/Ctrl + Enter)

### Step 4: Verify Success

You should see success messages in the Results panel:

```
SUCCESS! Created dummy data:
- 2 Pipelines (Commercial Leads, Residential Leads)
- 18 Stages total (9 per pipeline)
- 30 Opportunities (15 per pipeline)
- 30 Contacts
```

### Step 5: View Your Data

1. Navigate to the Opportunities page in your application
2. You should see:
   - **Pipeline dropdown** with "Commercial Leads" and "Residential Leads"
   - **Kanban view** showing opportunities in their respective stages
   - **List view** displaying all opportunities in a table format

## Viewing the Data

### Kanban View

The Kanban board will display opportunities as cards organized by stage:
- Each column represents a stage
- Cards show opportunity name, value, and business name
- Drag and drop cards to move opportunities between stages

### List View

The list view shows opportunities in a table with columns:
- Opportunity Name
- Value
- Business Name
- Stage
- Status
- Source
- Tags

## Sample Data Details

### Commercial Opportunities Include:
- Warehouse Roof Replacement ($85,000)
- Manufacturing Plant Roof ($125,000)
- Corporate HQ Replacement ($185,000)
- And 12 more varied commercial projects

### Residential Opportunities Include:
- 123 Oak Street Roof ($12,500)
- 789 Pine Avenue Replacement ($15,000)
- 357 Sycamore Lane Replacement ($17,500)
- And 12 more varied residential projects

## Troubleshooting

### Error: "No authenticated user found"

**Solution:** Make sure you're logged into your application before running the script. The script uses `auth.uid()` to get your user ID.

### Error: Table does not exist

**Solution:** Make sure you've run the initial database setup first. Check the `OPPORTUNITIES_SETUP.md` file for instructions on creating the necessary tables.

### Data doesn't appear in the application

**Solution:**
1. Refresh your browser
2. Check that you're logged in with the same account used when running the script
3. Verify the pipelines were created by checking the Supabase database tables

## Cleaning Up Test Data

If you want to remove the dummy data:

```sql
-- Delete all opportunities and contacts for the dummy pipelines
DELETE FROM opportunity_contacts WHERE opportunity_id IN (
  SELECT id FROM opportunities WHERE pipeline_id IN (
    SELECT id FROM pipelines WHERE name IN ('Commercial Leads', 'Residential Leads')
  )
);

DELETE FROM opportunities WHERE pipeline_id IN (
  SELECT id FROM pipelines WHERE name IN ('Commercial Leads', 'Residential Leads')
);

-- Delete the pipeline stages
DELETE FROM pipeline_stages WHERE pipeline_id IN (
  SELECT id FROM pipelines WHERE name IN ('Commercial Leads', 'Residential Leads')
);

-- Delete the pipelines
DELETE FROM pipelines WHERE name IN ('Commercial Leads', 'Residential Leads');
```

## Notes

- All dummy data is tied to your authenticated user account
- The data respects Row Level Security (RLS) policies
- Only you can see and access this data
- The "Residential Leads" pipeline is set as the default pipeline
- Opportunities in stages 7 and 8 have "won" and "lost" statuses respectively
