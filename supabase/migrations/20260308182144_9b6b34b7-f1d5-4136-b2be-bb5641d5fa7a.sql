CREATE OR REPLACE FUNCTION public.auto_create_installments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  plan_config jsonb;
  item jsonb;
  base_date date := CURRENT_DATE;
  due date;
BEGIN
  -- Define installment plans
  IF NEW.payment_plan = 'full' THEN
    plan_config := '[{"number":1,"percent":100,"days_offset":0}]'::jsonb;
  ELSIF NEW.payment_plan = '60-40' THEN
    plan_config := '[{"number":1,"percent":60,"days_offset":0},{"number":2,"percent":40,"days_offset":7}]'::jsonb;
  ELSIF NEW.payment_plan = '60-20-20' THEN
    plan_config := '[{"number":1,"percent":60,"days_offset":0},{"number":2,"percent":20,"days_offset":15},{"number":3,"percent":20,"days_offset":20}]'::jsonb;
  ELSE
    plan_config := '[{"number":1,"percent":100,"days_offset":0}]'::jsonb;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(plan_config)
  LOOP
    due := base_date + ((item->>'days_offset')::int || ' days')::interval;
    INSERT INTO public.installments (
      enrollment_id,
      installment_number,
      amount,
      due_date,
      status
    ) VALUES (
      NEW.id,
      (item->>'number')::int,
      round((NEW.total_price * (item->>'percent')::numeric) / 100),
      due,
      'pending'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_enrollment_create_installments
  AFTER INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_installments();