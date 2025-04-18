import { pgTable, text, serial, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table and schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

// File receipt table and schemas
export const fileReceipts = pgTable("file_receipts", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  cnrNumber: text("cnr_number").notNull(),
  caseType: text("case_type").notNull(),
  caseYear: text("case_year").notNull(),
  caseNumber: text("case_number").notNull(),
  pageCount: integer("page_count").notNull(),
  partyNames: text("party_names"),
  priority: text("priority").notNull().default("normal"),
  receivedById: integer("received_by_id").notNull(),
  receivedAt: timestamp("received_at").notNull().defaultNow(),
  remarks: text("remarks"),
  status: text("status").notNull().default("pending_scan"),
});

export const insertFileReceiptSchema = createInsertSchema(fileReceipts).omit({
  id: true,
  transactionId: true,
});

// File handover table and schemas
export const fileHandovers = pgTable("file_handovers", {
  id: serial("id").primaryKey(),
  fileReceiptId: integer("file_receipt_id").notNull(),
  handoverById: integer("handover_by_id").notNull(),
  handoverToId: integer("handover_to_id").notNull(),
  handoverMode: text("handover_mode").notNull(),
  handoverAt: timestamp("handover_at").notNull().defaultNow(),
  remarks: text("remarks"),
});

export const insertFileHandoverSchema = createInsertSchema(fileHandovers).omit({
  id: true,
});

// File lifecycle tracking table and schemas
export const fileLifecycles = pgTable("file_lifecycles", {
  id: serial("id").primaryKey(),
  fileReceiptId: integer("file_receipt_id").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  updatedById: integer("updated_by_id").notNull(),
  remarks: text("remarks"),
});

export const insertFileLifecycleSchema = createInsertSchema(fileLifecycles).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FileReceipt = typeof fileReceipts.$inferSelect;
export type InsertFileReceipt = z.infer<typeof insertFileReceiptSchema>;

export type FileHandover = typeof fileHandovers.$inferSelect;
export type InsertFileHandover = z.infer<typeof insertFileHandoverSchema>;

export type FileLifecycle = typeof fileLifecycles.$inferSelect;
export type InsertFileLifecycle = z.infer<typeof insertFileLifecycleSchema>;

// Extended file receipt schema with validation
export const fileReceiptFormSchema = insertFileReceiptSchema.extend({
  cnrNumber: z.string().min(5, "CNR Number must be at least 5 characters"),
  caseType: z.string().min(1, "Case type is required"),
  caseYear: z.string().min(4, "Please enter a valid year").max(4),
  caseNumber: z.string().min(1, "Case number is required"),
  pageCount: z.number().min(1, "Page count must be at least 1")
});

// Extended file handover schema with validation
export const fileHandoverFormSchema = insertFileHandoverSchema.extend({
  fileReceiptId: z.number().min(1, "File receipt is required"),
  handoverToId: z.number().min(1, "Handover recipient is required"),
  handoverMode: z.string().min(1, "Handover mode is required")
});
