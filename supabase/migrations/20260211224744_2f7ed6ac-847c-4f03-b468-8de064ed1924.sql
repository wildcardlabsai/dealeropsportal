
-- =============================================
-- Phase 3: Leads, Invoices, Warranties, Aftersales
-- =============================================

-- Enums
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'viewing', 'negotiating', 'won', 'lost');
CREATE TYPE public.lead_source AS ENUM ('walk_in', 'phone', 'website', 'autotrader', 'ebay', 'facebook', 'referral', 'other');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.warranty_status AS ENUM ('active', 'expired', 'claimed', 'voided');
CREATE TYPE public.aftersale_status AS ENUM ('open', 'in_progress', 'awaiting_parts', 'resolved', 'closed');
CREATE TYPE public.aftersale_type AS ENUM ('complaint', 'repair', 'recall', 'goodwill', 'other');

-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  customer_id UUID REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  status public.lead_status NOT NULL DEFAULT 'new',
  source public.lead_source NOT NULL DEFAULT 'walk_in',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  assigned_to UUID,
  estimated_value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on leads" ON public.leads FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer leads" ON public.leads FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer leads" ON public.leads FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer leads" ON public.leads FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  customer_id UUID REFERENCES public.customers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  invoice_number TEXT NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on invoices" ON public.invoices FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer invoices" ON public.invoices FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer invoices" ON public.invoices FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer invoices" ON public.invoices FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Invoice line items
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on invoice_items" ON public.invoice_items FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer invoice items" ON public.invoice_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.dealer_id = get_user_dealer_id()));
CREATE POLICY "Users can insert own dealer invoice items" ON public.invoice_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.dealer_id = get_user_dealer_id()));
CREATE POLICY "Users can update own dealer invoice items" ON public.invoice_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.dealer_id = get_user_dealer_id()));
CREATE POLICY "Users can delete own dealer invoice items" ON public.invoice_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.dealer_id = get_user_dealer_id()));

-- =============================================
-- WARRANTIES TABLE
-- =============================================
CREATE TABLE public.warranties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID REFERENCES public.customers(id),
  status public.warranty_status NOT NULL DEFAULT 'active',
  provider TEXT,
  policy_number TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  mileage_limit INTEGER,
  cost NUMERIC,
  coverage_details TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on warranties" ON public.warranties FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer warranties" ON public.warranties FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer warranties" ON public.warranties FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer warranties" ON public.warranties FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AFTERSALES TABLE
-- =============================================
CREATE TABLE public.aftersales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  customer_id UUID REFERENCES public.customers(id),
  status public.aftersale_status NOT NULL DEFAULT 'open',
  case_type public.aftersale_type NOT NULL DEFAULT 'complaint',
  subject TEXT NOT NULL,
  description TEXT,
  resolution TEXT,
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aftersales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on aftersales" ON public.aftersales FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer aftersales" ON public.aftersales FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer aftersales" ON public.aftersales FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer aftersales" ON public.aftersales FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_aftersales_updated_at BEFORE UPDATE ON public.aftersales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
