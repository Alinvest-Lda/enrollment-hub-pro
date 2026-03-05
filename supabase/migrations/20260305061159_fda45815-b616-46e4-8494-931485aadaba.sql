-- Add enrollment source enum
CREATE TYPE public.enrollment_source AS ENUM ('site', 'presencial', 'telefone', 'whatsapp', 'email', 'csv_import', 'outro');

-- Add source column to enrollments
ALTER TABLE public.enrollments 
ADD COLUMN source public.enrollment_source NOT NULL DEFAULT 'site';

-- Add payment_method column to enrollments
ALTER TABLE public.enrollments
ADD COLUMN payment_method text DEFAULT null;
