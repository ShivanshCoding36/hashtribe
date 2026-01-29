# Fix Profile Creation Error with Triggers

The error `42501` (RLS Policy Violation) happens because the user profile is trying to be created before variables like `auth.uid()` are fully available or confirmed (e.g. if email confirmation is enabled).

The best practice is to use a **Database Trigger** to automatically create the public profile whenever a user signs up. This runs with system privileges, bypassing RLS issues.

## 1. Run this SQL in Supabase Editor after running the migrations

Run the following SQL to set up the trigger. This handles both Email and GitHub signups automatically.

```sql
-- 1. Function to handle dynamic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, full_name, avatar_url, bio, github_username, github_id)
  VALUES (
    NEW.id,
    -- Map Username
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'user_name', 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    -- Map Display Name (Initial fallback)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      ''
    ),
    -- Map Full Name (Specific for Issue #36)
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      ''
    ),
    -- Map Avatar
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    ),
    -- Default Bio (Dynamic starting point)
    'New member of the tribe',
    -- GitHub metadata
    NEW.raw_user_meta_data->>'user_name', 
    (NEW.raw_user_meta_data->>'provider_id')::bigint
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. Verify Auth Settings

Enforce valid `raw_user_meta_data` is sent from the client (our code already does this).

Once you run this, new signups will work immediately without RLS errors!
