-- Simple update to ensure isactive column exists and has correct values
-- First check if the column exists and update it
ALTER TABLE IF EXISTS users ALTER COLUMN isactive TYPE boolean;
ALTER TABLE IF EXISTS users ALTER COLUMN isactive SET DEFAULT true;
ALTER TABLE IF EXISTS users ALTER COLUMN isactive SET NOT NULL;

-- Update any null values to true
UPDATE users SET isactive = true WHERE isactive IS NULL; 