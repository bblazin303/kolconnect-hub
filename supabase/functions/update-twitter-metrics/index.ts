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

    const { userId, twitterUsername } = await req.json()
    console.log('🔄 Updating Twitter metrics for:', twitterUsername)

    if (!userId || !twitterUsername) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or twitterUsername' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Twitter API credentials from Supabase secrets
    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN')
    
    if (!twitterBearerToken) {
      console.log('Twitter Bearer Token not configured')
      return new Response(
        JSON.stringify({ error: 'Twitter API not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      // Fetch user data from Twitter API v2
      const userUrl = `https://api.twitter.com/2/users/by/username/${twitterUsername}?user.fields=public_metrics,created_at,description,location,profile_image_url,verified`
      
      console.log('🐦 Fetching Twitter data from:', userUrl)
      
      const response = await fetch(userUrl, {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Twitter API error:', response.status, errorText)
        throw new Error(`Twitter API error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('📊 Twitter API response:', data)
      
      if (!data.data) {
        throw new Error('User not found on Twitter')
      }

      const userData = data.data
      const metrics = userData.public_metrics

      console.log('📈 Extracted metrics:', metrics)

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
        console.error('❌ Database update error:', updateError)
        throw updateError
      }

      console.log('✅ Successfully updated Twitter metrics in database')

      return new Response(
        JSON.stringify({ 
          success: true,
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
      return new Response(
        JSON.stringify({ 
          error: 'Could not fetch Twitter metrics',
          details: twitterError.message 
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