/*
  # Add Solar Products Feature Flag

  1. Purpose
    - Add a feature flag to control the availability of solar products in the measurement ordering system
    - Allows Super Admin to enable/disable solar products (Inform Essentials+, Inform Advanced, TrueDesign for Sales, TrueDesign for Planning)
    - Initially set to 'off' with a clear message that products will be available in V1

  2. Changes
    - Insert new feature flag record into feature_flags table
    - Set status to 'off' to disable solar products by default
    - Set rollout_type to 'all' for global control
    - Add descriptive information about the feature

  3. Notes
    - Super Admin can toggle this flag from the Features page
    - When enabled, solar products become immediately available for selection
    - No code deployment needed to activate the feature
*/

-- Insert the solar products feature flag
INSERT INTO feature_flags (
  key,
  name,
  description,
  status,
  rollout_type,
  rollout_config
) VALUES (
  'solar_products_enabled',
  'Solar Products',
  'Enable solar products for measurement orders (Inform Essentials+, Inform Advanced, TrueDesign for Sales, TrueDesign for Planning). These products will be available in V1.',
  'off',
  'all',
  '{}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
