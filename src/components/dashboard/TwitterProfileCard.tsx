import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  CalendarDays, 
  Users, 
  MessageSquare, 
  Heart, 
  Repeat2, 
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Share
} from 'lucide-react'
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
      console.log('🔍 User ID:', user?.id)
      
      if (!user?.profile?.twitter_username) {
        console.log('❌ No Twitter username found')
        setLoading(false)
        return
      }
      
      if (!user?.id) {
        console.log('❌ No user ID found')
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase.functions.invoke('fetch-twitter-posts', {
        body: { 
          twitterUsername: user.profile.twitter_username,
          userId: user.id
        }
      })
      
      console.log('🐦 Twitter posts response:', data)
      console.log('🐦 Twitter posts error:', error)
      
      if (error) {
        console.error('🚨 Edge function error:', error)
        setLoading(false)
        return
      }
      
      if (data?.posts && data.posts.length > 0) {
        console.log('✅ Posts found:', data.posts.length)
        setPosts(data.posts)
      } else if (data?.source === 'error') {
        console.log('❌ Twitter API error:', data.error)
      } else if (data?.cached === false || data?.source === 'fresh_api') {
        console.log('🔄 Trying again in 3 seconds for fresh data...')
        // If not cached, try again in a few seconds for background task to complete
        setTimeout(async () => {
          try {
            const { data: retryData } = await supabase.functions.invoke('fetch-twitter-posts', {
              body: { 
                twitterUsername: user.profile.twitter_username,
                userId: user.id
              }
            })
            console.log('🐦 Retry response:', retryData)
            if (retryData?.posts && retryData.posts.length > 0) {
              console.log('✅ Retry success with posts:', retryData.posts.length)
              setPosts(retryData.posts)
            }
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError)
          }
        }, 3000)
      } else {
        console.log('ℹ️ No posts available, response:', data)
      }
    } catch (error) {
      console.error('❌ Error fetching Twitter posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
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
              <h2 className="text-2xl font-semibold text-gray-800">Twitter Profile</h2>
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
                <AvatarFallback className="text-xl font-bold bg-blue-500 text-white">
                  {user.profile.twitter_username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-400 rounded-full ring-2 ring-white"></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-1">@{user.profile.twitter_username}</h3>
              {user.profile.twitter_description && (
                <p className="text-gray-600 leading-relaxed">
                  {user.profile.twitter_description}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {user.profile.twitter_location && (
                <div className="flex items-center space-x-2 bg-blue-50/70 px-3 py-1.5 rounded-full border border-blue-100">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">{user.profile.twitter_location}</span>
                </div>
              )}
              {user.profile.twitter_account_created_at && (
                <div className="flex items-center space-x-2 bg-green-50/70 px-3 py-1.5 rounded-full border border-green-100">
                  <CalendarDays className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Joined {formatTimeAgo(user.profile.twitter_account_created_at)}</span>
                </div>
              )}
            </div>
            
            {/* Social Media Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50/40 border border-blue-100/50 rounded-xl hover:bg-blue-50/60 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{formatNumber(user.profile.twitter_followers_count || 0)}</div>
                <div className="text-xs text-gray-600 font-medium">Followers</div>
              </div>
              <div className="text-center p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-xl hover:bg-emerald-50/60 transition-colors">
                <div className="text-2xl font-bold text-gray-800">{formatNumber(user.profile.twitter_following_count || 0)}</div>
                <div className="text-xs text-gray-600 font-medium">Following</div>
              </div>
              <div className="text-center p-4 bg-purple-50/40 border border-purple-100/50 rounded-xl hover:bg-purple-50/60 transition-colors">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{formatNumber(user.profile.twitter_tweet_count || 0)}</div>
                <div className="text-xs text-gray-600 font-medium">Posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Posts - Social Media Feed Style */}
      <div className="social-card p-6 animate-fade-in">
        <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
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
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                {/* Post header with user info */}
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                    <AvatarImage 
                      src={post.author?.profile_image_url || user.profile.twitter_profile_image_url || user.profile.avatar_url} 
                      alt={`@${post.author?.username || user.profile.twitter_username}`}
                    />
                    <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                      {(post.author?.username || user.profile.twitter_username)?.charAt(0).toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900 truncate">
                        @{post.author?.username || user.profile.twitter_username}
                      </p>
                      {user.profile.twitter_verified && (
                        <Badge variant="secondary" className="h-4 w-4 p-0 rounded-full bg-blue-500">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </Badge>
                      )}
                      <span className="text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 text-sm">{formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>
                  
                  {/* Twitter link */}
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => window.open(`https://twitter.com/${user.profile.twitter_username}/status/${post.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Post content */}
                <div className="mb-4">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                    {post.text}
                  </p>
                </div>
                
                {/* Engagement metrics - Twitter style */}
                <div className="flex items-center justify-between text-gray-500 pt-2 border-t border-gray-100">
                  <button className="flex items-center space-x-2 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-1.5 transition-all group">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatNumber(post.public_metrics?.reply_count || 0)}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 hover:text-green-500 hover:bg-green-50 rounded-full px-3 py-1.5 transition-all group">
                    <Repeat2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatNumber(post.public_metrics?.retweet_count || 0)}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 hover:text-red-500 hover:bg-red-50 rounded-full px-3 py-1.5 transition-all group">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatNumber(post.public_metrics?.like_count || 0)}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 hover:text-blue-500 hover:bg-blue-50 rounded-full px-3 py-1.5 transition-all group">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2 font-medium">No recent posts available</p>
            <p className="text-sm text-gray-500">
              Twitter API rate limits may prevent loading posts. Try the refresh button.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}