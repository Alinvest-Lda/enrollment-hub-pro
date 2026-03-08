
-- Add second signature (trainer) and institution fields to certificate templates
ALTER TABLE public.certificate_templates 
  ADD COLUMN institution_name text NOT NULL DEFAULT 'ALINVEST S. U. LDA',
  ADD COLUMN intro_text text NOT NULL DEFAULT 'A coordenação de Treinamentos da empresa ALINVEST S. U. LDA, tem a honra de certificar que',
  ADD COLUMN closing_text text NOT NULL DEFAULT 'Por esta declaração reflectir a verdade, emitimos o presente certificado.',
  ADD COLUMN signature2_name text NOT NULL DEFAULT '',
  ADD COLUMN signature2_label text NOT NULL DEFAULT 'Formador(a) do Curso';

-- Add trainer name to issued certificates
ALTER TABLE public.certificates
  ADD COLUMN trainer_name text NOT NULL DEFAULT '';
