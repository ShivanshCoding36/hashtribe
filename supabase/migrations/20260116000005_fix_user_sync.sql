-- Fix User Profile Sync (Corrected for username constraints)

-- 1. Create a function to handle new user creation in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  clean_username TEXT;
  final_username TEXT;
BEGIN
  -- Get base username from metadata or email
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1));
  
  -- Sanitize: Remove characters that are NOT alphanumeric, underscore, or hyphen
  clean_username := REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_-]', '', 'g');
  
  -- Ensure it has at least some content
  IF length(clean_username) < 1 THEN
    clean_username := 'user';
  END IF;
  
  -- Construct final username: Truncate base to 15 chars + '_' + last 4 of ID
  -- This ensures total length <= 20 and satisfies the unique requirement
  final_username := SUBSTRING(clean_username FROM 1 FOR 15) || '_' || RIGHT(NEW.id::text, 4);

  INSERT INTO public.users (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Create or Replace the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill with Sanitization
INSERT INTO public.users (id, username, display_name)
SELECT 
  id, 
  -- Same logic: Sanitize -> Truncate -> Append ID
  SUBSTRING(REGEXP_REPLACE(COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)), '[^a-zA-Z0-9_-]', '', 'g') FROM 1 FOR 15) 
  || '_' || RIGHT(id::text, 4),
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
