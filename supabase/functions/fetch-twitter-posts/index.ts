import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache for Twitter data to avoid rate limits
const twitterCache = new Map()

async function fetchTwitterDataWithRetry(url: string, headers: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers })
      
      if (response.status === 429) {
        const resetTime = response.headers.get('x-rate-limit-reset')
        const waitTime = resetTime ? (parseInt(resetTime) * 1000 - Date.now()) / 1000 : 60
        console.log(`Rate limited, waiting ${waitTime}s before retry ${i + 1}/${retries}`)
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime * 1000, 60000)))
          continue
        }
      }
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

async function backgroundFetchPosts(supabaseClient: any, twitterUsername: string, userId: string, twitterBearerToken: string) {
  try {
    console.log('🔄 Background task: Fetching posts for', twitterUsername)
    
    // Check cache first
    const cacheKey = `posts_${twitterUsername}`
    const cached = twitterCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      console.log('📋 Using cached posts')
      return cached.data
    }

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

    // Store in cache
    twitterCache.set(cacheKey, {
      data: formattedTweets,
      timestamp: Date.now()
    })

    // Store in database for persistence
    await supabaseClient
      .from('users')
      .update({
        twitter_posts_cache: formattedTweets,
        twitter_posts_updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    console.log('✅ Background task completed, cached', formattedTweets.length, 'posts')
    return formattedTweets
  } catch (error) {
    console.error('❌ Background task failed:', error)
    return []
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

    // Check cache first for immediate response
    const cacheKey = `posts_${twitterUsername}`
    const cached = twitterCache.get(cacheKey)
    
    // Get cached posts from database as fallback
    const { data: userData } = await supabaseClient
      .from('users')
      .select('twitter_posts_cache, twitter_posts_updated_at')
      .eq('id', userId)
      .single()

    let posts = []
    
    if (cached && Date.now() - cached.timestamp < 300000) {
      posts = cached.data
      console.log('📋 Using memory cache')
    } else if (userData?.twitter_posts_cache && userData.twitter_posts_updated_at) {
      const dbCacheAge = Date.now() - new Date(userData.twitter_posts_updated_at).getTime()
      if (dbCacheAge < 900000) { // 15 minutes
        posts = userData.twitter_posts_cache
        console.log('💾 Using database cache')
      }
    }

    // Start background task to refresh data (don't await)
    EdgeRuntime.waitUntil(
      backgroundFetchPosts(supabaseClient, twitterUsername, userId, twitterBearerToken)
    )

    return new Response(
      JSON.stringify({ 
        posts: posts,
        message: posts.length > 0 ? 'Posts loaded from cache' : 'Posts loading in background',
        cached: posts.length > 0
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