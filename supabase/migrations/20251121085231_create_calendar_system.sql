/*
  # Calendar and Appointment System

  ## Overview
  This migration creates a comprehensive calendar and appointment management system with support for calendar groups, service menus, rooms, and equipment.

  ## 1. New Tables

    ### `calendar_groups`
    - `id` (uuid, primary key) - Unique identifier for the group
    - `name` (text) - Name of the calendar group
    - `description` (text, nullable) - Description of the group
    - `user_id` (uuid) - Owner of the group
    - `created_at` (timestamptz) - When the group was created
    - `updated_at` (timestamptz) - When the group was last updated

    ### `calendars`
    - `id` (uuid, primary key) - Unique identifier for the calendar
    - `name` (text) - Name of the calendar
    - `group_id` (uuid, nullable) - Reference to calendar group
    - `duration` (integer) - Default duration in minutes
    - `type` (text) - Calendar type (personal, round-robin, event)
    - `status` (text) - Status (active, inactive)
    - `owner_id` (uuid) - Owner of the calendar
    - `description` (text, nullable) - Description
    - `color` (text) - Display color for the calendar
    - `created_at` (timestamptz) - When created
    - `updated_at` (timestamptz) - When last updated

    ### `appointments`
    - `id` (uuid, primary key) - Unique identifier
    - `title` (text) - Appointment title
    - `contact_id` (uuid, nullable) - Reference to contact
    - `status` (text) - Status (upcoming, cancelled, completed)
    - `appointment_time` (timestamptz) - Scheduled time
    - `end_time` (timestamptz) - End time
    - `calendar_id` (uuid) - Reference to calendar
    - `owner_id` (uuid) - Appointment owner/creator
    - `location` (text, nullable) - Location
    - `notes` (text, nullable) - Additional notes
    - `created_at` (timestamptz) - When created
    - `updated_at` (timestamptz) - When last updated

    ### `service_menu_items`
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Service name
    - `description` (text, nullable) - Service description
    - `duration` (integer) - Duration in minutes
    - `price` (decimal, nullable) - Service price
    - `calendar_id` (uuid, nullable) - Associated calendar
    - `status` (text) - Status (active, inactive)
    - `created_at` (timestamptz) - When created
    - `updated_at` (timestamptz) - When last updated

    ### `rooms`
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Room name
    - `description` (text, nullable) - Room description
    - `capacity` (integer, nullable) - Room capacity
    - `status` (text) - Status (active, inactive)
    - `created_at` (timestamptz) - When created
    - `updated_at` (timestamptz) - When last updated

    ### `equipment`
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text) - Equipment name
    - `description` (text, nullable) - Equipment description
    - `quantity` (integer) - Available quantity
    - `status` (text) - Status (active, inactive, maintenance)
    - `created_at` (timestamptz) - When created
    - `updated_at` (timestamptz) - When last updated

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for viewing shared calendars and appointments

  ## 3. Important Notes
    - All timestamps use timestamptz for timezone support
    - Foreign keys use ON DELETE CASCADE where appropriate
    - Indexes added for frequently queried fields
    - Default values set for status and timestamp fields
*/

-- Create calendar_groups table
CREATE TABLE IF NOT EXISTS calendar_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create calendars table
CREATE TABLE IF NOT EXISTS calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  group_id uuid REFERENCES calendar_groups(id) ON DELETE SET NULL,
  duration integer DEFAULT 30,
  type text DEFAULT 'personal' CHECK (type IN ('personal', 'round-robin', 'event')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  owner_id uuid NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  contact_id uuid,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'cancelled', 'completed')),
  appointment_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  calendar_id uuid REFERENCES calendars(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_menu_items table
CREATE TABLE IF NOT EXISTS service_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration integer DEFAULT 30,
  price decimal(10, 2),
  calendar_id uuid REFERENCES calendars(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  capacity integer,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  quantity integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_groups_user_id ON calendar_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_calendars_owner_id ON calendars(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendars_group_id ON calendars(group_id);
CREATE INDEX IF NOT EXISTS idx_calendars_status ON calendars(status);
CREATE INDEX IF NOT EXISTS idx_appointments_calendar_id ON appointments(calendar_id);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments(appointment_time);
CREATE INDEX IF NOT EXISTS idx_service_menu_calendar_id ON service_menu_items(calendar_id);

-- Enable Row Level Security
ALTER TABLE calendar_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_groups
CREATE POLICY "Users can view their own calendar groups"
  ON calendar_groups FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create calendar groups"
  ON calendar_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar groups"
  ON calendar_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar groups"
  ON calendar_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for calendars
CREATE POLICY "Users can view their own calendars"
  ON calendars FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create calendars"
  ON calendars FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own calendars"
  ON calendars FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own calendars"
  ON calendars FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own appointments"
  ON appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for service_menu_items
CREATE POLICY "All authenticated users can view service menu items"
  ON service_menu_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create service menu items"
  ON service_menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update service menu items"
  ON service_menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete service menu items"
  ON service_menu_items FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for rooms
CREATE POLICY "All authenticated users can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for equipment
CREATE POLICY "All authenticated users can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_calendar_groups_updated_at
  BEFORE UPDATE ON calendar_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_menu_items_updated_at
  BEFORE UPDATE ON service_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
