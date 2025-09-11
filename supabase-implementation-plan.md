# Supabase Implementation Plan for Dibs Fitness

## Overview
Complete implementation guide for integrating Supabase as the backend for Dibs Fitness, including database design, authentication, real-time features, and API integration.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Authentication Setup](#authentication-setup)
4. [API Integration](#api-integration)
5. [Real-time Features](#real-time-features)
6. [Storage Implementation](#storage-implementation)
7. [Security & RLS](#security--rls)
8. [Implementation Timeline](#implementation-timeline)

## Architecture Overview

### Tech Stack Integration
```
Frontend (Next.js) <-> Supabase Client <-> Supabase Backend
                                              ├── PostgreSQL Database
                                              ├── Auth Service
                                              ├── Realtime Subscriptions
                                              ├── Storage Buckets
                                              └── Edge Functions
```

### Key Benefits
- **Built-in Authentication**: Replace Clerk with Supabase Auth
- **Real-time Database**: Live updates for schedules and notifications
- **PostgreSQL**: Powerful relational database with full SQL support
- **Row Level Security**: Fine-grained access control
- **Storage**: Built-in file storage for member photos and documents
- **Edge Functions**: Serverless functions for business logic

## Database Schema

### 1. Core Tables

#### Users Table (Extended from Supabase Auth)
```sql
-- profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('trainer', 'admin', 'member')) DEFAULT 'member',
  business_name TEXT,
  business_address TEXT,
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

#### Members Table
```sql
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'expired')) DEFAULT 'active',
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

CREATE INDEX idx_members_trainer ON members(trainer_id);
CREATE INDEX idx_members_status ON members(status);
```

#### Plans Table
```sql
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### Member Plans (Subscriptions)
```sql
CREATE TABLE public.member_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.plans(id) ON DELETE RESTRICT,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
  sessions_used INTEGER DEFAULT 0,
  sessions_remaining INTEGER,
  next_billing_date DATE,
  amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_member_plans_member ON member_plans(member_id);
CREATE INDEX idx_member_plans_status ON member_plans(status);
```

#### Sessions Table
```sql
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

#### Session Participants (for group sessions)
```sql
CREATE TABLE public.session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('registered', 'attended', 'no-show', 'cancelled')) DEFAULT 'registered',
  checked_in_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(session_id, member_id)
);

CREATE INDEX idx_participants_session ON session_participants(session_id);
CREATE INDEX idx_participants_member ON session_participants(member_id);
```

#### Payments Table
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
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
```

#### Invoices Table
```sql
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  member_plan_id UUID REFERENCES public.member_plans(id) ON DELETE SET NULL,
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
```

#### Messages Table
```sql
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type TEXT CHECK (recipient_type IN ('individual', 'group', 'broadcast')) DEFAULT 'individual',
  recipient_ids UUID[],
  subject TEXT,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'sms', 'in-app')) DEFAULT 'email',
  status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'delivered', 'failed')) DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_trainer ON messages(trainer_id);
CREATE INDEX idx_messages_status ON messages(status);
```

#### Message Templates Table
```sql
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT CHECK (type IN ('email', 'sms', 'in-app')) DEFAULT 'email',
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_trainer ON message_templates(trainer_id);
```

### 2. Analytics Tables

#### Session Analytics
```sql
CREATE TABLE public.session_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  cancelled_sessions INTEGER DEFAULT 0,
  no_show_sessions INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,
  unique_members INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(trainer_id, date)
);

CREATE INDEX idx_analytics_trainer_date ON session_analytics(trainer_id, date);
```

### 3. Database Functions & Triggers

#### Auto-update timestamps
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for all tables...
```

#### Generate Invoice Numbers
```sql
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
  WHERE trainer_id = $1
  AND EXTRACT(YEAR FROM created_at) = current_year;
  
  new_number := 'INV-' || current_year || '-' || LPAD(invoice_count::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;
```

#### Update Member Session Count
```sql
CREATE OR REPLACE FUNCTION update_member_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE members 
    SET total_sessions = total_sessions + 1,
        last_session_date = CURRENT_DATE
    WHERE id = NEW.member_id;
    
    UPDATE member_plans
    SET sessions_used = sessions_used + 1,
        sessions_remaining = GREATEST(0, sessions_remaining - 1)
    WHERE member_id = NEW.member_id
    AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_count
AFTER UPDATE ON sessions
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION update_member_session_count();
```

## Authentication Setup

### 1. Replace Clerk with Supabase Auth

#### Remove Clerk
```bash
npm uninstall @clerk/nextjs @clerk/themes
rm src/middleware.ts
```

#### Install Supabase
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared
```

#### Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Supabase Client Setup

#### Create Supabase Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server Client
```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 3. Auth Provider
```typescript
// providers/supabase-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const SupabaseContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <SupabaseContext.Provider value={{ user, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)
```

## API Integration

### 1. Data Fetching Hooks

#### Members Hook
```typescript
// hooks/useMembers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useMembers() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_plans (
            *,
            plan:plans(*)
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
  })
}

