import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type UserProfile = Database['public']['Tables']['users']['Row']
type KOLProfile = Database['public']['Tables']['kol_profiles']['Row']
type ProjectProfile = Database['public']['Tables']['project_profiles']['Row']

interface AuthUser extends User {
  profile?: UserProfile
  kolProfile?: KOLProfile
  projectProfile?: ProjectProfile
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        console.log('🔄 Auth state change:', event, session ? {
          user_id: session.user?.id,
          email: session.user?.email,
          access_token_present: !!session.access_token,
          expires_at: session.expires_at
        } : 'null')
        setSession(session)
        
        if (session?.user) {
          // Only load profile if we don't already have it or if user changed
          if (!user || user.id !== session.user.id) {
            loadUserProfile(session.user)
          }
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove user dependency to prevent loops

  const loadUserProfile = async (authUser: User) => {
    try {
      setLoading(true)
      console.log('👤 Loading profile for user:', authUser.id)

      // Fetch the user's profile from the users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('👤 User profile result:', { profile, profileError })

      if (profile) {
        // Fetch KOL or Project profile based on user type
        let additionalProfile = null
        
        if (profile.user_type === 'kol') {
          const { data: kolProfile } = await supabase
            .from('kol_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          additionalProfile = kolProfile
        } else if (profile.user_type === 'project') {
          const { data: projectProfile } = await supabase
            .from('project_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          additionalProfile = projectProfile
        }

        // Only fetch Twitter metrics if we don't have them and have username
        const shouldFetchMetrics = profile.twitter_username && 
          (!profile.twitter_public_metrics || profile.twitter_followers_count === 0)

        if (shouldFetchMetrics) {
          console.log('📊 Fetching enhanced Twitter metrics...')
          // Don't await this - let it run in background
          supabase.functions.invoke('update-twitter-metrics', {
            body: { 
              userId: authUser.id, 
              twitterUsername: profile.twitter_username 
            }
          }).then(({ data: metricsResult }) => {
            console.log('📈 Twitter metrics result:', metricsResult)
          }).catch(metricsError => {
            console.log('⚠️ Twitter metrics fetch failed (non-critical):', metricsError)
          })
        }

        // Set user with profile data
        const enrichedUser: AuthUser = {
          ...authUser,
          profile,
          kolProfile: profile.user_type === 'kol' ? additionalProfile : undefined,
          projectProfile: profile.user_type === 'project' ? additionalProfile : undefined
        }

        setUser(enrichedUser)
      } else {
        console.log('⚠️ No profile found for user, setting basic user')
        setUser(authUser)
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      setUser(authUser) // Set basic user data even if profile fetch fails
    } finally {
      setLoading(false)
    }
  }

  const signInWithTwitter = async (userType: 'kol' | 'project', redirectTo?: string) => {
    try {
      console.log('🐦 Starting Twitter OAuth with user type:', userType)
      console.log('🌐 Window origin:', window.location.origin)
      
      // Store user type in localStorage for retrieval after redirect
      localStorage.setItem('oauth_user_type', userType)
      console.log('🔍 Stored user type in localStorage:', userType)
      
      const redirectUrl = redirectTo || `${window.location.origin}/auth/callback`
      console.log('🔗 Using redirect URL:', redirectUrl)
      
      // Test Supabase client first
      console.log('🔍 Testing Supabase client...')
      const { data: testData, error: testError } = await supabase.auth.getSession()
      console.log('🔍 Current session test:', { testData, testError })
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            user_type: userType
          }
        }
      })

      if (error) {
        console.error('❌ Twitter OAuth error:', error)
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        localStorage.removeItem('oauth_user_type') // Clean up on error
        throw error
      }

      console.log('✅ Twitter OAuth initiated successfully:', data)
      return { data, error: null }
    } catch (error: any) {
      console.error('❌ Error initiating Twitter OAuth:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error keys:', Object.keys(error))
      localStorage.removeItem('oauth_user_type') // Clean up on error
      return { data: null, error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return { error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setUser(prev => prev ? { ...prev, profile: data } : prev)
    }

    return { data, error }
  }

  const isAuthenticated = !!session && !!user
  const isKOL = user?.profile?.user_type === 'kol'
  const isProject = user?.profile?.user_type === 'project'

  return {
    user,
    session,
    loading,
    signInWithTwitter,
    signOut,
    updateProfile,
    isAuthenticated,
    isKOL,
    isProject
  }
}