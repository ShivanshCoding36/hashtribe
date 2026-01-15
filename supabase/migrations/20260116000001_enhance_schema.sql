-- Enhance Tribes Table with Metadata
ALTER TABLE public.tribes
ADD COLUMN is_official BOOLEAN DEFAULT false,
ADD COLUMN cover_url TEXT,
ADD COLUMN logo_url TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN rules TEXT;

-- =============================================
-- POSTS TABLE (Tweet/Feed Style)
-- =============================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  image_urls TEXT[] DEFAULT '{}',
  parent_id UUID REFERENCES public.posts(id) ON DELETE CASCADE, -- For replies
  
  -- Stats for performance
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  reposts_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for feed performance
CREATE INDEX idx_posts_tribe_id ON public.posts(tribe_id);
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_parent_id ON public.posts(parent_id);

-- =============================================
-- POST LIKES (Interactions)
-- =============================================
CREATE TABLE public.post_likes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for Posts
-- Everyone can view posts of public tribes
CREATE POLICY "Public posts are viewable by everyone" 
ON public.posts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tribes 
    WHERE id = posts.tribe_id AND visibility = 'public'
  ) OR 
  -- Users can see posts in private tribes they are members of
  EXISTS (
    SELECT 1 FROM public.tribe_members 
    WHERE tribe_id = posts.tribe_id AND user_id = auth.uid()
  )
);

-- Auth users can create posts
CREATE POLICY "Users can create posts in tribes they are members of" 
ON public.posts FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 FROM public.tribe_members 
    WHERE tribe_id = tribe_id AND user_id = auth.uid()
  )
);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" 
ON public.posts FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for Likes
CREATE POLICY "Likes are viewable by everyone" 
ON public.post_likes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like posts" 
ON public.post_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
ON public.post_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to update stats? (Optional, usually handled by app or edge function, sticking to basics)
-- Keeping it simple.
