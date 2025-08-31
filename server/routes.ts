import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertServerSchema, insertEggSchema, insertNodeSchema, insertLocationSchema,
  insertAllocationSchema, insertServerDatabaseSchema, insertServerBackupSchema
} from "@shared/schema";
import { randomBytes } from "crypto";
import { requireAuth, requireAdmin, requireServerAccess, requireServerPermission, logActivity, rateLimit } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const clients = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    const clientId = randomBytes(16).toString('hex');
    clients.set(clientId, ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe_server':
            // Subscribe to server logs and status updates
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              serverId: data.serverId
            }));
            break;
            
          case 'server_command':
            // Execute command on server (would communicate with Wings)
            const { serverId, command } = data;
            
            // Log the command
            await storage.createServerLog({
              serverId,
              content: `> ${command}`
            });
            
            // Broadcast to all clients subscribed to this server
            broadcast('server_log', {
              serverId,
              content: `> ${command}`,
              timestamp: new Date().toISOString()
            });
            
            // Simulate command response (in real implementation, this would come from Wings)
            setTimeout(() => {
              broadcast('server_log', {
                serverId,
                content: `Command executed: ${command}`,
                timestamp: new Date().toISOString()
              });
            }, 1000);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
    });
  });
  
  function broadcast(type: string, data: any) {
    const message = JSON.stringify({ type, ...data });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // API Routes

  // Server routes
  app.get("/api/servers", requireAuth, async (req, res) => {
    const servers = req.user!.role === 'admin' 
      ? await storage.getServers() 
      : await storage.getServersByUser(req.user!.id);
    res.json(servers);
  });

  app.get("/api/servers/:id", requireServerAccess, async (req, res) => {
    const server = await storage.getServerWithFullDetails(req.params.id);
    if (!server) return res.sendStatus(404);
    
    res.json(server);
  });

  app.post("/api/servers", requireAdmin, logActivity('server.create', 'Created new server'), async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse({
        ...req.body,
        ownerId: req.body.ownerId || req.user!.id // Admin can assign to other users
      });
      
      const server = await storage.createServer(validatedData);
      res.status(201).json(server);
    } catch (error) {
      res.status(400).json({ error: "Invalid server data" });
    }
  });

  app.post("/api/servers/:id/power", requireServerPermission('server.start'), logActivity('server.power', 'Server power action'), async (req, res) => {
    const { action } = req.body; // start, stop, restart
    const serverId = req.params.id;
    
    const server = await storage.getServer(serverId);
    if (!server) return res.sendStatus(404);
    
    // Update server status
    let newStatus = server.status;
    switch (action) {
      case 'start':
        newStatus = 'starting';
        break;
      case 'stop':
        newStatus = 'stopping';
        break;
      case 'restart':
        newStatus = 'starting';
        break;
    }
    
    await storage.updateServerStatus(serverId, newStatus);
    
    // Log the action
    await storage.createServerLog({
      serverId,
      content: `Server ${action} requested by ${req.user!.username}`
    });
    
    // Broadcast status update
    broadcast('server_status_update', {
      serverId,
      status: newStatus,
      action
    });
    
    // Simulate status change after delay
    setTimeout(async () => {
      const finalStatus = action === 'stop' ? 'offline' : 'online';
      await storage.updateServerStatus(serverId, finalStatus);
      
      broadcast('server_status_update', {
        serverId,
        status: finalStatus
      });
    }, 3000);
    
    res.json({ success: true, status: newStatus });
  });

  // Server logs
  app.get("/api/servers/:id/logs", requireServerPermission('server.console'), async (req, res) => {
    const logs = await storage.getServerLogs(req.params.id);
    res.json(logs);
  });

  // Node routes (Admin only)
  app.get("/api/nodes", requireAdmin, async (req, res) => {
    const nodes = await storage.getNodes();
    res.json(nodes);
  });

  app.post("/api/nodes", requireAdmin, logActivity('node.create', 'Created new node'), async (req, res) => {
    try {
      const validatedData = insertNodeSchema.parse({
        ...req.body,
        daemonToken: randomBytes(32).toString('hex')
      });
      
      const node = await storage.createNode(validatedData);
      res.status(201).json(node);
    } catch (error) {
      res.status(400).json({ error: "Invalid node data" });
    }
  });

  // Egg routes
  app.get("/api/eggs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const eggs = await storage.getEggs();
    res.json(eggs);
  });

  app.post("/api/eggs", requireAdmin, logActivity('egg.create', 'Created new egg'), async (req, res) => {
    try {
      const validatedData = insertEggSchema.parse(req.body);
      const egg = await storage.createEgg(validatedData);
      res.status(201).json(egg);
    } catch (error) {
      res.status(400).json({ error: "Invalid egg data" });
    }
  });

  // Location routes
  app.get("/api/locations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.post("/api/locations", requireAdmin, logActivity('location.create', 'Created new location'), async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  // Add complex features
  
  // Allocations
  app.get("/api/allocations", requireAdmin, async (req, res) => {
    const allocations = await storage.getAllocations();
    res.json(allocations);
  });
  
  app.get("/api/nodes/:nodeId/allocations", requireAdmin, async (req, res) => {
    const allocations = await storage.getAllocationsByNode(req.params.nodeId);
    res.json(allocations);
  });
  
  app.post("/api/allocations", requireAdmin, logActivity('allocation.create'), async (req, res) => {
    try {
      const validatedData = insertAllocationSchema.parse(req.body);
      const allocation = await storage.createAllocation(validatedData);
      res.status(201).json(allocation);
    } catch (error) {
      res.status(400).json({ error: "Invalid allocation data" });
    }
  });
  
  // Server databases
  app.get("/api/servers/:id/databases", requireServerPermission('database.read'), async (req, res) => {
    const databases = await storage.getServerDatabases(req.params.id);
    res.json(databases);
  });
  
  app.post("/api/servers/:id/databases", requireServerPermission('database.create'), logActivity('database.create'), async (req, res) => {
    try {
      const validatedData = insertServerDatabaseSchema.parse({
        ...req.body,
        serverId: req.params.id
      });
      const database = await storage.createServerDatabase(validatedData);
      res.status(201).json(database);
    } catch (error) {
      res.status(400).json({ error: "Invalid database data" });
    }
  });
  
  // Server backups
  app.get("/api/servers/:id/backups", requireServerPermission('backup.read'), async (req, res) => {
    const backups = await storage.getServerBackups(req.params.id);
    res.json(backups);
  });
  
  app.post("/api/servers/:id/backups", requireServerPermission('backup.create'), logActivity('backup.create'), async (req, res) => {
    try {
      const validatedData = insertServerBackupSchema.parse({
        ...req.body,
        serverId: req.params.id
      });
      const backup = await storage.createServerBackup(validatedData);
      res.status(201).json(backup);
    } catch (error) {
      res.status(400).json({ error: "Invalid backup data" });
    }
  });
  
  // Activity logs
  app.get("/api/activity", requireAuth, async (req, res) => {
    const userId = req.user!.role === 'admin' ? undefined : req.user!.id;
    const logs = await storage.getActivityLogs(userId);
    res.json(logs);
  });
  
  app.get("/api/servers/:id/activity", requireServerAccess, async (req, res) => {
    const logs = await storage.getActivityLogs(undefined, req.params.id);
    res.json(logs);
  });

  // System stats endpoint
  app.get("/api/stats", requireAuth, async (req, res) => {
    
    try {
      const servers = await storage.getServers();
      const nodes = await storage.getNodes();
      
      const totalServers = servers.length;
      const onlineServers = servers.filter(s => s.status === 'online').length;
      const onlineNodes = nodes.filter(n => n.isOnline).length;
      
      // Calculate resource usage (simulated for now)
      const cpuUsage = Math.floor(Math.random() * 40) + 30; // 30-70%
      const memoryUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
      const diskUsage = Math.floor(Math.random() * 20) + 15; // 15-35%
      
      res.json({
        totalServers,
        onlineServers,
        totalNodes: nodes.length,
        onlineNodes,
        cpuUsage,
        memoryUsage,
        diskUsage,
        networkIn: Math.floor(Math.random() * 5) + 1, // 1-6 MB/s
        networkOut: Math.floor(Math.random() * 3) + 2, // 2-5 MB/s
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  return httpServer;
}
