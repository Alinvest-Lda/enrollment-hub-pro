
-- Create a public bucket for course images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload/update/delete course images
CREATE POLICY "Admins can manage course images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'course-images' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'course-images' AND public.is_admin(auth.uid()));

-- Allow public read access to course images
CREATE POLICY "Anyone can view course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');
