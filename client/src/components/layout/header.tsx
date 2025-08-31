import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, action, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMenuClick}
          className="md:hidden"
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {action}
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" data-testid="button-notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full flex items-center justify-center">
            <span className="text-destructive-foreground text-xs">3</span>
          </span>
        </Button>
        
        {/* Wings Status */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-accent rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-accent-foreground" data-testid="text-wings-status">
            Wings Connected
          </span>
        </div>
      </div>
    </header>
  );
}
