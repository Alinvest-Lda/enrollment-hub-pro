
-- Add payment tracking fields to quotations
ALTER TABLE public.quotations
  ADD COLUMN payment_plan text NOT NULL DEFAULT 'full',
  ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';

-- Allow public read of quotations by ID (for payment page)
CREATE POLICY "Anyone can view quotation by id" ON public.quotations
  FOR SELECT TO anon
  USING (true);
