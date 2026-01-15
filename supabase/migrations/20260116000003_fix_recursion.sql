-- Fix Infinite Recursion in tribe_members RLS Policy

-- 1. Create a helper function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_tribe_member(_tribe_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.tribe_members 
    WHERE tribe_id = _tribe_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Drop the recursive policy
DROP POLICY IF EXISTS "Tribe members are viewable by tribe members" ON public.tribe_members;

-- 3. Re-create the policy using the security definer function
CREATE POLICY "Tribe members are viewable by tribe members"
  ON public.tribe_members FOR SELECT
  USING (
    public.is_tribe_member(tribe_id)
  );
