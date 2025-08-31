-- Enhanced Twitter OAuth data parsing with better logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_type_val text;
  twitter_user_name text;
  twitter_followers integer;
  twitter_following integer;
  twitter_tweets integer;
  twitter_img_url text;
  twitter_desc text;
  twitter_verified_status boolean;
BEGIN
  -- Try to get user_type from different sources in order of priority
  user_type_val := COALESCE(
    NEW.raw_user_meta_data->>'user_type',
    NEW.raw_app_meta_data->>'user_type',
    'kol'
  );
  
  -- Enhanced logging for debugging OAuth flow
  RAISE LOG 'OAuth user creation - ID: %, Type: %, Raw metadata keys: %', 
    NEW.id, user_type_val, (SELECT array_agg(key) FROM jsonb_each(NEW.raw_user_meta_data));
  
  RAISE LOG 'OAuth metadata content: %', NEW.raw_user_meta_data;
  
  -- Extract Twitter data with multiple fallback patterns
  twitter_user_name := COALESCE(
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'screen_name',
    NEW.raw_user_meta_data->>'username'
  );
  
  -- Try different patterns for follower count
  twitter_followers := COALESCE(
    (NEW.raw_user_meta_data->'public_metrics'->>'followers_count')::integer,
    (NEW.raw_user_meta_data->>'public_metrics_followers_count')::integer,
    (NEW.raw_user_meta_data->>'followers_count')::integer,
    0
  );
  
  twitter_following := COALESCE(
    (NEW.raw_user_meta_data->'public_metrics'->>'following_count')::integer,
    (NEW.raw_user_meta_data->>'following_count')::integer,
    0
  );
  
  twitter_tweets := COALESCE(
    (NEW.raw_user_meta_data->'public_metrics'->>'tweet_count')::integer,
    (NEW.raw_user_meta_data->>'tweet_count')::integer,
    (NEW.raw_user_meta_data->>'statuses_count')::integer,
    0
  );
  
  twitter_img_url := COALESCE(
    NEW.raw_user_meta_data->>'profile_image_url',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  twitter_desc := NEW.raw_user_meta_data->>'description';
  
  twitter_verified_status := COALESCE(
    (NEW.raw_user_meta_data->>'verified')::boolean,
    false
  );
  
  RAISE LOG 'Extracted Twitter data - Username: %, Followers: %, Following: %, Tweets: %, Image: %, Verified: %',
    twitter_user_name, twitter_followers, twitter_following, twitter_tweets, twitter_img_url, twitter_verified_status;
  
  -- Insert into users table with extracted data
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
    twitter_user_name,
    NEW.raw_user_meta_data->>'provider_id',
    twitter_verified_status,
    twitter_followers,
    twitter_following,
    twitter_tweets,
    COALESCE((NEW.raw_user_meta_data->'public_metrics'->>'listed_count')::integer, 0),
    twitter_desc,
    twitter_img_url,
    NEW.raw_user_meta_data->>'location',
    CASE 
      WHEN NEW.raw_user_meta_data->>'created_at' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'created_at')::timestamp with time zone
      ELSE NULL
    END,
    twitter_img_url,
    twitter_desc,
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
        twitter_user_name,
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
        twitter_user_name,
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