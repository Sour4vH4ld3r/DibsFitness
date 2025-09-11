-- Add monthly_fees column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS monthly_fees DECIMAL(10, 2) DEFAULT 0;

-- Add membership_type column to members table
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS membership_type TEXT DEFAULT 'basic';

-- Update the members table to make email optional
ALTER TABLE public.members 
ALTER COLUMN email DROP NOT NULL;

-- Add check constraint for membership_type
ALTER TABLE public.members
ADD CONSTRAINT membership_type_check 
CHECK (membership_type IN ('basic', 'premium', 'elite', 'custom'));

COMMENT ON COLUMN public.members.monthly_fees IS 'Monthly membership fees for the member';
COMMENT ON COLUMN public.members.membership_type IS 'Type of membership plan';
COMMENT ON COLUMN public.members.email IS 'Member email address (optional)';
