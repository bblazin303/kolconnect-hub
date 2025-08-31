import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Twitter,
  MessageCircle,
  Eye,
  ArrowUpDown,
  Grid3X3,
  List
} from "lucide-react";

interface RealKOL {
  id: string;
  user_id: string;
  display_name: string;
  twitter_username: string;
  twitter_followers_count: number;
  twitter_verified: boolean;
  twitter_profile_image_url: string;
  hourly_rate: number;
  rating: number;
  total_campaigns: number;
  specialties: string[];
  availability: boolean;
  verification_status: string;
}

export default function KOLDirectoryRealUsers() {
  const [kols, setKols] = useState<RealKOL[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    loadKOLs()
  }, [])

  const loadKOLs = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          twitter_username,
          twitter_followers_count,
          twitter_verified,
          twitter_profile_image_url,
          kol_profiles!inner(
            user_id,
            display_name,
            hourly_rate,
            rating,
            total_campaigns,
            specialties,
            availability,
            verification_status
          )
        `)
        .eq('user_type', 'kol')

      if (error) throw error

      // Flatten the data structure
      const formattedKOLs = data?.map(user => ({
        id: user.id,
        user_id: user.id,
        display_name: user.kol_profiles[0]?.display_name || user.twitter_username,
        twitter_username: user.twitter_username,
        twitter_followers_count: user.twitter_followers_count || 0,
        twitter_verified: user.twitter_verified,
        twitter_profile_image_url: user.twitter_profile_image_url,
        hourly_rate: user.kol_profiles[0]?.hourly_rate || 0,
        rating: user.kol_profiles[0]?.rating || 0,
        total_campaigns: user.kol_profiles[0]?.total_campaigns || 0,
        specialties: user.kol_profiles[0]?.specialties || [],
        availability: user.kol_profiles[0]?.availability || true,
        verification_status: user.kol_profiles[0]?.verification_status || 'pending'
      })) || []

      setKols(formattedKOLs)
    } catch (error) {
      console.error('Error loading KOLs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort KOLs
  const filteredKOLs = kols
    .filter(kol => {
      if (searchQuery && 
          !kol.display_name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !kol.twitter_username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'followers': return b.twitter_followers_count - a.twitter_followers_count;
        case 'campaigns': return b.total_campaigns - a.total_campaigns;
        case 'price-low': return a.hourly_rate - b.hourly_rate;
        case 'price-high': return b.hourly_rate - a.hourly_rate;
        default: return 0;
      }
    });

  const KOLCard = ({ kol, isListView = false }: { kol: RealKOL; isListView?: boolean }) => (
    <Card className={`social-card social-card-hover border-0 overflow-hidden ${isListView ? 'flex' : ''}`}>
      <CardContent className={`p-6 ${isListView ? 'flex items-center space-x-6 w-full' : ''}`}>
        {/* Header */}
        <div className={`flex items-start justify-between ${isListView ? 'w-64 flex-shrink-0' : 'mb-4'}`}>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={kol.twitter_profile_image_url} alt={kol.display_name} />
              <AvatarFallback>{kol.display_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">{kol.display_name}</h3>
                {kol.twitter_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{kol.twitter_username}</p>
              <Badge 
                variant={kol.availability ? 'default' : 'secondary'}
                className="text-xs mt-1"
              >
                {kol.availability ? 'Available' : 'Busy'}
              </Badge>
            </div>
          </div>
          <Twitter className="h-4 w-4 text-blue-500" />
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-4 text-xs ${isListView ? 'w-48 flex-shrink-0' : 'mb-4'}`}>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-primary" />
            <span className="font-medium">{kol.twitter_followers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-secondary" />
            <span className="font-medium">{kol.total_campaigns} campaigns</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="font-medium">{kol.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={`text-xs ${
              kol.verification_status === 'verified' ? 'border-green-500 text-green-600' : 
              kol.verification_status === 'pending' ? 'border-yellow-500 text-yellow-600' :
              'border-red-500 text-red-600'
            }`}>
              {kol.verification_status}
            </Badge>
          </div>
        </div>

        {/* Specialties */}
        <div className={`${isListView ? 'flex-1 mr-4' : 'mb-4'}`}>
          <div className="flex flex-wrap gap-1">
            {kol.specialties.slice(0, isListView ? 5 : 3).map((spec) => (
              <Badge 
                key={spec} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary border-secondary/30"
              >
                {spec}
              </Badge>
            ))}
            {kol.specialties.length === 0 && (
              <span className="text-xs text-muted-foreground">No specialties listed</span>
            )}
          </div>
        </div>

        {/* Metrics & Action */}
        <div className={`space-y-2 ${isListView ? 'w-48 flex-shrink-0' : ''}`}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaigns:</span>
              <span className="font-medium">{kol.total_campaigns}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-medium text-primary">
                {kol.hourly_rate > 0 ? `$${kol.hourly_rate}/hr` : 'Not set'}
              </span>
            </div>
          </div>
          
          <Link to={`/kols/${kol.user_id}`}>
            <Button 
              className="w-full btn-secondary text-xs py-2 group mt-2"
              size="sm"
            >
              View Profile
              <Eye className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={false} />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-mono font-bold mb-4">
            Discover <span className="text-gradient">Verified KOLs</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Browse {kols.length} verified crypto influencers and find the perfect match for your campaign
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Search and Controls */}
          <div className="lg:w-80 space-y-6">
            <div className="social-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Search & Filter</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search KOLs</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="followers">Most Followers</SelectItem>
                      <SelectItem value="campaigns">Most Campaigns</SelectItem>
                      <SelectItem value="price-low">Lowest Price</SelectItem>
                      <SelectItem value="price-high">Highest Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredKOLs.length} KOLs found
                </span>
                
                {/* View Toggle */}
                <div className="flex items-center gap-1 social-card p-1 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* KOL Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredKOLs.map((kol) => (
                <KOLCard key={kol.id} kol={kol} isListView={viewMode === 'list'} />
              ))}
            </div>

            {filteredKOLs.length === 0 && (
              <div className="text-center py-12">
                {kols.length === 0 ? (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No KOLs registered yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to join our platform and start earning!
                    </p>
                    <Link to="/auth?type=kol">
                      <Button>Join as KOL</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">No KOLs match your search.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}