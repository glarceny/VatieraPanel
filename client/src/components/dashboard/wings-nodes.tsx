import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NodeWithRelations } from "@shared/schema";

interface WingsNodesProps {
  nodes: NodeWithRelations[];
}

export function WingsNodes({ nodes }: WingsNodesProps) {
  const getStatusColor = (isOnline: boolean) => {
    return isOnline 
      ? "bg-success text-success-foreground" 
      : "bg-destructive text-destructive-foreground";
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle>Wings Nodes</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {nodes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-network-wired text-2xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Wings nodes</h3>
            <p className="text-sm text-muted-foreground">
              Install Wings on your servers to manage them remotely
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-4 bg-accent/50 rounded-lg border border-border"
                data-testid={`node-item-${node.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground" data-testid={`node-name-${node.id}`}>
                    {node.name}
                  </h4>
                  <Badge className={getStatusColor(node.isOnline)} data-testid={`node-status-${node.id}`}>
                    {node.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground text-right" data-testid={`node-location-${node.id}`}>
                      {node.location?.description || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servers:</span>
                    <span className="text-foreground" data-testid={`node-servers-${node.id}`}>
                      {node.servers.length}/∞
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="text-foreground" data-testid={`node-memory-${node.id}`}>
                      {Math.floor(node.memory / 1024)}GB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
