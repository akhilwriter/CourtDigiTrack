import { pgTable, text, serial, integer, timestamp, boolean, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table and schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"),
  permissions: text("permissions").notNull().default("view"),  // 'view' or 'edit'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
  permissions: true,
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
  receivedById: integer("received_by_id").notNull().references(() => users.id),
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
  fileReceiptId: integer("file_receipt_id").notNull().references(() => fileReceipts.id),
  handoverById: integer("handover_by_id").notNull().references(() => users.id),
  handoverToId: integer("handover_to_id").notNull().references(() => users.id),
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
  fileReceiptId: integer("file_receipt_id").notNull().references(() => fileReceipts.id),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  updatedById: integer("updated_by_id").notNull().references(() => users.id),
  remarks: text("remarks"),
});

export const insertFileLifecycleSchema = createInsertSchema(fileLifecycles).omit({
  id: true,
});

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  receivedFiles: many(fileReceipts, { relationName: "user_received_files" }),
  handoversBy: many(fileHandovers, { relationName: "user_handovers_by" }),
  handoversTo: many(fileHandovers, { relationName: "user_handovers_to" }),
  lifecycleUpdates: many(fileLifecycles, { relationName: "user_lifecycle_updates" })
}));

export const fileReceiptsRelations = relations(fileReceipts, ({ one, many }) => ({
  receivedBy: one(users, {
    fields: [fileReceipts.receivedById],
    references: [users.id],
    relationName: "user_received_files"
  }),
  handovers: many(fileHandovers),
  lifecycles: many(fileLifecycles)
}));

export const fileHandoversRelations = relations(fileHandovers, ({ one }) => ({
  fileReceipt: one(fileReceipts, {
    fields: [fileHandovers.fileReceiptId],
    references: [fileReceipts.id]
  }),
  handoverBy: one(users, {
    fields: [fileHandovers.handoverById],
    references: [users.id],
    relationName: "user_handovers_by"
  }),
  handoverTo: one(users, {
    fields: [fileHandovers.handoverToId],
    references: [users.id],
    relationName: "user_handovers_to"
  })
}));

export const fileLifecyclesRelations = relations(fileLifecycles, ({ one }) => ({
  fileReceipt: one(fileReceipts, {
    fields: [fileLifecycles.fileReceiptId],
    references: [fileReceipts.id]
  }),
  updatedBy: one(users, {
    fields: [fileLifecycles.updatedById],
    references: [users.id],
    relationName: "user_lifecycle_updates"
  })
}));

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
  pageCount: z.number().min(1, "Page count must be at least 1"),
  receivedAt: z.string().or(z.date()),
});

// Extended file handover schema with validation
export const fileHandoverFormSchema = insertFileHandoverSchema.extend({
  fileReceiptId: z.number().min(1, "File receipt is required"),
  handoverToId: z.number().min(1, "Handover recipient is required"),
  handoverMode: z.string().min(1, "Handover mode is required")
});
