import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      if (data?.posts && data.posts.length > 0) {
        setPosts(data.posts)
      } else if (data?.cached === false) {
        // If not cached, try again in a few seconds for background task to complete
        setTimeout(() => {
          supabase.functions.invoke('fetch-twitter-posts', {
            body: { 
              twitterUsername: user?.profile?.twitter_username,
              userId: user?.id
            }
          }).then(({ data: retryData }) => {
            if (retryData?.posts) {
              setPosts(retryData.posts)
            }
          })
        }, 3000)
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
      {/* Profile Header - Social Media Style */}
      <div className="social-card social-card-hover p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-display font-bold text-gradient">Twitter Profile</h2>
              {user.profile.twitter_verified && (
                <div className="badge-verified">
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
              )}
            </div>
          </div>
          <RefreshMetricsButton />
        </div>

        <div className="flex items-start space-x-6">
          <div className="relative">
            {/* Instagram-style story ring */}
            <div className="story-ring">
              <Avatar className="h-20 w-20 ring-2 ring-white">
                <AvatarImage 
                  src={user.profile.twitter_profile_image_url?.replace('_normal', '_400x400') || user.profile.avatar_url?.replace('_normal', '_400x400')} 
                  alt={`@${user.profile.twitter_username}`}
                  onError={(e) => {
                    console.log('❌ Profile image failed to load:', e.currentTarget.src)
                    // Try different image sizes as fallback
                    const originalSrc = user.profile.twitter_profile_image_url || user.profile.avatar_url
                    if (originalSrc) {
                      const fallbacks = [
                        originalSrc.replace('_normal', '_bigger'),
                        originalSrc.replace('_normal', ''),
                        originalSrc,
                        `https://ui-avatars.com/api/?name=${user.profile.twitter_username}&background=random&size=400`
                      ]
                      const currentIndex = fallbacks.indexOf(e.currentTarget.src)
                      if (currentIndex < fallbacks.length - 1) {
                        e.currentTarget.src = fallbacks[currentIndex + 1]
                        console.log('🔄 Trying fallback image:', fallbacks[currentIndex + 1])
                      }
                    }
                  }}
                  onLoad={() => {
                    console.log('✅ Profile image loaded successfully:', user.profile.twitter_profile_image_url)
                  }}
                />
                <AvatarFallback className="text-xl font-bold bg-gradient-primary text-white">
                  {user.profile.twitter_username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-400 rounded-full ring-2 ring-white"></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-display font-bold text-gradient mb-1">@{user.profile.twitter_username}</h3>
              {user.profile.twitter_description && (
                <p className="text-muted-foreground leading-relaxed">
                  {user.profile.twitter_description}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.profile.twitter_location && (
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{user.profile.twitter_location}</span>
                </div>
              )}
              {user.profile.twitter_account_created_at && (
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>Joined {formatDate(user.profile.twitter_account_created_at)}</span>
                </div>
              )}
            </div>
            
            {/* Social Media Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-primary mr-1" />
                </div>
                <div className="text-2xl font-bold text-primary">{formatNumber(user.profile.twitter_followers_count || 0)}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl">
                <div className="text-2xl font-bold text-secondary">{formatNumber(user.profile.twitter_following_count || 0)}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="h-4 w-4 text-purple-500 mr-1" />
                </div>
                <div className="text-2xl font-bold text-purple-500">{formatNumber(user.profile.twitter_tweet_count || 0)}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts - Social Media Feed Style */}
      <div className="social-card p-6 animate-fade-in">
        <h3 className="text-xl font-display font-bold mb-4 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          Recent Posts
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pulse-social rounded-xl h-24"></div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="feed-item">
                <p className="text-foreground mb-3 leading-relaxed">{post.text}</p>
                <div className="engagement-bar">
                  <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                  <div className="flex items-center space-x-6">
                    <button className="like-button flex items-center space-x-1 hover:text-red-500">
                      <Heart className="h-4 w-4" />
                      <span>{formatNumber(post.public_metrics?.like_count || 0)}</span>
                    </button>
                    <button className="like-button flex items-center space-x-1 hover:text-green-500">
                      <Repeat2 className="h-4 w-4" />
                      <span>{formatNumber(post.public_metrics?.retweet_count || 0)}</span>
                    </button>
                    <button className="like-button flex items-center space-x-1 hover:text-blue-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>{formatNumber(post.public_metrics?.reply_count || 0)}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground mb-2 font-medium">No recent posts available</p>
            <p className="text-sm text-muted-foreground">
              Twitter API rate limits may prevent loading posts. Try the refresh button.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}