-- Debug and Fix Profile Creation Issue
-- Run this in Supabase SQL Editor to diagnose and fix the foreign key constraint

-- 1. Check if profiles exist for auth users
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  p.id as profile_id,
  p.email as profile_email,
  p.full_name
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 2. Check if the profile creation trigger exists and is active
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if the handle_new_user function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4. Manually create profile for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Verify profiles were created
SELECT COUNT(*) as total_auth_users,
       (SELECT COUNT(*) FROM public.profiles) as total_profiles
FROM auth.users;

-- 6. Test the trigger function manually (if needed)
-- This will show us if the function works correctly
-- SELECT public.handle_new_user();