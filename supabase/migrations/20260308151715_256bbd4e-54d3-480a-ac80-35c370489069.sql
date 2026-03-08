
-- Add example image and language support to certificate templates
ALTER TABLE public.certificate_templates 
  ADD COLUMN example_image_url text DEFAULT NULL,
  ADD COLUMN language text NOT NULL DEFAULT 'pt';

-- Add language to issued certificates
ALTER TABLE public.certificates
  ADD COLUMN language text NOT NULL DEFAULT 'pt';
