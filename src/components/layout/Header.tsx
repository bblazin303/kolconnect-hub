import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { NotificationButton } from "@/components/dashboard/NotificationButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Menu,
  X
} from "lucide-react";

interface HeaderProps {
  userType?: 'kol' | 'project' | null;
  isAuthenticated?: boolean;
}

export function Header({ userType = null, isAuthenticated: propIsAuthenticated = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  // Use actual auth status and user data
  const actuallyAuthenticated = isAuthenticated && user?.profile;
  const actualUserType = user?.profile?.user_type;

  const handleAuthClick = (type: 'kol' | 'project') => {
    navigate('/auth');
  };

  const handleDashboardClick = () => {
    if (actualUserType) {
      navigate(`/dashboard/${actualUserType}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-black font-bold text-sm">KH</span>
              </div>
              <span className="text-xl font-mono font-bold text-gradient-gold">
                KOLHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/kols" 
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Find KOLs
            </Link>
            <Link 
              to="/jobs" 
              className="text-foreground/80 hover:text-secondary transition-colors"
            >
              Job Board
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-foreground/80 hover:text-primary transition-colors"
            >
              Leaderboard
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-foreground/80 hover:text-secondary transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {!actuallyAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => handleAuthClick('kol')}
                  className="text-secondary hover:text-secondary/80"
                >
                  Join as KOL
                </Button>
                <Button 
                  onClick={() => handleAuthClick('project')}
                  className="btn-hero"
                >
                  Post a Job
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                {/* Dashboard Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDashboardClick}
                  className="hidden sm:flex"
                >
                  Dashboard
                </Button>

                {/* Search */}
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Search className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <NotificationButton />
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.profile?.twitter_profile_image_url || user?.profile?.avatar_url || "/avatars/user.jpg"} 
                          alt="User" 
                        />
                        <AvatarFallback>
                          {user?.profile?.twitter_username?.charAt(0).toUpperCase() || 
                           (actualUserType === 'kol' ? 'K' : 'P')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-card" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          @{user?.profile?.twitter_username || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboardClick}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/kols" 
                className="text-foreground/80 hover:text-primary transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Find KOLs
              </Link>
              <Link 
                to="/jobs" 
                className="text-foreground/80 hover:text-secondary transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Job Board
              </Link>
              <Link 
                to="/leaderboard" 
                className="text-foreground/80 hover:text-primary transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Leaderboard
              </Link>
              <Link 
                to="/how-it-works" 
                className="text-foreground/80 hover:text-secondary transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              
              {!actuallyAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleAuthClick('kol')}
                    className="justify-start text-secondary hover:text-secondary/80"
                  >
                    Join as KOL
                  </Button>
                  <Button 
                    onClick={() => handleAuthClick('project')}
                    className="btn-hero justify-start"
                  >
                    Post a Job
                  </Button>
                </div>
              )}

              {actuallyAuthenticated && (
                <div className="flex flex-col space-y-2 pt-3 border-t border-border/50">
                  <Button 
                    variant="ghost" 
                    onClick={handleDashboardClick}
                    className="justify-start"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleSignOut}
                    className="justify-start text-red-500 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}