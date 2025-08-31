import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache for Twitter data to avoid rate limits
const twitterCache = new Map()

async function fetchTwitterDataWithRetry(url: string, headers: any, retries = 2): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers })
      
      if (response.status === 429) {
        const resetTime = response.headers.get('x-rate-limit-reset')
        let waitTime = resetTime ? (parseInt(resetTime) * 1000 - Date.now()) / 1000 : 60
        
        // Cap wait time at 2 minutes to prevent long delays
        waitTime = Math.min(waitTime, 120)
        console.log(`Rate limited, waiting ${waitTime}s before retry ${i + 1}/${retries}`)
        
        if (i < retries - 1 && waitTime <= 120) {
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
          continue
        } else {
          // If wait time is too long, throw immediately to use cached data
          throw new Error(`Rate limited: ${response.status} - Try again later`)
        }
      }
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
    }
  }
}

async function fetchPosts(supabaseClient: any, twitterUsername: string, userId: string, twitterBearerToken: string) {
  try {
    console.log('🔄 Fetching posts for', twitterUsername)
    
    // Check memory cache first
    const cacheKey = `posts_${twitterUsername}`
    const cached = twitterCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutes cache
      console.log('📋 Using memory cached posts')
      return { posts: cached.data, source: 'memory_cache' }
    }

    // Check database cache
    const { data: userData } = await supabaseClient
      .from('users')
      .select('twitter_posts_cache, twitter_posts_updated_at')
      .eq('id', userId)
      .single()

    if (userData?.twitter_posts_cache && userData.twitter_posts_updated_at) {
      const dbCacheAge = Date.now() - new Date(userData.twitter_posts_updated_at).getTime()
      if (dbCacheAge < 1800000) { // 30 minutes database cache
        console.log('💾 Using database cached posts')
        // Update memory cache
        twitterCache.set(cacheKey, {
          data: userData.twitter_posts_cache,
          timestamp: Date.now() - 300000 // Mark as 5 minutes old to refresh soon
        })
        return { posts: userData.twitter_posts_cache, source: 'db_cache' }
      }
    }

    // Try to fetch fresh data from Twitter API
    try {
      // First get the user ID
      const userUrl = `https://api.twitter.com/2/users/by/username/${twitterUsername}?user.fields=public_metrics,profile_image_url`
      const userData = await fetchTwitterDataWithRetry(userUrl, {
        'Authorization': `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json'
      })

      if (!userData.data) {
        throw new Error('User not found on Twitter')
      }

      const twitterUserId = userData.data.id

      // Fetch recent tweets
      const tweetsUrl = `https://api.twitter.com/2/users/${twitterUserId}/tweets?max_results=5&tweet.fields=created_at,public_metrics,text&expansions=author_id&user.fields=username,profile_image_url`
      const tweetsData = await fetchTwitterDataWithRetry(tweetsUrl, {
        'Authorization': `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json'
      })

      const tweets = tweetsData.data || []
      const users = tweetsData.includes?.users || []
      const authorData = users.find((user: any) => user.id === twitterUserId)

      // Format tweets
      const formattedTweets = tweets.map((tweet: any) => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        public_metrics: tweet.public_metrics,
        author: {
          username: twitterUsername,
          profile_image_url: authorData?.profile_image_url || userData.data.profile_image_url
        }
      }))

      // Store in both caches
      twitterCache.set(cacheKey, {
        data: formattedTweets,
        timestamp: Date.now()
      })

      // Store in database for persistence (don't await to avoid delays)
      supabaseClient
        .from('users')
        .update({
          twitter_posts_cache: formattedTweets,
          twitter_posts_updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .then(() => console.log('💾 Posts saved to database'))
        .catch((err: any) => console.error('❌ Failed to save to database:', err))

      console.log('✅ Fresh posts fetched and cached:', formattedTweets.length)
      return { posts: formattedTweets, source: 'fresh_api' }

    } catch (apiError) {
      console.error('❌ Twitter API failed:', apiError)
      
      // Fallback to older cached data if available
      if (userData?.twitter_posts_cache) {
        console.log('🔄 Using stale cache due to API failure')
        return { posts: userData.twitter_posts_cache, source: 'stale_cache', error: 'Twitter API rate limited' }
      }
      
      throw apiError
    }
  } catch (error) {
    console.error('❌ Failed to fetch posts:', error)
    return { posts: [], source: 'error', error: error.message }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { twitterUsername, userId } = await req.json()
    console.log('🐦 Fetching posts for:', twitterUsername)

    if (!twitterUsername) {
      return new Response(
        JSON.stringify({ error: 'Missing twitterUsername' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    
    if (!twitterBearerToken) {
      console.log('Twitter Bearer Token not configured')
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured', posts: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch posts with intelligent caching
    const result = await fetchPosts(supabaseClient, twitterUsername, userId, twitterBearerToken)
    
    return new Response(
      JSON.stringify({ 
        posts: result.posts,
        message: result.source === 'fresh_api' ? 'Fresh posts loaded' : 
                result.source === 'memory_cache' ? 'Posts loaded from cache' :
                result.source === 'db_cache' ? 'Posts loaded from database' :
                result.source === 'stale_cache' ? 'Showing cached posts (Twitter API rate limited)' :
                'Unable to load posts',
        cached: result.source !== 'fresh_api',
        source: result.source,
        error: result.error || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})