export function useCreateMember() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (member: NewMember) => {
      const { data, error } = await supabase
        .from('members')
        .insert(member)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
    },
  })
}
```

#### Sessions Hook
```typescript
// hooks/useSessions.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useSessions(startDate: Date, endDate: Date) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['sessions', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          member:members(*),
          participants:session_participants(
            *,
            member:members(*)
          )
        `)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true })
      
      if (error) throw error
      return data
    },
  })
}
```

### 2. API Routes (Edge Functions)

#### Payment Processing
```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.5.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { invoiceId, paymentMethodId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    // Get invoice details
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, member:members(*)')
      .eq('id', invoiceId)
      .single()
    
    if (error) throw error
    
    // Process payment with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total_amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        invoice_id: invoiceId,
        member_id: invoice.member_id,
      },
    })
    
    // Update invoice and create payment record
    if (paymentIntent.status === 'succeeded') {
      await supabase.from('invoices').update({
        status: 'paid',
        paid_date: new Date().toISOString(),
      }).eq('id', invoiceId)
      
      await supabase.from('payments').insert({
        invoice_id: invoiceId,
        member_id: invoice.member_id,
        trainer_id: invoice.trainer_id,
        amount: invoice.total_amount,
        payment_method: 'card',
        status: 'completed',
        transaction_id: paymentIntent.id,
        paid_at: new Date().toISOString(),
      })
    }
    
    return new Response(JSON.stringify({ success: true, paymentIntent }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

## Real-time Features

### 1. Real-time Subscriptions

#### Schedule Updates
```typescript
// hooks/useRealtimeSchedule.ts
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeSchedule() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('schedule-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        (payload) => {
          // Invalidate and refetch sessions
          queryClient.invalidateQueries({ queryKey: ['sessions'] })
          
          // Show notification
          if (payload.eventType === 'INSERT') {
            toast.success('New session scheduled!')
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Session updated')
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, queryClient])
}
```

#### Live Notifications
```typescript
// hooks/useNotifications.ts
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()
  
  useEffect(() => {
    // Initial fetch
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
      
      if (data) setNotifications(data)
    }
    
    fetchNotifications()
    
    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev])
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Dibs Fitness', {
              body: payload.new.message,
              icon: '/icon.png',
            })
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])
  
  return notifications
}
```

## Storage Implementation

### 1. Storage Buckets Setup

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('documents', 'documents', false),
  ('attachments', 'attachments', false);
```

### 2. Upload Functions

```typescript
// lib/supabase/storage.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  const filePath = `${userId}/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (uploadError) throw uploadError
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

