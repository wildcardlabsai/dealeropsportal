
-- Allow dealer admins to update their own dealer
CREATE POLICY "DealerAdmin can update own dealer" ON public.dealers
  FOR UPDATE
  USING (is_dealer_admin_or_super(id))
  WITH CHECK (is_dealer_admin_or_super(id));
