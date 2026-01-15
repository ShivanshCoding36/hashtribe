-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_id BIGINT UNIQUE,
  devcom_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$')
);

-- Index for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_github_id ON public.users(github_id);
CREATE INDEX idx_users_devcom_score ON public.users(devcom_score DESC);

-- =============================================
-- TRIBES TABLE
-- =============================================
CREATE TYPE tribe_visibility AS ENUM ('public', 'private');

CREATE TABLE public.tribes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  visibility tribe_visibility DEFAULT 'public',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_tribes_slug ON public.tribes(slug);
CREATE INDEX idx_tribes_created_by ON public.tribes(created_by);
CREATE INDEX idx_tribes_visibility ON public.tribes(visibility);

-- =============================================
-- TRIBE MEMBERS TABLE
-- =============================================
CREATE TYPE tribe_role AS ENUM ('admin', 'member');

CREATE TABLE public.tribe_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role tribe_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tribe_id, user_id)
);

-- Index for performance
CREATE INDEX idx_tribe_members_tribe_id ON public.tribe_members(tribe_id);
CREATE INDEX idx_tribe_members_user_id ON public.tribe_members(user_id);

-- =============================================
-- TOPICS TABLE
-- =============================================
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0
);

-- Index for performance
CREATE INDEX idx_topics_tribe_id ON public.topics(tribe_id);
CREATE INDEX idx_topics_created_by ON public.topics(created_by);
CREATE INDEX idx_topics_created_at ON public.topics(created_at DESC);

-- =============================================
-- TOPIC REPLIES TABLE
-- =============================================
CREATE TABLE public.topic_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  code_snippet TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0
);

-- Index for performance
CREATE INDEX idx_topic_replies_topic_id ON public.topic_replies(topic_id);
CREATE INDEX idx_topic_replies_created_by ON public.topic_replies(created_by);

-- =============================================
-- COMPETITIONS TABLE
-- =============================================
CREATE TYPE competition_status AS ENUM ('draft', 'upcoming', 'live', 'ended');
CREATE TYPE competition_difficulty AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty competition_difficulty DEFAULT 'medium',
  status competition_status DEFAULT 'draft',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for performance
CREATE INDEX idx_competitions_slug ON public.competitions(slug);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_start_time ON public.competitions(start_time);

-- =============================================
-- COMPETITION PARTICIPANTS TABLE
-- =============================================
CREATE TABLE public.competition_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  submitted_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(competition_id, user_id)
);

-- Index for performance
CREATE INDEX idx_competition_participants_competition_id ON public.competition_participants(competition_id);
CREATE INDEX idx_competition_participants_user_id ON public.competition_participants(user_id);
CREATE INDEX idx_competition_participants_score ON public.competition_participants(score DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tribes_updated_at BEFORE UPDATE ON public.tribes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_topic_replies_updated_at BEFORE UPDATE ON public.topic_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_competitions_updated_at BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-add creator as admin member when tribe is created
CREATE OR REPLACE FUNCTION add_tribe_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tribe_members (tribe_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_tribe_creator AFTER INSERT ON public.tribes
  FOR EACH ROW EXECUTE FUNCTION add_tribe_creator_as_admin();
