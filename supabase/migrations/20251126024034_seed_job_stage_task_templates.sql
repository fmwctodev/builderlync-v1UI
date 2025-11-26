/*
  # Seed Job Stage Task Templates

  This migration populates the job_stage_tasks table with:
  1. Auto-created tasks for all 13 job stages
  2. Optional task templates organized by category
  
  Auto-created tasks fire automatically when a job enters a stage.
  Optional tasks can be manually added by users as needed.
*/

-- ========================================
-- AUTO-CREATED TASKS FOR EACH STAGE
-- ========================================

-- 1. Inspection/Estimate Booked
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Inspection/Estimate Booked', 'Confirm appointment date/time with customer', 'Reach out to customer to confirm the scheduled appointment details', true, 1, 'inspection'),
('Inspection/Estimate Booked', 'Verify full property address & access notes', 'Ensure we have complete address and any special access instructions', true, 2, 'inspection'),
('Inspection/Estimate Booked', 'Assign primary rep (sales/inspector)', 'Assign the sales representative or inspector who will handle this job', true, 3, 'inspection'),
('Inspection/Estimate Booked', 'Send appointment confirmation SMS/email', 'Send automated confirmation message to customer', true, 4, 'inspection'),
('Inspection/Estimate Booked', 'Prepare inspection checklist & measurement tools', 'Ensure all tools and checklists are ready for the inspection', true, 5, 'inspection');

-- 2. Inspection/Estimate Complete
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Inspection/Estimate Complete', 'Upload inspection photos/videos', 'Add all photos and videos taken during inspection to job files', true, 1, 'inspection'),
('Inspection/Estimate Complete', 'Enter detailed inspection notes', 'Document all findings, conditions, and observations', true, 2, 'inspection'),
('Inspection/Estimate Complete', 'Add measurements (manual or report)', 'Input measurements or upload measurement report', true, 3, 'inspection'),
('Inspection/Estimate Complete', 'Tag job type (retail/insurance/mixed)', 'Classify the job type for proper workflow routing', true, 4, 'inspection'),
('Inspection/Estimate Complete', 'Schedule proposal drafting task', 'Create task to begin proposal preparation', true, 5, 'inspection');

-- 3. Proposal Drafted
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Proposal Drafted', 'Create detailed estimate with materials', 'Build complete estimate including all materials and labor', true, 1, 'proposal'),
('Proposal Drafted', 'Attach terms & conditions', 'Include all necessary terms, conditions, and warranties', true, 2, 'proposal'),
('Proposal Drafted', 'Internal QC review for pricing/margins', 'Review proposal for accuracy and profitability', true, 3, 'proposal'),
('Proposal Drafted', 'Prepare proposal for e-sign', 'Format and prepare proposal for electronic signature', true, 4, 'proposal');

-- 4. Proposal Sent
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Proposal Sent', 'Send proposal via email/portal', 'Deliver proposal to customer through preferred method', true, 1, 'proposal'),
('Proposal Sent', 'Create follow-up task (24–48 hrs)', 'Schedule follow-up contact in 24-48 hours', true, 2, 'proposal'),
('Proposal Sent', 'Confirm proposal delivery/open status', 'Verify customer received and opened the proposal', true, 3, 'proposal');

-- 5. Proposal Accepted
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Proposal Accepted', 'Confirm signed contract stored in job files', 'Verify signed contract is saved to job documents', true, 1, 'contract'),
('Proposal Accepted', 'Collect deposit/initial payment', 'Process deposit payment from customer', true, 2, 'contract'),
('Proposal Accepted', 'Verify scope and selections with customer', 'Confirm all materials and scope details with customer', true, 3, 'contract'),
('Proposal Accepted', 'Trigger Production Handoff Checklist', 'Begin production handoff process', true, 4, 'contract');

