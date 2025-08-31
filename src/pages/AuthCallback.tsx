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
    let timeoutId: NodeJS.Timeout

    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Processing callback...')
      console.log('🔍 Current URL:', window.location.href)
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
        console.log('🔍 Profile user_type:', user.profile.user_type)
        console.log('🔍 Stored user_type:', storedUserType)
        
        const userType = storedUserType || user.profile.user_type
        console.log('🎯 Final userType for redirect:', userType)
        console.log('🎯 Redirecting to dashboard URL:', `/dashboard/${userType}`)
        
        localStorage.removeItem('oauth_user_type') // Clean up
        navigate(`/dashboard/${userType}`, { replace: true })
        return
      } 
      
      if (user && !user.profile) {
        console.log('⚠️ User exists but no profile found:', user)
        console.log('⚠️ User ID:', user.id)
        console.log('⚠️ User email:', user.email)
        // Wait a bit longer for profile to load or be created by trigger
        timeoutId = setTimeout(() => {
          if (!user?.profile) {
            console.log('❌ Profile still not loaded after timeout, redirecting to auth')
            localStorage.removeItem('oauth_user_type') // Clean up
            navigate('/auth')
          }
        }, 3000)
        return
      } 
      
      if (!user) {
        console.log('❌ No user found after callback')
        console.log('❌ Current user state:', user)
        console.log('❌ Loading state:', loading)
        // If no user after a short delay, redirect to auth
        timeoutId = setTimeout(() => {
          console.log('❌ Still no user after timeout, redirecting to auth')
          localStorage.removeItem('oauth_user_type') // Clean up
          navigate('/auth')
        }, 2000)
      }
    }

    handleCallback()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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