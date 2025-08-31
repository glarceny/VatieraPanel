import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink } from "lucide-react";
import { ServerWithRelations } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ServerListProps {
  servers: ServerWithRelations[];
  fullWidth?: boolean;
}

export function ServerList({ servers, fullWidth = false }: ServerListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success text-success-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      case 'starting': case 'stopping': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getServerIcon = (eggName: string) => {
    if (eggName.toLowerCase().includes('minecraft')) return 'fas fa-cube';
    if (eggName.toLowerCase().includes('node')) return 'fab fa-node-js';
    if (eggName.toLowerCase().includes('samp')) return 'fas fa-gamepad';
    return 'fas fa-server';
  };

  return (
    <Card className={cn("shadow-sm", fullWidth && "w-full")}>
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle>Your Servers</CardTitle>
          <Button size="sm" data-testid="button-create-server-list">
            <Plus className="h-4 w-4 mr-2" />
            Create Server
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {servers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-server text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No servers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first server to get started with VatieraPanel
            </p>
            <Button data-testid="button-create-first-server">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Server
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-accent/50 rounded-lg border border-border hover:bg-accent transition-smooth cursor-pointer space-y-3 sm:space-y-0"
                data-testid={`server-item-${server.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className={`${getServerIcon(server.egg.name)} text-primary`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground" data-testid={`server-name-${server.id}`}>
                      {server.name}
                    </h4>
                    <p className="text-sm text-muted-foreground" data-testid={`server-egg-${server.id}`}>
                      {server.egg.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(server.status)} data-testid={`server-status-${server.id}`}>
                      {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                    </Badge>
                    <div className="text-sm text-muted-foreground" data-testid={`server-resources-${server.id}`}>
                      {server.memory}MB
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" data-testid={`button-server-details-${server.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
