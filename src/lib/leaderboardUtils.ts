interface KOLMetrics {
  followers: number;
  campaigns: number;
  earnings: number;
  rating: number;
}

export function calculateKOLScore(metrics: KOLMetrics): number {
  // Normalize metrics to 0-100 scale
  const followerScore = Math.min(metrics.followers / 10000, 100) * 0.3; // 30% weight
  const campaignScore = Math.min(metrics.campaigns * 2, 100) * 0.25; // 25% weight
  const earningsScore = Math.min(metrics.earnings / 1000, 100) * 0.25; // 25% weight
  const ratingScore = (metrics.rating / 5) * 100 * 0.2; // 20% weight

  return followerScore + campaignScore + earningsScore + ratingScore;
}

export function determineTier(score: number): 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' {
  if (score >= 90) return 'diamond';
  if (score >= 75) return 'platinum';
  if (score >= 60) return 'gold';
  if (score >= 45) return 'silver';
  return 'bronze';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}