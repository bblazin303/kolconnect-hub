import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  Users,
  Megaphone,
  MessageSquare,
  Plus,
  ChevronRight,
  Calendar,
  Eye,
  BarChart3
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProjectDashboard() {
  const { user } = useAuth()

  // Mock data - in real app, fetch from Supabase
  const stats = {
    totalSpent: 45200,
    activeCampaigns: 5,
    totalKOLs: 23,
    averageROI: 3.4,
    pendingApplications: 12,
    newMessages: 7
  }

  const activeCampaigns = [
    {
      id: '1',
      title: 'DeFi Platform Launch Campaign',
      budget: 15000,
      spent: 8500,
      applications: 24,
      accepted: 5,
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'Active'
    },
    {
      id: '2',
      title: 'NFT Collection Promotion',
      budget: 8000,
      spent: 3200,
      applications: 18,
      accepted: 3,
      startDate: '2024-01-05',
      endDate: '2024-01-25',
      status: 'Active'
    },
    {
      id: '3',
      title: 'Gaming Token Community Building',
      budget: 12000,
      spent: 0,
      applications: 31,
      accepted: 0,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'Recruiting'
    }
  ]

  const topKOLs = [
    {
      id: '1',
      name: 'CryptoGuru_official',
      followers: 156000,
      engagement: 4.2,
      campaigns: 3,
      rating: 4.9
    },
    {
      id: '2',
      name: 'DeFiExplorer',
      followers: 89000,
      engagement: 3.8,
      campaigns: 2,
      rating: 4.7
    },
    {
      id: '3',
      name: 'NFTCollector_X',
      followers: 234000,
      engagement: 5.1,
      campaigns: 1,
      rating: 4.8
    }
  ]

  const recentApplications = [
    {
      id: '1',
      kolName: 'BlockchainBuzz',
      campaign: 'DeFi Platform Launch Campaign',
      rate: 2500,
      appliedAt: '2 hours ago',
      followers: 67000
    },
    {
      id: '2',
      kolName: 'CryptoInsights24',
      campaign: 'NFT Collection Promotion',
      rate: 1800,
      appliedAt: '4 hours ago',
      followers: 45000
    },
    {
      id: '3',
      kolName: 'MetaGaming_Pro',
      campaign: 'Gaming Token Community Building',
      rate: 3200,
      appliedAt: '6 hours ago',
      followers: 123000
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold text-gradient-gold">
              Campaign Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your campaigns and track KOL performance.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="glass-card border-0">
              <Users className="h-4 w-4 mr-2" />
              Browse KOLs
            </Button>
            <Button className="btn-hero">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-gold">
                ${stats.totalSpent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Megaphone className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gradient-emerald">
                {stats.activeCampaigns}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalKOLs} KOLs working
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <TrendingUp className="h-4 w-4 text-crypto-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageROI}x</div>
              <p className="text-xs text-muted-foreground">
                Above industry average
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <MessageSquare className="h-4 w-4 text-crypto-purple" />
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
                  <Megaphone className="h-5 w-5 text-secondary" />
                  Active Campaigns
                </CardTitle>
                <Link to="/dashboard/project/campaigns">
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
                        <p className="text-sm text-muted-foreground">
                          {campaign.applications} applications • {campaign.accepted} accepted
                        </p>
                      </div>
                      <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget Used</span>
                        <span className="font-medium">
                          ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {campaign.startDate} - {campaign.endDate}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start btn-hero">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Check Messages ({stats.newMessages})
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Review Applications ({stats.pendingApplications})
                </Button>
              </CardContent>
            </Card>

            {/* Top Performing KOLs */}
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top KOLs</CardTitle>
                <Link to="/dashboard/project/kols">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {topKOLs.map((kol) => (
                  <div key={kol.id} className="glass-card p-3 hover:card-hover">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{kol.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{kol.rating}</span>
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>{kol.followers.toLocaleString()} followers</p>
                      <p>{kol.engagement}% engagement rate</p>
                      <p>{kol.campaigns} active campaigns</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <Link to="/dashboard/project/applications">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentApplications.map((app) => (
                  <div key={app.id} className="glass-card p-3 hover:card-hover">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm">{app.kolName}</h3>
                      <span className="text-xs text-primary font-medium">
                        ${app.rate.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {app.campaign}
                    </p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{app.followers.toLocaleString()} followers</span>
                      <span>{app.appliedAt}</span>
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