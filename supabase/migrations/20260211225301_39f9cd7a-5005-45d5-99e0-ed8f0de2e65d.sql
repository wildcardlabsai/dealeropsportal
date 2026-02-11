
-- =============================================
-- Phase 4: Courtesy Cars, Tasks
-- =============================================

CREATE TYPE public.courtesy_car_status AS ENUM ('available', 'on_loan', 'in_service', 'retired');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done', 'cancelled');

-- =============================================
-- COURTESY CARS TABLE
-- =============================================
CREATE TABLE public.courtesy_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  vrm TEXT NOT NULL,
  make TEXT,
  model TEXT,
  status public.courtesy_car_status NOT NULL DEFAULT 'available',
  current_customer_id UUID REFERENCES public.customers(id),
  loaned_at TIMESTAMPTZ,
  expected_return TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courtesy_cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on courtesy_cars" ON public.courtesy_cars FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer courtesy_cars" ON public.courtesy_cars FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer courtesy_cars" ON public.courtesy_cars FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer courtesy_cars" ON public.courtesy_cars FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_courtesy_cars_updated_at BEFORE UPDATE ON public.courtesy_cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id UUID NOT NULL REFERENCES public.dealers(id),
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID,
  related_customer_id UUID REFERENCES public.customers(id),
  related_vehicle_id UUID REFERENCES public.vehicles(id),
  completed_at TIMESTAMPTZ,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SuperAdmin full access on tasks" ON public.tasks FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Users can view own dealer tasks" ON public.tasks FOR SELECT USING (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can insert own dealer tasks" ON public.tasks FOR INSERT WITH CHECK (dealer_id = get_user_dealer_id());
CREATE POLICY "Users can update own dealer tasks" ON public.tasks FOR UPDATE USING (dealer_id = get_user_dealer_id()) WITH CHECK (dealer_id = get_user_dealer_id());

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
