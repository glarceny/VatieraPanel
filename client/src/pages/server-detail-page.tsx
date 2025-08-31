import { useRoute } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Console } from "@/components/dashboard/console";
import { FileManager } from "@/components/dashboard/file-manager";
import { ResourceMonitor } from "@/components/dashboard/resource-monitor";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ServerDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, params] = useRoute("/servers/:id");
  const serverId = params?.id;

  const { data: server, isLoading } = useQuery<any>({
    queryKey: ["/api/servers", serverId],
  });

  if (isLoading || !server) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          isMobile={true} 
        />
        <div className="md:ml-64 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-muted-foreground">Loading server...</div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'offline': return 'text-destructive';
      case 'starting': case 'stopping': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isMobile={true} 
      />
      <div className="md:ml-64">
        <Header 
          title={server?.name || "Server"}
          subtitle={server?.description || "Server management"}
          onMenuClick={() => setSidebarOpen(true)}
          action={
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(server?.status || 'offline').replace('text-', 'bg-')}`}></div>
                <span className={`text-xs md:text-sm font-medium ${getStatusColor(server?.status || 'offline')} hidden sm:inline`}>
                  {(server?.status || 'offline').charAt(0).toUpperCase() + (server?.status || 'offline').slice(1)}
                </span>
              </div>
              <Button variant="outline" size="sm" data-testid="button-start-server">
                <Play className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="sm" data-testid="button-restart-server">
                <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="sm" data-testid="button-stop-server">
                <Square className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          }
        />
        
        <main className="p-4 md:p-6">
          {/* Server Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Server Type</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-foreground">{server?.egg?.name || 'Unknown'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Node</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-foreground">{server?.node?.name || 'Unknown'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {server?.memory || 0}MB RAM • {server?.disk || 0}MB Disk • {server?.cpu || 0}% CPU
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Console selectedServerId={serverId} />
              <FileManager serverId={serverId} />
            </div>
            
            <div>
              <ResourceMonitor serverId={serverId} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
