import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface ResourceMonitorProps {
  stats?: any;
  serverId?: string;
}

export function ResourceMonitor({ stats, serverId }: ResourceMonitorProps) {
  const [realTimeStats, setRealTimeStats] = useState(stats || {});

  // Fetch server-specific stats if serverId provided
  const { data: serverStats } = useQuery({
    queryKey: ["/api/servers", serverId, "stats"],
    enabled: !!serverId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (serverStats) {
      setRealTimeStats(serverStats);
    } else if (stats) {
      setRealTimeStats(stats);
    }
  }, [stats, serverStats]);

  // Simulate real-time updates for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats((prev: any) => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * 40) + 30,
        memoryUsage: Math.floor(Math.random() * 30) + 50,
        networkIn: Math.floor(Math.random() * 5) + 1,
        networkOut: Math.floor(Math.random() * 3) + 2,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle>System Resources</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* CPU Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">CPU Usage</span>
            <span className="text-sm text-muted-foreground" data-testid="stat-cpu-usage">
              {realTimeStats.cpuUsage || 0}%
            </span>
          </div>
          <Progress value={realTimeStats.cpuUsage || 0} className="h-2" />
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Memory</span>
            <span className="text-sm text-muted-foreground" data-testid="stat-memory-usage">
              {serverId ? `${realTimeStats.memoryUsed || 0}MB / ${realTimeStats.memoryLimit || 0}MB` : `${realTimeStats.memoryUsage || 0}%`}
            </span>
          </div>
          <Progress 
            value={serverId ? ((realTimeStats.memoryUsed || 0) / (realTimeStats.memoryLimit || 1)) * 100 : (realTimeStats.memoryUsage || 0)} 
            className="h-2" 
          />
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Disk Space</span>
            <span className="text-sm text-muted-foreground" data-testid="stat-disk-usage">
              {serverId ? `${realTimeStats.diskUsed || 0}MB / ${realTimeStats.diskLimit || 0}MB` : `${realTimeStats.diskUsage || 0}%`}
            </span>
          </div>
          <Progress 
            value={serverId ? ((realTimeStats.diskUsed || 0) / (realTimeStats.diskLimit || 1)) * 100 : (realTimeStats.diskUsage || 0)} 
            className="h-2" 
          />
        </div>

        {/* Network */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground">Network I/O</span>
            <span className="text-sm text-muted-foreground" data-testid="stat-network-io">
              ↑ {realTimeStats.networkOut || 0}MB/s ↓ {realTimeStats.networkIn || 0}MB/s
            </span>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(((realTimeStats.networkOut || 0) / 10) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(((realTimeStats.networkIn || 0) / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
