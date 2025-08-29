-- Update the handle_new_user function to get user_type from query params
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_type_val text;
BEGIN
  -- Try to get user_type from different sources in order of priority
  user_type_val := COALESCE(
    NEW.raw_user_meta_data->>'user_type',  -- From metadata
    NEW.raw_app_meta_data->>'user_type',   -- From app metadata
    'kol'  -- Default fallback
  );
  
  -- Log for debugging
  RAISE LOG 'Creating user with type: %, metadata: %', user_type_val, NEW.raw_user_meta_data;
  
  -- Insert into users table
  INSERT INTO public.users (
    id, 
    user_type, 
    twitter_username, 
    twitter_id, 
    twitter_verified, 
    twitter_followers_count, 
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_type_val,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE((NEW.raw_user_meta_data->>'verified')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'public_metrics_followers_count')::integer, 0),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );

  -- Create corresponding profile based on user type
  IF user_type_val = 'kol' THEN
    INSERT INTO public.kol_profiles (
      user_id,
      display_name,
      total_campaigns,
      total_earnings,
      rating,
      availability,
      verification_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'User'),
      0,
      0,
      0,
      true,
      'pending',
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Created KOL profile for user: %', NEW.id;
    
  ELSIF user_type_val = 'project' THEN
    INSERT INTO public.project_profiles (
      user_id,
      company_name,
      total_campaigns,
      total_spent,
      verification_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'user_name', 'Company'),
      0,
      0,
      'pending',
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Created Project profile for user: %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;