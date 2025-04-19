import { 
  users, User, InsertUser, 
  fileReceipts, FileReceipt, InsertFileReceipt,
  fileHandovers, FileHandover, InsertFileHandover,
  fileLifecycles, FileLifecycle, InsertFileLifecycle
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, gte, and, sql } from "drizzle-orm";

// Define full interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(user: { id: number; username: string; fullName: string; role: string; permissions: string; password?: string }): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  getUsers(): Promise<User[]>;

  // File Receipt operations
  createFileReceipt(receipt: InsertFileReceipt): Promise<FileReceipt>;
  getFileReceipt(id: number): Promise<FileReceipt | undefined>;
  getFileReceiptByTransactionId(transactionId: string): Promise<FileReceipt | undefined>;
  getFileReceiptByCnr(cnrNumber: string): Promise<FileReceipt | undefined>;
  getAllFileReceipts(): Promise<FileReceipt[]>;
  getFileReceiptsByStatus(status: string): Promise<FileReceipt[]>;
  updateFileReceiptStatus(id: number, status: string): Promise<FileReceipt | undefined>;

  // File Handover operations
  createFileHandover(handover: InsertFileHandover): Promise<FileHandover>;
  getFileHandoversForReceipt(fileReceiptId: number): Promise<FileHandover[]>;
  getAllFileHandovers(): Promise<FileHandover[]>;

  // File Lifecycle operations
  createFileLifecycle(lifecycle: InsertFileLifecycle): Promise<FileLifecycle>;
  getFileLifecyclesForReceipt(fileReceiptId: number): Promise<FileLifecycle[]>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<{
    pendingReceipt: number;
    receivedToday: number;
    scannedToday: number;
    uploadCompleted: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fileReceipts: Map<number, FileReceipt>;
  private fileHandovers: Map<number, FileHandover>;
  private fileLifecycles: Map<number, FileLifecycle>;
  
  private userIdCounter: number;
  private fileReceiptIdCounter: number;
  private fileHandoverIdCounter: number;
  private fileLifecycleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.fileReceipts = new Map();
    this.fileHandovers = new Map();
    this.fileLifecycles = new Map();
    
    this.userIdCounter = 1;
    this.fileReceiptIdCounter = 1;
    this.fileHandoverIdCounter = 1;
    this.fileLifecycleIdCounter = 1;
    
    // Add initial admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      fullName: "Admin User",
      role: "admin"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id,
      role: user.role || 'user', // Ensure role is never undefined
      permissions: user.permissions || 'view' // Ensure permissions is never undefined
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(user: { id: number; username: string; fullName: string; role: string; permissions: string; password?: string }): Promise<User> {
    const existingUser = await this.getUser(user.id);
    if (!existingUser) {
      throw new Error(`User with ID ${user.id} not found`);
    }
    
    const updatedUser: User = {
      ...existingUser,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      ...(user.password ? { password: user.password } : {})
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    if (!this.users.has(id)) {
      return false;
    }
    
    return this.users.delete(id);
  }

  // File Receipt operations
  async createFileReceipt(receipt: InsertFileReceipt): Promise<FileReceipt> {
    const id = this.fileReceiptIdCounter++;
    const transactionId = `TRX-${new Date().getFullYear()}-${id.toString().padStart(5, '0')}`;
    const now = new Date();
    
    const newReceipt: FileReceipt = { 
      ...receipt, 
      id, 
      transactionId,
      status: receipt.status || "pending_scan",
      partyNames: receipt.partyNames || null,
      priority: receipt.priority || "normal",
      receivedAt: receipt.receivedAt || now,
      remarks: receipt.remarks || null
    };
    
    this.fileReceipts.set(id, newReceipt);
    
    // Create initial lifecycle entry
    await this.createFileLifecycle({
      fileReceiptId: id,
      status: "pending_scan",
      updatedById: receipt.receivedById,
      remarks: "File received for digitization",
      timestamp: now
    });
    
    return newReceipt;
  }

  async getFileReceipt(id: number): Promise<FileReceipt | undefined> {
    return this.fileReceipts.get(id);
  }

  async getFileReceiptByTransactionId(transactionId: string): Promise<FileReceipt | undefined> {
    return Array.from(this.fileReceipts.values()).find(
      (receipt) => receipt.transactionId === transactionId
    );
  }

  async getFileReceiptByCnr(cnrNumber: string): Promise<FileReceipt | undefined> {
    return Array.from(this.fileReceipts.values()).find(
      (receipt) => receipt.cnrNumber === cnrNumber
    );
  }

  async getAllFileReceipts(): Promise<FileReceipt[]> {
    return Array.from(this.fileReceipts.values()).sort((a, b) => {
      // Sort by most recent first
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });
  }

  async getFileReceiptsByStatus(status: string): Promise<FileReceipt[]> {
    return Array.from(this.fileReceipts.values())
      .filter(receipt => receipt.status === status)
      .sort((a, b) => {
        // Sort by most recent first
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      });
  }

  async updateFileReceiptStatus(id: number, status: string): Promise<FileReceipt | undefined> {
    const receipt = await this.getFileReceipt(id);
    if (receipt) {
      const updatedReceipt = { ...receipt, status };
      this.fileReceipts.set(id, updatedReceipt);
      return updatedReceipt;
    }
    return undefined;
  }

  // File Handover operations
  async createFileHandover(handover: InsertFileHandover): Promise<FileHandover> {
    const id = this.fileHandoverIdCounter++;
    const now = new Date();
    
    const newHandover: FileHandover = { 
      ...handover, 
      id,
      remarks: handover.remarks || null,
      handoverAt: handover.handoverAt || now
    };
    
    this.fileHandovers.set(id, newHandover);
    
    // Update file receipt status
    await this.updateFileReceiptStatus(handover.fileReceiptId, "handover");
    
    // Create lifecycle entry
    await this.createFileLifecycle({
      fileReceiptId: handover.fileReceiptId,
      status: "handover",
      updatedById: handover.handoverById,
      remarks: handover.remarks || "File handed over for scanning",
      timestamp: now
    });
    
    return newHandover;
  }

  async getFileHandoversForReceipt(fileReceiptId: number): Promise<FileHandover[]> {
    return Array.from(this.fileHandovers.values())
      .filter(handover => handover.fileReceiptId === fileReceiptId)
      .sort((a, b) => {
        // Sort by most recent first
        return new Date(b.handoverAt).getTime() - new Date(a.handoverAt).getTime();
      });
  }

  async getAllFileHandovers(): Promise<FileHandover[]> {
    return Array.from(this.fileHandovers.values()).sort((a, b) => {
      // Sort by most recent first
      return new Date(b.handoverAt).getTime() - new Date(a.handoverAt).getTime();
    });
  }

  // File Lifecycle operations
  async createFileLifecycle(lifecycle: InsertFileLifecycle): Promise<FileLifecycle> {
    const id = this.fileLifecycleIdCounter++;
    const now = new Date();
    
    const newLifecycle: FileLifecycle = { 
      ...lifecycle, 
      id,
      remarks: lifecycle.remarks || null,
      timestamp: lifecycle.timestamp || now
    };
    
    this.fileLifecycles.set(id, newLifecycle);
    return newLifecycle;
  }

  async getFileLifecyclesForReceipt(fileReceiptId: number): Promise<FileLifecycle[]> {
    return Array.from(this.fileLifecycles.values())
      .filter(lifecycle => lifecycle.fileReceiptId === fileReceiptId)
      .sort((a, b) => {
        // Sort by most recent first
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    pendingReceipt: number;
    receivedToday: number;
    scannedToday: number;
    uploadCompleted: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pendingReceipt = Array.from(this.fileReceipts.values()).filter(
      receipt => receipt.status === "pending_scan"
    ).length;
    
    const receivedToday = Array.from(this.fileReceipts.values()).filter(
      receipt => new Date(receipt.receivedAt) >= today
    ).length;
    
    const scannedToday = Array.from(this.fileLifecycles.values()).filter(
      lifecycle => 
        lifecycle.status === "scanning" && 
        new Date(lifecycle.timestamp) >= today
    ).length;
    
    const uploadCompleted = Array.from(this.fileReceipts.values()).filter(
      receipt => receipt.status === "upload_completed"
    ).length;
    
    return {
      pendingReceipt,
      receivedToday,
      scannedToday,
      uploadCompleted
    };
  }
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const defaultRole = user.role || 'user';
    const defaultPermissions = user.permissions || 'view';
    const [createdUser] = await db
      .insert(users)
      .values({ 
        ...user, 
        role: defaultRole,
        permissions: defaultPermissions 
      })
      .returning();
    return createdUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(user: { id: number; username: string; fullName: string; role: string; permissions: string; password?: string }): Promise<User> {
    // Create update object with only the fields that should be updated
    const updateData: any = {
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions
    };
    
    // Only add password if it's provided
    if (user.password) {
      updateData.password = user.password;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning();
      
    if (!updatedUser) {
      throw new Error(`User with ID ${user.id} not found`);
    }
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
      
    return true; // If no error was thrown, deletion was successful
  }

  // File Receipt operations
  async createFileReceipt(receipt: InsertFileReceipt): Promise<FileReceipt> {
    const now = new Date();
    // Generate transaction ID
    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileReceipts);
    const count = countResult[0]?.count || 0;
    
    const nextCount = Number(count) + 1;
    const transactionId = `TRX-${now.getFullYear()}-${nextCount.toString().padStart(5, '0')}`;
    
    // Create receipt with defaults
    const [newReceipt] = await db
      .insert(fileReceipts)
      .values({
        ...receipt,
        transactionId,
        status: receipt.status || "pending_scan",
        partyNames: receipt.partyNames || null,
        priority: receipt.priority || "normal",
        // Convert string date to Date object if needed
        receivedAt: typeof receipt.receivedAt === 'string' ? new Date(receipt.receivedAt) : (receipt.receivedAt || now),
        remarks: receipt.remarks || null
      })
      .returning();
    
    // Create initial lifecycle entry
    await this.createFileLifecycle({
      fileReceiptId: newReceipt.id,
      status: "pending_scan",
      updatedById: receipt.receivedById,
      remarks: "File received for digitization",
      timestamp: now
    });
    
    return newReceipt;
  }

  async getFileReceipt(id: number): Promise<FileReceipt | undefined> {
    const [receipt] = await db.select().from(fileReceipts).where(eq(fileReceipts.id, id));
    return receipt;
  }

  async getFileReceiptByTransactionId(transactionId: string): Promise<FileReceipt | undefined> {
    const [receipt] = await db
      .select()
      .from(fileReceipts)
      .where(eq(fileReceipts.transactionId, transactionId));
    return receipt;
  }

  async getFileReceiptByCnr(cnrNumber: string): Promise<FileReceipt | undefined> {
    const [receipt] = await db
      .select()
      .from(fileReceipts)
      .where(eq(fileReceipts.cnrNumber, cnrNumber));
    return receipt;
  }

  async getAllFileReceipts(): Promise<FileReceipt[]> {
    return await db
      .select()
      .from(fileReceipts)
      .orderBy(desc(fileReceipts.receivedAt));
  }

  async getFileReceiptsByStatus(status: string): Promise<FileReceipt[]> {
    return await db
      .select()
      .from(fileReceipts)
      .where(eq(fileReceipts.status, status))
      .orderBy(desc(fileReceipts.receivedAt));
  }

  async updateFileReceiptStatus(id: number, status: string): Promise<FileReceipt | undefined> {
    const [updatedReceipt] = await db
      .update(fileReceipts)
      .set({ status })
      .where(eq(fileReceipts.id, id))
      .returning();
    return updatedReceipt;
  }

  // File Handover operations
  async createFileHandover(handover: InsertFileHandover): Promise<FileHandover> {
    const now = new Date();
    
    // Create handover with defaults
    const [newHandover] = await db
      .insert(fileHandovers)
      .values({
        ...handover,
        remarks: handover.remarks || null,
        handoverAt: handover.handoverAt || now
      })
      .returning();
    
    // Update file receipt status
    await this.updateFileReceiptStatus(handover.fileReceiptId, "handover");
    
    // Create lifecycle entry
    await this.createFileLifecycle({
      fileReceiptId: handover.fileReceiptId,
      status: "handover",
      updatedById: handover.handoverById,
      remarks: handover.remarks || "File handed over for scanning",
      timestamp: now
    });
    
    return newHandover;
  }

  async getFileHandoversForReceipt(fileReceiptId: number): Promise<FileHandover[]> {
    return await db
      .select()
      .from(fileHandovers)
      .where(eq(fileHandovers.fileReceiptId, fileReceiptId))
      .orderBy(desc(fileHandovers.handoverAt));
  }

  async getAllFileHandovers(): Promise<FileHandover[]> {
    return await db
      .select()
      .from(fileHandovers)
      .orderBy(desc(fileHandovers.handoverAt));
  }

  // File Lifecycle operations
  async createFileLifecycle(lifecycle: InsertFileLifecycle): Promise<FileLifecycle> {
    const now = new Date();
    
    const [newLifecycle] = await db
      .insert(fileLifecycles)
      .values({
        ...lifecycle,
        remarks: lifecycle.remarks || null,
        timestamp: lifecycle.timestamp || now
      })
      .returning();
    
    return newLifecycle;
  }

  async getFileLifecyclesForReceipt(fileReceiptId: number): Promise<FileLifecycle[]> {
    return await db
      .select()
      .from(fileLifecycles)
      .where(eq(fileLifecycles.fileReceiptId, fileReceiptId))
      .orderBy(desc(fileLifecycles.timestamp));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{
    pendingReceipt: number;
    receivedToday: number;
    scannedToday: number;
    uploadCompleted: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get pending receipts count
    const pendingReceiptResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileReceipts)
      .where(eq(fileReceipts.status, "pending_scan"));
    const pendingReceipt = pendingReceiptResult[0]?.count || 0;
    
    // Get received today count
    const receivedTodayResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileReceipts)
      .where(gte(fileReceipts.receivedAt, today));
    const receivedToday = receivedTodayResult[0]?.count || 0;
    
    // Get scanned today count
    const scannedTodayResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileLifecycles)
      .where(
        and(
          eq(fileLifecycles.status, "scanning"),
          gte(fileLifecycles.timestamp, today)
        )
      );
    const scannedToday = scannedTodayResult[0]?.count || 0;
    
    // Get upload completed count
    const uploadCompletedResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fileReceipts)
      .where(eq(fileReceipts.status, "upload_completed"));
    const uploadCompleted = uploadCompletedResult[0]?.count || 0;
    
    return {
      pendingReceipt,
      receivedToday,
      scannedToday,
      uploadCompleted
    };
  }
}

// Create and export a database storage instance
export const storage = new DatabaseStorage();
