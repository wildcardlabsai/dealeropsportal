
-- ====================================================================
-- PART 1: Enhance audit_logs table
-- ====================================================================
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS actor_role text,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS user_agent text;

-- ====================================================================
-- PART 2: Document Templates table
-- ====================================================================
CREATE TABLE public.document_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id uuid REFERENCES public.dealers(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'OTHER',
  description text,
  template_format text NOT NULL DEFAULT 'HTML',
  template_html text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform default templates"
  ON public.document_templates FOR SELECT
  USING (dealer_id IS NULL);

CREATE POLICY "Users can view own dealer templates"
  ON public.document_templates FOR SELECT
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "SuperAdmin full access on document_templates"
  ON public.document_templates FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Users can insert own dealer templates"
  ON public.document_templates FOR INSERT
  WITH CHECK (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can update own dealer templates"
  ON public.document_templates FOR UPDATE
  USING (dealer_id = get_user_dealer_id())
  WITH CHECK (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can delete own dealer templates"
  ON public.document_templates FOR DELETE
  USING (dealer_id = get_user_dealer_id());

-- ====================================================================
-- PART 3: Generated Documents table
-- ====================================================================
CREATE TABLE public.generated_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id uuid NOT NULL REFERENCES public.dealers(id),
  template_id uuid REFERENCES public.document_templates(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'OTHER',
  related_entity_type text NOT NULL DEFAULT 'NONE',
  related_entity_id uuid,
  variables_json jsonb,
  pdf_url text NOT NULL,
  created_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dealer generated_documents"
  ON public.generated_documents FOR SELECT
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can insert own dealer generated_documents"
  ON public.generated_documents FOR INSERT
  WITH CHECK (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can delete own dealer generated_documents"
  ON public.generated_documents FOR DELETE
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "SuperAdmin full access on generated_documents"
  ON public.generated_documents FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ====================================================================
-- PART 4: Uploaded Files table
-- ====================================================================
CREATE TABLE public.uploaded_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_id uuid NOT NULL REFERENCES public.dealers(id),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'GENERAL',
  related_entity_type text NOT NULL DEFAULT 'NONE',
  related_entity_id uuid,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own dealer uploaded_files"
  ON public.uploaded_files FOR SELECT
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can insert own dealer uploaded_files"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (dealer_id = get_user_dealer_id());

CREATE POLICY "Users can delete own dealer uploaded_files"
  ON public.uploaded_files FOR DELETE
  USING (dealer_id = get_user_dealer_id());

CREATE POLICY "SuperAdmin full access on uploaded_files"
  ON public.uploaded_files FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ====================================================================
-- PART 5: Seed default document templates (platform-wide, dealer_id NULL)
-- ====================================================================
INSERT INTO public.document_templates (dealer_id, name, category, description, template_html, is_active) VALUES

(NULL, 'Pre-Delivery Inspection (PDI) Sheet', 'PDI', 'Standard PDI checklist for vehicle preparation before customer handover.',
'<h2>Pre-Delivery Inspection Sheet</h2>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><th style="text-align:left;border:1px solid #ccc;padding:8px;background:#f5f5f5">Item</th><th style="border:1px solid #ccc;padding:8px;width:60px;background:#f5f5f5">Pass</th><th style="border:1px solid #ccc;padding:8px;width:60px;background:#f5f5f5">Fail</th><th style="border:1px solid #ccc;padding:8px;width:200px;background:#f5f5f5">Notes</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Lights &amp; Indicators</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Tyres (tread &amp; pressure)</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Brakes</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Fluids (oil, coolant, washer, brake)</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Electrics (windows, mirrors, A/C)</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Test Drive</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Seatbelts &amp; Safety</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px"><strong>Dashboard Warning Lights</strong></td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
</table>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}} — VIN: {{VehicleVIN}} — Mileage: {{VehicleMileage}}</p>
<p><strong>Inspector:</strong> {{StaffName}} &nbsp;&nbsp; <strong>Date:</strong> {{DateGenerated}}</p>
<br/><p>Signature: _________________________</p>', true),

(NULL, 'Valeting Job Card', 'VALETING', 'Standard valeting job card with task checklist.',
'<h2>Valeting Job Card</h2>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}}</p>
<p><strong>Customer:</strong> {{CustomerName}}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><th style="text-align:left;border:1px solid #ccc;padding:8px;background:#f5f5f5">Task</th><th style="border:1px solid #ccc;padding:8px;width:60px;background:#f5f5f5">Done</th><th style="border:1px solid #ccc;padding:8px;width:200px;background:#f5f5f5">Notes</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Exterior Wash</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Polish / Wax</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Interior Vacuum</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Glass Cleaned</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Wheels &amp; Arches</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Deodorise</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td><td style="border:1px solid #ccc;padding:8px"></td></tr>
</table>
<p><strong>Start:</strong> __________ &nbsp;&nbsp; <strong>End:</strong> __________</p>
<p><strong>Completed by:</strong> {{StaffName}} &nbsp;&nbsp; <strong>Date:</strong> {{DateGenerated}}</p>
<br/><p>Sign-off: _________________________</p>', true),

(NULL, 'Handover Checklist', 'HANDOVER', 'Customer vehicle handover checklist.',
'<h2>Handover Checklist</h2>
<p><strong>Customer:</strong> {{CustomerName}} &nbsp;&nbsp; <strong>Vehicle:</strong> {{VehicleMakeModel}} — {{VehicleReg}}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><th style="text-align:left;border:1px solid #ccc;padding:8px;background:#f5f5f5">Item</th><th style="border:1px solid #ccc;padding:8px;width:60px;background:#f5f5f5">✓</th></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Both keys provided</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">V5 status explained</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Service book / history provided</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Spare wheel / tyre kit shown</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Dashboard warning lights clear</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Fuel level noted</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Controls demonstrated</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Infotainment / Bluetooth setup</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Warranty terms explained</td><td style="border:1px solid #ccc;padding:8px;text-align:center">☐</td></tr>
</table>
<p><strong>Date:</strong> {{DateGenerated}} &nbsp;&nbsp; <strong>Staff:</strong> {{StaffName}}</p>
<br/><p>Customer Signature: _________________________</p>', true),

(NULL, 'Courtesy Car Agreement', 'COURTESY_CAR', 'Loan agreement for courtesy car usage.',
'<h2>Courtesy Car Loan Agreement</h2>
<p><strong>Customer:</strong> {{CustomerName}}</p>
<p><strong>Address:</strong> {{CustomerAddress}}</p>
<p><strong>Phone:</strong> {{CustomerPhone}} &nbsp;&nbsp; <strong>Email:</strong> {{CustomerEmail}}</p>
<hr/>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}}</p>
<p><strong>Mileage Out:</strong> __________ &nbsp;&nbsp; <strong>Fuel Out:</strong> __________</p>
<p><strong>Loan Date:</strong> {{DateGenerated}} &nbsp;&nbsp; <strong>Expected Return:</strong> __________</p>
<hr/>
<h3>Terms &amp; Conditions</h3>
<ol>
<li>The vehicle must be returned in the same condition as provided.</li>
<li>The borrower is responsible for any damage, fines, or penalties incurred during the loan period.</li>
<li>The vehicle must not be used for commercial purposes or sub-let to third parties.</li>
<li>Insurance is provided under the dealership policy; the borrower must hold a valid UK driving licence.</li>
<li>Fuel must be returned at the same level as provided.</li>
</ol>
<br/>
<p><strong>Customer Signature:</strong> _________________________ &nbsp;&nbsp; <strong>Date:</strong> __________</p>
<p><strong>Staff Signature:</strong> _________________________ &nbsp;&nbsp; <strong>Date:</strong> __________</p>', true),

(NULL, 'Vehicle Collection / Delivery Form', 'SALES', 'Delivery or collection confirmation form.',
'<h2>Vehicle Collection / Delivery Form</h2>
<p><strong>Customer:</strong> {{CustomerName}}</p>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}} — VIN: {{VehicleVIN}}</p>
<p><strong>Mileage at Delivery:</strong> {{VehicleMileage}}</p>
<p><strong>Delivery Date:</strong> {{DateGenerated}}</p>
<p><strong>Delivery Address:</strong> {{CustomerAddress}}</p>
<hr/>
<p><strong>Condition Notes:</strong></p>
<p style="border:1px solid #ccc;min-height:80px;padding:8px"></p>
<br/>
<p><strong>Customer Signature:</strong> _________________________ &nbsp;&nbsp; <strong>Date:</strong> __________</p>
<p><strong>Staff:</strong> {{StaffName}}</p>', true),

(NULL, 'Aftersales Vehicle Drop-off Form', 'AFTERSALES', 'Customer vehicle drop-off form for service or repair.',
'<h2>Aftersales Vehicle Drop-off Form</h2>
<p><strong>Customer:</strong> {{CustomerName}} &nbsp;&nbsp; <strong>Phone:</strong> {{CustomerPhone}}</p>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}} — Mileage: {{VehicleMileage}}</p>
<hr/>
<p><strong>Complaint / Issue Description:</strong></p>
<p style="border:1px solid #ccc;min-height:80px;padding:8px">{{IssueSummary}}</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
<tr><td style="border:1px solid #ccc;padding:8px">Warning lights on dashboard?</td><td style="border:1px solid #ccc;padding:8px;width:100px">Yes ☐ &nbsp; No ☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Consent to diagnostic inspection?</td><td style="border:1px solid #ccc;padding:8px">Yes ☐ &nbsp; No ☐</td></tr>
<tr><td style="border:1px solid #ccc;padding:8px">Permission to contact by phone?</td><td style="border:1px solid #ccc;padding:8px">Yes ☐ &nbsp; No ☐</td></tr>
</table>
<br/>
<p><strong>Customer Signature:</strong> _________________________ &nbsp;&nbsp; <strong>Date:</strong> {{DateGenerated}}</p>
<p><strong>Staff:</strong> {{StaffName}}</p>', true),

(NULL, 'Warranty Certificate', 'WARRANTY', 'Warranty certificate template for vehicle sale.',
'<h2>Warranty Certificate</h2>
<p style="text-align:center;font-size:18px"><strong>Vehicle Warranty</strong></p>
<hr/>
<p><strong>Customer:</strong> {{CustomerName}}</p>
<p><strong>Vehicle:</strong> {{VehicleMakeModel}} — Reg: {{VehicleReg}} — VIN: {{VehicleVIN}}</p>
<p><strong>Mileage at Sale:</strong> {{VehicleMileage}}</p>
<p><strong>Sale Date:</strong> {{SaleDate}}</p>
<hr/>
<h3>Warranty Details</h3>
<p><strong>Start Date:</strong> {{SaleDate}} &nbsp;&nbsp; <strong>End Date:</strong> __________</p>
<p><strong>Coverage:</strong> Mechanical and electrical components as per warranty booklet terms.</p>
<h3>How to Make a Claim</h3>
<ol>
<li>Contact the dealership at {{DealerPhone}} or {{DealerEmail}}.</li>
<li>Describe the issue and provide your warranty certificate number.</li>
<li>Bring the vehicle to the dealership for inspection.</li>
<li>Authorised repairs will be carried out at no cost within warranty terms.</li>
</ol>
<br/>
<p style="text-align:center;font-size:12px;color:#666">This warranty is provided by {{DealerName}} and is subject to the terms and conditions outlined in the warranty booklet.</p>', true);

-- ====================================================================
-- PART 6: Storage bucket for generated documents
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-documents', 'generated-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view own dealer generated docs storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'generated-documents' AND (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND dealer_id::text = (storage.foldername(name))[1]
  ) OR is_super_admin()));

CREATE POLICY "Users can upload generated docs storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'generated-documents' AND (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND dealer_id::text = (storage.foldername(name))[1]
  ) OR is_super_admin()));

-- Storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('dealer-uploads', 'dealer-uploads', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view own dealer uploads storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dealer-uploads' AND (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND dealer_id::text = (storage.foldername(name))[1]
  ) OR is_super_admin()));

CREATE POLICY "Users can upload to dealer-uploads storage"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dealer-uploads' AND (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND dealer_id::text = (storage.foldername(name))[1]
  ) OR is_super_admin()));

CREATE POLICY "Users can delete own dealer uploads storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dealer-uploads' AND (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND dealer_id::text = (storage.foldername(name))[1]
  ) OR is_super_admin()));
