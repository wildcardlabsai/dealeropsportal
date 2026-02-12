
-- Fix the overly permissive storage policies for courtesy-car-photos
DROP POLICY IF EXISTS "Users can upload courtesy car photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view courtesy car photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload courtesy car photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'courtesy-car-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can view courtesy car photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'courtesy-car-photos' AND auth.uid() IS NOT NULL);
