import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  Star,
  Briefcase,
  MessageSquare,
  Clock,
  ChevronRight,
  Calendar,
  Users,
  Target
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function KOLDashboard() {
  const { user } = useAuth()

  // Mock data - in real app, fetch from Supabase
  const stats = {
    totalEarnings: 12450,
    activeCampaigns: 3,
    completedCampaigns: 27,
    averageRating: 4.8,
    pendingApplications: 2,
    newMessages: 3
  }

  const activeCampaigns = [
    {
      id: '1',
      title: 'DeFi Protocol Launch',
      company: 'AstroFinance',
      deadline: '2024-01-15',
      progress: 75,
      payment: 2500,
      status: 'In Progress'
    },
    {
      id: '2',
      title: 'NFT Collection Promotion',
      company: 'CryptoArt Labs',
      deadline: '2024-01-20',
      progress: 45,
      payment: 1800,
      status: 'In Progress'
    },
    {
      id: '3',
      title: 'Gaming Token Campaign',
      company: 'MetaGames',
      deadline: '2024-01-25',
      progress: 20,
      payment: 3200,
      status: 'Starting Soon'
    }
  ]

  const recentOpportunities = [
    {
      id: '1',
      title: 'Blockchain Gaming Platform Promotion',
      company: 'GameChain',
      budget: '$2,000 - $4,000',
      deadline: 'Apply by Jan 10',
      requirements: ['Gaming Content', '50K+ Followers', 'Twitter + YouTube']
    },
    {
      id: '2',
      title: 'DeFi Yield Farming Campaign',
      company: 'YieldMax',
      budget: '$1,500 - $3,000',
      deadline: 'Apply by Jan 12',
      requirements: ['DeFi Expert', 'Thread Series', 'Twitter Spaces']
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-gradient-gold">
              Welcome back, {user?.profile?.twitter_username || 'KOL'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your campaigns and opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="btn-secondary">
              <Target className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
            <Button className="btn-hero">
              <Users className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-gold">
                ${stats.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Briefcase className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-emerald">
                {stats.activeCampaigns}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedCampaigns} completed total
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(stats.averageRating)
                        ? 'text-primary fill-current'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <MessageSquare className="h-4 w-4 text-crypto-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications + stats.newMessages}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingApplications} applications, {stats.newMessages} messages
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2">
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-secondary" />
                  Active Campaigns
                </CardTitle>
                <Link to="/dashboard/kol/campaigns">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="glass-card p-4 hover:glow-primary transition-glow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.company}</p>
                      </div>
                      <Badge variant={campaign.status === 'In Progress' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{campaign.progress}%</span>
                      </div>
                      <Progress value={campaign.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due {campaign.deadline}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Payment</p>
                        <p className="font-semibold text-primary">
                          ${campaign.payment.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check Messages ({stats.newMessages})
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  View Applications ({stats.pendingApplications})
                </Button>
                <Button className="w-full justify-start btn-secondary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Recent Opportunities */}
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">New Opportunities</CardTitle>
                <Link to="/dashboard/kol/jobs">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="glass-card p-4 hover:card-hover">
                    <h3 className="font-semibold text-sm mb-1">{opportunity.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{opportunity.company}</p>
                    <p className="text-sm font-medium text-primary mb-2">{opportunity.budget}</p>
                    <p className="text-xs text-muted-foreground mb-3">{opportunity.deadline}</p>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.requirements.slice(0, 2).map((req, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {opportunity.requirements.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.requirements.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}