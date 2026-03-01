-- Add screenshot_url to payments table
ALTER TABLE payments ADD COLUMN screenshot_url TEXT;

-- Create Storage Bucket for screenshots if it doesn't exist
-- Note: This requires Supabase admin privileges or manual setup in the console.
-- Most local setups ignore this, but it's good practice.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Simplified for dev)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');
