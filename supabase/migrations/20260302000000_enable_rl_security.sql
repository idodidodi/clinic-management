-- 1. Create Authorized Users Table
CREATE TABLE IF NOT EXISTS authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- 3. Define Policies

-- Policy for Authorized Users Table (Only authenticated users can see it, for the app check)
CREATE POLICY "Allow authenticated to read authorized users" ON authorized_users
FOR SELECT TO authenticated USING (true);

-- Policy for Customers
CREATE POLICY "Allow access for clinic owners" ON customers
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
);

-- Policy for Meetings
CREATE POLICY "Allow access for clinic owners" ON meetings
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
);

-- Policy for Payments
CREATE POLICY "Allow access for clinic owners" ON payments
AS PERMISSIVE FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM authorized_users 
    WHERE authorized_users.email = auth.jwt() ->> 'email'
  )
);
