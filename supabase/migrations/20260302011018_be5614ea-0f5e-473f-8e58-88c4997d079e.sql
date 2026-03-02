
-- Allow admins to delete enrollments
CREATE POLICY "Admins can delete enrollments"
ON public.enrollments FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to delete courses
CREATE POLICY "Admins can delete courses"
ON public.courses FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
