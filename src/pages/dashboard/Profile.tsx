import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/ui/use-toast'
import { 
  Settings,
  User,
  Globe,
  MapPin,
  Clock,
  Star,
  DollarSign,
  Save,
  Twitter,
  RefreshCw
} from 'lucide-react'

interface KOLProfile {
  display_name: string
  hourly_rate: number
  specialties: string[]
  languages: string[]
  time_zone: string
  availability: boolean
  rating: number
  total_campaigns: number
  total_earnings: number
  verification_status: string
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<KOLProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshingTwitter, setRefreshingTwitter] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('kol_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setProfile(data)
      } else {
        // Create default profile
        setProfile({
          display_name: user?.profile?.twitter_username || '',
          hourly_rate: 0,
          specialties: [],
          languages: ['English'],
          time_zone: 'UTC',
          availability: true,
          rating: 0,
          total_campaigns: 0,
          total_earnings: 0,
          verification_status: 'pending'
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('kol_profiles')
        .upsert({
          user_id: user?.id,
          ...profile
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const refreshTwitterData = async () => {
    setRefreshingTwitter(true)
    try {
      // Trigger Twitter data refresh via edge function
      const { error } = await supabase.functions.invoke('update-twitter-metrics', {
        body: { userId: user?.id }
      })

      if (error) throw error

      // Reload user profile from database
      await loadProfile()
      
      toast({
        title: "Success",
        description: "Twitter data refreshed successfully"
      })
    } catch (error) {
      console.error('Error refreshing Twitter data:', error)
      toast({
        title: "Error", 
        description: "Failed to refresh Twitter data",
        variant: "destructive"
      })
    } finally {
      setRefreshingTwitter(false)
    }
  }

  const addSpecialty = (specialty: string) => {
    if (profile && !profile.specialties.includes(specialty)) {
      setProfile({
        ...profile,
        specialties: [...profile.specialties, specialty]
      })
    }
  }

  const removeSpecialty = (specialty: string) => {
    if (profile) {
      setProfile({
        ...profile,
        specialties: profile.specialties.filter(s => s !== specialty)
      })
    }
  }

  const commonSpecialties = ['DeFi', 'NFTs', 'Gaming', 'Memecoins', 'Layer 1', 'Trading', 'Yield Farming', 'Protocols', 'Community', 'Viral Content', 'Metaverse', 'Web3']

  if (loading || !profile) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your KOL profile and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={profile.display_name}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    placeholder="Your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={profile.hourly_rate}
                      onChange={(e) => setProfile({ ...profile, hourly_rate: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time_zone">Time Zone</Label>
                  <Input
                    id="time_zone"
                    value={profile.time_zone}
                    onChange={(e) => setProfile({ ...profile, time_zone: e.target.value })}
                    placeholder="UTC"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Specialties</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select your areas of expertise in crypto/Web3
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSpecialty(specialty)}
                    >
                      {specialty} ×
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Label>Add Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonSpecialties
                      .filter(s => !profile.specialties.includes(s))
                      .map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => addSpecialty(specialty)}
                        >
                          + {specialty}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profile?.twitter_profile_image_url} />
                    <AvatarFallback>
                      {profile.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{profile.display_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      @{user?.profile?.twitter_username}
                    </p>
                    <Badge 
                      variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {profile.verification_status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="font-semibold">{profile.total_campaigns}</p>
                    <p className="text-muted-foreground">Campaigns</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="font-semibold">{profile.rating.toFixed(1)}</p>
                    <p className="text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Twitter Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="h-5 w-5 text-blue-500" />
                  Twitter Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Followers:</span>
                    <span className="font-medium">
                      {user?.profile?.twitter_followers_count?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Following:</span>
                    <span className="font-medium">
                      {user?.profile?.twitter_following_count?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tweets:</span>
                    <span className="font-medium">
                      {user?.profile?.twitter_tweet_count?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={refreshTwitterData}
                  disabled={refreshingTwitter}
                >
                  {refreshingTwitter ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Earnings</span>
                    <span className="font-semibold text-green-600">
                      ${profile.total_earnings.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-semibold">&lt; 2 hours</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <Badge variant={profile.availability ? 'default' : 'secondary'}>
                      {profile.availability ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}