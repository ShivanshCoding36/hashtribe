# Fix Profile Creation Error with Triggers

The error `42501` (RLS Policy Violation) happens because the user profile is trying to be created before variables like `auth.uid()` are fully available or confirmed (e.g. if email confirmation is enabled).

The best practice is to use a **Database Trigger** to automatically create the public profile whenever a user signs up. This runs with system privileges, bypassing RLS issues.

## 1. Run this SQL in Supabase Editor

Run the following SQL to set up the trigger. This handles both Email and GitHub signups automatically.

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, display_name, avatar_url, bio, github_username, github_id)
  VALUES (
    NEW.id,
    -- Handle username: use metadata or fallback to 'user_xxxxx'
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'user_name', -- GitHub uses 'user_name' sometimes
      NEW.raw_user_meta_data->>'preferred_username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    -- Handle display name
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'name', 
      ''
    ),
    -- Handle avatar
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id
    ),
    -- Default Bio
    'New member of the tribe',
    -- GitHub specific fields (nullable)
    NEW.raw_user_meta_data->>'user_name', 
    (NEW.raw_user_meta_data->>'provider_id')::bigint
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 2. Verify Auth Settings

Enforce valid `raw_user_meta_data` is sent from the client (our code already does this).

Once you run this, new signups will work immediately without RLS errors!
