-- Fix Posts RLS to use the safe is_tribe_member function
-- This avoids any potential recursion or ambiguity in the previous nested queries

-- 1. Drop old policies
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts in tribes they are members of" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- 2. Create new simplified policies using the helper function

-- View Policy: Public tribes OR Member of any tribe
CREATE POLICY "View Posts Policy"
ON public.posts FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM public.tribes WHERE id = tribe_id AND visibility = 'public'))
  OR 
  public.is_tribe_member(tribe_id)
);

-- Insert Policy: Must be a member (and user_id must match auth)
CREATE POLICY "Create Posts Policy"
ON public.posts FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  public.is_tribe_member(tribe_id)
);

-- Delete Policy: Own posts only
CREATE POLICY "Delete Own Posts Policy"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

-- Update Policy (if needed later, currently posts are immutable)
-- ...
