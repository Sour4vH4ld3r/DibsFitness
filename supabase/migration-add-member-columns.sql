-- Migration: Add missing membership_type and monthly_fees columns to members table
-- Run this in Supabase SQL Editor to fix existing databases
-- Date: 2024-09-10

-- Add membership_type column with constraint and default value
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS membership_type TEXT 
CHECK (membership_type IN ('basic', 'premium', 'elite', 'custom')) 
DEFAULT 'basic';

-- Add monthly_fees column with default value
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS monthly_fees DECIMAL(10, 2) 
DEFAULT 0.00;

-- Create index for membership_type for better query performance
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type);

-- Update any existing members with sample membership data (optional)
-- UNCOMMENT the lines below if you want to set default values for existing members

-- UPDATE public.members 
-- SET 
--   membership_type = 'basic',
--   monthly_fees = CASE 
--     WHEN membership_type IS NULL OR membership_type = 'basic' THEN 99.00
--     WHEN membership_type = 'premium' THEN 149.00
--     WHEN membership_type = 'elite' THEN 199.00
--     WHEN membership_type = 'custom' THEN 250.00
--     ELSE 99.00
--   END
-- WHERE membership_type IS NULL OR monthly_fees IS NULL OR monthly_fees = 0;

-- Verification query - check that columns were added successfully
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'members'
AND column_name IN ('membership_type', 'monthly_fees')
ORDER BY ordinal_position;