-- Fix the handle_new_user function to properly handle Twitter OAuth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_type_val text;
BEGIN
  -- Try to get user_type from different sources in order of priority
  user_type_val := COALESCE(
    NEW.raw_user_meta_data->>'user_type',    -- From OAuth metadata
    NEW.raw_app_meta_data->>'user_type',     -- From app metadata  
    'kol'  -- Default fallback to KOL
  );
  
  -- Additional logging for debugging OAuth flow
  RAISE LOG 'OAuth user creation - ID: %, Type: %, Full metadata: %', 
    NEW.id, user_type_val, NEW.raw_user_meta_data;
  
  -- Insert into users table with comprehensive Twitter data
  -- Use COALESCE and proper JSON field access with explicit casting
  INSERT INTO public.users (
    id, 
    user_type, 
    twitter_username, 
    twitter_id, 
    twitter_verified, 
    twitter_followers_count,
    twitter_following_count,
    twitter_tweet_count,
    twitter_listed_count,
    twitter_description,
    twitter_profile_image_url,
    twitter_location,
    twitter_account_created_at,
    avatar_url,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    user_type_val,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username'),
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE((NEW.raw_user_meta_data->>'verified')::boolean, false),
    COALESCE(
      (NEW.raw_user_meta_data->'public_metrics'->>'followers_count')::integer,
      (NEW.raw_user_meta_data->>'public_metrics_followers_count')::integer, 
      0
    ),
    COALESCE((NEW.raw_user_meta_data->'public_metrics'->>'following_count')::integer, 0),
    COALESCE((NEW.raw_user_meta_data->'public_metrics'->>'tweet_count')::integer, 0),
    COALESCE((NEW.raw_user_meta_data->'public_metrics'->>'listed_count')::integer, 0),
    NEW.raw_user_meta_data->>'description',
    NEW.raw_user_meta_data->>'profile_image_url',
    NEW.raw_user_meta_data->>'location',
    CASE 
      WHEN NEW.raw_user_meta_data->>'created_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'created_at')::timestamp with time zone
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'profile_image_url'),
    NEW.raw_user_meta_data->>'description',
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
      COALESCE(
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'user_name', 
        NEW.raw_user_meta_data->>'preferred_username',
        'User'
      ),
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
      COALESCE(
        NEW.raw_user_meta_data->>'name', 
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'user_name', 
        NEW.raw_user_meta_data->>'preferred_username',
        'Company'
      ),
      0,
      0,
      'pending',
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Created Project profile for user: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE LOG 'Error in handle_new_user for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$function$;