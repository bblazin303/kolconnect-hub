import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Bell,
  Plus,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  MessageSquare
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'

export function DashboardHeader() {
  const { user, signOut, isKOL, isProject } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="h-16 border-b border-border/50 glass-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-black font-bold text-sm">KH</span>
          </div>
          <span className="text-xl font-mono font-bold text-gradient-gold">KOLHub</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isKOL ? "Search campaigns..." : "Search KOLs..."}
            className="pl-10 glass-card border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Actions */}
        {isProject && (
          <Button size="sm" className="btn-hero">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        )}

        {isKOL && (
          <Button size="sm" variant="outline" className="glass-card border-0">
            <Search className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-card border-0">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="p-2 hover:bg-accent/50 rounded-md cursor-pointer">
                <p className="text-sm font-medium">New campaign application</p>
                <p className="text-xs text-muted-foreground">CryptoPunk NFT project wants to work with you</p>
                <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
              </div>
              <div className="p-2 hover:bg-accent/50 rounded-md cursor-pointer">
                <p className="text-sm font-medium">Payment received</p>
                <p className="text-xs text-muted-foreground">$500 for DeFi promotion campaign</p>
                <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
              </div>
              <div className="p-2 hover:bg-accent/50 rounded-md cursor-pointer">
                <p className="text-sm font-medium">New message</p>
                <p className="text-xs text-muted-foreground">Project manager sent you a message</p>
                <p className="text-xs text-muted-foreground mt-1">3 hours ago</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Messages */}
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-4 w-4" />
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
            2
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-black font-bold text-xs">
                  {user?.profile?.twitter_username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {user?.profile?.twitter_username || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isKOL ? 'KOL Account' : 'Project Account'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-0">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={isKOL ? '/dashboard/kol/profile' : '/dashboard/project/profile'}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={isKOL ? '/dashboard/kol/settings' : '/dashboard/project/settings'}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}