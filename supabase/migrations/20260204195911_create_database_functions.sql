/*
  # Create Database Functions

  This migration creates all necessary database functions for the application.

  ## Functions Created:

  ### 1. Utility Functions
    - `generate_po_number()` - Generates purchase order numbers
    - `generate_wo_number()` - Generates work order numbers
    - `generate_estimator_slug()` - Generates unique slugs for estimators
    - `generate_unique_code(length)` - Generates random alphanumeric codes

  ### 2. Updated_at Trigger Functions
    - `update_updated_at_column()` - Generic trigger function for updated_at timestamps
    - Various table-specific updated_at functions

  ### 3. Business Logic Functions
    - `log_material_order_change()` - Logs material order history
    - `update_form_submission_count()` - Updates form submission counts
    - `sierra_search_knowledge_base()` - Vector similarity search for Sierra AI
    - `calculate_account_health_score()` - Calculates enterprise account health

  ### 4. Sync Functions
    - `sync_organization_to_enterprise_account()` - Syncs org data to enterprise
    - `sync_organization_member_to_platform_user()` - Syncs members to platform users
    - `get_organization_owner()` - Gets organization owner

  ### 5. Setup Functions
    - `setup_organization()` - Sets up new organizations with defaults
    - `cleanup_test_user()` - Cleans up test user data

  ### 6. Monitoring Functions
    - `check_form_submissions_schema_health()` - Schema health checks
    - `cleanup_old_error_logs()` - Cleans up old error logs
    - `get_slow_queries()` - Returns slow query metrics

  ## Security
    - Functions use SECURITY DEFINER where appropriate
    - Proper access controls on sensitive functions
*/

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM material_orders
  WHERE po_number LIKE 'PO-%';
  
  new_number := 'PO-' || LPAD(counter::text, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_wo_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(wo_number FROM 4) AS integer)), 0) + 1
  INTO counter
  FROM work_orders
  WHERE wo_number LIKE 'WO-%';
  
  new_number := 'WO-' || LPAD(counter::text, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_estimator_slug()
RETURNS text AS $$
DECLARE
  new_slug text;
  slug_exists boolean;
BEGIN
  LOOP
    new_slug := lower(
      substr(md5(random()::text || clock_timestamp()::text), 1, 8)
    );
    
    SELECT EXISTS(
      SELECT 1 FROM instant_estimators WHERE slug = new_slug
    ) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_unique_code(length integer DEFAULT 8)
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_pipelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ai_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_marketing_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_instant_estimators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_work_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_material_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_brand_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_calendars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_material_order_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO material_order_history (
    order_id,
    changed_by,
    change_type,
    old_status,
    new_status,
    notes
  ) VALUES (
    NEW.id,
    NEW.updated_by,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_change'
      ELSE 'updated'
    END,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
    NEW.status,
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_form_submission_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE marketing_forms
    SET submission_count = submission_count + 1,
        last_submission_at = now()
    WHERE id = NEW.form_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE marketing_forms
    SET submission_count = GREATEST(0, submission_count - 1)
    WHERE id = OLD.form_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sierra_search_knowledge_base(
  p_organization_id uuid,
  p_agent_id uuid,
  p_query_embedding vector(384),
  p_match_threshold float DEFAULT 0.7,
  p_match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source_type text,
  source_id uuid,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.content,
    e.source_type,
    e.source_id,
    1 - (e.embedding <=> p_query_embedding) as similarity
  FROM sierra_kb_embeddings e
  JOIN ai_agents a ON a.id = e.agent_id
  WHERE e.organization_id = p_organization_id
    AND e.agent_id = p_agent_id
    AND 1 - (e.embedding <=> p_query_embedding) > p_match_threshold
  ORDER BY e.embedding <=> p_query_embedding
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_account_health_score(p_account_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_usage_score integer;
  v_billing_score integer;
  v_engagement_score integer;
  v_total_score integer;
BEGIN
  SELECT 
    CASE 
      WHEN ut.api_calls > 0 THEN LEAST(100, (ut.api_calls::float / NULLIF(ul.api_calls_limit, 0) * 100)::integer)
      ELSE 0
    END
  INTO v_usage_score
  FROM usage_tracking ut
  LEFT JOIN usage_limits ul ON ul.organization_id = ut.organization_id
  WHERE ut.organization_id = p_account_id
  ORDER BY ut.period_start DESC
  LIMIT 1;

  v_usage_score := COALESCE(v_usage_score, 50);

  SELECT 
    CASE 
      WHEN bs.mrr > 0 THEN 100
      WHEN bs.mrr = 0 THEN 50
      ELSE 25
    END
  INTO v_billing_score
  FROM billing_snapshots bs
  WHERE bs.organization_id = p_account_id
  ORDER BY bs.snapshot_date DESC
  LIMIT 1;

  v_billing_score := COALESCE(v_billing_score, 50);

  SELECT 
    CASE 
      WHEN COUNT(*) > 10 THEN 100
      WHEN COUNT(*) > 5 THEN 75
      WHEN COUNT(*) > 0 THEN 50
      ELSE 25
    END
  INTO v_engagement_score
  FROM audit_logs al
  WHERE al.organization_id = p_account_id
    AND al.created_at > now() - interval '7 days';

  v_engagement_score := COALESCE(v_engagement_score, 50);

  v_total_score := (v_usage_score + v_billing_score + v_engagement_score) / 3;

  v_result := jsonb_build_object(
    'total_score', v_total_score,
    'usage_score', v_usage_score,
    'billing_score', v_billing_score,
    'engagement_score', v_engagement_score,
    'calculated_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_onboarding_completion(p_organization_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_progress record;
  v_total_steps integer := 10;
  v_completed_steps integer := 0;
BEGIN
  SELECT * INTO v_progress
  FROM onboarding_progress
  WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'completion_percentage', 0,
      'completed_steps', 0,
      'total_steps', v_total_steps,
      'status', 'not_started'
    );
  END IF;

  IF v_progress.welcome_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.branding_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.team_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.pipeline_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.integrations_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.lead_sources_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.phone_setup_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.ai_agent_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.billing_completed THEN v_completed_steps := v_completed_steps + 1; END IF;
  IF v_progress.review_completed THEN v_completed_steps := v_completed_steps + 1; END IF;

  v_result := jsonb_build_object(
    'completion_percentage', (v_completed_steps::float / v_total_steps * 100)::integer,
    'completed_steps', v_completed_steps,
    'total_steps', v_total_steps,
    'status', CASE 
      WHEN v_completed_steps = v_total_steps THEN 'completed'
      WHEN v_completed_steps > 0 THEN 'in_progress'
      ELSE 'not_started'
    END,
    'current_step', v_progress.current_step
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SYNC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_organization_to_enterprise_account()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_owner_email text;
  v_owner_name text;
BEGIN
  SELECT om.user_id INTO v_owner_id
  FROM organization_members om
  WHERE om.organization_id = NEW.id
    AND om.role = 'owner'
    AND om.is_active = true
  LIMIT 1;

  IF v_owner_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data->>'full_name'
    INTO v_owner_email, v_owner_name
    FROM auth.users
    WHERE id = v_owner_id;
  END IF;

  INSERT INTO enterprise_accounts (
    id,
    organization_id,
    company_name,
    plan_tier,
    status,
    owner_name,
    owner_email,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.name,
    COALESCE(NEW.subscription_tier, 'free'),
    CASE 
      WHEN NEW.subscription_status = 'active' THEN 'active'
      WHEN NEW.subscription_status = 'trialing' THEN 'trial'
      ELSE 'inactive'
    END,
    v_owner_name,
    v_owner_email,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    plan_tier = EXCLUDED.plan_tier,
    status = EXCLUDED.status,
    owner_name = EXCLUDED.owner_name,
    owner_email = EXCLUDED.owner_email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_organization_member_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email text;
  v_user_name text;
  v_org_name text;
BEGIN
  SELECT email, raw_user_meta_data->>'full_name'
  INTO v_user_email, v_user_name
  FROM auth.users
  WHERE id = NEW.user_id;

  SELECT name INTO v_org_name
  FROM organizations
  WHERE id = NEW.organization_id;

  INSERT INTO platform_users (
    id,
    user_id,
    organization_id,
    email,
    full_name,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.user_id,
    NEW.organization_id,
    v_user_email,
    v_user_name,
    NEW.role,
    CASE WHEN NEW.is_active THEN 'active' ELSE 'inactive' END,
    NEW.created_at,
    now()
  )
  ON CONFLICT (user_id, organization_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_organization_owner(p_organization_id uuid)
RETURNS uuid AS $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT user_id INTO v_owner_id
  FROM organization_members
  WHERE organization_id = p_organization_id
    AND role = 'owner'
    AND is_active = true
  LIMIT 1;
  
  RETURN v_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id uuid)
RETURNS TABLE (organization_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id
  FROM organization_members om
  WHERE om.user_id = p_user_id
    AND om.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SETUP FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION setup_organization(
  p_organization_id uuid,
  p_user_id uuid,
  p_organization_name text,
  p_plan_tier text DEFAULT 'free'
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  UPDATE organizations
  SET 
    name = p_organization_name,
    subscription_tier = p_plan_tier,
    subscription_status = 'active',
    updated_at = now()
  WHERE id = p_organization_id;

  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active,
    created_at
  ) VALUES (
    p_organization_id,
    p_user_id,
    'owner',
    true,
    now()
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE SET
    role = 'owner',
    is_active = true;

  INSERT INTO onboarding_progress (
    organization_id,
    current_step,
    welcome_completed,
    created_at,
    updated_at
  ) VALUES (
    p_organization_id,
    'welcome',
    false,
    now(),
    now()
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO usage_limits (
    organization_id,
    contacts_limit,
    storage_limit_gb,
    api_calls_limit,
    team_members_limit,
    created_at,
    updated_at
  ) VALUES (
    p_organization_id,
    CASE p_plan_tier
      WHEN 'enterprise' THEN -1
      WHEN 'professional' THEN 50000
      WHEN 'starter' THEN 5000
      ELSE 1000
    END,
    CASE p_plan_tier
      WHEN 'enterprise' THEN 1000
      WHEN 'professional' THEN 100
      WHEN 'starter' THEN 10
      ELSE 1
    END,
    CASE p_plan_tier
      WHEN 'enterprise' THEN -1
      WHEN 'professional' THEN 100000
      WHEN 'starter' THEN 10000
      ELSE 1000
    END,
    CASE p_plan_tier
      WHEN 'enterprise' THEN -1
      WHEN 'professional' THEN 25
      WHEN 'starter' THEN 5
      ELSE 1
    END,
    now(),
    now()
  )
  ON CONFLICT (organization_id) DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'organization_id', p_organization_id,
    'message', 'Organization setup completed'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_test_user(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_org_ids uuid[];
  v_result jsonb;
BEGIN
  SELECT ARRAY_AGG(organization_id) INTO v_org_ids
  FROM organization_members
  WHERE user_id = p_user_id;

  DELETE FROM organization_members WHERE user_id = p_user_id;

  IF v_org_ids IS NOT NULL THEN
    DELETE FROM organizations 
    WHERE id = ANY(v_org_ids)
      AND NOT EXISTS (
        SELECT 1 FROM organization_members om 
        WHERE om.organization_id = organizations.id
      );
  END IF;

  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'organizations_cleaned', COALESCE(array_length(v_org_ids, 1), 0)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MONITORING FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_form_submissions_schema_health()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_table_exists boolean;
  v_column_count integer;
  v_index_count integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'form_submissions'
  ) INTO v_table_exists;

  IF NOT v_table_exists THEN
    RETURN jsonb_build_object(
      'healthy', false,
      'error', 'form_submissions table does not exist'
    );
  END IF;

  SELECT COUNT(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_name = 'form_submissions';

  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE tablename = 'form_submissions';

  v_result := jsonb_build_object(
    'healthy', true,
    'table_exists', v_table_exists,
    'column_count', v_column_count,
    'index_count', v_index_count,
    'checked_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_old_error_logs(p_days_to_keep integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM error_logs
  WHERE created_at < now() - (p_days_to_keep || ' days')::interval;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_slow_queries(
  p_threshold_ms integer DEFAULT 1000,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  query_hash text,
  query_text text,
  avg_duration_ms numeric,
  max_duration_ms numeric,
  call_count bigint,
  last_called timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qm.query_hash,
    qm.query_text,
    AVG(qm.duration_ms)::numeric as avg_duration_ms,
    MAX(qm.duration_ms)::numeric as max_duration_ms,
    COUNT(*)::bigint as call_count,
    MAX(qm.created_at) as last_called
  FROM query_metrics qm
  WHERE qm.duration_ms >= p_threshold_ms
  GROUP BY qm.query_hash, qm.query_text
  ORDER BY avg_duration_ms DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_query_metric(
  p_query_hash text,
  p_query_text text,
  p_duration_ms numeric,
  p_rows_affected integer DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO query_metrics (
    query_hash,
    query_text,
    duration_ms,
    rows_affected,
    created_at
  ) VALUES (
    p_query_hash,
    p_query_text,
    p_duration_ms,
    p_rows_affected,
    now()
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREDIT AND BILLING FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION deduct_organization_credits(
  p_organization_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'usage'
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_result jsonb;
BEGIN
  SELECT credits_balance INTO v_current_balance
  FROM organization_credits
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No credits record found for organization'
    );
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_balance', v_current_balance,
      'requested', p_amount
    );
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE organization_credits
  SET 
    credits_balance = v_new_balance,
    updated_at = now()
  WHERE organization_id = p_organization_id;

  INSERT INTO credit_transactions (
    organization_id,
    amount,
    type,
    reason,
    balance_after,
    created_at
  ) VALUES (
    p_organization_id,
    -p_amount,
    'deduction',
    p_reason,
    v_new_balance,
    now()
  );

  v_result := jsonb_build_object(
    'success', true,
    'previous_balance', v_current_balance,
    'deducted', p_amount,
    'new_balance', v_new_balance
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_organization_credits(
  p_organization_id uuid,
  p_amount integer,
  p_reason text DEFAULT 'purchase'
)
RETURNS jsonb AS $$
DECLARE
  v_current_balance integer;
  v_new_balance integer;
  v_result jsonb;
BEGIN
  INSERT INTO organization_credits (
    organization_id,
    credits_balance,
    created_at,
    updated_at
  ) VALUES (
    p_organization_id,
    0,
    now(),
    now()
  )
  ON CONFLICT (organization_id) DO NOTHING;

  SELECT credits_balance INTO v_current_balance
  FROM organization_credits
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  v_new_balance := COALESCE(v_current_balance, 0) + p_amount;

  UPDATE organization_credits
  SET 
    credits_balance = v_new_balance,
    updated_at = now()
  WHERE organization_id = p_organization_id;

  INSERT INTO credit_transactions (
    organization_id,
    amount,
    type,
    reason,
    balance_after,
    created_at
  ) VALUES (
    p_organization_id,
    p_amount,
    'addition',
    p_reason,
    v_new_balance,
    now()
  );

  v_result := jsonb_build_object(
    'success', true,
    'previous_balance', COALESCE(v_current_balance, 0),
    'added', p_amount,
    'new_balance', v_new_balance
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTH HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
BEGIN
  INSERT INTO organizations (
    id,
    name,
    subscription_tier,
    subscription_status,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email),
    'free',
    'trialing',
    now(),
    now()
  )
  RETURNING id INTO v_org_id;

  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    is_active,
    created_at
  ) VALUES (
    v_org_id,
    NEW.id,
    'owner',
    true,
    now()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM super_admin_users
    WHERE user_id = p_user_id
      AND is_active = true
  ) INTO v_is_admin;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_belongs_to_organization(
  p_user_id uuid,
  p_organization_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_belongs boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = p_user_id
      AND organization_id = p_organization_id
      AND is_active = true
  ) INTO v_belongs;
  
  RETURN COALESCE(v_belongs, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STORM CANVASSING FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION find_nearby_doors(
  p_lat double precision,
  p_lng double precision,
  p_radius_meters integer DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  address text,
  distance_meters double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.address,
    ST_Distance(
      d.location::geography,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) as distance_meters
  FROM canvass_doors d
  WHERE ST_DWithin(
    d.location::geography,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_radius_meters
  )
  ORDER BY distance_meters
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_turf_stats(p_turf_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_total_doors integer;
  v_visited_doors integer;
  v_leads_count integer;
BEGIN
  SELECT COUNT(*) INTO v_total_doors
  FROM canvass_doors
  WHERE turf_id = p_turf_id;

  SELECT COUNT(DISTINCT door_id) INTO v_visited_doors
  FROM canvass_visits
  WHERE door_id IN (SELECT id FROM canvass_doors WHERE turf_id = p_turf_id);

  SELECT COUNT(*) INTO v_leads_count
  FROM canvass_leads
  WHERE turf_id = p_turf_id;

  v_result := jsonb_build_object(
    'total_doors', v_total_doors,
    'visited_doors', v_visited_doors,
    'visit_rate', CASE WHEN v_total_doors > 0 
      THEN (v_visited_doors::float / v_total_doors * 100)::numeric(5,2)
      ELSE 0 
    END,
    'leads_count', v_leads_count,
    'conversion_rate', CASE WHEN v_visited_doors > 0
      THEN (v_leads_count::float / v_visited_doors * 100)::numeric(5,2)
      ELSE 0
    END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DASHBOARD FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_organization_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_contacts_count integer;
  v_opportunities_count integer;
  v_jobs_count integer;
  v_revenue numeric;
BEGIN
  SELECT COUNT(*) INTO v_contacts_count
  FROM contacts
  WHERE organization_id = p_organization_id;

  SELECT COUNT(*) INTO v_opportunities_count
  FROM opportunities
  WHERE organization_id = p_organization_id
    AND status = 'open';

  SELECT COUNT(*) INTO v_jobs_count
  FROM jobs
  WHERE organization_id = p_organization_id
    AND status IN ('in_progress', 'scheduled');

  SELECT COALESCE(SUM(amount), 0) INTO v_revenue
  FROM invoices
  WHERE organization_id = p_organization_id
    AND status = 'paid'
    AND paid_at >= date_trunc('month', now());

  v_result := jsonb_build_object(
    'contacts_count', v_contacts_count,
    'open_opportunities', v_opportunities_count,
    'active_jobs', v_jobs_count,
    'mtd_revenue', v_revenue,
    'calculated_at', now()
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_pipeline_metrics(
  p_organization_id uuid,
  p_pipeline_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_agg(stage_data)
  INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'stage_id', ps.id,
      'stage_name', ps.name,
      'count', COUNT(o.id),
      'value', COALESCE(SUM(o.value), 0)
    ) as stage_data
    FROM pipeline_stages ps
    LEFT JOIN opportunities o ON o.stage_id = ps.id
    WHERE ps.organization_id = p_organization_id
      AND (p_pipeline_id IS NULL OR ps.pipeline_id = p_pipeline_id)
    GROUP BY ps.id, ps.name, ps.order_index
    ORDER BY ps.order_index
  ) stages;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
