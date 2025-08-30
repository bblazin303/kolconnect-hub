-- Add additional Twitter metrics columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_following_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_tweet_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_listed_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_account_created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_description TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_profile_image_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS twitter_public_metrics JSONB;