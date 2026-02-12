
-- Add check status enums
CREATE TYPE public.check_run_status AS ENUM ('success', 'partial', 'failed');
CREATE TYPE public.check_provider_status AS ENUM ('success', 'failed', 'not_run');

-- Add missing columns to vehicle_checks
ALTER TABLE public.vehicle_checks
  ADD COLUMN IF NOT EXISTS status public.check_run_status NOT NULL DEFAULT 'success',
  ADD COLUMN IF NOT EXISTS dvla_status public.check_provider_status NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS dvsa_status public.check_provider_status NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS gvd_status public.check_provider_status NOT NULL DEFAULT 'not_run',
  ADD COLUMN IF NOT EXISTS summary_data jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS error_message text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cached_until timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS requested_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Rename existing json columns for consistency
ALTER TABLE public.vehicle_checks RENAME COLUMN dvla_data TO dvla_json;
ALTER TABLE public.vehicle_checks RENAME COLUMN dvsa_data TO dvsa_json;
ALTER TABLE public.vehicle_checks RENAME COLUMN gvd_data TO gvd_json;

-- Add updated_at trigger
CREATE TRIGGER update_vehicle_checks_updated_at
  BEFORE UPDATE ON public.vehicle_checks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_dealer_vrm ON public.vehicle_checks(dealer_id, vrm);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_created_by ON public.vehicle_checks(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_checks_status ON public.vehicle_checks(status);
