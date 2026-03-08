
-- Quotations table for training requests
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_request_id uuid REFERENCES public.training_requests(id) ON DELETE SET NULL,
  quotation_number text NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  client_type text NOT NULL DEFAULT 'individual',
  organization_name text,
  training_topic text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric NOT NULL DEFAULT 0,
  discount_percent numeric NOT NULL DEFAULT 0,
  tax_percent numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MZN',
  notes text,
  terms text DEFAULT 'Cotação válida por 30 dias. Pagamento conforme plano acordado.',
  status text NOT NULL DEFAULT 'draft',
  valid_until date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage quotations"
  ON public.quotations
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Payment plans table for custom payment models
CREATE TABLE public.payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  installments jsonb NOT NULL DEFAULT '[]',
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment plans"
  ON public.payment_plans
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active payment plans"
  ON public.payment_plans
  FOR SELECT
  USING (is_active = true);

-- Seed default payment plans
INSERT INTO public.payment_plans (name, description, installments, is_default, is_active) VALUES
  ('Pagamento Integral', '100% no ato da inscrição', '[{"number": 1, "percent": 100, "days_offset": 0, "label": "Pagamento único"}]', true, true),
  ('Plano 60/40', '60% na inscrição e 40% em 7 dias (cursos de 2 semanas)', '[{"number": 1, "percent": 60, "days_offset": 0, "label": "1ª prestação"}, {"number": 2, "percent": 40, "days_offset": 7, "label": "2ª prestação"}]', true, true),
  ('Plano 60/20/20', '60% na inscrição, 20% em 15 dias e 20% em 20 dias (cursos de 1 mês)', '[{"number": 1, "percent": 60, "days_offset": 0, "label": "1ª prestação"}, {"number": 2, "percent": 20, "days_offset": 15, "label": "2ª prestação"}, {"number": 3, "percent": 20, "days_offset": 20, "label": "3ª prestação"}]', true, true);

-- Create sequence for quotation numbers
CREATE SEQUENCE public.quotation_number_seq START WITH 1001;
