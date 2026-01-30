-- Cleanup Script: Remove Printing Module
-- WARNING: This will delete all print logs and metadata.

BEGIN;

-- 1. Drop Printing Tables
DROP TABLE IF EXISTS loading_slips CASCADE;
DROP TABLE IF EXISTS pay_slips CASCADE;
DROP TABLE IF EXISTS print_logs CASCADE;
DROP TABLE IF EXISTS slip_prints CASCADE;
DROP TABLE IF EXISTS print_metadata CASCADE;
DROP TABLE IF EXISTS slip_counters CASCADE;

-- 2. Drop Sequences
DROP SEQUENCE IF EXISTS loading_slip_seq;
DROP SEQUENCE IF EXISTS pay_slip_seq;

-- 3. Cleanup Trips Table (Remove Slip Numbers)
ALTER TABLE trips DROP COLUMN IF EXISTS loading_slip_number;
ALTER TABLE trips DROP COLUMN IF EXISTS pay_slip_number;
ALTER TABLE trips DROP COLUMN IF EXISTS print_status;
ALTER TABLE trips DROP COLUMN IF EXISTS printed_at;
ALTER TABLE trips DROP COLUMN IF EXISTS last_printed_by;

COMMIT;
