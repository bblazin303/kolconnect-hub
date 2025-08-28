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
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      let kolProfile = null
      let projectProfile = null

      if (profile) {
        if (profile.user_type === 'kol') {
          const { data } = await supabase
            .from('kol_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          kolProfile = data
        } else if (profile.user_type === 'project') {
          const { data } = await supabase
            .from('project_profiles')
            .select('*')
            .eq('user_id', authUser.id)
            .single()
          projectProfile = data
        }
      }

      setUser({
        ...authUser,
        profile,
        kolProfile,
        projectProfile
      })
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithTwitter = async (userType: 'kol' | 'project') => {
    try {
      // Test basic Supabase connection first
      console.log('🧪 Testing Supabase connection...');
      const { data: session } = await supabase.auth.getSession();
      console.log('📊 Session test result:', session);
      
      // Test if we can reach auth settings
      const testUrl = `https://nontyyrqwonrlcmvxdjy.supabase.co/auth/v1/settings`;
      console.log('🌐 Testing auth endpoint:', testUrl);
      
      try {
        const response = await fetch(testUrl, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbnR5eXJxd29ucmxjbXZ4ZGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5OTY5NTUsImV4cCI6MjA3MTU3Mjk1NX0.Yem0z53jj78hTz7i5NzeBWwK8Ft7zDG4tRgVAWhU6Tk'
          }
        });
        const settings = await response.json();
        console.log('✅ Auth settings:', settings);
        console.log('🐦 Twitter enabled:', settings.external?.twitter);
      } catch (e) {
        console.error('❌ Auth endpoint error:', e);
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      console.log('🚀 Starting Twitter OAuth...');
      console.log('📍 Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=${userType}`
        }
      })
      
      console.log('🔗 Generated OAuth URL:', data?.url);
      
      if (error) {
        console.error('❌ OAuth error:', error);
        throw error;
      }
      
      // Manual redirect to test
      if (data?.url) {
        console.log('🌐 Manually redirecting to:', data.url);
        window.location.href = data.url;
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

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing in with email:', error)
      return { data: null, error }
    }
  }

  const signUpWithEmail = async (email: string, password: string, userType: 'kol' | 'project') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType
          }
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error signing up with email:', error)
      return { data: null, error }
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
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    isAuthenticated: !!session,
    isKOL: user?.profile?.user_type === 'kol',
    isProject: user?.profile?.user_type === 'project'
  }
}