-- Fix Profile RLS Policies
-- The profiles table is missing an INSERT policy
-- Run this in Supabase SQL Editor

-- Add missing INSERT policy for profiles
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;