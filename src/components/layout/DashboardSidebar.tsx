import { useAuth } from '@/hooks/useAuth'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Megaphone,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  Briefcase,
  Star,
  DollarSign,
  Bell
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

export function DashboardSidebar() {
  const { user, isKOL, isProject } = useAuth()
  const { state } = useSidebar()
  const location = useLocation()
  
  const collapsed = state === 'collapsed'

  const kolItems = [
    { title: 'Dashboard', url: '/dashboard/kol', icon: Home },
    { title: 'Browse Jobs', url: '/dashboard/kol/jobs', icon: Briefcase },
    { title: 'My Applications', url: '/dashboard/kol/applications', icon: Users },
    { title: 'Active Campaigns', url: '/dashboard/kol/campaigns', icon: Megaphone },
    { title: 'Messages', url: '/dashboard/kol/messages', icon: MessageSquare, badge: 3 },
    { title: 'Analytics', url: '/dashboard/kol/analytics', icon: BarChart3 },
    { title: 'Earnings', url: '/dashboard/kol/earnings', icon: DollarSign },
  ]

  const projectItems = [
    { title: 'Dashboard', url: '/dashboard/project', icon: Home },
    { title: 'My Campaigns', url: '/dashboard/project/campaigns', icon: Megaphone },
    { title: 'KOL Directory', url: '/dashboard/project/kols', icon: Users },
    { title: 'Applications', url: '/dashboard/project/applications', icon: Briefcase },
    { title: 'Messages', url: '/dashboard/project/messages', icon: MessageSquare, badge: 5 },
    { title: 'Analytics', url: '/dashboard/project/analytics', icon: BarChart3 },
    { title: 'Billing', url: '/dashboard/project/billing', icon: DollarSign },
  ]

  const settingsItems = [
    { title: 'Profile', url: isKOL ? '/dashboard/kol/profile' : '/dashboard/project/profile', icon: User },
    { title: 'Settings', url: isKOL ? '/dashboard/kol/settings' : '/dashboard/project/settings', icon: Settings },
    { title: 'Notifications', url: isKOL ? '/dashboard/kol/notifications' : '/dashboard/project/notifications', icon: Bell },
  ]

  const items = isKOL ? kolItems : projectItems

  const isActive = (path: string) => location.pathname === path

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'

  return (
    <Sidebar className={collapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="glass-card border-r border-border/50">
        {/* User Profile Section */}
        <div className="p-4 border-b border-border/50">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {user?.profile?.twitter_username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.profile?.twitter_username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isKOL ? 'KOL' : 'Project'}
                </p>
              </div>
              {user?.profile?.twitter_verified && (
                <Star className="h-4 w-4 text-primary" />
              )}
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 text-xs p-0 flex items-center justify-center">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}