
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  is_secret boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.system_settings (key, value, category, label, description) VALUES
  ('company_name', 'ALINVEST Academy', 'general', 'Nome da Empresa', 'Nome exibido no site e comunicações'),
  ('company_email', 'info@alinvest.co.mz', 'general', 'Email da Empresa', 'Email principal de contacto'),
  ('company_phone', '+258 84 999 9999', 'general', 'Telefone', 'Número de contacto principal'),
  ('company_address', 'Maputo, Moçambique', 'general', 'Endereço', 'Endereço físico da empresa'),
  ('company_website', 'https://alinvest.co.mz', 'general', 'Website', 'URL do site institucional'),
  ('whatsapp_number', '258849999999', 'whatsapp', 'Número WhatsApp', 'Número para link wa.me (sem +)'),
  ('whatsapp_phone_number_id', '', 'whatsapp', 'Phone Number ID', 'ID do número na Meta Cloud API'),
  ('whatsapp_welcome_template', 'enrollment_confirmation', 'whatsapp', 'Template de Boas-Vindas', 'Nome do template de confirmação'),
  ('mpesa_environment', 'sandbox', 'mpesa', 'Ambiente', 'sandbox ou production'),
  ('mpesa_service_provider_code', '', 'mpesa', 'Service Provider Code', 'Código do provedor M-Pesa'),
  ('bank_name', 'Millennium BIM', 'bank', 'Nome do Banco', 'Banco para transferências'),
  ('bank_account_number', '000 000 000 000', 'bank', 'Número da Conta', 'Conta bancária'),
  ('bank_nib', '0001 0000 0000 0000 000 00', 'bank', 'NIB', 'Número de Identificação Bancária'),
  ('bank_account_name', 'ALINVEST Lda', 'bank', 'Titular da Conta', 'Nome do titular'),
  ('emola_number', '86 999 9999', 'emola', 'Número e-Mola', 'Número para pagamentos e-Mola'),
  ('emola_name', 'ALINVEST Lda', 'emola', 'Nome e-Mola', 'Nome associado à conta'),
  ('mpesa_enabled', 'true', 'payments', 'M-Pesa Activo', 'Activar/desactivar M-Pesa'),
  ('emola_enabled', 'true', 'payments', 'e-Mola Activo', 'Activar/desactivar e-Mola'),
  ('bank_transfer_enabled', 'true', 'payments', 'Transferência Activa', 'Activar/desactivar transferência');
