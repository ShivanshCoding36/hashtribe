# Database Setup Instructions

It seems your Supabase database tables haven't been created yet. Please run the following SQL queries in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).

## 1. Create Tables

```sql
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
```

## 2. Enable RLS

Run this after creating the tables.

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS POLICIES
-- =============================================

-- Anyone can view public user profiles
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- TRIBES POLICIES
-- =============================================

-- Public tribes are viewable by everyone
CREATE POLICY "Public tribes are viewable by everyone"
  ON public.tribes FOR SELECT
  USING (visibility = 'public');

-- Private tribes are viewable by members only
CREATE POLICY "Private tribes are viewable by members"
  ON public.tribes FOR SELECT
  USING (
    visibility = 'private' AND
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribes.id AND user_id = auth.uid()
    )
  );

-- Authenticated users can create tribes
CREATE POLICY "Authenticated users can create tribes"
  ON public.tribes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only tribe admins can update tribes
CREATE POLICY "Tribe admins can update tribes"
  ON public.tribes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribes.id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribes.id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- Only tribe admins can delete tribes
CREATE POLICY "Tribe admins can delete tribes"
  ON public.tribes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribes.id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
  );

-- =============================================
-- TRIBE MEMBERS POLICIES
-- =============================================

-- Members can view other members in their tribes
CREATE POLICY "Tribe members are viewable by tribe members"
  ON public.tribe_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members tm
      WHERE tm.tribe_id = tribe_members.tribe_id 
        AND tm.user_id = auth.uid()
    )
  );

-- Users can join public tribes
CREATE POLICY "Users can join public tribes"
  ON public.tribe_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.tribes
      WHERE id = tribe_id AND visibility = 'public'
    )
  );

-- Users can leave tribes (delete their membership)
CREATE POLICY "Users can leave tribes"
  ON public.tribe_members FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can remove members
CREATE POLICY "Admins can remove members"
  ON public.tribe_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members tm
      WHERE tm.tribe_id = tribe_members.tribe_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = 'admin'
    )
  );

-- =============================================
-- TOPICS POLICIES
-- =============================================

-- Topics in public tribes are viewable by everyone
CREATE POLICY "Topics in public tribes are viewable by everyone"
  ON public.topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribes
      WHERE id = topics.tribe_id AND visibility = 'public'
    )
  );

-- Topics in private tribes are viewable by members only
CREATE POLICY "Topics in private tribes are viewable by members"
  ON public.topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribes t
      JOIN public.tribe_members tm ON t.id = tm.tribe_id
      WHERE t.id = topics.tribe_id 
        AND t.visibility = 'private'
        AND tm.user_id = auth.uid()
    )
  );

-- Tribe members can create topics
CREATE POLICY "Tribe members can create topics"
  ON public.topics FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = topics.tribe_id AND user_id = auth.uid()
    )
  );

-- Topic creators can update their topics
CREATE POLICY "Topic creators can update their topics"
  ON public.topics FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Topic creators can delete their topics
CREATE POLICY "Topic creators can delete their topics"
  ON public.topics FOR DELETE
  USING (auth.uid() = created_by);

-- =============================================
-- TOPIC REPLIES POLICIES
-- =============================================

-- Replies are viewable if the topic is viewable
CREATE POLICY "Replies are viewable if topic is viewable"
  ON public.topic_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.topics t
      JOIN public.tribes tr ON t.tribe_id = tr.id
      WHERE t.id = topic_replies.topic_id
        AND (
          tr.visibility = 'public' OR
          EXISTS (
            SELECT 1 FROM public.tribe_members tm
            WHERE tm.tribe_id = tr.id AND tm.user_id = auth.uid()
          )
        )
    )
  );

-- Tribe members can create replies
CREATE POLICY "Tribe members can create replies"
  ON public.topic_replies FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.topics t
      JOIN public.tribe_members tm ON t.tribe_id = tm.tribe_id
      WHERE t.id = topic_replies.topic_id AND tm.user_id = auth.uid()
    )
  );

-- Reply creators can update their replies
CREATE POLICY "Reply creators can update their replies"
  ON public.topic_replies FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Reply creators can delete their replies
CREATE POLICY "Reply creators can delete their replies"
  ON public.topic_replies FOR DELETE
  USING (auth.uid() = created_by);

-- =============================================
-- COMPETITIONS POLICIES
-- =============================================

-- All competitions are viewable by everyone (except drafts)
CREATE POLICY "Non-draft competitions are viewable by everyone"
  ON public.competitions FOR SELECT
  USING (status != 'draft');

-- Draft competitions are viewable by creator only
CREATE POLICY "Draft competitions are viewable by creator"
  ON public.competitions FOR SELECT
  USING (status = 'draft' AND created_by = auth.uid());

-- Authenticated users can create competitions
CREATE POLICY "Authenticated users can create competitions"
  ON public.competitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Competition creators can update their competitions
CREATE POLICY "Competition creators can update their competitions"
  ON public.competitions FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Competition creators can delete their competitions
CREATE POLICY "Competition creators can delete their competitions"
  ON public.competitions FOR DELETE
  USING (auth.uid() = created_by);

-- =============================================
-- COMPETITION PARTICIPANTS POLICIES
-- =============================================

-- Participants are viewable by everyone
CREATE POLICY "Competition participants are viewable by everyone"
  ON public.competition_participants FOR SELECT
  USING (true);

-- Users can join competitions
CREATE POLICY "Users can join competitions"
  ON public.competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update their own participation"
  ON public.competition_participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can leave competitions (before submission)
CREATE POLICY "Users can leave competitions"
  ON public.competition_participants FOR DELETE
  USING (auth.uid() = user_id AND submitted_at IS NULL);
```
