import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/hooks/use-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL params
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.error('OAuth Error:', error, errorDescription)
        toast({
          variant: "destructive",
          title: "Authentication Failed", 
          description: errorDescription || "Please try again"
        })
        navigate('/auth')
        return
      }

      // Wait for auth to finish loading
      if (loading) return

      // If user is authenticated, redirect to appropriate dashboard
      if (user?.profile) {
        const userType = user.profile.user_type || searchParams.get('type') || 'kol'
        navigate(`/dashboard/${userType}`, { replace: true })
      } else {
        // If no user after a short delay, redirect to auth
        setTimeout(() => {
          if (!user) {
            navigate('/auth')
          }
        }, 2000)
      }
    }

    handleCallback()
  }, [user, loading, navigate, searchParams])

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