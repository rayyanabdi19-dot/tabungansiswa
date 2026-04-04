
-- Add logo_url column to school_settings
ALTER TABLE public.school_settings ADD COLUMN IF NOT EXISTS logo_url text DEFAULT '';

-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public) VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to school-logos bucket
CREATE POLICY "Admins can upload school logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

-- Allow anyone to view school logos
CREATE POLICY "Anyone can view school logos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'school-logos');

-- Allow admins to update/delete school logos
CREATE POLICY "Admins can update school logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete school logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'school-logos' AND public.has_role(auth.uid(), 'admin'));
