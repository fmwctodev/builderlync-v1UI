-- Change organization_id from UUID to VARCHAR to support company slugs
ALTER TABLE opportunity_appointments 
ALTER COLUMN organization_id TYPE VARCHAR(100);

ALTER TABLE opportunity_notes 
ALTER COLUMN organization_id TYPE VARCHAR(100);

ALTER TABLE opportunity_tasks 
ALTER COLUMN organization_id TYPE VARCHAR(100);

ALTER TABLE opportunity_payments 
ALTER COLUMN organization_id TYPE VARCHAR(100);
