import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

export function RefreshMetricsButton() {
  const { user } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshMetrics = async () => {
    if (!user?.profile?.twitter_username) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No Twitter username found"
      })
      return
    }

    setIsRefreshing(true)
    
    try {
      console.log('🔄 Refreshing Twitter metrics for:', user.profile.twitter_username)
      
      const { data, error } = await supabase.functions.invoke('update-twitter-metrics', {
        body: { 
          userId: user.id,
          twitterUsername: user.profile.twitter_username
        }
      })

      if (error) {
        throw error
      }

      console.log('✅ Metrics refresh result:', data)
      
      toast({
        title: "Success",
        description: "Twitter metrics updated successfully"
      })

      // Reload the page to show updated data
      window.location.reload()
      
    } catch (error) {
      console.error('❌ Error refreshing metrics:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh Twitter metrics"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button 
      onClick={handleRefreshMetrics}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="ml-auto"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      Refresh Metrics
    </Button>
  )
}