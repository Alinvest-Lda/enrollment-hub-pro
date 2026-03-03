
-- Create enum for client type
CREATE TYPE public.client_type AS ENUM ('individual', 'empresa', 'ong', 'estado');

-- Create training requests table
CREATE TABLE public.training_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_type public.client_type NOT NULL DEFAULT 'individual',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization_name TEXT,
  organization_sector TEXT,
  num_participants INTEGER,
  training_topic TEXT NOT NULL,
  training_details TEXT,
  preferred_start TEXT,
  budget_range TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert (no auth required)
CREATE POLICY "Anyone can submit training requests"
ON public.training_requests FOR INSERT
WITH CHECK (true);

-- Admins can view
CREATE POLICY "Admins can view training requests"
ON public.training_requests FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update
CREATE POLICY "Admins can update training requests"
ON public.training_requests FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete
CREATE POLICY "Admins can delete training requests"
ON public.training_requests FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_training_requests_updated_at
BEFORE UPDATE ON public.training_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
