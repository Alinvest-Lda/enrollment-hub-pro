
-- Create bucket for certificate example images
INSERT INTO storage.buckets (id, name, public) VALUES ('certificate-examples', 'certificate-examples', true);

-- Allow admins to upload
CREATE POLICY "Admins can upload certificate examples" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificate-examples' AND public.is_admin(auth.uid()));

-- Allow admins to delete
CREATE POLICY "Admins can delete certificate examples" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'certificate-examples' AND public.is_admin(auth.uid()));

-- Allow public read
CREATE POLICY "Anyone can view certificate examples" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'certificate-examples');
