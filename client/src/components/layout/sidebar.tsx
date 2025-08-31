import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, X } from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-home" },
  { name: "Servers", href: "/servers", icon: "fas fa-server" },
  { name: "File Manager", href: "/files", icon: "fas fa-folder" },
  { name: "Console", href: "/console", icon: "fas fa-terminal" },
  { name: "Monitoring", href: "/monitoring", icon: "fas fa-chart-line" },
];

const managementNav = [
  { name: "Users", href: "/users", icon: "fas fa-users" },
  { name: "Eggs", href: "/eggs", icon: "fas fa-cubes" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 md:hidden" 
            onClick={onClose}
          />
        )}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <MobileSidebarContent 
            location={location}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            logoutMutation={logoutMutation}
            onClose={onClose}
            handleLinkClick={handleLinkClick}
          />
        </div>
      </>
    );
  }

  return (
    <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:bg-card md:border-r md:border-border md:block">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-server text-primary-foreground text-sm"></i>
          </div>
          <h1 className="text-xl font-semibold text-foreground">VatieraPanel</h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleTheme}
          data-testid="button-toggle-theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-smooth",
                location === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              data-testid={`link-nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              {item.name}
            </a>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Management
          </h3>
          <div className="mt-3 space-y-1">
            {managementNav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-smooth",
                  location === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`link-mgmt-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt text-muted-foreground text-sm"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}

function MobileSidebarContent({ 
  location, 
  user, 
  theme, 
  toggleTheme, 
  logoutMutation, 
  onClose, 
  handleLinkClick 
}: {
  location: string;
  user: any;
  theme: string;
  toggleTheme: () => void;
  logoutMutation: any;
  onClose?: () => void;
  handleLinkClick: () => void;
}) {
  const handleLogout = () => {
    logoutMutation.mutate();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-server text-primary-foreground text-sm"></i>
          </div>
          <h1 className="text-xl font-semibold text-foreground">VatieraPanel</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            data-testid="button-close-sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-smooth",
                location === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              data-testid={`link-nav-${item.name.toLowerCase().replace(' ', '-')}`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              {item.name}
            </a>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Management
          </h3>
          <div className="mt-3 space-y-1">
            {managementNav.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-smooth",
                  location === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                data-testid={`link-mgmt-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" data-testid="text-username">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate" data-testid="text-user-role">
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt text-muted-foreground text-sm"></i>
          </Button>
        </div>
      </div>
    </>
  );
}
