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

-- Insert comprehensive sample historical events
INSERT INTO public.historical_events (date, title, description, category) VALUES
  -- Technology & Science
  ('2007-06-29', 'iPhone Launch', 'Apple launches the first iPhone, revolutionizing mobile technology and changing how we interact with devices', 'Technology'),
  ('2004-02-04', 'Facebook Launch', 'Facebook is launched by Mark Zuckerberg at Harvard University, beginning the social media revolution', 'Technology'),
  ('1969-07-20', 'Moon Landing', 'Apollo 11 lands on the moon, Neil Armstrong becomes first human to walk on lunar surface', 'Science'),
  ('1989-03-12', 'World Wide Web', 'Tim Berners-Lee proposes the World Wide Web, revolutionizing global communication', 'Technology'),
  ('2003-04-14', 'Human Genome Project', 'Human Genome Project completed, mapping all human DNA sequences', 'Science'),

  -- Global Events & Politics
  ('2001-09-11', '9/11 Terrorist Attacks', 'Terrorist attacks on the World Trade Center and Pentagon change global security forever', 'Global Events'),
  ('1989-11-09', 'Berlin Wall Falls', 'The Berlin Wall falls, symbolizing the end of the Cold War and German reunification', 'Politics'),
  ('1991-12-26', 'Soviet Union Dissolves', 'The Soviet Union officially dissolves, ending the Cold War era', 'Politics'),
  ('2008-11-04', 'Obama Elected', 'Barack Obama elected as first African American President of the United States', 'Politics'),
  ('2016-06-23', 'Brexit Vote', 'United Kingdom votes to leave the European Union in historic referendum', 'Politics'),

  -- Economics & Finance
  ('2008-09-15', 'Financial Crisis', 'Lehman Brothers collapse triggers global financial crisis and recession', 'Economics'),
  ('1929-10-29', 'Black Tuesday', 'Stock market crash triggers the Great Depression', 'Economics'),
  ('2009-01-03', 'Bitcoin Genesis', 'First Bitcoin block mined, beginning the cryptocurrency revolution', 'Economics'),
  ('1971-08-15', 'Nixon Shock', 'US abandons gold standard, fundamentally changing global monetary system', 'Economics'),

  -- Health & Pandemics
  ('2020-03-11', 'COVID-19 Pandemic Declared', 'WHO declares COVID-19 a global pandemic, affecting billions worldwide', 'Health'),
  ('1981-06-05', 'AIDS First Reported', 'First cases of AIDS reported, beginning a global health crisis', 'Health'),
  ('1955-04-12', 'Polio Vaccine', 'Jonas Salk announces successful polio vaccine, saving millions of lives', 'Health'),
  ('2003-04-16', 'SARS Outbreak', 'SARS coronavirus outbreak spreads globally, foreshadowing future pandemics', 'Health'),

  -- Natural Disasters
  ('2004-12-26', 'Indian Ocean Tsunami', 'Massive tsunami kills over 230,000 people across 14 countries', 'Natural Disaster'),
  ('2011-03-11', 'Japan Earthquake', 'Magnitude 9.0 earthquake and tsunami devastate Japan, cause Fukushima nuclear disaster', 'Natural Disaster'),
  ('2005-08-29', 'Hurricane Katrina', 'Hurricane Katrina devastates New Orleans and Gulf Coast', 'Natural Disaster'),
  ('1986-04-26', 'Chernobyl Disaster', 'Nuclear reactor explosion in Ukraine causes worst nuclear disaster in history', 'Natural Disaster'),

  -- Arts & Culture
  ('1969-08-15', 'Woodstock Festival', 'Iconic music festival defines counterculture movement and generation', 'Culture'),
  ('1977-05-25', 'Star Wars Premiere', 'Star Wars premieres, revolutionizing cinema and popular culture', 'Culture'),
  ('1981-08-01', 'MTV Launches', 'MTV begins broadcasting, changing music industry and youth culture', 'Culture'),
  ('1985-07-13', 'Live Aid Concert', 'Global benefit concert raises awareness and funds for African famine relief', 'Culture'),

  -- Sports
  ('1980-02-22', 'Miracle on Ice', 'US hockey team defeats Soviet Union in Olympics, iconic Cold War moment', 'Sports'),
  ('1992-08-11', 'Dream Team Olympics', 'US basketball Dream Team dominates Olympics, globalizing NBA', 'Sports'),
  ('1999-07-10', 'Women''s World Cup', 'US women win World Cup, Brandi Chastain celebration becomes iconic', 'Sports'),
  ('2008-08-08', 'Beijing Olympics', 'China hosts Olympics, showcasing economic rise to global audience', 'Sports'),

  -- Recent Events (2010s-2020s)
  ('2011-05-02', 'Bin Laden Killed', 'Osama bin Laden killed by US forces, ending decade-long manhunt', 'Global Events'),
  ('2013-06-06', 'Snowden Revelations', 'Edward Snowden reveals NSA surveillance programs, sparking privacy debates', 'Politics'),
  ('2016-11-08', 'Trump Elected', 'Donald Trump elected US President in upset victory', 'Politics'),
  ('2019-12-31', 'COVID-19 Emerges', 'First cases of mysterious pneumonia reported in Wuhan, China', 'Health'),
  ('2021-01-06', 'Capitol Riot', 'Supporters of Donald Trump storm US Capitol building', 'Politics'),
  ('2022-02-24', 'Russia Invades Ukraine', 'Russia launches full-scale invasion of Ukraine, major European conflict', 'Global Events')
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
