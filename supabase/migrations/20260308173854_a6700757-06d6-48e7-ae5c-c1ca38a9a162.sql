
-- Testimonials table
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  course text NOT NULL DEFAULT '',
  text text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5,
  initials text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- FAQs table
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage faqs" ON public.faqs
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active faqs" ON public.faqs
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Team members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active team members" ON public.team_members
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Hero stats table (for the homepage stats card)
CREATE TABLE public.hero_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value integer NOT NULL DEFAULT 0,
  suffix text NOT NULL DEFAULT '+',
  icon text NOT NULL DEFAULT 'Users',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hero stats" ON public.hero_stats
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active hero stats" ON public.hero_stats
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Seed current hardcoded data

INSERT INTO public.testimonials (name, role, course, text, rating, initials, display_order) VALUES
  ('Joana Macuácua', 'Gestora de Qualidade — Cervejas de Moçambique', 'ISO 9001 – Implementação', 'A formação da ALINVEST foi transformadora. Consegui implementar o SGQ na minha empresa em menos de 3 meses após o curso. Os formadores são excepcionais.', 5, 'JM', 1),
  ('Fernando Sitoe', 'Coordenador HSE — Sasol Moçambique', 'ISO 45001 – Saúde e Segurança', 'O nível de profundidade e os exercícios práticos superaram as minhas expectativas. Recomendo a todos os profissionais de HSEQ em Moçambique.', 5, 'FS', 2),
  ('Marta Cossa', 'Directora Executiva — TechStart Moz', 'Gestão de Projectos', 'As metodologias ágeis que aprendi aplicam-se directamente ao dia-a-dia da minha startup. Investimento que valeu cada metical.', 5, 'MC', 3),
  ('Alberto Mondlane', 'Auditor Interno — Banco BCI', 'Auditoria Interna – ISO 19011', 'A certificação que obtive abriu portas para novas oportunidades. Os templates e ferramentas fornecidos são de uso diário no meu trabalho.', 4, 'AM', 4);

INSERT INTO public.faqs (question, answer, display_order) VALUES
  ('Como funciona o processo de inscrição?', 'Escolha o curso desejado, preencha o formulário de inscrição com os seus dados e seleccione o plano de pagamento. Após submeter, receberá as instruções de pagamento. A sua inscrição será confirmada assim que o pagamento for verificado pela nossa equipa.', 1),
  ('Quais são os métodos de pagamento aceites?', 'Aceitamos M-Pesa (pagamento online instantâneo), transferência bancária e e-Mola. O M-Pesa permite pagamento directo no acto da inscrição. Para os demais métodos, envie o comprovativo pelo formulário.', 2),
  ('Posso pagar em prestações?', 'Sim! Disponibilizamos planos de pagamento flexíveis dependendo da duração do curso. Pode optar por pagamento integral ou dividir em 2 ou 3 prestações conforme o plano disponível para cada curso.', 3),
  ('Os cursos oferecem certificado?', 'Sim, todos os nossos cursos emitem um certificado de conclusão reconhecido, desde que o participante cumpra os requisitos mínimos de assiduidade e avaliação definidos para cada programa.', 4),
  ('Os cursos são presenciais ou online?', 'Oferecemos cursos em ambas as modalidades. Consulte a página de cada curso para verificar o formato disponível. Para treinamentos personalizados, podemos adaptar o formato às necessidades da sua equipa.', 5),
  ('Como solicitar um treinamento personalizado?', 'Utilize o formulário na secção ''Treinamento Personalizado'' mais abaixo nesta página. Informe o tema, número de participantes e detalhes da sua necessidade. A nossa equipa entrará em contacto em até 48 horas com uma proposta à medida.', 6);

INSERT INTO public.team_members (name, role, bio, display_order) VALUES
  ('Dr. António Machava', 'Director Executivo', 'Mais de 15 anos de experiência em consultoria e gestão empresarial em Moçambique e região austral de África.', 1),
  ('Eng.ª Márcia Tembe', 'Directora de Formação', 'Especialista em sistemas de gestão ISO com certificação PECB e vasta experiência em formação corporativa.', 2),
  ('Dr. Carlos Nhantumbo', 'Consultor Sénior HSEQ', 'Auditor líder certificado com experiência em projectos de petróleo, gás e construção civil.', 3);

INSERT INTO public.hero_stats (label, value, suffix, icon, display_order) VALUES
  ('Profissionais Formados', 500, '+', 'Users', 1),
  ('Cursos Disponíveis', 25, '+', 'BookOpen', 2),
  ('Taxa de Aprovação', 98, '%', 'Award', 3),
  ('Anos de Experiência', 5, '+', 'Shield', 4);
