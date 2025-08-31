import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateKOLScore, determineTier } from "@/lib/leaderboardUtils";

export interface LeaderboardKOL {
  id: string;
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  score: number;
  change: number;
  followers: string;
  engagement: string;
  campaigns: number;
  revenue: string;
  rating: number;
  specialization: string;
  tier: 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze';
  isVerified: boolean;
  monthlyGrowth: number;
  successRate: number;
}

export function useLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardKOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch KOL profiles with user data
      const { data: kolProfiles, error: kolError } = await supabase
        .from('kol_profiles')
        .select(`
          *,
          users!inner(
            id,
            twitter_username,
            twitter_followers_count,
            twitter_verified,
            avatar_url,
            bio,
            twitter_profile_image_url
          )
        `)
        .eq('users.user_type', 'kol')
        .order('total_campaigns', { ascending: false });

      if (kolError) throw kolError;

      if (!kolProfiles) {
        setLeaderboardData([]);
        return;
      }

      // Transform data and calculate scores
      const transformedData: LeaderboardKOL[] = kolProfiles.map((profile, index) => {
        const user = profile.users;
        const score = calculateKOLScore({
          followers: user.twitter_followers_count || 0,
          campaigns: profile.total_campaigns || 0,
          earnings: profile.total_earnings || 0,
          rating: profile.rating || 0
        });

        const tier = determineTier(score);
        
        // Format follower count
        const formatFollowers = (count: number): string => {
          if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
          if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
          return count.toString();
        };

        return {
          id: profile.id,
          rank: index + 1,
          name: profile.display_name || 'Unknown KOL',
          handle: user.twitter_username ? `@${user.twitter_username}` : '@username',
          avatar: user.twitter_profile_image_url || user.avatar_url || '/placeholder.svg',
          score: Math.round(score * 10) / 10,
          change: Math.random() * 6 - 3, // Mock change data for now
          followers: formatFollowers(user.twitter_followers_count || 0),
          engagement: `${(Math.random() * 10 + 2).toFixed(1)}%`, // Mock engagement rate
          campaigns: profile.total_campaigns || 0,
          revenue: `$${(profile.total_earnings || 0).toLocaleString()}`,
          rating: profile.rating || 0,
          specialization: profile.specialties?.[0] || 'General',
          tier,
          isVerified: user.twitter_verified || false,
          monthlyGrowth: Math.random() * 20, // Mock monthly growth
          successRate: Math.random() * 20 + 80 // Mock success rate 80-100%
        };
      });

      // Sort by score (descending)
      const sortedData = transformedData.sort((a, b) => b.score - a.score);
      
      // Update ranks
      const rankedData = sortedData.map((item, index) => ({
        ...item,
        rank: index + 1
      }));

      setLeaderboardData(rankedData);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    leaderboardData,
    loading,
    error,
    refetch: fetchLeaderboardData
  };
}