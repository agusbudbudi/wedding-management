-- Migration: Create Guest Logs and Profiles
-- Description: Records history of actions on guests

-- 1. Create Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email)
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Guest Logs Table
CREATE TABLE IF NOT EXISTS guest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for logs
ALTER TABLE guest_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view logs for their events" ON guest_logs;
CREATE POLICY "Users can view logs for their events" ON guest_logs
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
      UNION
      SELECT event_id FROM event_staff WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create logs" ON guest_logs;
CREATE POLICY "Authenticated users can create logs" ON guest_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_guest_logs_guest_id ON guest_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_logs_event_id ON guest_logs(event_id);
