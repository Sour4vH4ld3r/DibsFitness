-- Dibs Fitness Database Schema - UPDATED
-- Run this in Supabase SQL Editor

-- First, add the missing columns to the existing members table
-- These are the columns that the frontend code is expecting but are missing from the current schema

-- ============================================
-- ADD MISSING COLUMNS TO MEMBERS TABLE
-- ============================================

-- Add membership_type column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS membership_type TEXT 
CHECK (membership_type IN ('basic', 'premium', 'elite', 'custom')) 
DEFAULT 'basic';

-- Add monthly_fees column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS monthly_fees DECIMAL(10, 2) 
DEFAULT 0.00;

-- Add index for membership_type for better query performance
CREATE INDEX IF NOT EXISTS idx_members_membership_type ON members(membership_type);

-- ============================================
-- ALTERNATIVE: If you want to recreate the table completely
-- (ONLY run this if you want to start fresh and lose existing data)
-- ============================================

-- UNCOMMENT BELOW ONLY IF YOU WANT TO RECREATE THE TABLE
-- DROP TABLE IF EXISTS public.members CASCADE;

-- CREATE TABLE public.members (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
--   full_name TEXT NOT NULL,
--   email TEXT NOT NULL,
--   phone TEXT,
--   status TEXT CHECK (status IN ('active', 'paused', 'expired')) DEFAULT 'active',
--   membership_type TEXT CHECK (membership_type IN ('basic', 'premium', 'elite', 'custom')) DEFAULT 'basic',
--   monthly_fees DECIMAL(10, 2) DEFAULT 0.00,
--   avatar_url TEXT,
--   date_of_birth DATE,
--   emergency_contact JSONB,
--   medical_notes TEXT,
--   join_date DATE DEFAULT CURRENT_DATE,
--   last_session_date DATE,
--   total_sessions INTEGER DEFAULT 0,
--   notes TEXT,
--   tags TEXT[],
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW(),
--   
--   UNIQUE(trainer_id, email)
-- );

-- -- Create indexes
-- CREATE INDEX idx_members_trainer ON members(trainer_id);
-- CREATE INDEX idx_members_status ON members(status);
-- CREATE INDEX idx_members_membership_type ON members(membership_type);

-- -- Enable RLS
-- ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- -- Members policies
-- CREATE POLICY "Trainers can view own members" ON members
--   FOR SELECT USING (trainer_id = auth.uid());

-- CREATE POLICY "Trainers can insert own members" ON members
--   FOR INSERT WITH CHECK (trainer_id = auth.uid());

-- CREATE POLICY "Trainers can update own members" ON members
--   FOR UPDATE USING (trainer_id = auth.uid());

-- CREATE POLICY "Trainers can delete own members" ON members
--   FOR DELETE USING (trainer_id = auth.uid());

-- -- Add the updated_at trigger
-- CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA UPDATE
-- ============================================

-- Update existing members with default membership data (optional)
-- UNCOMMENT BELOW IF YOU WANT TO SET DEFAULT VALUES FOR EXISTING MEMBERS

-- UPDATE public.members 
-- SET 
--   membership_type = 'basic',
--   monthly_fees = 99.00
-- WHERE membership_type IS NULL;

-- Or set different fees based on different criteria
-- UPDATE public.members 
-- SET 
--   membership_type = CASE 
--     WHEN id IN (SELECT id FROM members LIMIT 1) THEN 'premium'
--     ELSE 'basic'
--   END,
--   monthly_fees = CASE 
--     WHEN membership_type = 'premium' THEN 149.00
--     WHEN membership_type = 'elite' THEN 199.00
--     WHEN membership_type = 'custom' THEN 250.00
--     ELSE 99.00
--   END;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify the columns exist:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'members'
-- ORDER BY ordinal_position;