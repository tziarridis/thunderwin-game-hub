
-- Add is_admin column to profiles table (this is just a reference file, not executed automatically)
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
