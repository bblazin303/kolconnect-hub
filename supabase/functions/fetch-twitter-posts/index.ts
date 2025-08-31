import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    try {
      // First get the user ID from the username using Twitter API v2
      const userUrl = `https://api.twitter.com/2/users/by/username/${twitterUsername}?user.fields=public_metrics,created_at,description,location,profile_image_url,verified`
      
      const userResponse = await fetch(userUrl, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        throw new Error(`Twitter API user lookup failed: ${userResponse.status}`)
      }

      const userData = await userResponse.json()
      
      if (!userData.data) {
        throw new Error('User not found on Twitter')
      }

      const twitterUserId = userData.data.id

      // Fetch recent tweets using Twitter API v2
      const tweetsUrl = `https://api.twitter.com/2/users/${twitterUserId}/tweets?max_results=3&tweet.fields=created_at,public_metrics,text&expansions=author_id&user.fields=username,profile_image_url`
      
      const tweetsResponse = await fetch(tweetsUrl, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!tweetsResponse.ok) {
        throw new Error(`Twitter API tweets lookup failed: ${tweetsResponse.status}`)
      }

      const tweetsData = await tweetsResponse.json()
      const tweets = tweetsData.data || []
      const users = tweetsData.includes?.users || []
      const authorData = users.find((user: any) => user.id === twitterUserId)

      // Format tweets for response
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