-- 6. Job Won
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Won', 'Introduce PM to customer (SMS/email)', 'Send introduction message from project manager to customer', true, 1, 'production'),
('Job Won', 'Confirm material selections and colors', 'Final verification of all material choices', true, 2, 'production'),
('Job Won', 'Verify job documents and uploads', 'Ensure all necessary documents are in the system', true, 3, 'production'),
('Job Won', 'Schedule permit/approval tasks', 'Create tasks for obtaining necessary permits', true, 4, 'production');

-- 7. Under Contract
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Under Contract', 'Submit permit applications', 'File all required permit applications with local authorities', true, 1, 'permits'),
('Under Contract', 'Finalize and confirm material SKUs', 'Lock in exact SKUs for all materials to be ordered', true, 2, 'permits'),
('Under Contract', 'Build job timeline & schedule draft', 'Create preliminary project schedule', true, 3, 'permits'),
('Under Contract', 'Confirm access/communication preferences', 'Verify how and when to communicate with customer', true, 4, 'permits');

-- 8. Invoice Sent
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Invoice Sent', 'Send invoice to customer', 'Deliver invoice through preferred method', true, 1, 'billing'),
('Invoice Sent', 'Set payment reminder sequence', 'Configure automated payment reminders', true, 2, 'billing'),
('Invoice Sent', 'Sync invoice with accounting', 'Ensure invoice is recorded in accounting system', true, 3, 'billing');

-- 9. Invoice Paid
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Invoice Paid', 'Record payment and receipt confirmation', 'Log payment received and send receipt', true, 1, 'billing'),
('Invoice Paid', 'Reconcile invoice in accounting', 'Update accounting records with payment', true, 2, 'billing'),
('Invoice Paid', 'Send customer payment receipt', 'Provide customer with payment confirmation', true, 3, 'billing');

-- 10. Job Scheduled
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Scheduled', 'Lock start dates in system calendar', 'Finalize and lock project start date', true, 1, 'scheduling'),
('Job Scheduled', 'Confirm schedule with customer', 'Get customer confirmation of scheduled dates', true, 2, 'scheduling'),
('Job Scheduled', 'Assign crews and foreman', 'Assign work crew and lead foreman to job', true, 3, 'scheduling'),
('Job Scheduled', 'Schedule dumpster delivery', 'Arrange dumpster delivery for start date', true, 4, 'scheduling'),
('Job Scheduled', 'Schedule material delivery', 'Coordinate material delivery timing', true, 5, 'scheduling');

-- 11. Materials Ordered
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Materials Ordered', 'Send POs to suppliers', 'Submit purchase orders to material suppliers', true, 1, 'materials'),
('Materials Ordered', 'Upload order confirmations', 'Save supplier order confirmations to job files', true, 2, 'materials'),
('Materials Ordered', 'Confirm delivery date/time', 'Verify scheduled delivery dates with suppliers', true, 3, 'materials'),
('Materials Ordered', 'Create delivery verification task', 'Set up task to verify materials upon arrival', true, 4, 'materials');

-- 12. Job Started
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Started', 'Day-1 customer confirmation', 'Confirm with customer that crew has arrived and started', true, 1, 'production'),
('Job Started', 'Upload "before photos"', 'Take and upload photos of property before work begins', true, 2, 'production'),
('Job Started', 'Log daily job progress', 'Create daily progress log entries', true, 3, 'production'),
('Job Started', 'Document any change orders', 'Record any scope changes or additions', true, 4, 'production');

-- 13. Job Complete
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Complete', 'Perform final inspection', 'Complete thorough final walkthrough and inspection', true, 1, 'completion'),
('Job Complete', 'Upload "after photos"', 'Take and upload final photos of completed work', true, 2, 'completion'),
('Job Complete', 'Complete punch list', 'Address and complete any punch list items', true, 3, 'completion'),
('Job Complete', 'Close out permit & inspections', 'Finalize all permit and inspection requirements', true, 4, 'completion'),
('Job Complete', 'Send review request', 'Request customer review/testimonial', true, 5, 'completion'),
('Job Complete', 'Send final invoice or confirm $0 balance', 'Issue final invoice or confirm account is settled', true, 6, 'completion');

