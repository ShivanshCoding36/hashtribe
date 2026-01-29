# HashTribe Setup Guide

This guide covers the comprehensive setup for HashTribe, specifically focusing on the Supabase backend configuration, which is critical for the application to function correctly.

## 1. Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: v8 or higher (`npm install -g pnpm`)
- **Git**
- **Supabase Account**: [Sign up here](https://supabase.com/)

---

## 2. Environment Configuration

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/the-mayankjha/hashtribe.git
    cd HashTribe
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```

3.  **Create Environment File**
    Copy the example file to `.env`:
    ```bash
    cp .env.example .env
    ```

    Your `.env` file should look like this (located in `apps/web/.env` or root depending on your workspace setup):

    ```env
    # Supabase Configuration
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here

    # Optional: GitHub Personal Access Token
    VITE_GITHUB_TOKEN=your_token_here
    ```

---

## 3. Supabase Backend Setup

HashTribe relies heavily on Supabase for Auth, Database, and Row Level Security (RLS). You have two options: use the **Hosted Supabase** (easiest) or run it locally via CLI. This guide focuses on the Hosted setup.

### Step 3.1: Create a Project
1.  Go to [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click **"New Project"**.
3.  Give it a name (e.g., "Hashtribe Dev") and a database password.
4.  Wait for the project to finish provisioning.

### Step 3.2: Get Credentials
1.  Go to **Project Settings** -> **API**.
2.  Copy **Project URL** and paste it into `VITE_SUPABASE_URL` in your `.env`.
3.  Copy **anon public** key and paste it into `VITE_SUPABASE_ANON_KEY` in your `.env`.

### Step 3.3: Configure Authentication
1.  Go to **Authentication** -> **Providers**.
2.  Enable **GitHub**.
3.  You will need a GitHub OAuth App:
    *   Go to [GitHub Developer Settings](https://github.com/settings/developers).
    *   Create **New OAuth App**.
    *   **Homepage URL**: `http://localhost:5173` (or your production URL)
    *   **Callback URL**: `https://<your-project-id>.supabase.co/auth/v1/callback`
4.  Copy the **Client ID** and **Client Secret** from GitHub back to Supabase.
5.  Click **Save**.

### Step 3.4: Configure Storage

HashTribe uses a public storage bucket for user avatars.

2.  Go to Storage in the Supabase Dashboard.

3.  The bucket avatars is created automatically if you ran the SQL script in Step 4.

4.  Ensure the bucket is set to Public to allow the profile images to load globally.

---

## 4. Database Schema & Policies (CRITICAL)

The database schema includes Users, Tribes, Posts, and security policies. Without this, the app will throw `406 Not Acceptable`, `404 Not Found`, or `Foreign Key Constraint` errors.

### **Run this SQL Script**
Go to your Supabase project's **SQL Editor** and run the following script in its entirety. This script is idempotent (safe to run multiple times).

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SAFELY CREATE TYPES
-- =============================================
DO $$ BEGIN
    CREATE TYPE tribe_visibility AS ENUM ('public', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tribe_role AS ENUM ('admin', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_tribe_member(_tribe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.tribe_members 
    WHERE tribe_id = _tribe_id AND user_id = auth.uid()
  );
END;
$$;

-- =============================================
-- TABLES
-- =============================================

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_id BIGINT UNIQUE,
  devcom_score INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$')
);

-- TRIBES
CREATE TABLE IF NOT EXISTS public.tribes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  visibility tribe_visibility DEFAULT 'public',
  is_official BOOLEAN DEFAULT false,
  cover_url TEXT,
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  rules TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRIBE MEMBERS
CREATE TABLE IF NOT EXISTS public.tribe_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role tribe_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tribe_id, user_id)
);

-- POSTS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  parent_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates during updates

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public tribes viewable by everyone" ON public.tribes;
CREATE POLICY "Public tribes viewable by everyone" ON public.tribes FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Private tribes viewable by members" ON public.tribes;
CREATE POLICY "Private tribes viewable by members" ON public.tribes FOR SELECT USING (visibility = 'private' AND public.is_tribe_member(id));

DROP POLICY IF EXISTS "Auth users create tribes" ON public.tribes;
CREATE POLICY "Auth users create tribes" ON public.tribes FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Tribe members viewable" ON public.tribe_members;
CREATE POLICY "Tribe members viewable" ON public.tribe_members FOR SELECT USING (public.is_tribe_member(tribe_id) OR EXISTS (SELECT 1 FROM public.tribes WHERE id = tribe_id AND visibility = 'public'));

DROP POLICY IF EXISTS "Join public tribes" ON public.tribe_members;
CREATE POLICY "Join public tribes" ON public.tribe_members FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.tribes WHERE id = tribe_id AND visibility = 'public'));

DROP POLICY IF EXISTS "View Posts" ON public.posts;
CREATE POLICY "View Posts" ON public.posts FOR SELECT USING ((EXISTS (SELECT 1 FROM public.tribes WHERE id = tribe_id AND visibility = 'public')) OR public.is_tribe_member(tribe_id));

DROP POLICY IF EXISTS "Create Posts" ON public.posts;
CREATE POLICY "Create Posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_tribe_member(tribe_id));

-- =============================================
-- TRIGGERS (Auto-sync User & Admin)
-- =============================================

-- 1. Sync Auth User to Public User Table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
BEGIN
  base_username := COALESCE(NEW.raw_user_meta_data->>'user_name', SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  final_username := SUBSTRING(base_username FROM 1 FOR 15) || '_' || RIGHT(NEW.id::text, 4);

  INSERT INTO public.users (id, username, display_name, full_name, avatar_url, github_username, github_id, bio)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name',
    (NEW.raw_user_meta_data->>'provider_id')::BIGINT,
    'New member of the tribe'
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add Tribe Creator as Admin
CREATE OR REPLACE FUNCTION add_tribe_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tribe_members (tribe_id, user_id, role) VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_tribe_creator ON public.tribes;
CREATE TRIGGER add_tribe_creator AFTER INSERT ON public.tribes FOR EACH ROW EXECUTE FUNCTION add_tribe_creator_as_admin();

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar Viewable by Public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatars" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 5. Common Issues & Troubleshooting

### Error: `406 Not Acceptable`
- **Cause**: The API request is failing validation, mostly commonly because the Table does not exist or RLS policies are preventing any return type.
- **Fix**: Run the provided SQL script to ensure tables exist.

### Error: `Violates foreign key constraint "tribes_created_by_fkey"`
- **Cause**: The user ID trying to create the tribe doesn't exist in the `public.users` table. This happens if the `on_auth_user_created` trigger wasn't active when the user signed up.
- **Fix**: Run this SQL snippet to manually sync your user:
    ```sql
    INSERT INTO public.users (id, username, display_name, full_name, bio, avatar_url, followers_count)
    SELECT 
      id, 
      COALESCE(raw_user_meta_data->>'user_name', 'user_' || SUBSTRING(id::text, 1, 8)),
      COALESCE(raw_user_meta_data->>'full_name', 'User'),
      COALESCE(raw_user_meta_data->>'full_name', 'User'), 
      'New member of the tribe', 
      raw_user_meta_data->>'avatar_url',
      0
    FROM auth.users
    ON CONFLICT (id) DO NOTHING;
    ```

### Error: `Infinite recursion detected in policy`
- **Cause**: RLS policies are referencing themselves (e.g., checking membership availability by querying membership).
- **Fix**: We use a `SECURITY DEFINER` function `is_tribe_member()` to break this loop. Ensure you are using the updated SQL script provided above.
