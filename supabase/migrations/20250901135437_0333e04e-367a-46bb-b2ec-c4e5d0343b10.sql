-- Create VIP KOLs tracking table
CREATE TABLE public.vip_kols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  signup_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  follower_count_at_signup INTEGER NOT NULL,
  vip_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient querying by position
CREATE INDEX idx_vip_kols_position ON public.vip_kols(vip_position);
CREATE INDEX idx_vip_kols_signup_timestamp ON public.vip_kols(signup_timestamp);

-- Enable RLS on vip_kols table (admin access only)
ALTER TABLE public.vip_kols ENABLE ROW LEVEL SECURITY;

-- Add is_vip_kol field to users table
ALTER TABLE public.users 
ADD COLUMN is_vip_kol BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient VIP user queries
CREATE INDEX idx_users_is_vip_kol ON public.users(is_vip_kol) WHERE is_vip_kol = true;

-- Update the handle_new_user function to track VIP KOLs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
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
  current_vip_count integer;
  next_vip_position integer;
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

  -- Check if this KOL qualifies for VIP status (10k+ followers and under 100 VIP slots)
  IF user_type_val = 'kol' AND twitter_followers >= 10000 THEN
    -- Get current VIP count
    SELECT COUNT(*) INTO current_vip_count FROM public.vip_kols;
    
    -- If we haven't reached the 100 VIP limit
    IF current_vip_count < 100 THEN
      next_vip_position := current_vip_count + 1;
      
      RAISE LOG 'KOL qualifies for VIP status - Username: %, Followers: %, VIP Position: %',
        twitter_user_name, twitter_followers, next_vip_position;
    END IF;
  END IF;
  
  -- Insert into users table with extracted data and VIP status
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
    is_vip_kol,
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
    CASE WHEN next_vip_position IS NOT NULL THEN true ELSE false END,
    NOW(),
    NOW()
  );

  -- If user qualified for VIP, add them to vip_kols table
  IF next_vip_position IS NOT NULL THEN
    INSERT INTO public.vip_kols (
      user_id,
      follower_count_at_signup,
      vip_position,
      signup_timestamp
    )
    VALUES (
      NEW.id,
      twitter_followers,
      next_vip_position,
      NOW()
    );
    
    RAISE LOG 'Added VIP KOL - ID: %, Position: %, Followers: %', 
      NEW.id, next_vip_position, twitter_followers;
  END IF;

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