import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Trophy,
  Star,
  DollarSign,
  Calendar
} from 'lucide-react'

const kolNavItems = [
  { name: 'Dashboard', href: '/dashboard/kol', icon: LayoutDashboard },
  { name: 'Job Board', href: '/jobs', icon: Briefcase },
  { name: 'Applications', href: '/dashboard/kol/applications', icon: Calendar },
  { name: 'Messages', href: '/dashboard/kol/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/kol/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/kol/profile', icon: Settings },
]

const projectNavItems = [
  { name: 'Dashboard', href: '/dashboard/project', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Briefcase },
  { name: 'KOL Directory', href: '/kol-directory', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function DashboardSidebar() {
  const { user, isKOL, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navItems = isKOL ? kolNavItems : projectNavItems

  // Helper function to get notification count for specific menu items
  const getNotificationCount = (itemName: string) => {
    if (itemName === 'Messages') {
      return unreadCount
    }
    // Add more notification types here as needed
    return 0
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold">KOLHub</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              {user?.profile?.avatar_url ? (
                <img 
                  src={user.profile.avatar_url} 
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {user?.profile?.twitter_username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                @{user?.profile?.twitter_username || 'user'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.profile?.user_type || 'User'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            const notificationCount = getNotificationCount(item.name)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.name}</span>
                {notificationCount > 0 && (
                  <Badge 
                    variant={isActive ? "secondary" : "destructive"} 
                    className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}