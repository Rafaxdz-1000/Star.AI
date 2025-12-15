-- Add email column to form_data table for authentication
ALTER TABLE public.form_data 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Make email required (remove NULL constraint if exists, then add NOT NULL)
-- First, update any existing NULL values to empty string
UPDATE public.form_data SET email = '' WHERE email IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE public.form_data 
ALTER COLUMN email SET NOT NULL;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_data_email ON public.form_data(email);

-- Update RLS policy to allow reading by email (if needed)
-- The existing policy already allows SELECT for all, so no change needed

