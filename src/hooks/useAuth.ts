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
      const redirectUrl = `${window.location.origin}/dashboard/${userType}`;
      
      // Detailed debugging
      console.log('🔄 DETAILED DEBUG INFO:');
      console.log('📍 Window location object:', {
        href: window.location.href,
        origin: window.location.origin,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port
      });
      console.log('🎯 Constructed redirect URL:', redirectUrl);
      console.log('👤 User type:', userType);
      
      // Test if redirect URL is valid
      try {
        new URL(redirectUrl);
        console.log('✅ Redirect URL is valid');
      } catch (urlError) {
        console.error('❌ Invalid redirect URL:', urlError);
      }
      
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
        console.error('❌ OAuth error full details:', {
          message: error.message,
          status: error.status,
          error: error
        });
        throw error;
      }
      
      console.log('✅ OAuth initiated successfully:', data);
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