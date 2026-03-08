CREATE OR REPLACE FUNCTION public.auto_create_draft_quotation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_quotation_number text;
BEGIN
  new_quotation_number := 'COT-' || upper(to_hex(extract(epoch from now())::bigint));

  INSERT INTO public.quotations (
    quotation_number,
    training_request_id,
    client_name,
    client_email,
    client_phone,
    client_type,
    organization_name,
    training_topic,
    items,
    subtotal,
    discount_percent,
    tax_percent,
    total,
    currency,
    status,
    notes,
    terms,
    valid_until
  ) VALUES (
    new_quotation_number,
    NEW.id,
    NEW.full_name,
    NEW.email,
    NEW.phone,
    NEW.client_type::text,
    NEW.organization_name,
    NEW.training_topic,
    jsonb_build_array(
      jsonb_build_object(
        'description', 'Formação: ' || NEW.training_topic || COALESCE(' (' || NEW.num_participants || ' participantes)', ''),
        'quantity', COALESCE(NEW.num_participants, 1),
        'unit_price', 0,
        'total', 0
      )
    ),
    0,
    0,
    16,
    0,
    'MZN',
    'draft',
    COALESCE(NEW.training_details, ''),
    'Cotação válida por 30 dias. Pagamento conforme plano acordado.',
    (CURRENT_DATE + interval '30 days')::date
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_training_request_create_quotation
  AFTER INSERT ON public.training_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_draft_quotation();