
-- Certificate templates table
CREATE TABLE public.certificate_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  background_color text NOT NULL DEFAULT '#ffffff',
  border_style text NOT NULL DEFAULT 'classic',
  logo_url text DEFAULT NULL,
  header_text text NOT NULL DEFAULT 'CERTIFICADO DE CONCLUSÃO',
  body_template text NOT NULL DEFAULT 'Certificamos que {{student_name}} concluiu com sucesso o curso {{course_name}}, com a duração de {{duration}}, realizado no período de {{start_date}} a {{end_date}}.',
  footer_text text NOT NULL DEFAULT '',
  signature_label text NOT NULL DEFAULT 'Director',
  signature_name text NOT NULL DEFAULT '',
  variables text[] NOT NULL DEFAULT '{student_name,course_name,duration,start_date,end_date}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage certificate templates" ON public.certificate_templates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active templates" ON public.certificate_templates
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Certificates table (issued certificates)
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text NOT NULL UNIQUE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  student_name text NOT NULL,
  course_name text NOT NULL,
  course_duration text NOT NULL DEFAULT '',
  start_date text DEFAULT NULL,
  end_date text DEFAULT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can verify certificates" ON public.certificates
  FOR SELECT TO anon, authenticated
  USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_certificate_templates_updated_at
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
