-- ====================================================================
-- StudyAesthetic.com - Supabase PostgreSQL Schema
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  auth_provider TEXT DEFAULT 'email',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Automatically create profile on new signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. User Preferences & Layout
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  selected_background TEXT DEFAULT 'cafe-rain',
  selected_background_type TEXT DEFAULT 'youtube',
  timer_settings JSONB DEFAULT '{"pomodoro": 1500, "shortBreak": 300, "longBreak": 900, "autoStartBreaks": false, "autoStartPomodoros": false}'::JSONB,
  sound_volumes JSONB DEFAULT '{}'::JSONB,
  notifications BOOLEAN DEFAULT TRUE,
  focus_mode BOOLEAN DEFAULT FALSE,
  island_layout JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Study Sessions
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL, -- seconds
  mode TEXT NOT NULL,        -- 'pomodoro' | 'short' | 'long'
  completed BOOLEAN DEFAULT TRUE,
  background_used TEXT,
  sounds_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own study sessions"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Study Statistics
CREATE TABLE IF NOT EXISTS public.study_stats (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  total_focus_seconds BIGINT DEFAULT 0,
  today_focus_seconds BIGINT DEFAULT 0,
  week_focus_seconds BIGINT DEFAULT 0,
  month_focus_seconds BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  longest_session INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  most_used_background TEXT,
  most_productive_hour INTEGER,
  achievements TEXT[] DEFAULT '{}',
  last_calculated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own stats"
  ON public.study_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Custom Uploaded Spaces / Backgrounds
CREATE TABLE IF NOT EXISTS public.custom_videos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Custom',
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  content_url TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'youtube' | 'direct_video' | 'image'
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.custom_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own custom videos"
  ON public.custom_videos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
