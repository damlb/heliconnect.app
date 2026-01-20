import { Bell, User, LogOut, Settings, Globe, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getInitials } from '@/lib/utils'

interface HeaderProps {
  language: 'fr' | 'en'
  onLanguageChange: (lang: 'fr' | 'en') => void
  isMobile: boolean
  onMenuClick: () => void
}

export default function Header({ language, onLanguageChange, isMobile, onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-5 w-5 text-gray-500" />
          </Button>
        )}

        {/* Title - hidden on mobile */}
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'fr' ? 'Bienvenue' : 'Welcome'}, {profile?.first_name || 'Client'}
          </h2>
          <p className="text-sm text-gray-500">
            {language === 'fr'
              ? 'Trouvez votre prochain vol en hélicoptère'
              : 'Find your next helicopter flight'}
          </p>
        </div>

        {/* Mobile logo */}
        {isMobile && (
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-icon.svg"
              alt="HeliConnect"
              className="h-7 w-7"
            />
            <span className="font-poppins font-bold text-primary text-sm">
              HeliConnect
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Globe className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onLanguageChange('fr')}>
              <span className={language === 'fr' ? 'font-semibold' : ''}>
                Français
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLanguageChange('en')}>
              <span className={language === 'en' ? 'font-semibold' : ''}>
                English
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-gray-500" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                2
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 md:w-80">
            <DropdownMenuLabel>
              {language === 'fr' ? 'Notifications' : 'Notifications'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-sm text-gray-500 text-center">
              {language === 'fr'
                ? 'Aucune nouvelle notification'
                : 'No new notifications'}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 md:gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {profile?.first_name && profile?.last_name ? getInitials(`${profile.first_name} ${profile.last_name}`) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.company_name || 'Client'}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {language === 'fr' ? 'Mon compte' : 'My account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Profil' : 'Profile'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Paramètres' : 'Settings'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {language === 'fr' ? 'Déconnexion' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
