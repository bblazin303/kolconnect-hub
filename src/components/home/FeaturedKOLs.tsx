import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Twitter,
  MessageCircle,
  Eye
} from "lucide-react";

interface FeaturedKOL {
  id: string;
  display_name: string;
  twitter_username: string;
  twitter_profile_image_url: string;
  twitter_followers_count: number;
  twitter_verified: boolean;
  rating: number;
  total_campaigns: number;
  hourly_rate: number;
  specialties: string[];
  availability: boolean;
}

function formatFollowers(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

function formatRate(rate: number): string {
  return `$${rate}`;
}

export function FeaturedKOLs() {
  const [featuredKOLs, setFeaturedKOLs] = useState<FeaturedKOL[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedKOLs = async () => {
      try {
        const { data: kolData, error } = await supabase
          .from('users')
          .select(`
            id,
            twitter_username,
            twitter_profile_image_url,
            twitter_followers_count,
            twitter_verified,
            kol_profiles!inner(
              display_name,
              rating,
              total_campaigns,
              hourly_rate,
              specialties,
              availability
            )
          `)
          .eq('user_type', 'kol')
          .eq('kol_profiles.availability', true)
          .not('twitter_followers_count', 'is', null)
          .order('twitter_followers_count', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching featured KOLs:', error);
          return;
        }

        const formattedKOLs: FeaturedKOL[] = (kolData || []).map((item: any) => ({
          id: item.id,
          display_name: item.kol_profiles.display_name || item.twitter_username || 'Unknown',
          twitter_username: item.twitter_username || '',
          twitter_profile_image_url: item.twitter_profile_image_url || '',
          twitter_followers_count: item.twitter_followers_count || 0,
          twitter_verified: item.twitter_verified || false,
          rating: item.kol_profiles.rating || 0,
          total_campaigns: item.kol_profiles.total_campaigns || 0,
          hourly_rate: item.kol_profiles.hourly_rate || 0,
          specialties: item.kol_profiles.specialties || [],
          availability: item.kol_profiles.availability || false,
        }));

        setFeaturedKOLs(formattedKOLs);
      } catch (error) {
        console.error('Error fetching featured KOLs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedKOLs();
  }, []);
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-6 text-secondary border-secondary/30 bg-secondary/10">
            Top Performers
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold mb-6">
            Featured <span className="text-gradient-gold">KOLs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover verified crypto influencers with proven track records and exceptional performance metrics
          </p>
        </div>

        {/* KOL Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            // Loading skeletons
            [...Array(4)].map((_, index) => (
              <Card key={index} className="glass-card border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="mb-4">
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            featuredKOLs.map((kol) => (
              <Card key={kol.id} className="glass-card card-hover border-0 overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center space-x-3">
                       <div className="relative">
                         <img 
                           src={kol.twitter_profile_image_url}
                           alt={kol.display_name}
                           className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20"
                           referrerPolicy="no-referrer"
                           crossOrigin="anonymous"
                           onError={(e) => {
                             console.log('Image failed to load:', kol.twitter_profile_image_url);
                             // Replace with fallback div
                             const fallbackDiv = document.createElement('div');
                             fallbackDiv.className = 'h-12 w-12 rounded-full bg-secondary flex items-center justify-center ring-2 ring-primary/20';
                             fallbackDiv.innerHTML = `<span class="text-lg font-bold text-foreground">${kol.display_name ? kol.display_name.split(' ').map(n => n[0]).join('') : 'KOL'}</span>`;
                             e.currentTarget.parentNode?.replaceChild(fallbackDiv, e.currentTarget);
                           }}
                           onLoad={() => {
                             console.log('Image loaded successfully:', kol.twitter_profile_image_url);
                           }}
                         />
                       </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{kol.display_name}</h3>
                          {kol.twitter_verified && (
                            <CheckCircle className="h-4 w-4 text-crypto-blue" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">@{kol.twitter_username}</p>
                      </div>
                    </div>
                    <Twitter className="h-4 w-4 text-crypto-blue" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className="font-medium">{formatFollowers(kol.twitter_followers_count)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-secondary" />
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-primary fill-primary" />
                      <span className="font-medium">{kol.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-crypto-blue" />
                      <span className="font-medium">Fast</span>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {kol.specialties.slice(0, 3).map((spec) => (
                        <Badge 
                          key={spec} 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary border-secondary/30"
                        >
                          {spec}
                        </Badge>
                      ))}
                      {kol.specialties.length === 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary border-secondary/30"
                        >
                          Crypto
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Campaigns:</span>
                      <span className="font-medium">{kol.total_campaigns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium text-primary">{formatRate(kol.hourly_rate)}/hr</span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link to={`/kols/${kol.id}`}>
                    <Button 
                      className="w-full btn-secondary text-xs py-2 group"
                      size="sm"
                    >
                      View Profile
                      <Eye className="ml-1 h-3 w-3 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/kols">
            <Button size="lg" variant="outline" className="glass-card group">
              Explore All KOLs
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}