-- Update existing user's Twitter data using the enhanced Twitter API
UPDATE users SET
  twitter_followers_count = CASE 
    WHEN twitter_followers_count = 0 AND twitter_username IS NOT NULL 
    THEN (
      SELECT COALESCE(
        (raw_user_meta_data->'public_metrics'->>'followers_count')::integer,
        (raw_user_meta_data->>'followers_count')::integer,
        0
      )
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE twitter_followers_count 
  END,
  twitter_following_count = CASE 
    WHEN twitter_following_count = 0 AND twitter_username IS NOT NULL 
    THEN (
      SELECT COALESCE(
        (raw_user_meta_data->'public_metrics'->>'following_count')::integer,
        (raw_user_meta_data->>'following_count')::integer,
        0
      )
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE twitter_following_count 
  END,
  twitter_tweet_count = CASE 
    WHEN twitter_tweet_count = 0 AND twitter_username IS NOT NULL 
    THEN (
      SELECT COALESCE(
        (raw_user_meta_data->'public_metrics'->>'tweet_count')::integer,
        (raw_user_meta_data->>'tweet_count')::integer,
        (raw_user_meta_data->>'statuses_count')::integer,
        0
      )
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE twitter_tweet_count 
  END,
  twitter_profile_image_url = CASE 
    WHEN twitter_profile_image_url IS NULL AND twitter_username IS NOT NULL 
    THEN (
      SELECT COALESCE(
        raw_user_meta_data->>'profile_image_url',
        raw_user_meta_data->>'avatar_url'
      )
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE twitter_profile_image_url 
  END,
  avatar_url = CASE 
    WHEN avatar_url IS NULL AND twitter_username IS NOT NULL 
    THEN (
      SELECT COALESCE(
        raw_user_meta_data->>'profile_image_url',
        raw_user_meta_data->>'avatar_url'
      )
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE avatar_url 
  END,
  twitter_description = CASE 
    WHEN twitter_description IS NULL AND twitter_username IS NOT NULL 
    THEN (
      SELECT raw_user_meta_data->>'description'
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE twitter_description 
  END,
  bio = CASE 
    WHEN bio IS NULL AND twitter_username IS NOT NULL 
    THEN (
      SELECT raw_user_meta_data->>'description'
      FROM auth.users 
      WHERE auth.users.id = users.id
    )
    ELSE bio 
  END,
  updated_at = NOW()
WHERE twitter_username IS NOT NULL
  AND (twitter_followers_count = 0 OR twitter_profile_image_url IS NULL OR avatar_url IS NULL);