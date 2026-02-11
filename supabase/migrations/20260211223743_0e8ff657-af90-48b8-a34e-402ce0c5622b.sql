
-- Tighten audit logs insert: require actor_user_id matches auth.uid()
DROP POLICY "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_user_id = auth.uid());

-- Contact leads: restrict to reasonable fields only (already limited by table structure)
-- The WITH CHECK (true) for anon INSERT on contact_leads is acceptable for a public contact form
-- No change needed there
