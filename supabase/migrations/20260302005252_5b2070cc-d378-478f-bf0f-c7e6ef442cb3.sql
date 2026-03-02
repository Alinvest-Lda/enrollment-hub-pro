
-- Courses table for CRUD management
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  duration_weeks integer NOT NULL DEFAULT 2,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'MZN',
  start_date date,
  image text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  payment_plan_group text NOT NULL DEFAULT '2-weeks',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view active courses
CREATE POLICY "Anyone can view active courses"
ON public.courses FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing courses
INSERT INTO public.courses (slug, title, category, description, duration, duration_weeks, price, currency, start_date, image, highlights, payment_plan_group) VALUES
('iso-9001-implementacao', 'ISO 9001 – Implementação do Sistema de Gestão da Qualidade', 'ISO & Gestão', 'Aprenda a implementar e gerir um Sistema de Gestão da Qualidade conforme a norma ISO 9001, desde a análise de contexto até a auditoria interna.', '2 Semanas', 2, 25000, 'MZN', '2026-04-15', '', ARRAY['Certificado PECB', 'Material didáctico incluído', 'Formadores certificados', 'Exercícios práticos'], '2-weeks'),
('iso-45001-seguranca', 'ISO 45001 – Saúde e Segurança Ocupacional', 'HSEQ', 'Formação completa sobre implementação do sistema de gestão de saúde e segurança no trabalho, primeiros socorros e combate a incêndios.', '1 Mês', 4, 35000, 'MZN', '2026-04-22', '', ARRAY['Prática em campo', 'Certificação internacional', 'Instrutores especializados', 'Case studies reais'], '1-month'),
('gestao-projectos', 'Gestão de Projectos – Metodologias Ágeis e PMI', 'Gestão', 'Domine ferramentas e metodologias de gestão de projectos aplicadas ao contexto empresarial moçambicano e internacional.', '2 Semanas', 2, 20000, 'MZN', '2026-05-06', '', ARRAY['Metodologia PMI', 'Ferramentas digitais', 'Projecto final prático', 'Networking'], '2-weeks'),
('auditoria-interna', 'Auditoria Interna – ISO 19011', 'ISO & Gestão', 'Capacitação em técnicas de auditoria interna conforme a ISO 19011, incluindo planeamento, execução e relatórios de auditoria.', '2 Semanas', 2, 22000, 'MZN', '2026-05-20', '', ARRAY['Simulações de auditoria', 'Templates profissionais', 'Certificado de conclusão', 'Mentoria pós-curso'], '2-weeks'),
('lideranca-executiva', 'Liderança Executiva e Desenvolvimento Organizacional', 'Liderança', 'Programa intensivo de desenvolvimento de competências de liderança para gestores e directores, com foco em tomada de decisão estratégica.', '1 Mês', 4, 40000, 'MZN', '2026-06-01', '', ARRAY['Coaching individual', 'Casos de estudo africanos', 'Rede de líderes', 'Plano de acção personalizado'], '1-month'),
('hse-basico', 'HSE Básico – Saúde, Segurança e Ambiente', 'HSEQ', 'Formação fundamental em saúde, segurança e ambiente para equipas operacionais, cumprindo a legislação moçambicana.', '2 Semanas', 2, 15000, 'MZN', '2026-04-28', '', ARRAY['Legislação nacional', 'Práticas de campo', 'Kit de segurança', 'Avaliação final'], '2-weeks');
