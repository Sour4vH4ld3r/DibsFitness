-- Add Expenses Table for Dibs Fitness
-- Run this in Supabase SQL Editor

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('equipment', 'rent', 'utilities', 'marketing', 'food', 'transport', 'other')) DEFAULT 'other',
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_trainer ON expenses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- Enable RLS for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expenses policies
CREATE POLICY "Trainers can view own expenses" ON expenses
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own expenses" ON expenses
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own expenses" ON expenses
  FOR DELETE USING (trainer_id = auth.uid());

-- Add updated_at trigger for expenses
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Verification query
SELECT 
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'expenses';

-- Check if RLS policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'expenses'
ORDER BY cmd;