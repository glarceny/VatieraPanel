import { 
  users, nodes, locations, eggs, servers, serverLogs, allocations, serverDatabases, 
  serverBackups, serverVariables, serverSubusers, apiKeys, activityLogs,
  type User, type InsertUser, type Node, type InsertNode, type Location, type InsertLocation, 
  type Egg, type InsertEgg, type Server, type InsertServer, type ServerLog, type InsertServerLog, 
  type Allocation, type InsertAllocation, type ServerDatabase, type InsertServerDatabase,
  type ServerBackup, type InsertServerBackup, type ServerVariable, type InsertServerVariable,
  type ServerSubuser, type InsertServerSubuser, type ApiKey, type InsertApiKey,
  type ActivityLog, type InsertActivityLog, type ServerWithRelations, type NodeWithRelations,
  type ServerWithFullRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  // Node methods
  getNodes(): Promise<NodeWithRelations[]>;
  getNode(id: string): Promise<NodeWithRelations | undefined>;
  createNode(node: InsertNode): Promise<Node>;
  updateNode(id: string, updates: Partial<Node>): Promise<Node>;
  deleteNode(id: string): Promise<void>;
  updateNodeStatus(id: string, isOnline: boolean): Promise<void>;
  
  // Location methods
  getLocations(): Promise<Location[]>;
  getLocation(id: string): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: string, updates: Partial<Location>): Promise<Location>;
  deleteLocation(id: string): Promise<void>;
  
  // Egg methods
  getEggs(): Promise<Egg[]>;
  getEgg(id: string): Promise<Egg | undefined>;
  createEgg(egg: InsertEgg): Promise<Egg>;
  updateEgg(id: string, updates: Partial<Egg>): Promise<Egg>;
  deleteEgg(id: string): Promise<void>;
  
  // Server methods
  getServers(): Promise<ServerWithRelations[]>;
  getServersByUser(userId: string): Promise<ServerWithRelations[]>;
  getServer(id: string): Promise<ServerWithRelations | undefined>;
  getServerWithFullDetails(id: string): Promise<ServerWithFullRelations | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: string, updates: Partial<Server>): Promise<Server>;
  deleteServer(id: string): Promise<void>;
  updateServerStatus(id: string, status: string): Promise<void>;
  
  // Server logs
  getServerLogs(serverId: string, limit?: number): Promise<ServerLog[]>;
  createServerLog(log: InsertServerLog): Promise<ServerLog>;
  
  // Allocations
  getAllocations(): Promise<Allocation[]>;
  getAllocationsByNode(nodeId: string): Promise<Allocation[]>;
  getAllocationsByServer(serverId: string): Promise<Allocation[]>;
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  updateAllocation(id: string, updates: Partial<Allocation>): Promise<Allocation>;
  deleteAllocation(id: string): Promise<void>;
  assignAllocation(id: string, serverId: string): Promise<void>;
  unassignAllocation(id: string): Promise<void>;
  
  // Server databases
  getServerDatabases(serverId: string): Promise<ServerDatabase[]>;
  createServerDatabase(database: InsertServerDatabase): Promise<ServerDatabase>;
  updateServerDatabase(id: string, updates: Partial<ServerDatabase>): Promise<ServerDatabase>;
  deleteServerDatabase(id: string): Promise<void>;
  
  // Server backups
  getServerBackups(serverId: string): Promise<ServerBackup[]>;
  createServerBackup(backup: InsertServerBackup): Promise<ServerBackup>;
  updateServerBackup(id: string, updates: Partial<ServerBackup>): Promise<ServerBackup>;
  deleteServerBackup(id: string): Promise<void>;
  
  // Server variables
  getServerVariables(serverId: string): Promise<ServerVariable[]>;
  createServerVariable(variable: InsertServerVariable): Promise<ServerVariable>;
  updateServerVariable(id: string, updates: Partial<ServerVariable>): Promise<ServerVariable>;
  deleteServerVariable(id: string): Promise<void>;
  
  // Server subusers
  getServerSubusers(serverId: string): Promise<(ServerSubuser & { user: User })[]>;
  createServerSubuser(subuser: InsertServerSubuser): Promise<ServerSubuser>;
  updateServerSubuser(id: string, updates: Partial<ServerSubuser>): Promise<ServerSubuser>;
  deleteServerSubuser(id: string): Promise<void>;
  
  // API keys
  getApiKeys(userId: string): Promise<ApiKey[]>;
  getApiKey(identifier: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  
  // Activity logs
  getActivityLogs(userId?: string, serverId?: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Node methods
  async getNodes(): Promise<NodeWithRelations[]> {
    return await db.query.nodes.findMany({
      with: {
        location: true,
        servers: true,
      },
    });
  }

  async getNode(id: string): Promise<NodeWithRelations | undefined> {
    return await db.query.nodes.findFirst({
      where: eq(nodes.id, id),
      with: {
        location: true,
        servers: true,
      },
    });
  }

  async createNode(insertNode: InsertNode): Promise<Node> {
    const [node] = await db
      .insert(nodes)
      .values(insertNode)
      .returning();
    return node;
  }

  async updateNodeStatus(id: string, isOnline: boolean): Promise<void> {
    await db
      .update(nodes)
      .set({ isOnline })
      .where(eq(nodes.id, id));
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values(insertLocation)
      .returning();
    return location;
  }

  // Egg methods
  async getEggs(): Promise<Egg[]> {
    return await db.select().from(eggs);
  }

  async getEgg(id: string): Promise<Egg | undefined> {
    const [egg] = await db.select().from(eggs).where(eq(eggs.id, id));
    return egg || undefined;
  }

  async createEgg(insertEgg: InsertEgg): Promise<Egg> {
    const [egg] = await db
      .insert(eggs)
      .values(insertEgg)
      .returning();
    return egg;
  }

  // Server methods
  async getServers(): Promise<ServerWithRelations[]> {
    return await db.query.servers.findMany({
      with: {
        owner: true,
        node: { with: { location: true } },
        egg: true,
      },
    });
  }

  async getServersByUser(userId: string): Promise<ServerWithRelations[]> {
    return await db.query.servers.findMany({
      where: eq(servers.ownerId, userId),
      with: {
        owner: true,
        node: { with: { location: true } },
        egg: true,
      },
    });
  }

  async getServer(id: string): Promise<ServerWithRelations | undefined> {
    return await db.query.servers.findFirst({
      where: eq(servers.id, id),
      with: {
        owner: true,
        node: { with: { location: true } },
        egg: true,
      },
    });
  }

  async getServerWithFullDetails(id: string): Promise<ServerWithFullRelations | undefined> {
    return await db.query.servers.findFirst({
      where: eq(servers.id, id),
      with: {
        owner: true,
        node: { with: { location: true } },
        egg: true,
        allocations: true,
        databases: true,
        backups: true,
        variables: true,
        subusers: { with: { user: true } },
      },
    }) as ServerWithFullRelations | undefined;
  }

  async createServer(insertServer: InsertServer): Promise<Server> {
    const [server] = await db
      .insert(servers)
      .values(insertServer)
      .returning();
    return server;
  }

  async updateServerStatus(id: string, status: string): Promise<void> {
    await db
      .update(servers)
      .set({ status })
      .where(eq(servers.id, id));
  }

  // Server logs
  async getServerLogs(serverId: string, limit: number = 100): Promise<ServerLog[]> {
    return await db
      .select()
      .from(serverLogs)
      .where(eq(serverLogs.serverId, serverId))
      .orderBy(desc(serverLogs.timestamp))
      .limit(limit);
  }

  async createServerLog(insertLog: InsertServerLog): Promise<ServerLog> {
    const [log] = await db
      .insert(serverLogs)
      .values(insertLog)
      .returning();
    return log;
  }

  // User methods implementation
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  // Node methods implementation
  async updateNode(id: string, updates: Partial<Node>): Promise<Node> {
    const [node] = await db
      .update(nodes)
      .set(updates)
      .where(eq(nodes.id, id))
      .returning();
    return node;
  }

  async deleteNode(id: string): Promise<void> {
    await db.delete(nodes).where(eq(nodes.id, id));
  }

  // Location methods implementation
  async getLocation(id: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async updateLocation(id: string, updates: Partial<Location>): Promise<Location> {
    const [location] = await db
      .update(locations)
      .set(updates)
      .where(eq(locations.id, id))
      .returning();
    return location;
  }

  async deleteLocation(id: string): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Egg methods implementation
  async updateEgg(id: string, updates: Partial<Egg>): Promise<Egg> {
    const [egg] = await db
      .update(eggs)
      .set(updates)
      .where(eq(eggs.id, id))
      .returning();
    return egg;
  }

  async deleteEgg(id: string): Promise<void> {
    await db.delete(eggs).where(eq(eggs.id, id));
  }

  // Server methods implementation
  async updateServer(id: string, updates: Partial<Server>): Promise<Server> {
    const [server] = await db
      .update(servers)
      .set(updates)
      .where(eq(servers.id, id))
      .returning();
    return server;
  }

  async deleteServer(id: string): Promise<void> {
    await db.delete(servers).where(eq(servers.id, id));
  }

  // Allocations implementation
  async getAllocations(): Promise<Allocation[]> {
    return await db.select().from(allocations);
  }

  async getAllocationsByNode(nodeId: string): Promise<Allocation[]> {
    return await db.select().from(allocations).where(eq(allocations.nodeId, nodeId));
  }

  async getAllocationsByServer(serverId: string): Promise<Allocation[]> {
    return await db.select().from(allocations).where(eq(allocations.serverId, serverId));
  }

  async createAllocation(insertAllocation: InsertAllocation): Promise<Allocation> {
    const [allocation] = await db
      .insert(allocations)
      .values(insertAllocation)
      .returning();
    return allocation;
  }

  async updateAllocation(id: string, updates: Partial<Allocation>): Promise<Allocation> {
    const [allocation] = await db
      .update(allocations)
      .set(updates)
      .where(eq(allocations.id, id))
      .returning();
    return allocation;
  }

  async deleteAllocation(id: string): Promise<void> {
    await db.delete(allocations).where(eq(allocations.id, id));
  }

  async assignAllocation(id: string, serverId: string): Promise<void> {
    await db
      .update(allocations)
      .set({ serverId, isAssigned: true })
      .where(eq(allocations.id, id));
  }

  async unassignAllocation(id: string): Promise<void> {
    await db
      .update(allocations)
      .set({ serverId: null, isAssigned: false })
      .where(eq(allocations.id, id));
  }

  // Server databases implementation
  async getServerDatabases(serverId: string): Promise<ServerDatabase[]> {
    return await db.select().from(serverDatabases).where(eq(serverDatabases.serverId, serverId));
  }

  async createServerDatabase(insertDatabase: InsertServerDatabase): Promise<ServerDatabase> {
    const [database] = await db
      .insert(serverDatabases)
      .values(insertDatabase)
      .returning();
    return database;
  }

  async updateServerDatabase(id: string, updates: Partial<ServerDatabase>): Promise<ServerDatabase> {
    const [database] = await db
      .update(serverDatabases)
      .set(updates)
      .where(eq(serverDatabases.id, id))
      .returning();
    return database;
  }

  async deleteServerDatabase(id: string): Promise<void> {
    await db.delete(serverDatabases).where(eq(serverDatabases.id, id));
  }

  // Server backups implementation
  async getServerBackups(serverId: string): Promise<ServerBackup[]> {
    return await db
      .select()
      .from(serverBackups)
      .where(eq(serverBackups.serverId, serverId))
      .orderBy(desc(serverBackups.createdAt));
  }

  async createServerBackup(insertBackup: InsertServerBackup): Promise<ServerBackup> {
    const [backup] = await db
      .insert(serverBackups)
      .values(insertBackup)
      .returning();
    return backup;
  }

  async updateServerBackup(id: string, updates: Partial<ServerBackup>): Promise<ServerBackup> {
    const [backup] = await db
      .update(serverBackups)
      .set(updates)
      .where(eq(serverBackups.id, id))
      .returning();
    return backup;
  }

  async deleteServerBackup(id: string): Promise<void> {
    await db.delete(serverBackups).where(eq(serverBackups.id, id));
  }

  // Server variables implementation
  async getServerVariables(serverId: string): Promise<ServerVariable[]> {
    return await db.select().from(serverVariables).where(eq(serverVariables.serverId, serverId));
  }

  async createServerVariable(insertVariable: InsertServerVariable): Promise<ServerVariable> {
    const [variable] = await db
      .insert(serverVariables)
      .values(insertVariable)
      .returning();
    return variable;
  }

  async updateServerVariable(id: string, updates: Partial<ServerVariable>): Promise<ServerVariable> {
    const [variable] = await db
      .update(serverVariables)
      .set(updates)
      .where(eq(serverVariables.id, id))
      .returning();
    return variable;
  }

  async deleteServerVariable(id: string): Promise<void> {
    await db.delete(serverVariables).where(eq(serverVariables.id, id));
  }

  // Server subusers implementation
  async getServerSubusers(serverId: string): Promise<(ServerSubuser & { user: User })[]> {
    return await db.query.serverSubusers.findMany({
      where: eq(serverSubusers.serverId, serverId),
      with: {
        user: true,
      },
    });
  }

  async createServerSubuser(insertSubuser: InsertServerSubuser): Promise<ServerSubuser> {
    const [subuser] = await db
      .insert(serverSubusers)
      .values(insertSubuser)
      .returning();
    return subuser;
  }

  async updateServerSubuser(id: string, updates: Partial<ServerSubuser>): Promise<ServerSubuser> {
    const [subuser] = await db
      .update(serverSubusers)
      .set(updates)
      .where(eq(serverSubusers.id, id))
      .returning();
    return subuser;
  }

  async deleteServerSubuser(id: string): Promise<void> {
    await db.delete(serverSubusers).where(eq(serverSubusers.id, id));
  }

  // API keys implementation
  async getApiKeys(userId: string): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
  }

  async getApiKey(identifier: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.identifier, identifier));
    return apiKey || undefined;
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db
      .insert(apiKeys)
      .values(insertApiKey)
      .returning();
    return apiKey;
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const [apiKey] = await db
      .update(apiKeys)
      .set(updates)
      .where(eq(apiKeys.id, id))
      .returning();
    return apiKey;
  }

  async deleteApiKey(id: string): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Activity logs implementation
  async getActivityLogs(userId?: string, serverId?: string, limit: number = 100): Promise<ActivityLog[]> {
    if (userId && serverId) {
      return await db
        .select()
        .from(activityLogs)
        .where(and(eq(activityLogs.userId, userId), eq(activityLogs.serverId, serverId)))
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit);
    } else if (userId) {
      return await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.userId, userId))
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit);
    } else if (serverId) {
      return await db
        .select()
        .from(activityLogs)
        .where(eq(activityLogs.serverId, serverId))
        .orderBy(desc(activityLogs.timestamp))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLogs)
      .values(insertLog)
      .returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
