ALTER TABLE users 
ADD COLUMN twitter_posts_cache JSONB,
ADD COLUMN twitter_posts_updated_at TIMESTAMP WITH TIME ZONE;