import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Users, MessageSquare, Heart, Repeat2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { RefreshMetricsButton } from './RefreshMetricsButton'

interface TwitterPost {
  id: string
  text: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  author: {
    username: string
    profile_image_url?: string
  }
}

export function TwitterProfileCard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<TwitterPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasFetchedPosts, setHasFetchedPosts] = useState(false)

  useEffect(() => {
    console.log('🔍 TwitterProfileCard user data:', user?.profile)
    console.log('🔍 Twitter username:', user?.profile?.twitter_username)
    console.log('🔍 Twitter followers:', user?.profile?.twitter_followers_count)
    console.log('🔍 Twitter following:', user?.profile?.twitter_following_count)
    console.log('🔍 Twitter tweets:', user?.profile?.twitter_tweet_count)

    // Only fetch posts once when component mounts and user has twitter username
    if (user?.profile?.twitter_username && !hasFetchedPosts) {
      fetchTwitterPosts()
      setHasFetchedPosts(true)
    } else if (!user?.profile?.twitter_username) {
      setLoading(false)
    }
  }, [user?.profile?.twitter_username, hasFetchedPosts])

  const fetchTwitterPosts = async () => {
    try {
      console.log('🐦 Fetching Twitter posts for:', user?.profile?.twitter_username)
      const { data } = await supabase.functions.invoke('fetch-twitter-posts', {
        body: { 
          twitterUsername: user?.profile?.twitter_username,
          userId: user?.id
        }
      })
      
      console.log('🐦 Twitter posts response:', data)
      if (data?.posts) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching Twitter posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (!user?.profile) {
    console.log('❌ TwitterProfileCard: No user profile found')
    return null
  }

  console.log('✅ TwitterProfileCard: Rendering with profile:', {
    username: user.profile.twitter_username,
    followers: user.profile.twitter_followers_count,
    following: user.profile.twitter_following_count,
    tweets: user.profile.twitter_tweet_count,
    profileImage: user.profile.twitter_profile_image_url,
    avatarUrl: user.profile.avatar_url
  })

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Twitter Profile</span>
              {user.profile.twitter_verified && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
            <RefreshMetricsButton />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage 
                src={user.profile.twitter_profile_image_url || user.profile.avatar_url} 
                alt={`@${user.profile.twitter_username}`}
                onError={(e) => {
                  console.log('❌ Profile image failed to load:', user.profile.twitter_profile_image_url)
                  e.currentTarget.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('✅ Profile image loaded successfully:', user.profile.twitter_profile_image_url)
                }}
              />
              <AvatarFallback className="text-lg">
                {user.profile.twitter_username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="font-semibold text-lg">@{user.profile.twitter_username}</h3>
                {user.profile.twitter_description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {user.profile.twitter_description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {user.profile.twitter_location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{user.profile.twitter_location}</span>
                  </div>
                )}
                {user.profile.twitter_account_created_at && (
                  <div className="flex items-center space-x-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>Joined {formatDate(user.profile.twitter_account_created_at)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span className="font-medium">{formatNumber(user.profile.twitter_followers_count || 0)}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium">{formatNumber(user.profile.twitter_following_count || 0)}</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="font-medium">{formatNumber(user.profile.twitter_tweet_count || 0)}</span>
                  <span className="text-muted-foreground">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b border-border pb-4 last:border-b-0">
                  <p className="text-sm mb-2 leading-relaxed">{post.text}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(post.created_at)}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(post.public_metrics?.like_count || 0)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Repeat2 className="h-3 w-3" />
                        <span>{formatNumber(post.public_metrics?.retweet_count || 0)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{formatNumber(post.public_metrics?.reply_count || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent posts available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}