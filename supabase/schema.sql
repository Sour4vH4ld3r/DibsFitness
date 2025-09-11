-- Dibs Fitness Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('trainer', 'admin', 'member')) DEFAULT 'trainer',
  business_name TEXT,
  business_address TEXT,
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'expired')) DEFAULT 'active',
  membership_type TEXT CHECK (membership_type IN ('basic', 'premium', 'elite', 'custom')) DEFAULT 'basic',
  monthly_fees DECIMAL(10, 2) DEFAULT 0.00,
  avatar_url TEXT,
  date_of_birth DATE,
  emergency_contact JSONB,
  medical_notes TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  last_session_date DATE,
  total_sessions INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(trainer_id, email)
);

-- Create indexes
CREATE INDEX idx_members_trainer ON members(trainer_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_membership_type ON members(membership_type);

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Members policies
CREATE POLICY "Trainers can view own members" ON members
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert own members" ON members
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own members" ON members
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own members" ON members
  FOR DELETE USING (trainer_id = auth.uid());

-- ============================================
-- 3. PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly', 'one-time')) DEFAULT 'monthly',
  sessions_included INTEGER,
  is_group_plan BOOLEAN DEFAULT FALSE,
  max_members INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_trainer ON plans(trainer_id);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Plans policies
CREATE POLICY "Trainers can manage own plans" ON plans
  FOR ALL USING (trainer_id = auth.uid());

-- ============================================
-- 4. SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')) DEFAULT 'scheduled',
  is_group_session BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_trainer ON sessions(trainer_id);
CREATE INDEX idx_sessions_member ON sessions(member_id);
CREATE INDEX idx_sessions_start ON sessions(start_time);
CREATE INDEX idx_sessions_status ON sessions(status);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Trainers can manage own sessions" ON sessions
  FOR ALL USING (trainer_id = auth.uid());

-- ============================================
-- 5. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  invoice_id UUID,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_trainer ON payments(trainer_id);
CREATE INDEX idx_payments_member ON payments(member_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Trainers can manage own payments" ON payments
  FOR ALL USING (trainer_id = auth.uid());

-- ============================================
-- 6. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  due_date DATE NOT NULL,
  paid_date DATE,
  line_items JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_trainer ON invoices(trainer_id);
CREATE INDEX idx_invoices_member ON invoices(member_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Trainers can manage own invoices" ON invoices
  FOR ALL USING (trainer_id = auth.uid());

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generate invoice number function
CREATE OR REPLACE FUNCTION generate_invoice_number(trainer_id UUID)
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  invoice_count INTEGER;
  new_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());
  
  SELECT COUNT(*) + 1 INTO invoice_count
  FROM invoices
  WHERE invoices.trainer_id = $1
  AND EXTRACT(YEAR FROM created_at) = current_year;
  
  new_number := 'INV-' || current_year || '-' || LPAD(invoice_count::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert your profile (it should already exist from the trigger)
-- UPDATE public.profiles 
-- SET role = 'trainer', 
--     business_name = 'Dibs Fitness Studio'
-- WHERE email = 'your-email@example.com';

-- Insert sample members (replace trainer_id with your actual user ID)
-- INSERT INTO public.members (trainer_id, full_name, email, phone, status, membership_type, monthly_fees) VALUES
-- (auth.uid(), 'John Doe', 'john@example.com', '555-0101', 'active', 'premium', 149.00),
-- (auth.uid(), 'Jane Smith', 'jane@example.com', '555-0102', 'active', 'basic', 99.00),
-- (auth.uid(), 'Mike Johnson', 'mike@example.com', '555-0103', 'paused', 'elite', 199.00);

-- Insert sample plans
-- INSERT INTO public.plans (trainer_id, name, description, price, billing_cycle) VALUES
-- (auth.uid(), 'Basic Monthly', 'Basic fitness plan', 99.00, 'monthly'),
-- (auth.uid(), 'Premium Monthly', 'Premium fitness plan with nutrition', 149.00, 'monthly'),
-- (auth.uid(), 'Group Classes', 'Unlimited group classes', 79.00, 'monthly');

COMMENT ON SCHEMA public IS 'Dibs Fitness Database Schema';
