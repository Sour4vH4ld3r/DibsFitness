-- Migration Script: Add missing columns to existing payments table
-- Run this in Supabase SQL Editor if you get "column does not exist" errors

-- ============================================
-- CHECK AND ADD MISSING COLUMNS TO PAYMENTS
-- ============================================

-- Add payment_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'payment_date'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN payment_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Add transaction_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'transaction_id'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN transaction_id TEXT;
    END IF;
END $$;

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add invoice_id column if it doesn't exist (but first ensure invoices table exists)
DO $$
BEGIN
    -- First check if invoices table exists, create if not
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invoices'
    ) THEN
        -- Create invoices table first
        CREATE TABLE public.invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
            invoice_number TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
            due_date DATE NOT NULL,
            paid_date DATE,
            items JSONB DEFAULT '[]'::jsonb,
            tax_amount DECIMAL(10, 2) DEFAULT 0.00,
            discount_amount DECIMAL(10, 2) DEFAULT 0.00,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(trainer_id, invoice_number)
        );
    END IF;
    
    -- Now add invoice_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'invoice_id'
    ) THEN
        ALTER TABLE public.payments ADD COLUMN invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- CREATE MISSING INDEXES
-- ============================================

-- Create indexes for payments (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_payments_trainer ON payments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- Create indexes for invoices (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_invoices_trainer ON invoices(trainer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================
-- ENABLE RLS AND CREATE POLICIES
-- ============================================

-- Enable RLS for invoices if not already enabled
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create invoices policies (will skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Trainers can view own invoices'
    ) THEN
        CREATE POLICY "Trainers can view own invoices" ON invoices
            FOR SELECT USING (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Trainers can insert own invoices'
    ) THEN
        CREATE POLICY "Trainers can insert own invoices" ON invoices
            FOR INSERT WITH CHECK (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Trainers can update own invoices'
    ) THEN
        CREATE POLICY "Trainers can update own invoices" ON invoices
            FOR UPDATE USING (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoices' 
        AND policyname = 'Trainers can delete own invoices'
    ) THEN
        CREATE POLICY "Trainers can delete own invoices" ON invoices
            FOR DELETE USING (trainer_id = auth.uid());
    END IF;
END $$;

-- Enable RLS for payments if not already enabled
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create payments policies (will skip if already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Trainers can view own payments'
    ) THEN
        CREATE POLICY "Trainers can view own payments" ON payments
            FOR SELECT USING (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Trainers can insert own payments'
    ) THEN
        CREATE POLICY "Trainers can insert own payments" ON payments
            FOR INSERT WITH CHECK (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Trainers can update own payments'
    ) THEN
        CREATE POLICY "Trainers can update own payments" ON payments
            FOR UPDATE USING (trainer_id = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' 
        AND policyname = 'Trainers can delete own payments'
    ) THEN
        CREATE POLICY "Trainers can delete own payments" ON payments
            FOR DELETE USING (trainer_id = auth.uid());
    END IF;
END $$;

-- ============================================
-- ADD TRIGGERS FOR updated_at
-- ============================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_payments_updated_at'
    ) THEN
        CREATE TRIGGER update_payments_updated_at 
            BEFORE UPDATE ON payments
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_invoices_updated_at'
    ) THEN
        CREATE TRIGGER update_invoices_updated_at 
            BEFORE UPDATE ON invoices
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- INVOICE NUMBER GENERATION FUNCTION
-- ============================================

-- Drop existing function first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS generate_invoice_number(UUID);

CREATE OR REPLACE FUNCTION generate_invoice_number(trainer_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next sequence number for this trainer this year
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ ('^INV-' || current_year || '-[0-9]+$') 
      THEN CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_num
  FROM invoices 
  WHERE trainer_id = trainer_uuid 
  AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  invoice_num := 'INV-' || current_year || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created/updated
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('payments', 'invoices')
ORDER BY tablename;

-- Check if all required columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('payments', 'invoices')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('payments', 'invoices')
ORDER BY tablename, cmd;