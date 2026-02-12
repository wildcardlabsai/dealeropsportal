
-- ============================================================
-- WARRANTIES MODULE: Add missing columns + warranty_claims
-- ============================================================

-- Add warranty_number column with auto-generation
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS warranty_number text;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS warranty_type text DEFAULT 'basic';
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS warranty_product_name text;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS duration_months integer;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS price_sold numeric DEFAULT 0;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS cost_to_dealer numeric;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS certificate_pdf_url text;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS created_by_user_id uuid;
ALTER TABLE public.warranties ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id);

-- Auto-generate warranty_number trigger
CREATE OR REPLACE FUNCTION public.generate_warranty_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_num int;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(warranty_number FROM 5) AS int)), 0) + 1
    INTO next_num
    FROM public.warranties
    WHERE dealer_id = NEW.dealer_id;
  NEW.warranty_number := 'WAR-' || LPAD(next_num::text, 6, '0');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generate_warranty_number_trigger ON public.warranties;
CREATE TRIGGER generate_warranty_number_trigger
  BEFORE INSERT ON public.warranties
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_warranty_number();

-- Warranty claims table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id),
  warranty_id uuid NOT NULL REFERENCES public.warranties(id),
  aftersales_case_id uuid REFERENCES public.aftersales_cases(id),
  claim_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  claim_amount numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on warranty_claims" ON public.warranty_claims
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer warranty_claims" ON public.warranty_claims
  FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer warranty_claims" ON public.warranty_claims
  FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer warranty_claims" ON public.warranty_claims
  FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

-- ============================================================
-- COURTESY CARS MODULE: Add missing columns + courtesy_loans
-- ============================================================

-- Add missing columns to courtesy_cars
ALTER TABLE public.courtesy_cars ADD COLUMN IF NOT EXISTS vin text;
ALTER TABLE public.courtesy_cars ADD COLUMN IF NOT EXISTS current_mileage numeric;

-- Courtesy loans table
CREATE TABLE IF NOT EXISTS public.courtesy_loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES public.dealers(id),
  courtesy_car_id uuid NOT NULL REFERENCES public.courtesy_cars(id),
  customer_id uuid REFERENCES public.customers(id),
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  customer_address text,
  loan_reason text,
  loan_start_at timestamptz NOT NULL DEFAULT now(),
  expected_return_at timestamptz,
  actual_return_at timestamptz,
  mileage_out numeric,
  mileage_in numeric,
  fuel_out text DEFAULT 'full',
  fuel_in text,
  damage_out_notes text,
  damage_in_notes text,
  deposit_amount numeric,
  excess_amount numeric,
  driving_licence_checked boolean DEFAULT false,
  insurance_confirmed boolean DEFAULT false,
  status text NOT NULL DEFAULT 'out',
  agreement_pdf_url text,
  agreement_signed_mode text,
  agreement_signed_at timestamptz,
  agreement_signed_by text,
  created_by_user_id uuid,
  assigned_to_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courtesy_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on courtesy_loans" ON public.courtesy_loans
  FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer courtesy_loans" ON public.courtesy_loans
  FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer courtesy_loans" ON public.courtesy_loans
  FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer courtesy_loans" ON public.courtesy_loans
  FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

-- Storage bucket for courtesy car photos
INSERT INTO storage.buckets (id, name, public) VALUES ('courtesy-car-photos', 'courtesy-car-photos', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload courtesy car photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'courtesy-car-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view courtesy car photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'courtesy-car-photos' AND auth.role() = 'authenticated');

-- Updated_at trigger for courtesy_loans
CREATE TRIGGER update_courtesy_loans_updated_at
  BEFORE UPDATE ON public.courtesy_loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