export async function uploadDocument(file: File, memberId: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${file.name}`
  const filePath = `${memberId}/${fileName}`
  
  const { error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) throw error
  
  return filePath
}
```

## Security & RLS

### 1. Row Level Security Policies

```sql
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Members: Trainers can only see and manage their own members
CREATE POLICY "Trainers can view own members" ON members
  FOR SELECT USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can insert own members" ON members
  FOR INSERT WITH CHECK (trainer_id = auth.uid());

CREATE POLICY "Trainers can update own members" ON members
  FOR UPDATE USING (trainer_id = auth.uid());

CREATE POLICY "Trainers can delete own members" ON members
  FOR DELETE USING (trainer_id = auth.uid());

-- Sessions: Trainers see their sessions, members see sessions they're in
CREATE POLICY "Trainers can manage own sessions" ON sessions
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Members can view their sessions" ON sessions
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE id = sessions.member_id
    )
  );

-- Invoices: Similar pattern
CREATE POLICY "Trainers can manage own invoices" ON invoices
  FOR ALL USING (trainer_id = auth.uid());

CREATE POLICY "Members can view their invoices" ON invoices
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM members WHERE id = invoices.member_id
    )
  );
```

### 2. API Security

```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
  }

  // Auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Implementation Timeline

### Phase 1: Setup & Authentication (Week 1)
- [ ] Create Supabase project
- [ ] Setup environment variables
- [ ] Remove Clerk, install Supabase
- [ ] Implement Supabase Auth
- [ ] Create auth pages with Supabase UI
- [ ] Setup middleware for protected routes

### Phase 2: Database Schema (Week 2)
- [ ] Create all tables
- [ ] Setup relationships
- [ ] Create indexes
- [ ] Implement RLS policies
- [ ] Create database functions
- [ ] Setup triggers

### Phase 3: Core Features (Week 3-4)
- [ ] Members CRUD operations
- [ ] Plans management
- [ ] Session scheduling
- [ ] Payment processing
- [ ] Invoice generation
- [ ] Message templates

### Phase 4: Real-time Features (Week 5)
- [ ] Schedule real-time updates
- [ ] Live notifications
- [ ] Session reminders
- [ ] Payment confirmations
- [ ] Member activity tracking

### Phase 5: Storage & Files (Week 6)
- [ ] Setup storage buckets
- [ ] Avatar uploads
- [ ] Document management
- [ ] Invoice PDFs
- [ ] Export functionality

### Phase 6: Analytics & Reports (Week 7)
- [ ] Dashboard analytics
- [ ] Revenue reports
- [ ] Member statistics
- [ ] Session analytics
- [ ] Custom reports

### Phase 7: Edge Functions (Week 8)
- [ ] Payment processing
- [ ] Email sending
- [ ] SMS notifications
- [ ] Automated reminders
- [ ] Data aggregation

### Phase 8: Testing & Optimization (Week 9-10)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

## Migration Guide

### 1. Data Migration from Mock to Supabase

```typescript
// scripts/migrate-data.ts
import { createClient } from '@supabase/supabase-js'
import { mockMembers, mockSchedule, mockInvoices } from '@/lib/mock-data'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateMembers() {
  for (const member of mockMembers) {
    const { error } = await supabase.from('members').insert({
      full_name: member.name,
      email: member.email,
      phone: member.phone,
      status: member.status,
      join_date: member.joinDate,
      total_sessions: member.totalSessions,
    })
    
    if (error) console.error('Error migrating member:', error)
  }
}

async function migrateSessions() {
  // Similar migration for sessions
}

async function migrateInvoices() {
  // Similar migration for invoices
}

// Run migrations
async function migrate() {
  await migrateMembers()
  await migrateSessions()
  await migrateInvoices()
  console.log('Migration complete!')
}

migrate()
```

### 2. Update Components to Use Supabase

```typescript
// Example: Update Members page
// app/dashboard/members/page.tsx
'use client'

import { useMembers, useCreateMember } from '@/hooks/useMembers'
import { useState } from 'react'

export default function MembersPage() {
  const { data: members, isLoading, error } = useMembers()
  const createMember = useCreateMember()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {/* Use real data from Supabase */}
      {members?.map(member => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  )
}
```

## Environment Setup

### 1. Install Dependencies
```bash
# Remove Clerk
npm uninstall @clerk/nextjs @clerk/themes

# Install Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
npm install @tanstack/react-query
npm install stripe
```

### 2. Generate Types
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Generate types
supabase gen types typescript --linked > types/supabase.ts
```

### 3. Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
RESEND_API_KEY=re_...
```

## Best Practices

### 1. Database Design
- Use UUIDs for all primary keys
- Create proper indexes for frequently queried columns
- Use JSONB for flexible data structures
- Implement soft deletes where appropriate

### 2. Security
- Always use RLS policies
- Never expose service role key to client
- Validate all inputs
- Use prepared statements
- Implement rate limiting

### 3. Performance
- Use database views for complex queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Use connection pooling
- Optimize images before storage

### 4. Real-time
- Limit real-time subscriptions to necessary data
- Implement debouncing for frequent updates
- Use presence for online status
- Clean up subscriptions on unmount

## Monitoring & Maintenance

### 1. Database Monitoring
```sql
-- Monitor slow queries
SELECT 
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2. Error Tracking
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs'

export function trackError(error: Error, context?: any) {
  console.error('Error:', error)
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    })
  }
}
```

## Conclusion

This implementation plan provides a complete roadmap for integrating Supabase as the backend for Dibs Fitness. The architecture leverages Supabase's powerful features including:

- PostgreSQL database with complex relationships
- Built-in authentication replacing Clerk
- Real-time subscriptions for live updates
- Storage for file management
- Edge Functions for serverless logic
- Row Level Security for data protection

The phased approach ensures a smooth transition from the current mock data implementation to a production-ready backend with all the features needed for a modern fitness management platform.
