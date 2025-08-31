import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  changeLabel?: string;
  progress?: number;
  color: "primary" | "success" | "warning" | "destructive";
}

export function StatsCard({ title, value, icon, change, changeLabel, progress, color }: StatsCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };

  const progressColors = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold text-foreground" data-testid={`stat-${title.toLowerCase().replace(' ', '-')}`}>
              {value}
            </p>
          </div>
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
            <i className={`${icon} text-xl`}></i>
          </div>
        </div>
        {change && changeLabel && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-success">{change}</span>
            <span className="text-muted-foreground ml-1">{changeLabel}</span>
          </div>
        )}
        {progress !== undefined && (
          <div className="mt-4 w-full bg-secondary rounded-full h-2">
            <div 
              className={cn("h-2 rounded-full transition-all duration-500", progressColors[color])}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
