-- Create campaigns table (matches backend API exactly)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL,
    staff_id INTEGER,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('email', 'sms')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    template_key VARCHAR(100),
    subject VARCHAR(500),
    from_name VARCHAR(255),
    from_email VARCHAR(255),
    content TEXT NOT NULL,
    target_audience JSONB NOT NULL DEFAULT '{"filter_type": "all", "estimated_count": 0}',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_recipients table (matches backend API)
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- Create campaign_stats table
CREATE TABLE IF NOT EXISTS campaign_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL UNIQUE REFERENCES campaigns(id) ON DELETE CASCADE,
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_staff_id ON campaigns(staff_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact_id ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_sent_at ON campaign_recipients(sent_at);

CREATE INDEX IF NOT EXISTS idx_campaign_stats_campaign_id ON campaign_stats(campaign_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER campaigns_updated_at_trigger
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Create function to automatically update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update campaign stats
    INSERT INTO campaign_stats (campaign_id, total_recipients, total_sent, total_opened, total_clicked, total_bounced, total_failed, last_updated)
    SELECT 
        NEW.campaign_id,
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'sent'),
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL),
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL),
        COUNT(*) FILTER (WHERE status = 'bounced'),
        COUNT(*) FILTER (WHERE status = 'failed'),
        NOW()
    FROM campaign_recipients
    WHERE campaign_id = NEW.campaign_id
    ON CONFLICT (campaign_id) 
    DO UPDATE SET
        total_recipients = EXCLUDED.total_recipients,
        total_sent = EXCLUDED.total_sent,
        total_opened = EXCLUDED.total_opened,
        total_clicked = EXCLUDED.total_clicked,
        total_bounced = EXCLUDED.total_bounced,
        total_failed = EXCLUDED.total_failed,
        last_updated = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when recipients change
CREATE TRIGGER campaign_recipients_stats_trigger
    AFTER INSERT OR UPDATE ON campaign_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_campaign_stats();

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaigns (using user_id integer)
CREATE POLICY "Users can view their own campaigns"
    ON campaigns FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can create their own campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (
        user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can update their own campaigns"
    ON campaigns FOR UPDATE
    USING (
        user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

CREATE POLICY "Users can delete their own campaigns"
    ON campaigns FOR DELETE
    USING (
        user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    );

-- Create RLS policies for campaign_recipients (using user_id from campaigns)
CREATE POLICY "Users can view recipients of their campaigns"
    ON campaign_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create recipients for their campaigns"
    ON campaign_recipients FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can update recipients of their campaigns"
    ON campaign_recipients FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete recipients of their campaigns"
    ON campaign_recipients FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

-- Create RLS policies for campaign_stats (using user_id from campaigns)
CREATE POLICY "Users can view stats of their campaigns"
    ON campaign_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE campaigns.id = campaign_stats.campaign_id
            AND campaigns.user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
        )
    );

-- Grant necessary permissions
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaign_recipients TO authenticated;
GRANT ALL ON campaign_stats TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE campaigns IS 'Stores email and SMS marketing campaigns';
COMMENT ON TABLE campaign_recipients IS 'Tracks individual recipients for each campaign';
COMMENT ON TABLE campaign_stats IS 'Aggregated statistics for campaigns';

COMMENT ON COLUMN campaigns.user_id IS 'Parent user ID (integer) - for data ownership';
COMMENT ON COLUMN campaigns.staff_id IS 'Staff member ID (integer) - null for main users, set for staff members';
COMMENT ON COLUMN campaigns.type IS 'Campaign type: email or sms';
COMMENT ON COLUMN campaigns.status IS 'Campaign status: draft, scheduled, sending, sent, paused, cancelled';
COMMENT ON COLUMN campaigns.template_key IS 'Template used: database_reactivation, follow_up, proposal_followup, or null for custom';
COMMENT ON COLUMN campaigns.target_audience IS 'JSON object with filter_type, job_statuses, tags, estimated_count';
COMMENT ON COLUMN campaigns.tags IS 'Array of tags for campaign categorization';

COMMENT ON COLUMN campaign_recipients.contact_id IS 'Contact ID (integer) from contacts table';

COMMENT ON COLUMN campaign_recipients.status IS 'Recipient status: pending, sent, failed, bounced';
COMMENT ON COLUMN campaign_recipients.opened_at IS 'Timestamp when recipient opened the email';
COMMENT ON COLUMN campaign_recipients.clicked_at IS 'Timestamp when recipient clicked a link';
