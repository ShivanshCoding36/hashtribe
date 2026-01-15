-- Update the trigger function to be SECURITY DEFINER
-- This ensures it bypasses RLS policies when inserting the creator as an admin member
-- Essential for creating Private tribes where the user wouldn't otherwise have permission to 'join' via standard policies

CREATE OR REPLACE FUNCTION add_tribe_creator_as_admin()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tribe_members (tribe_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
