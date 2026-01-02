-- Create opportunity_appointments table
CREATE TABLE IF NOT EXISTS public.opportunity_appointments (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    appointment_type VARCHAR(100) NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    assigned_to UUID,
    location TEXT,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_minutes_before INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunity_notes table
CREATE TABLE IF NOT EXISTS public.opportunity_notes (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunity_tasks table
CREATE TABLE IF NOT EXISTS public.opportunity_tasks (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to UUID,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunity_payments table
CREATE TABLE IF NOT EXISTS public.opportunity_payments (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMPTZ NOT NULL,
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create opportunity_associated_objects table
CREATE TABLE IF NOT EXISTS public.opportunity_associated_objects (
    id SERIAL PRIMARY KEY,
    opportunity_id INTEGER NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    object_type VARCHAR(50) NOT NULL CHECK (object_type IN ('job', 'contact', 'document', 'proposal', 'estimate')),
    object_id VARCHAR(100) NOT NULL,
    object_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_opportunity_id ON public.opportunity_appointments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_organization_id ON public.opportunity_appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_appointments_date ON public.opportunity_appointments(appointment_date);

CREATE INDEX IF NOT EXISTS idx_opportunity_notes_opportunity_id ON public.opportunity_notes(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_organization_id ON public.opportunity_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_notes_pinned ON public.opportunity_notes(is_pinned);

CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_opportunity_id ON public.opportunity_tasks(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_organization_id ON public.opportunity_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tasks_status ON public.opportunity_tasks(status);

CREATE INDEX IF NOT EXISTS idx_opportunity_payments_opportunity_id ON public.opportunity_payments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_payments_organization_id ON public.opportunity_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_payments_status ON public.opportunity_payments(status);

CREATE INDEX IF NOT EXISTS idx_opportunity_associated_objects_opportunity_id ON public.opportunity_associated_objects(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_associated_objects_type ON public.opportunity_associated_objects(object_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.opportunity_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_associated_objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for opportunity_appointments
CREATE POLICY "Users can view appointments in their organization"
    ON public.opportunity_appointments FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create appointments in their organization"
    ON public.opportunity_appointments FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update appointments in their organization"
    ON public.opportunity_appointments FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete appointments in their organization"
    ON public.opportunity_appointments FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

-- Create RLS policies for opportunity_notes
CREATE POLICY "Users can view notes in their organization"
    ON public.opportunity_notes FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create notes in their organization"
    ON public.opportunity_notes FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update notes in their organization"
    ON public.opportunity_notes FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete notes in their organization"
    ON public.opportunity_notes FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

-- Create RLS policies for opportunity_tasks
CREATE POLICY "Users can view tasks in their organization"
    ON public.opportunity_tasks FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create tasks in their organization"
    ON public.opportunity_tasks FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update tasks in their organization"
    ON public.opportunity_tasks FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete tasks in their organization"
    ON public.opportunity_tasks FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

-- Create RLS policies for opportunity_payments
CREATE POLICY "Users can view payments in their organization"
    ON public.opportunity_payments FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create payments in their organization"
    ON public.opportunity_payments FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update payments in their organization"
    ON public.opportunity_payments FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

CREATE POLICY "Users can delete payments in their organization"
    ON public.opportunity_payments FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM public.users WHERE id = auth.uid()
    ));

-- Create RLS policies for opportunity_associated_objects
CREATE POLICY "Users can view associated objects for their opportunities"
    ON public.opportunity_associated_objects FOR SELECT
    USING (opportunity_id IN (
        SELECT id FROM public.opportunities WHERE organization_id IN (
            SELECT organization_id FROM public.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can create associated objects for their opportunities"
    ON public.opportunity_associated_objects FOR INSERT
    WITH CHECK (opportunity_id IN (
        SELECT id FROM public.opportunities WHERE organization_id IN (
            SELECT organization_id FROM public.users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete associated objects for their opportunities"
    ON public.opportunity_associated_objects FOR DELETE
    USING (opportunity_id IN (
        SELECT id FROM public.opportunities WHERE organization_id IN (
            SELECT organization_id FROM public.users WHERE id = auth.uid()
        )
    ));

-- Grant permissions
GRANT ALL ON public.opportunity_appointments TO authenticated;
GRANT ALL ON public.opportunity_notes TO authenticated;
GRANT ALL ON public.opportunity_tasks TO authenticated;
GRANT ALL ON public.opportunity_payments TO authenticated;
GRANT ALL ON public.opportunity_associated_objects TO authenticated;
