import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TwitterApi } from 'https://esm.sh/twitter-api-v2@1.25.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get Twitter API credentials from Supabase secrets
    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    
    if (!twitterBearerToken) {
      console.log('Twitter Bearer Token not configured')
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured', posts: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Twitter client
    const twitterClient = new TwitterApi(twitterBearerToken)

    try {
      // First get the user ID from the username
      const userResponse = await twitterClient.v2.userByUsername(twitterUsername)
      
      if (!userResponse.data) {
        throw new Error('User not found on Twitter')
      }

      const twitterUserId = userResponse.data.id

      // Fetch recent tweets
      const tweetsResponse = await twitterClient.v2.userTimeline(twitterUserId, {
        max_results: 3,
        'tweet.fields': [
          'created_at',
          'public_metrics',
          'text',
          'author_id'
        ],
        expansions: ['author_id'],
        'user.fields': ['profile_image_url', 'username']
      })

      const tweets = tweetsResponse.data?.data || []
      const users = tweetsResponse.data?.includes?.users || []
      const authorData = users.find(user => user.id === twitterUserId)

      // Format tweets for response
      const formattedTweets = tweets.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        public_metrics: tweet.public_metrics,
        author: {
          username: twitterUsername,
          profile_image_url: authorData?.profile_image_url
        }
      }))

      console.log('📊 Fetched tweets:', formattedTweets.length)

      return new Response(
        JSON.stringify({ 
          posts: formattedTweets,
          message: 'Twitter posts fetched successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (twitterError) {
      console.error('Twitter API error:', twitterError)
      return new Response(
        JSON.stringify({ 
          error: 'Could not fetch Twitter posts',
          posts: [],
          details: twitterError.message 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, posts: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})