-- ========================================
-- OPTIONAL TASK TEMPLATES
-- ========================================

-- Inspection/Estimate Stage Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Inspection/Estimate Booked', 'HOA requirements request', 'Contact HOA to determine approval requirements', false, 100, 'inspection_optional'),
('Inspection/Estimate Booked', 'Insurance adjuster contact outreach', 'Reach out to insurance adjuster for coordination', false, 101, 'inspection_optional'),
('Inspection/Estimate Booked', 'Pre-inspection drone flight', 'Schedule drone inspection if needed', false, 102, 'inspection_optional'),
('Inspection/Estimate Booked', 'Google Earth measurement verification', 'Verify measurements using Google Earth', false, 103, 'inspection_optional'),
('Inspection/Estimate Booked', 'Property history research', 'Research property history and previous work', false, 104, 'inspection_optional'),
('Inspection/Estimate Booked', 'Customer financing prequalification', 'Help customer explore financing options', false, 105, 'inspection_optional');

-- Proposal Stage Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Proposal Drafted', 'Create alternate proposal version (good/better/best)', 'Build tiered pricing options', false, 100, 'proposal_optional'),
('Proposal Drafted', 'Add upgrade options', 'Include optional upgrades like ridge vent, synthetic underlayment', false, 101, 'proposal_optional'),
('Proposal Drafted', 'Add supplement package (insurance jobs)', 'Create supplemental estimate for insurance claim', false, 102, 'proposal_optional'),
('Proposal Drafted', 'Create 3D visualization or color mockup', 'Generate visual rendering of proposed work', false, 103, 'proposal_optional'),
('Proposal Drafted', 'Add manufacturer registration link to proposal', 'Include warranty registration information', false, 104, 'proposal_optional');

-- Proposal Follow-Up Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Proposal Sent', '3-touch follow-up sequence', 'Execute strategic follow-up sequence', false, 100, 'followup_optional'),
('Proposal Sent', 'Competitor comparison sheet', 'Provide competitive analysis document', false, 101, 'followup_optional'),
('Proposal Sent', 'Send testimonial videos or proof doc', 'Share customer testimonials and portfolio', false, 102, 'followup_optional'),
('Proposal Sent', 'Schedule preconstruction walkthrough', 'Set up early walkthrough if requested', false, 103, 'followup_optional');

-- Production Handoff Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Won', 'Internal meeting: Sales → Production', 'Conduct handoff meeting between sales and production teams', false, 100, 'handoff_optional'),
('Job Won', 'Confirm homeowner responsibilities', 'Review customer responsibilities (vehicles, pets, access)', false, 101, 'handoff_optional'),
('Job Won', 'Order safety equipment for job', 'Order necessary safety gear and equipment', false, 102, 'handoff_optional'),
('Job Won', 'Coordinate with subcontractors', 'Schedule and coordinate subcontractor involvement', false, 103, 'handoff_optional'),
('Job Won', 'Upload warranty registration requirements', 'Document warranty registration process', false, 104, 'handoff_optional');

-- Under Contract Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Under Contract', 'Schedule inspector re-measure', 'Arrange for re-measurement if needed', false, 100, 'contract_optional'),
('Under Contract', 'Submit insurance supplement', 'File supplemental claim with insurance', false, 101, 'contract_optional'),
('Under Contract', 'Record special-order lead times', 'Document extended lead times for special materials', false, 102, 'contract_optional'),
('Under Contract', 'Notify neighbors (courtesy notices)', 'Send courtesy notifications to neighboring properties', false, 103, 'contract_optional'),
('Under Contract', 'Mark landscaping or property protection plan', 'Create plan for protecting landscaping and property', false, 104, 'contract_optional');

