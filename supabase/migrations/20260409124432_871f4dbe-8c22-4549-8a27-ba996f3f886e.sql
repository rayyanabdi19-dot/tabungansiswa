
-- Add photo_url column to students
ALTER TABLE public.students ADD COLUMN photo_url text DEFAULT '';

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public) VALUES ('student-photos', 'student-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

CREATE POLICY "Admins can upload student photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Admins can update student photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'student-photos');

CREATE POLICY "Admins can delete student photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'student-photos');
