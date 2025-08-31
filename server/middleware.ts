import { Request, Response, NextFunction } from "express";
import { User } from "@shared/schema";
import { storage } from "./storage";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Middleware to ensure user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// Middleware to ensure user is an admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Middleware to check if user owns a server or is admin
export async function requireServerAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const serverId = req.params.id || req.params.serverId;
  if (!serverId) {
    return res.status(400).json({ error: "Server ID required" });
  }
  
  // Admin has access to all servers
  if (req.user.role === "admin") {
    return next();
  }
  
  try {
    const server = await storage.getServer(serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }
    
    // Check if user owns the server
    if (server.ownerId === req.user.id) {
      return next();
    }
    
    // Check if user is a subuser with access
    const subusers = await storage.getServerSubusers(serverId);
    const hasAccess = subusers.some(subuser => subuser.userId === req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "Server access denied" });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify server access" });
  }
}

// Middleware to check specific server permissions for subusers
export function requireServerPermission(permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const serverId = req.params.id || req.params.serverId;
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    
    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }
    
    try {
      const server = await storage.getServer(serverId);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      
      // Server owner has all permissions
      if (server.ownerId === req.user.id) {
        return next();
      }
      
      // Check subuser permissions
      const subusers = await storage.getServerSubusers(serverId);
      const subuser = subusers.find(su => su.userId === req.user.id);
      
      if (!subuser) {
        return res.status(403).json({ error: "Server access denied" });
      }
      
      const permissions = subuser.permissions as string[];
      if (!permissions.includes(permission)) {
        return res.status(403).json({ error: `Permission '${permission}' required` });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: "Failed to verify permissions" });
    }
  };
}

// Activity logging middleware
export function logActivity(event: string, description?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(body: any) {
      // Only log successful requests (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const serverId = req.params.id || req.params.serverId || undefined;
        
        storage.createActivityLog({
          event,
          userId: req.user?.id,
          serverId,
          description: description || `${event} performed`,
          properties: {
            method: req.method,
            path: req.path,
            params: req.params,
            body: req.method !== 'GET' ? req.body : undefined,
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        }).catch(console.error); // Log errors but don't fail the request
      }
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}

// Rate limiting middleware (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let entry = rateLimitMap.get(key);
    
    if (!entry || entry.resetTime < windowStart) {
      entry = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(key, entry);
      return next();
    }
    
    entry.count++;
    
    if (entry.count > maxRequests) {
      return res.status(429).json({ 
        error: "Too many requests", 
        retryAfter: Math.ceil((entry.resetTime - now) / 1000) 
      });
    }
    
    next();
  };
}