-- Add Payments & Invoices Tables for Dibs Fitness
-- Run this in Supabase SQL Editor

-- ============================================
-- INVOICES TABLE (Create first to avoid FK reference issues)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
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

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
  payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'other')) DEFAULT 'cash',
  payment_date DATE DEFAULT CURRENT_DATE,
  transaction_id TEXT,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_trainer ON invoices(trainer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_member ON invoices(member_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_trainer ON payments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);

-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Trainers can view own invoices" ON invoices
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own invoices" ON invoices
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own invoices" ON invoices
  FOR DELETE USING (trainer_id = auth.uid());

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Trainers can view own payments" ON payments
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert own payments" ON payments
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own payments" ON payments
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own payments" ON payments
  FOR DELETE USING (trainer_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INVOICE NUMBER GENERATION FUNCTION
-- ============================================
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
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to add sample data

-- First, add some sample invoices
-- INSERT INTO public.invoices (trainer_id, member_id, invoice_number, amount, status, due_date, items)
-- SELECT 
--   p.id as trainer_id,
--   m.id as member_id,
--   generate_invoice_number(p.id) as invoice_number,
--   m.monthly_fees as amount,
--   'sent' as status,
--   CURRENT_DATE + INTERVAL '30 days' as due_date,
--   jsonb_build_array(
--     jsonb_build_object(
--       'description', m.membership_type || ' Monthly Membership',
--       'amount', m.monthly_fees,
--       'quantity', 1
--     )
--   ) as items
-- FROM profiles p
-- CROSS JOIN members m
-- WHERE m.trainer_id = p.id
-- LIMIT 5;

-- Then, add some sample payments
-- INSERT INTO public.payments (trainer_id, member_id, amount, status, payment_method, payment_date, description, transaction_id)
-- SELECT 
--   p.id as trainer_id,
--   m.id as member_id,
--   m.monthly_fees as amount,
--   'completed' as status,
--   'cash' as payment_method,
--   CURRENT_DATE - INTERVAL '5 days' as payment_date,
--   'Monthly membership payment - ' || m.full_name as description,
--   'TXN' || EXTRACT(epoch FROM NOW())::bigint::text as transaction_id
-- FROM profiles p
-- CROSS JOIN members m
-- WHERE m.trainer_id = p.id
-- LIMIT 3;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
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

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('payments', 'invoices')
ORDER BY tablename, cmd;