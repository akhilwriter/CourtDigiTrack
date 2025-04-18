import { 
  User, InsertUser, 
  File, InsertFile, 
  FileHandover, InsertFileHandover,
  LifecycleEvent, InsertLifecycleEvent,
  fileStatusEnum
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFileByTransactionId(transactionId: string): Promise<File | undefined>;
  getFileByCNR(cnrNumber: string): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFileStatus(id: number, status: string): Promise<File | undefined>;
  getFiles(options?: { 
    status?: string; 
    caseType?: string;
    limit?: number;
    offset?: number;
  }): Promise<File[]>;
  getRecentFiles(limit?: number): Promise<File[]>;
  
  // File Handover operations
  createFileHandover(handover: InsertFileHandover): Promise<FileHandover>;
  getFileHandovers(fileId: number): Promise<FileHandover[]>;
  
  // Lifecycle operations
  createLifecycleEvent(event: InsertLifecycleEvent): Promise<LifecycleEvent>;
  getLifecycleEvents(fileId: number): Promise<LifecycleEvent[]>;
  getRecentLifecycleEvents(limit?: number): Promise<LifecycleEvent[]>;
  
  // Dashboard statistics
  getFilesCountByStatus(): Promise<{ status: string; count: number }[]>;
  getFilesCountToday(): Promise<number>;
  getFilesCountByDateRange(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private fileHandovers: Map<number, FileHandover>;
  private lifecycleEvents: Map<number, LifecycleEvent>;
  private userId: number;
  private fileId: number;
  private fileHandoverId: number;
  private lifecycleEventId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.fileHandovers = new Map();
    this.lifecycleEvents = new Map();
    this.userId = 1;
    this.fileId = 1;
    this.fileHandoverId = 1;
    this.lifecycleEventId = 1;
    
    // Add some default users
    this.addDefaultUsers();
  }

  private addDefaultUsers() {
    const defaultUsers: InsertUser[] = [
      {
        username: "admin",
        password: "admin123", // In a real app, this would be hashed
        fullName: "Admin User",
        role: "admin",
        active: true
      },
      {
        username: "operator1",
        password: "pass123",
        fullName: "Anita Sharma",
        role: "operator",
        active: true
      },
      {
        username: "operator2",
        password: "pass123",
        fullName: "Rajiv Kumar",
        role: "operator",
        active: true
      },
      {
        username: "supervisor1",
        password: "pass123",
        fullName: "Priya Desai",
        role: "supervisor",
        active: true
      }
    ];

    defaultUsers.forEach(user => this.createUser(user));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // File methods
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByTransactionId(transactionId: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.transactionId === transactionId
    );
  }

  async getFileByCNR(cnrNumber: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      (file) => file.cnrNumber === cnrNumber
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileId++;
    const now = new Date();
    const transactionId = `TRX-${now.getFullYear()}-${String(id).padStart(5, '0')}`;
    
    const file: File = {
      ...insertFile,
      id,
      transactionId,
      receivedAt: now,
      lastUpdatedAt: now,
      status: 'received'
    };

    this.files.set(id, file);
    
    // Also create initial lifecycle event
    this.createLifecycleEvent({
      fileId: id,
      status: 'received',
      userId: insertFile.receivedById,
      notes: "File received for digitization"
    });
    
    return file;
  }

  async updateFileStatus(id: number, status: string): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile: File = {
      ...file,
      status: status as any,
      lastUpdatedAt: new Date()
    };
    
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async getFiles(options: { 
    status?: string; 
    caseType?: string; 
    limit?: number;
    offset?: number;
  } = {}): Promise<File[]> {
    let files = Array.from(this.files.values());
    
    if (options.status) {
      files = files.filter(file => file.status === options.status);
    }
    
    if (options.caseType) {
      files = files.filter(file => file.caseType === options.caseType);
    }
    
    // Sort by receivedAt (most recent first)
    files.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
    
    // Apply pagination if provided
    if (options.offset !== undefined && options.limit !== undefined) {
      files = files.slice(options.offset, options.offset + options.limit);
    } else if (options.limit !== undefined) {
      files = files.slice(0, options.limit);
    }
    
    return files;
  }

  async getRecentFiles(limit: number = 10): Promise<File[]> {
    const files = Array.from(this.files.values());
    files.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());
    return files.slice(0, limit);
  }

  // File Handover methods
  async createFileHandover(insertHandover: InsertFileHandover): Promise<FileHandover> {
    const id = this.fileHandoverId++;
    const now = new Date();
    
    const handover: FileHandover = {
      ...insertHandover,
      id,
      handoverAt: now
    };
    
    this.fileHandovers.set(id, handover);
    
    // Update file status to under_scanning
    const file = await this.getFile(insertHandover.fileId);
    if (file) {
      await this.updateFileStatus(file.id, 'under_scanning');
      
      // Create lifecycle event for handover
      await this.createLifecycleEvent({
        fileId: file.id,
        status: 'under_scanning',
        userId: insertHandover.handoverById,
        notes: `File handed over to ${insertHandover.handoverToId} for scanning`
      });
    }
    
    return handover;
  }

  async getFileHandovers(fileId: number): Promise<FileHandover[]> {
    return Array.from(this.fileHandovers.values())
      .filter(handover => handover.fileId === fileId)
      .sort((a, b) => b.handoverAt.getTime() - a.handoverAt.getTime());
  }

  // Lifecycle methods
  async createLifecycleEvent(insertEvent: InsertLifecycleEvent): Promise<LifecycleEvent> {
    const id = this.lifecycleEventId++;
    const now = new Date();
    
    const event: LifecycleEvent = {
      ...insertEvent,
      id,
      timestamp: now
    };
    
    this.lifecycleEvents.set(id, event);
    return event;
  }

  async getLifecycleEvents(fileId: number): Promise<LifecycleEvent[]> {
    return Array.from(this.lifecycleEvents.values())
      .filter(event => event.fileId === fileId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentLifecycleEvents(limit: number = 10): Promise<LifecycleEvent[]> {
    const events = Array.from(this.lifecycleEvents.values());
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return events.slice(0, limit);
  }

  // Dashboard statistics
  async getFilesCountByStatus(): Promise<{ status: string; count: number }[]> {
    const statusCounts: Record<string, number> = {};
    
    // Initialize all statuses with zero count
    for (const status of fileStatusEnum.enumValues) {
      statusCounts[status] = 0;
    }
    
    // Count files by status
    for (const file of this.files.values()) {
      statusCounts[file.status]++;
    }
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  }

  async getFilesCountToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.files.values())
      .filter(file => file.receivedAt >= today)
      .length;
  }

  async getFilesCountByDateRange(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    // Initialize date map for the range
    const dateMap = new Map<string, number>();
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dateMap.set(dateString, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count files by date
    for (const file of this.files.values()) {
      const fileDate = file.receivedAt.toISOString().split('T')[0];
      if (dateMap.has(fileDate)) {
        dateMap.set(fileDate, (dateMap.get(fileDate) || 0) + 1);
      }
    }
    
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  }
}

export const storage = new MemStorage();
