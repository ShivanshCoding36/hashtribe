-- Final fix for Tribe Members Recursion

-- 1. Ensure the helper function exists and is correct
CREATE OR REPLACE FUNCTION public.is_tribe_member(_tribe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Non-recursive check: Does a row exist for this user?
  RETURN EXISTS (
    SELECT 1 
    FROM public.tribe_members 
    WHERE tribe_id = _tribe_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Drop potential problematic policies
DROP POLICY IF EXISTS "Tribe members are viewable by tribe members" ON public.tribe_members;
DROP POLICY IF EXISTS "Private tribes are viewable by members" ON public.tribes;

-- 3. Re-create Tribe Members Policy (Non-recursive)
CREATE POLICY "Tribe members are viewable by tribe members"
  ON public.tribe_members FOR SELECT
  USING (
    -- Use the function to break recursion
    public.is_tribe_member(tribe_id)
  );

-- 4. Re-create Tribes Policy (using the same safe check)
CREATE POLICY "Private tribes are viewable by members"
  ON public.tribes FOR SELECT
  USING (
    visibility = 'public' OR -- Public is always visible
    (visibility = 'private' AND public.is_tribe_member(id)) -- Private needs membership
  );
