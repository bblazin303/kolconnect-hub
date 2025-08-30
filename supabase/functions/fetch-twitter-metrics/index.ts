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

    const { userId, twitterUsername } = await req.json()

    if (!userId || !twitterUsername) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or twitterUsername' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Twitter API credentials from Supabase secrets
    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    
    if (!twitterBearerToken) {
      console.log('Twitter Bearer Token not configured, skipping metrics fetch')
      return new Response(
        JSON.stringify({ message: 'Twitter API not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Twitter client
    const twitterClient = new TwitterApi(twitterBearerToken)

    try {
      // Fetch user by username to get detailed metrics
      const userResponse = await twitterClient.v2.userByUsername(twitterUsername, {
        'user.fields': [
          'public_metrics',
          'created_at',
          'description',
          'location',
          'profile_image_url',
          'verified'
        ]
      })

      if (!userResponse.data) {
        throw new Error('User not found on Twitter')
      }

      const userData = userResponse.data
      const metrics = userData.public_metrics

      // Update user record with enhanced metrics
      const { error: updateError } = await supabaseClient
        .from('users')
        .update({
          twitter_following_count: metrics?.following_count || 0,
          twitter_tweet_count: metrics?.tweet_count || 0,
          twitter_listed_count: metrics?.listed_count || 0,
          twitter_followers_count: metrics?.followers_count || 0,
          twitter_account_created_at: userData.created_at,
          twitter_location: userData.location,
          twitter_description: userData.description,
          twitter_profile_image_url: userData.profile_image_url,
          twitter_verified: userData.verified || false,
          twitter_public_metrics: metrics,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ 
          message: 'Twitter metrics updated successfully',
          metrics: {
            followers: metrics?.followers_count || 0,
            following: metrics?.following_count || 0,
            tweets: metrics?.tweet_count || 0,
            listed: metrics?.listed_count || 0
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (twitterError) {
      console.error('Twitter API error:', twitterError)
      // Don't fail the whole process if Twitter API fails
      return new Response(
        JSON.stringify({ 
          message: 'Could not fetch Twitter metrics, but user created successfully',
          error: twitterError.message 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})