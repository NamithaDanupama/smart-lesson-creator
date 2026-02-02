-- Create a storage bucket for lesson images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-images', 'lesson-images', true);

-- Allow public read access to lesson images
CREATE POLICY "Public can view lesson images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-images');

-- Allow authenticated and anon to upload (for edge function service role)
CREATE POLICY "Anyone can upload lesson images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-images');

-- Allow updates to lesson images
CREATE POLICY "Anyone can update lesson images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-images');