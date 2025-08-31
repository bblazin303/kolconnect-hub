import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Edge function started, method:', req.method)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Processing request...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    console.log('✅ Supabase client created')

    let body
    try {
      body = await req.json()
      console.log('📄 Request body:', body)
    } catch (e) {
      console.log('❌ Failed to parse JSON:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { twitterUsername, userId } = body
    console.log('🐦 Processing for username:', twitterUsername, 'userId:', userId)

    if (!twitterUsername) {
      console.log('❌ Missing twitterUsername')
      return new Response(
        JSON.stringify({ error: 'Missing twitterUsername', posts: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userId) {
      console.log('❌ Missing userId')
      return new Response(
        JSON.stringify({ error: 'Missing userId', posts: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for cached posts in database first
    console.log('🔍 Checking database for cached posts...')
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('twitter_posts_cache, twitter_posts_updated_at')
      .eq('id', userId)
      .maybeSingle()

    if (userError) {
      console.error('❌ Database error:', userError)
      return new Response(
        JSON.stringify({ 
          error: 'Database error', 
          posts: [],
          message: 'Failed to fetch user data'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('👤 User data found:', !!userData)
    console.log('📋 Cached posts available:', !!userData?.twitter_posts_cache)

    // Return cached posts if available and recent (within 30 minutes)
    if (userData?.twitter_posts_cache && userData.twitter_posts_updated_at) {
      const cacheAge = Date.now() - new Date(userData.twitter_posts_updated_at).getTime()
      const thirtyMinutes = 30 * 60 * 1000
      
      if (cacheAge < thirtyMinutes) {
        console.log('✅ Returning cached posts (age:', Math.round(cacheAge / 60000), 'minutes)')
        return new Response(
          JSON.stringify({ 
            posts: userData.twitter_posts_cache,
            message: 'Posts loaded from cache',
            cached: true,
            source: 'db_cache',
            age_minutes: Math.round(cacheAge / 60000)
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // For now, return a message that fresh fetching is disabled
    console.log('ℹ️ No recent cached posts, fresh fetching temporarily disabled')
    return new Response(
      JSON.stringify({ 
        posts: userData?.twitter_posts_cache || [],
        message: 'Using any available cached posts (Twitter API temporarily disabled)',
        cached: true,
        source: 'stale_cache',
        note: 'Twitter API fetching temporarily disabled for testing'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Main error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        posts: [],
        message: 'Edge function error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})