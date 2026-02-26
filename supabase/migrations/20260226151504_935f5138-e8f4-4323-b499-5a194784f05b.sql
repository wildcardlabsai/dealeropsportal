
CREATE TABLE public.generated_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealership_name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  source_url TEXT,
  pitch_email_subject TEXT,
  pitch_email_body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  search_query TEXT,
  created_by_user_id UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage generated leads"
  ON public.generated_leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );
