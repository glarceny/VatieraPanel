import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().default("user"), // admin, user
  language: text("language").notNull().default("en"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const nodes = pgTable("nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fqdn: text("fqdn").notNull(), // Fully qualified domain name
  scheme: text("scheme").notNull().default("https"), // http or https
  locationId: varchar("location_id").references(() => locations.id),
  memory: integer("memory").notNull(), // Total memory in MB
  disk: integer("disk").notNull(), // Total disk in MB
  daemonToken: text("daemon_token").notNull(),
  daemonPort: integer("daemon_port").notNull().default(8080),
  isOnline: boolean("is_online").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortCode: text("short_code").notNull().unique(),
  description: text("description").notNull(),
});

export const eggs = pgTable("eggs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  dockerImage: text("docker_image").notNull(),
  startup: text("startup").notNull(),
  configFiles: jsonb("config_files").default('{}'),
  configStartup: jsonb("config_startup").default('{}'),
  configLogs: jsonb("config_logs").default('{}'),
  configStop: text("config_stop"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servers = pgTable("servers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  nodeId: varchar("node_id").notNull().references(() => nodes.id),
  eggId: varchar("egg_id").notNull().references(() => eggs.id),
  status: text("status").notNull().default("offline"), // online, offline, starting, stopping
  memory: integer("memory").notNull(), // Allocated memory in MB
  disk: integer("disk").notNull(), // Allocated disk in MB
  cpu: integer("cpu").notNull(), // CPU percentage limit
  dockerImage: text("docker_image").notNull(),
  startup: text("startup").notNull(),
  environment: jsonb("environment").default('{}'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const serverLogs = pgTable("server_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Allocations for IP/Port management
export const allocations = pgTable("allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nodeId: varchar("node_id").notNull().references(() => nodes.id),
  ip: text("ip").notNull(),
  port: integer("port").notNull(),
  alias: text("alias"),
  serverId: varchar("server_id").references(() => servers.id),
  isAssigned: boolean("is_assigned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Server databases
export const serverDatabases = pgTable("server_databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  databaseName: text("database_name").notNull(),
  username: text("username").notNull(),
  remote: text("remote").notNull().default("%"),
  maxConnections: integer("max_connections").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Server backups
export const serverBackups = pgTable("server_backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  ignoredFiles: text("ignored_files").default(""),
  checksum: text("checksum"),
  bytes: integer("bytes").default(0),
  isSuccessful: boolean("is_successful").default(false),
  isLocked: boolean("is_locked").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Server variables
export const serverVariables = pgTable("server_variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  variableName: text("variable_name").notNull(),
  variableValue: text("variable_value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Subusers for server permissions
export const serverSubusers = pgTable("server_subusers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  permissions: jsonb("permissions").notNull().default('[]'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// API keys
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  identifier: text("identifier").notNull().unique(),
  token: text("token").notNull(),
  allowedIps: jsonb("allowed_ips").default('[]'),
  memo: text("memo"),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  event: text("event").notNull(),
  userId: varchar("user_id").references(() => users.id),
  serverId: varchar("server_id").references(() => servers.id),
  description: text("description"),
  properties: jsonb("properties").default('{}'),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  servers: many(servers),
  serverSubusers: many(serverSubusers),
  apiKeys: many(apiKeys),
  activityLogs: many(activityLogs),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  location: one(locations, {
    fields: [nodes.locationId],
    references: [locations.id],
  }),
  servers: many(servers),
  allocations: many(allocations),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  nodes: many(nodes),
}));

export const eggsRelations = relations(eggs, ({ many }) => ({
  servers: many(servers),
}));

export const serversRelations = relations(servers, ({ one, many }) => ({
  owner: one(users, {
    fields: [servers.ownerId],
    references: [users.id],
  }),
  node: one(nodes, {
    fields: [servers.nodeId],
    references: [nodes.id],
  }),
  egg: one(eggs, {
    fields: [servers.eggId],
    references: [eggs.id],
  }),
  logs: many(serverLogs),
  allocations: many(allocations),
  databases: many(serverDatabases),
  backups: many(serverBackups),
  variables: many(serverVariables),
  subusers: many(serverSubusers),
}));

export const serverLogsRelations = relations(serverLogs, ({ one }) => ({
  server: one(servers, {
    fields: [serverLogs.serverId],
    references: [servers.id],
  }),
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  node: one(nodes, {
    fields: [allocations.nodeId],
    references: [nodes.id],
  }),
  server: one(servers, {
    fields: [allocations.serverId],
    references: [servers.id],
  }),
}));

export const serverDatabasesRelations = relations(serverDatabases, ({ one }) => ({
  server: one(servers, {
    fields: [serverDatabases.serverId],
    references: [servers.id],
  }),
}));

export const serverBackupsRelations = relations(serverBackups, ({ one }) => ({
  server: one(servers, {
    fields: [serverBackups.serverId],
    references: [servers.id],
  }),
}));

export const serverVariablesRelations = relations(serverVariables, ({ one }) => ({
  server: one(servers, {
    fields: [serverVariables.serverId],
    references: [servers.id],
  }),
}));

export const serverSubusersRelations = relations(serverSubusers, ({ one }) => ({
  server: one(servers, {
    fields: [serverSubusers.serverId],
    references: [servers.id],
  }),
  user: one(users, {
    fields: [serverSubusers.userId],
    references: [users.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  server: one(servers, {
    fields: [activityLogs.serverId],
    references: [servers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
  createdAt: true,
  isOnline: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertEggSchema = createInsertSchema(eggs).omit({
  id: true,
  createdAt: true,
});

export const insertServerSchema = createInsertSchema(servers).omit({
  id: true,
  createdAt: true,
});

export const insertServerLogSchema = createInsertSchema(serverLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  createdAt: true,
  isAssigned: true,
});

export const insertServerDatabaseSchema = createInsertSchema(serverDatabases).omit({
  id: true,
  createdAt: true,
});

export const insertServerBackupSchema = createInsertSchema(serverBackups).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  isSuccessful: true,
});

export const insertServerVariableSchema = createInsertSchema(serverVariables).omit({
  id: true,
  createdAt: true,
});

export const insertServerSubuserSchema = createInsertSchema(serverSubusers).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Node = typeof nodes.$inferSelect;
export type InsertNode = z.infer<typeof insertNodeSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Egg = typeof eggs.$inferSelect;
export type InsertEgg = z.infer<typeof insertEggSchema>;

export type Server = typeof servers.$inferSelect;
export type InsertServer = z.infer<typeof insertServerSchema>;

export type ServerLog = typeof serverLogs.$inferSelect;
export type InsertServerLog = z.infer<typeof insertServerLogSchema>;

export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;

export type ServerDatabase = typeof serverDatabases.$inferSelect;
export type InsertServerDatabase = z.infer<typeof insertServerDatabaseSchema>;

export type ServerBackup = typeof serverBackups.$inferSelect;
export type InsertServerBackup = z.infer<typeof insertServerBackupSchema>;

export type ServerVariable = typeof serverVariables.$inferSelect;
export type InsertServerVariable = z.infer<typeof insertServerVariableSchema>;

export type ServerSubuser = typeof serverSubusers.$inferSelect;
export type InsertServerSubuser = z.infer<typeof insertServerSubuserSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Server with relations
export type ServerWithRelations = Server & {
  owner: User;
  node: Node;
  egg: Egg;
};

// Node with relations
export type NodeWithRelations = Node & {
  location: Location | null;
  servers: Server[];
};

// Enhanced server with all relations
export type ServerWithFullRelations = Server & {
  owner: User;
  node: NodeWithRelations;
  egg: Egg;
  allocations: Allocation[];
  databases: ServerDatabase[];
  backups: ServerBackup[];
  variables: ServerVariable[];
  subusers: (ServerSubuser & { user: User })[];
};

// Permission constants
export const PERMISSIONS = {
  // Server management
  'server.console': 'Access server console',
  'server.start': 'Start server',
  'server.stop': 'Stop server',
  'server.restart': 'Restart server',
  'server.kill': 'Kill server process',
  'server.send-command': 'Send console commands',
  'server.edit-startup': 'Edit startup settings',
  'server.edit-settings': 'Edit server settings',
  'server.reinstall': 'Reinstall server',
  'server.delete': 'Delete server',
  
  // File management
  'files.read': 'Read files and directories',
  'files.write': 'Create and edit files',
  'files.delete': 'Delete files and directories',
  'files.upload': 'Upload files',
  'files.download': 'Download files',
  'files.archive': 'Create archives',
  'files.extract': 'Extract archives',
  
  // Database management
  'database.create': 'Create databases',
  'database.read': 'View databases',
  'database.update': 'Edit databases',
  'database.delete': 'Delete databases',
  
  // Backup management
  'backup.create': 'Create backups',
  'backup.read': 'View backups',
  'backup.restore': 'Restore backups',
  'backup.delete': 'Delete backups',
  'backup.download': 'Download backups',
  
  // User management
  'user.create': 'Create subusers',
  'user.read': 'View subusers',
  'user.update': 'Edit subusers',
  'user.delete': 'Delete subusers',
  
  // Allocation management
  'allocation.create': 'Create allocations',
  'allocation.read': 'View allocations',
  'allocation.update': 'Edit allocations',
  'allocation.delete': 'Delete allocations',
} as const;

export type Permission = keyof typeof PERMISSIONS;
