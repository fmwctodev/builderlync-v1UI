/*
  # Create Calendar & Scheduling System Tables
  
  1. New Tables
    - calendar_groups: Calendar group organization
    - calendars: Individual calendars
    - service_menu_items: Service offerings
    - rooms: Room resources
    - equipment: Equipment resources
    - appointment_attendees: Appointment attendees
    - recurring_appointments: Recurring appointment rules
    
  2. Security
    - Enable RLS on all tables
    - Organization-scoped access
*/

-- Calendar Groups Table
CREATE TABLE IF NOT EXISTS calendar_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_groups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage calendar groups in their org"
    ON calendar_groups FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = calendar_groups.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Calendars Table
CREATE TABLE IF NOT EXISTS calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  calendar_group_id uuid REFERENCES calendar_groups(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  type text DEFAULT 'personal',
  color text DEFAULT '#3B82F6',
  timezone text DEFAULT 'America/New_York',
  owner_id uuid REFERENCES auth.users(id),
  is_default boolean DEFAULT false,
  is_public boolean DEFAULT false,
  is_active boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage calendars in their org"
    ON calendars FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = calendars.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service Menu Items Table
CREATE TABLE IF NOT EXISTS service_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  buffer_before_minutes integer DEFAULT 0,
  buffer_after_minutes integer DEFAULT 0,
  price numeric,
  category text,
  color text DEFAULT '#3B82F6',
  is_public boolean DEFAULT true,
  is_active boolean DEFAULT true,
  requires_confirmation boolean DEFAULT false,
  max_attendees integer DEFAULT 1,
  settings jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_menu_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage service menu items in their org"
    ON service_menu_items FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = service_menu_items.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  capacity integer,
  location text,
  amenities jsonb DEFAULT '[]'::jsonb,
  hourly_rate numeric,
  color text DEFAULT '#3B82F6',
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage rooms in their org"
    ON rooms FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = rooms.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Equipment Table (for scheduling)
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  serial_number text,
  status text DEFAULT 'available',
  condition text DEFAULT 'good',
  hourly_rate numeric,
  daily_rate numeric,
  location text,
  is_active boolean DEFAULT true,
  maintenance_schedule jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage equipment in their org"
    ON equipment FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = equipment.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Appointment Attendees Table
CREATE TABLE IF NOT EXISTS appointment_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  email text,
  name text,
  role text DEFAULT 'attendee',
  status text DEFAULT 'pending',
  responded_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointment_attendees ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage appointment attendees"
    ON appointment_attendees FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM appointments
        JOIN user_organizations ON user_organizations.organization_id = appointments.organization_id
        WHERE appointments.id = appointment_attendees.appointment_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Recurring Appointments Table
CREATE TABLE IF NOT EXISTS recurring_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  recurrence_rule text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  start_date date NOT NULL,
  end_date date,
  timezone text DEFAULT 'America/New_York',
  location text,
  service_id uuid REFERENCES service_menu_items(id),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage recurring appointments in their org"
    ON recurring_appointments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_organizations
        WHERE user_organizations.organization_id = recurring_appointments.organization_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Appointment Reminders Table
CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  remind_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending',
  recipient_email text,
  recipient_phone text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can manage appointment reminders"
    ON appointment_reminders FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM appointments
        JOIN user_organizations ON user_organizations.organization_id = appointments.organization_id
        WHERE appointments.id = appointment_reminders.appointment_id
        AND user_organizations.user_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calendar_groups_org ON calendar_groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendars_org ON calendars(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendars_group ON calendars(calendar_group_id);
CREATE INDEX IF NOT EXISTS idx_calendars_owner ON calendars(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_menu_items_org ON service_menu_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_rooms_org ON rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_org ON equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointment_attendees_appointment ON appointment_attendees(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_attendees_user ON appointment_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_org ON recurring_appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_remind_at ON appointment_reminders(remind_at);
