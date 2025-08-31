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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('🔄 Loading user profile for:', authUser.id)
      console.log('🔄 User metadata:', authUser.user_metadata)
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('👤 User profile result:', { profile, profileError })

      // If profile exists and has Twitter username, fetch enhanced metrics
      if (profile?.twitter_username && !profile.twitter_public_metrics) {
        console.log('📊 Fetching enhanced Twitter metrics...')
        try {
          const { data: metricsResult } = await supabase.functions.invoke('fetch-twitter-metrics', {
            body: { 
              userId: authUser.id, 
              twitterUsername: profile.twitter_username 
            }
          })
          console.log('📈 Twitter metrics result:', metricsResult)
        } catch (metricsError) {
          console.log('⚠️ Twitter metrics fetch failed (non-critical):', metricsError)
        }
      }

      let kolProfile = null
      let projectProfile = null

      if (profile) {
        console.log('✅ Profile found, user_type:', profile.user_type)
        
        if (profile.user_type === 'kol') {
          const { data, error: kolError } = await supabase
            .from('kol_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          console.log('🎯 KOL profile result:', { data, kolError })
          kolProfile = data
        } else if (profile.user_type === 'project') {
          const { data, error: projectError } = await supabase
            .from('project_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          console.log('🏢 Project profile result:', { data, projectError })
          projectProfile = data
        }
      } else {
        console.log('❌ No profile found for user:', authUser.id)
      }

      const userData = {
        ...authUser,
        profile,
        kolProfile,
        projectProfile
      }
      
      console.log('📋 Final user data:', userData)
      setUser(userData)
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithTwitter = async (userType: 'kol' | 'project') => {
    try {
      // Store user type in localStorage so we can retrieve it after OAuth redirect
      localStorage.setItem('oauth_user_type', userType)
      
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('🐦 Starting Twitter OAuth with redirect:', redirectUrl)
      console.log('🐦 User type stored:', userType)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            user_type: userType
          }
        }
      })
      
      console.log('🐦 OAuth response:', { data, error })
      
      if (error) {
        console.error('❌ OAuth error:', error)
        throw error
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('❌ Error signing in with Twitter:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }


  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setUser(prev => prev ? { ...prev, profile: data } : null)
      return { data, error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { data: null, error }
    }
  }

  return {
    user,
    session,
    loading,
    signInWithTwitter,
    signOut,
    updateProfile,
    isAuthenticated: !!session,
    isKOL: user?.profile?.user_type === 'kol',
    isProject: user?.profile?.user_type === 'project'
  }
}