-- Materials & Scheduling Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Scheduled', 'Backup supplier order', 'Identify and order from backup supplier if needed', false, 100, 'materials_optional'),
('Job Scheduled', 'Custom metal fabrication request', 'Submit custom metal work orders', false, 101, 'materials_optional'),
('Job Scheduled', 'Weather risk review', 'Assess weather forecast and plan accordingly', false, 102, 'materials_optional'),
('Job Scheduled', 'Crew briefings / job packet creation', 'Create detailed job packet for crew', false, 103, 'materials_optional'),
('Job Scheduled', 'Dumpster placement diagram', 'Create diagram showing dumpster placement location', false, 104, 'materials_optional');

-- During Job Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Started', 'Daily photo documentation', 'Take comprehensive daily progress photos', false, 100, 'production_optional'),
('Job Started', 'Weather delay notice to customer', 'Notify customer of weather-related delays', false, 101, 'production_optional'),
('Job Started', 'Change order documentation & signature', 'Document and get approval for change orders', false, 102, 'production_optional'),
('Job Started', 'Internal team check-in', 'Conduct internal team status meeting', false, 103, 'production_optional'),
('Job Started', 'Quality control mid-job inspection', 'Perform QC inspection during project', false, 104, 'production_optional');

-- Job Complete Optional Templates
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Complete', 'Register manufacturer warranty', 'Complete manufacturer warranty registration', false, 100, 'completion_optional'),
('Job Complete', 'Register contractor labor warranty', 'Register contractor workmanship warranty', false, 101, 'completion_optional'),
('Job Complete', 'Upload final permit documents', 'Save finalized permit documentation', false, 102, 'completion_optional'),
('Job Complete', 'Create "aftercare" instructions for customer', 'Provide maintenance and care instructions', false, 103, 'completion_optional'),
('Job Complete', 'Request referral', 'Ask satisfied customer for referrals', false, 104, 'completion_optional'),
('Job Complete', 'Add project to portfolio/website', 'Feature completed project in marketing materials', false, 105, 'completion_optional');

-- Customer Experience Optional Templates (Can be added at any stage)
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Inspection/Estimate Booked', 'Send "What to Expect" guide', 'Provide customer with expectation-setting guide', false, 200, 'customer_experience'),
('Job Won', 'Send "What to Expect" guide', 'Provide customer with expectation-setting guide', false, 200, 'customer_experience'),
('Job Scheduled', 'Send "How to Prepare for Job Day" checklist', 'Provide job preparation checklist to customer', false, 201, 'customer_experience'),
('Job Complete', 'Send maintenance plan', 'Provide ongoing maintenance recommendations', false, 202, 'customer_experience'),
('Job Complete', 'Send Friends & Family referral incentive', 'Offer referral program details', false, 203, 'customer_experience');

-- Insurance Job Optional Templates (For insurance-type jobs)
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Inspection/Estimate Complete', 'Upload Xactimate or supplement estimates', 'Upload insurance estimate documentation', false, 200, 'insurance_optional'),
('Proposal Drafted', 'Create carrier call log', 'Document all communications with insurance carrier', false, 200, 'insurance_optional'),
('Proposal Drafted', 'Document depreciation, ACV, RCV breakdown', 'Detail insurance payment structure', false, 201, 'insurance_optional'),
('Under Contract', 'Request final check release', 'Request release of final insurance payment', false, 200, 'insurance_optional'),
('Job Complete', 'Submit final invoice to carrier', 'Send final invoice to insurance company', false, 200, 'insurance_optional');

-- Commercial Job Optional Templates (For commercial-type jobs)
INSERT INTO job_stage_tasks (stage_name, task_name, task_description, is_auto_created, task_order, task_category) VALUES
('Job Won', 'Add site safety binder', 'Create comprehensive site safety documentation', false, 200, 'commercial_optional'),
('Job Won', 'Add OSHA documentation', 'Compile required OSHA compliance documents', false, 201, 'commercial_optional'),
('Job Won', 'Add subcontractor agreements', 'Finalize all subcontractor contracts', false, 202, 'commercial_optional'),
('Job Started', 'Create weekly progress report tasks', 'Set up weekly progress reporting schedule', false, 200, 'commercial_optional'),
('Job Started', 'Request milestone inspections', 'Schedule required milestone inspections', false, 201, 'commercial_optional');