
-- =============================================
-- DEALEROPS CORE SCHEMA
-- =============================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin', 'dealer_admin', 'dealer_user');
CREATE TYPE public.dealer_status AS ENUM ('active', 'suspended', 'pending');

-- 2. DEALERS TABLE
CREATE TABLE public.dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status public.dealer_status NOT NULL DEFAULT 'active',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  plan_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- 3. PROFILES TABLE (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.dealers(id) ON DELETE SET NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. CONTACT LEADS TABLE (public contact form)
CREATE TABLE public.contact_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  dealership_name TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================

-- Check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Get current user's dealer_id
CREATE OR REPLACE FUNCTION public.get_user_dealer_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dealer_id FROM public.profiles
  WHERE id = auth.uid();
$$;

-- Check if current user has access to a dealer (any role)
CREATE OR REPLACE FUNCTION public.has_dealer_access(_dealer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR (
    SELECT dealer_id FROM public.profiles WHERE id = auth.uid()
  ) = _dealer_id;
$$;

-- Check if current user is dealer_admin or super_admin for a dealer
CREATE OR REPLACE FUNCTION public.is_dealer_admin_or_super(_dealer_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND dealer_id = _dealer_id
    AND role = 'dealer_admin'
  );
$$;

-- =============================================
-- RLS POLICIES
-- =============================================

-- DEALERS
CREATE POLICY "SuperAdmin can do all on dealers"
  ON public.dealers FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view own dealer"
  ON public.dealers FOR SELECT
  TO authenticated
  USING (id = public.get_user_dealer_id());

-- PROFILES
CREATE POLICY "SuperAdmin can do all on profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view profiles in own dealer"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (dealer_id = public.get_user_dealer_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- USER ROLES
CREATE POLICY "SuperAdmin can do all on user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Users can view roles in own dealer"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (dealer_id = public.get_user_dealer_id());

CREATE POLICY "DealerAdmin can manage roles in own dealer"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_dealer_admin_or_super(dealer_id)
    AND role IN ('dealer_admin', 'dealer_user')
  );

CREATE POLICY "DealerAdmin can delete roles in own dealer"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    public.is_dealer_admin_or_super(dealer_id)
    AND role IN ('dealer_admin', 'dealer_user')
  );

-- AUDIT LOGS
CREATE POLICY "SuperAdmin can view all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Users can view own dealer audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (dealer_id = public.get_user_dealer_id());

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- CONTACT LEADS (only SuperAdmin can view, anyone can insert)
CREATE POLICY "Anyone can submit contact leads"
  ON public.contact_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "SuperAdmin can view contact leads"
  ON public.contact_leads FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- =============================================
-- TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dealers_updated_at
  BEFORE UPDATE ON public.dealers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INDEXES
CREATE INDEX idx_profiles_dealer_id ON public.profiles(dealer_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_dealer_id ON public.user_roles(dealer_id);
CREATE INDEX idx_audit_logs_dealer_id ON public.audit_logs(dealer_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
