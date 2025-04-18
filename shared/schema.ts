import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'operator', 'supervisor']);
export const caseTypeEnum = pgEnum('case_type', ['civil', 'criminal', 'writ', 'appeal', 'revision', 'other']);
export const priorityEnum = pgEnum('priority', ['normal', 'high', 'urgent']);
export const fileStatusEnum = pgEnum('file_status', [
  'received', 
  'under_scanning', 
  'scanning_completed',
  'qc_pending',
  'qc_done',
  'upload_pending',
  'upload_completed'
]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default('operator'),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Files
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  cnrNumber: text("cnr_number").notNull(),
  caseType: caseTypeEnum("case_type").notNull(),
  caseYear: integer("case_year").notNull(),
  caseNumber: text("case_number").notNull(),
  pageCount: integer("page_count").notNull(),
  receivedById: integer("received_by_id").notNull().references(() => users.id),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  priority: priorityEnum("priority").notNull().default('normal'),
  status: fileStatusEnum("status").notNull().default('received'),
  notes: text("notes"),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
});

// File Handovers
export const fileHandovers = pgTable("file_handovers", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => files.id),
  handoverById: integer("handover_by_id").notNull().references(() => users.id),
  handoverToId: integer("handover_to_id").notNull().references(() => users.id),
  handoverAt: timestamp("handover_at").notNull().defaultNow(),
  handoverMode: text("handover_mode").notNull().default('manual'),
  notes: text("notes"),
});

// Lifecycle Events
export const lifecycleEvents = pgTable("lifecycle_events", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull().references(() => files.id),
  status: fileStatusEnum("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id),
  notes: text("notes"),
});

// Create Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  transactionId: true, // Generated server-side
  receivedAt: true,
  lastUpdatedAt: true
});

export const insertFileHandoverSchema = createInsertSchema(fileHandovers).omit({
  id: true,
  handoverAt: true
});

export const insertLifecycleEventSchema = createInsertSchema(lifecycleEvents).omit({
  id: true,
  timestamp: true
});

// Additional validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;

export type FileHandover = typeof fileHandovers.$inferSelect;
export type InsertFileHandover = z.infer<typeof insertFileHandoverSchema>;

export type LifecycleEvent = typeof lifecycleEvents.$inferSelect;
export type InsertLifecycleEvent = z.infer<typeof insertLifecycleEventSchema>;

export type FileStatus = typeof fileStatusEnum.enumValues;
export type CaseType = typeof caseTypeEnum.enumValues;
export type Priority = typeof priorityEnum.enumValues;
export type UserRole = typeof userRoleEnum.enumValues;

export type Login = z.infer<typeof loginSchema>;
