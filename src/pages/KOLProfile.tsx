import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  MessageCircle,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Eye,
  ThumbsUp,
  Heart,
  Share2,
  ExternalLink,
  ArrowLeft,
  Video,
  Mic,
  FileText,
  BarChart3,
  Award,
  Verified,
  Shield
} from "lucide-react";

interface RealKOL {
  id: string;
  user_id: string;
  display_name: string;
  twitter_username: string;
  twitter_followers_count: number;
  twitter_verified: boolean;
  twitter_profile_image_url: string;
  twitter_description: string;
  twitter_location: string;
  hourly_rate: number;
  rating: number;
  total_campaigns: number;
  specialties: string[];
  availability: boolean;
  verification_status: string;
  created_at: string;
}

// Generate consistent colors for users
const generateUserColor = (username: string) => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500', 'bg-teal-500']
  const index = (username?.length || 0) % colors.length
  return colors[index]
}

export default function KOLProfile() {
  const { kolId } = useParams<{ kolId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [kol, setKol] = useState<RealKOL | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (kolId) {
      loadKOLData(kolId);
    }
  }, [kolId]);

  const loadKOLData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          twitter_username,
          twitter_followers_count,
          twitter_verified,
          twitter_profile_image_url,
          twitter_description,
          twitter_location,
          created_at,
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
        .eq('id', userId)
        .eq('user_type', 'kol')
        .single();

      if (error) throw error;

      if (data && data.kol_profiles.length > 0) {
        const formattedKOL: RealKOL = {
          id: data.id,
          user_id: data.id,
          display_name: data.kol_profiles[0].display_name || data.twitter_username,
          twitter_username: data.twitter_username,
          twitter_followers_count: data.twitter_followers_count || 0,
          twitter_verified: data.twitter_verified,
          twitter_profile_image_url: data.twitter_profile_image_url,
          twitter_description: data.twitter_description,
          twitter_location: data.twitter_location,
          hourly_rate: data.kol_profiles[0].hourly_rate || 0,
          rating: data.kol_profiles[0].rating || 0,
          total_campaigns: data.kol_profiles[0].total_campaigns || 0,
          specialties: data.kol_profiles[0].specialties || [],
          availability: data.kol_profiles[0].availability || true,
          verification_status: data.kol_profiles[0].verification_status || 'pending',
          created_at: data.created_at
        };
        setKol(formattedKOL);
      }
    } catch (error) {
      console.error('Error loading KOL data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUser = () => {
    console.log('🔥 Message button clicked', { 
      user: user?.id, 
      userType: user?.profile?.user_type,
      isAuthenticated: !!user,
      targetUserId: kolId 
    });

    if (!user) {
      // Redirect to auth if not logged in
      console.log('❌ User not authenticated, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (!user.profile?.user_type) {
      console.log('❌ No user type found, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Navigate to appropriate dashboard based on user type
    const dashboardType = user.profile.user_type === 'kol' ? 'kol' : 'project';
    const messagesPath = `/dashboard/${dashboardType}/messages`;
    
    console.log('✅ Navigating to messages:', messagesPath);
    navigate(messagesPath, { 
      state: { startConversationWith: kolId } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={false} />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!kol) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={false} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">KOL Not Found</h1>
          <p className="text-muted-foreground mb-6">The KOL profile you're looking for doesn't exist.</p>
          <Link to="/kols">
            <Button>Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const HireModal = () => (
    <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Hire {kol.display_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Title</label>
            <Input placeholder="Enter your project title..." />
          </div>
          <div>
            <label className="text-sm font-medium">Service Type</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter-thread">Twitter Thread</SelectItem>
                <SelectItem value="twitter-spaces">Twitter Spaces</SelectItem>
                <SelectItem value="video-content">Video Content</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Budget Range</label>
            <Input placeholder="e.g. $500-1000" />
          </div>
          <div>
            <label className="text-sm font-medium">Project Description</label>
            <Textarea placeholder="Describe your project requirements..." rows={4} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={() => setIsHireModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Send Proposal</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      {/* Cover Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-6">
          <Link to="/kols" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="glass-card p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage 
                  src={kol.twitter_profile_image_url?.replace('_normal', '_400x400')} 
                  alt={kol.display_name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <AvatarFallback className={`${generateUserColor(kol.twitter_username)} text-white text-2xl font-bold`}>
                  {(kol.display_name?.charAt(0) || kol.twitter_username?.charAt(0) || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold">{kol.display_name}</h1>
                  {kol.twitter_verified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                  <Badge 
                    variant={kol.availability ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {kol.availability ? 'Available' : 'Busy'}
                  </Badge>
                </div>
                
                <p className="text-lg text-muted-foreground mb-3">@{kol.twitter_username}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {kol.twitter_location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {kol.twitter_location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        kol.verification_status === 'verified' ? 'border-green-500 text-green-600' : 
                        kol.verification_status === 'pending' ? 'border-yellow-500 text-yellow-600' :
                        'border-red-500 text-red-600'
                      }`}
                    >
                      {kol.verification_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(kol.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="lg:ml-auto flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="glass-card hover:bg-accent transition-colors" 
                onClick={handleMessageUser}
                disabled={loading}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {user ? 'Send Message' : 'Login to Message'}
              </Button>
              <Button 
                onClick={() => setIsHireModalOpen(true)} 
                className="btn-secondary"
                disabled={loading}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Hire Me
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Users className="h-4 w-4" />
                <span className="font-bold text-lg">{kol.twitter_followers_count.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Star className="h-4 w-4 fill-primary" />
                <span className="font-bold text-lg">{kol.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                <Award className="h-4 w-4" />
                <span className="font-bold text-lg">{kol.total_campaigns}</span>
              </div>
              <p className="text-xs text-muted-foreground">Campaigns</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-bold text-lg">
                  {kol.hourly_rate > 0 ? `$${kol.hourly_rate}/hr` : 'Not set'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Hourly Rate</p>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-1 h-auto">
            <TabsTrigger value="overview" className="px-6 py-3">Overview</TabsTrigger>
            <TabsTrigger value="portfolio" className="px-6 py-3">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews" className="px-6 py-3">Reviews</TabsTrigger>
            <TabsTrigger value="services" className="px-6 py-3">Services</TabsTrigger>
            <TabsTrigger value="stats" className="px-6 py-3">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bio & Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {kol.twitter_description || 'No bio available yet.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {kol.specialties && kol.specialties.length > 0 ? (
                        kol.specialties.map((spec) => (
                          <Badge key={spec} variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                            {spec}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No specialties listed yet.</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <a 
                        href={`https://twitter.com/${kol.twitter_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                        @{kol.twitter_username}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hourly Rate:</span>
                      <span className="font-medium text-primary">
                        {kol.hourly_rate > 0 ? `$${kol.hourly_rate}/hr` : 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaigns:</span>
                      <span className="font-medium text-secondary">{kol.total_campaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="font-medium">{kol.rating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{kol.availability ? 'Available' : 'Busy'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <a 
                      href={`https://twitter.com/${kol.twitter_username}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter Profile
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Portfolio Coming Soon</h3>
                <p className="text-muted-foreground">
                  This KOL's portfolio and case studies will be available soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {/* Rating Summary */}
            <Card className="glass-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">{kol.rating}</div>
                    <div className="flex items-center justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(kol.rating) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">No reviews yet</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${stars === 5 ? 80 : stars === 4 ? 15 : 5}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {stars === 5 ? '80%' : stars === 4 ? '15%' : '5%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Reviews */}
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  This KOL hasn't received any reviews yet. Be the first to hire them!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="glass-card border-0">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Services Available Soon</h3>
                <p className="text-muted-foreground mb-4">
                  This KOL is setting up their service packages. Check back soon!
                </p>
                <Button onClick={() => setIsHireModalOpen(true)} className="btn-secondary">
                  Contact for Custom Quote
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Success Rate</span>
                      <span className="font-bold text-primary">98.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg. Engagement</span>
                      <span className="font-bold text-secondary">N/A</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Client Retention</span>
                      <span className="font-bold text-crypto-blue">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Avg. ROI</span>
                      <span className="font-bold text-primary">N/A</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Followers</span>
                      <span className="font-bold text-primary">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="font-bold text-secondary">+8.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Campaign Volume</span>
                      <span className="font-bold text-crypto-blue">+15.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-bold text-primary">+22.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Trust Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">On-time Delivery</span>
                      <span className="font-bold text-primary">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Communication</span>
                      <span className="font-bold text-secondary">4.9/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Professionalism</span>
                      <span className="font-bold text-crypto-blue">4.9/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Would Rehire</span>
                      <span className="font-bold text-primary">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <HireModal />
    </div>
  );
}