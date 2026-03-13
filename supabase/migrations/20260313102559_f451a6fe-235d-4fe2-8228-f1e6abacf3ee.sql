
ALTER TABLE public.payment_plans ADD COLUMN payment_plan_group text NOT NULL DEFAULT 'all';

UPDATE public.payment_plans SET payment_plan_group = 'all' WHERE id = '3c22f915-77f9-45d8-9e1f-51383b0a2289';
UPDATE public.payment_plans SET payment_plan_group = '2-weeks' WHERE id = '03618502-8dd8-4704-97bf-00eab4411424';
UPDATE public.payment_plans SET payment_plan_group = '1-month' WHERE id = '8d4840ac-5461-4683-94de-993a416484ad';
UPDATE public.payment_plans SET payment_plan_group = '1-month' WHERE id = 'b957be61-e8f7-4a46-9b2c-4a0e81de5452';
