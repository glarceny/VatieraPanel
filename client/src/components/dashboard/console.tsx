import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { Send } from "lucide-react";

interface ConsoleProps {
  selectedServerId?: string;
}

export function Console({ selectedServerId }: ConsoleProps) {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedServer, setSelectedServer] = useState(selectedServerId || "");
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data: servers } = useQuery<any[]>({
    queryKey: ["/api/servers"],
  });

  const { data: serverLogs } = useQuery({
    queryKey: ["/api/servers", selectedServer, "logs"],
    enabled: !!selectedServer,
  });

  useEffect(() => {
    if (serverLogs && Array.isArray(serverLogs)) {
      setLogs(serverLogs.map((log: any) => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.content}`));
    }
  }, [serverLogs]);

  useEffect(() => {
    // WebSocket connection for real-time logs
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (selectedServer) {
        socket.send(JSON.stringify({
          type: 'subscribe_server',
          serverId: selectedServer
        }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'server_log' && data.serverId === selectedServer) {
        const timestamp = new Date(data.timestamp).toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${data.content}`].slice(-100)); // Keep last 100 logs
      }
    };

    return () => {
      socket.close();
    };
  }, [selectedServer]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSendCommand = () => {
    if (!command.trim() || !selectedServer) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'server_command',
        serverId: selectedServer,
        command: command.trim()
      }));
      setCommand("");
      socket.close();
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendCommand();
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle>Live Console</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-server-console">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {servers && Array.isArray(servers) ? servers.map((server: any) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Console Output */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 md:p-4 h-48 md:h-64 overflow-y-auto font-mono text-xs md:text-sm mb-4">
          {selectedServer ? (
            <div className="space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-400">No logs available. Start the server to see output.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-slate-300" data-testid={`console-log-${index}`}>
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          ) : (
            <div className="text-slate-400 text-center py-8">
              Select a server to view console output
            </div>
          )}
        </div>

        {/* Command Input */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter server command..."
            className="flex-1"
            disabled={!selectedServer}
            data-testid="input-console-command"
          />
          <Button 
            onClick={handleSendCommand}
            disabled={!command.trim() || !selectedServer}
            data-testid="button-send-command"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
