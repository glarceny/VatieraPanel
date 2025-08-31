import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ServerList } from "@/components/dashboard/server-list";
import { ResourceMonitor } from "@/components/dashboard/resource-monitor";
import { Console } from "@/components/dashboard/console";
import { FileManager } from "@/components/dashboard/file-manager";
import { WingsNodes } from "@/components/dashboard/wings-nodes";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const { data: servers, isLoading: serversLoading } = useQuery<any[]>({
    queryKey: ["/api/servers"],
  });

  const { data: nodes, isLoading: nodesLoading } = useQuery<any[]>({
    queryKey: ["/api/nodes"],
  });

  if (statsLoading || serversLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          title="Dashboard" 
          subtitle="Welcome back, manage your servers" 
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="p-4 md:p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <StatsCard
              title="Total Servers"
              value={stats?.totalServers || 0}
              icon="fas fa-server"
              change="+2"
              changeLabel="from last month"
              color="primary"
            />
            <StatsCard
              title="Online Servers"
              value={stats?.onlineServers || 0}
              icon="fas fa-play"
              change={stats?.totalServers ? `${Math.round((stats.onlineServers / stats.totalServers) * 100)}%` : '0%'}
              changeLabel="uptime"
              color="success"
            />
            <StatsCard
              title="CPU Usage"
              value={`${stats?.cpuUsage || 0}%`}
              icon="fas fa-microchip"
              progress={stats?.cpuUsage || 0}
              color="warning"
            />
            <StatsCard
              title="Memory Usage"
              value={`${stats?.memoryUsage || 0}%`}
              icon="fas fa-memory"
              progress={stats?.memoryUsage || 0}
              color="destructive"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Server List */}
            <div className="lg:col-span-2">
              <ServerList servers={servers || []} />
            </div>

            {/* Quick Actions & System Info */}
            <div className="space-y-6">
              <ResourceMonitor stats={stats} />
            </div>
          </div>

          {/* Recent Activity & Console */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
            <Console />
            <FileManager />
          </div>

          {/* Wings Nodes Status */}
          <div className="mt-4 md:mt-6">
            <WingsNodes nodes={nodes || []} />
          </div>
        </main>
      </div>
    </div>
  );
}
