import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Processing callback...')
      console.log('🔍 Search params:', Object.fromEntries(searchParams.entries()))
      console.log('🔍 User state:', user)
      console.log('🔍 Loading state:', loading)
      
      // Get stored user type from localStorage
      const storedUserType = localStorage.getItem('oauth_user_type') as 'kol' | 'project' | null
      console.log('🔍 Stored user type:', storedUserType)
      
      // Check for error in URL params
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.error('❌ OAuth Error:', error, errorDescription)
        localStorage.removeItem('oauth_user_type') // Clean up
        toast({
          variant: "destructive",
          title: "Authentication Failed", 
          description: errorDescription || "Please try again"
        })
        navigate('/auth')
        return
      }

      // Wait for auth to finish loading
      if (loading) {
        console.log('⏳ Still loading, waiting...')
        return
      }

      // If user is authenticated, handle profile setup and redirect
      if (user?.profile) {
        console.log('✅ User authenticated with profile:', user.profile)
        
        // Check if we need to update user type based on stored preference
        if (storedUserType && user.profile.user_type !== storedUserType) {
          console.log('🔄 Updating user type from', user.profile.user_type, 'to', storedUserType)
          // Update the user profile with correct type
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({ user_type: storedUserType, updated_at: new Date().toISOString() })
              .eq('id', user.id)
            
            if (updateError) {
              console.error('❌ Failed to update user type:', updateError)
            } else {
              console.log('✅ User type updated successfully')
            }
          } catch (error) {
            console.error('❌ Error updating user type:', error)
          }
        }
        
        const userType = storedUserType || user.profile.user_type
        console.log('🎯 Redirecting to dashboard:', userType)
        localStorage.removeItem('oauth_user_type') // Clean up
        navigate(`/dashboard/${userType}`, { replace: true })
      } else if (user && !user.profile) {
        console.log('⚠️ User exists but no profile found:', user)
        // Wait a bit longer for profile to load or be created by trigger
        setTimeout(() => {
          if (!user?.profile) {
            console.log('❌ Profile still not loaded, redirecting to auth')
            localStorage.removeItem('oauth_user_type') // Clean up
            navigate('/auth')
          }
        }, 3000)
      } else {
        console.log('❌ No user found after callback')
        // If no user after a short delay, redirect to auth
        setTimeout(() => {
          if (!user) {
            console.log('❌ Still no user, redirecting to auth')
            localStorage.removeItem('oauth_user_type') // Clean up
            navigate('/auth')
          }
        }, 2000)
      }
    }

    handleCallback()
  }, [user, loading, navigate, searchParams, toast])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Processing authentication...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we sign you in</p>
      </div>
    </div>
  )
}