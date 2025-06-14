-- LifeWeeks Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table (extends auth.users)
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  birthdate date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create personal_events table
DROP TABLE IF EXISTS public.personal_events CASCADE;
CREATE TABLE public.personal_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date timestamp with time zone NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('Career', 'Education', 'Personal', 'Travel')),
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  narrative text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_events ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own events" ON public.personal_events;
DROP POLICY IF EXISTS "Users can insert own events" ON public.personal_events;
DROP POLICY IF EXISTS "Users can update own events" ON public.personal_events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.personal_events;

-- 6. Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 7. Create RLS policies for personal_events table
CREATE POLICY "Users can view own events" ON public.personal_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.personal_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON public.personal_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.personal_events
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, birthdate)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'birthdate', '1990-01-01')::date
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for automatic user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_personal_events_updated_at
  BEFORE UPDATE ON public.personal_events
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 12. Insert sample data for testing (optional)
-- This will only work after you create a user account

-- Sample historical events (you can add more)
CREATE TABLE IF NOT EXISTS public.historical_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  date date NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert some sample historical events
INSERT INTO public.historical_events (date, title, description, category) VALUES
  ('2007-06-29', 'iPhone Launch', 'Apple launches the first iPhone, revolutionizing mobile technology', 'Technology'),
  ('2004-02-04', 'Facebook Launch', 'Facebook is launched by Mark Zuckerberg at Harvard University', 'Technology'),
  ('2020-03-11', 'COVID-19 Pandemic Declared', 'WHO declares COVID-19 a global pandemic', 'Health'),
  ('2008-09-15', 'Financial Crisis', 'Lehman Brothers collapse triggers global financial crisis', 'Economics'),
  ('2001-09-11', '9/11 Terrorist Attacks', 'Terrorist attacks on the World Trade Center and Pentagon', 'Global Events')
ON CONFLICT DO NOTHING;

-- 13. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.personal_events TO authenticated;
GRANT SELECT ON public.historical_events TO authenticated, anon;

-- 14. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_personal_events_user_id ON public.personal_events(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_events_date ON public.personal_events(date);
CREATE INDEX IF NOT EXISTS idx_personal_events_sentiment ON public.personal_events(sentiment);
CREATE INDEX IF NOT EXISTS idx_historical_events_date ON public.historical_events(date);

-- Verification queries (run these to check if everything is set up correctly)
-- SELECT * FROM auth.users LIMIT 5;
-- SELECT * FROM public.users LIMIT 5;
-- SELECT * FROM public.personal_events LIMIT 5;
-- SELECT * FROM public.historical_events LIMIT 5;
