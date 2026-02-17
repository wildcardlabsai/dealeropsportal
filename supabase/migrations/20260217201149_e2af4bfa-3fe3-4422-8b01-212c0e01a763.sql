
-- Add UPDATE policy for dealer admins on user_roles table
-- This fixes the race condition from the delete+insert pattern
CREATE POLICY "DealerAdmin can update roles in own dealer"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    public.is_dealer_admin_or_super(dealer_id)
    AND role IN ('dealer_admin', 'dealer_user')
  )
  WITH CHECK (
    public.is_dealer_admin_or_super(dealer_id)
    AND role IN ('dealer_admin', 'dealer_user')
  );
