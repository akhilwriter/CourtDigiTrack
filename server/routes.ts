import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  fileReceiptFormSchema, 
  fileHandoverFormSchema,
  insertFileLifecycleSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // AUTH ROUTES
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real app, we would set up a session or JWT here
      // For simplicity, we'll just return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // USER ROUTES
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords before sending
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Remove password before sending response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update user endpoint
  app.put("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // If updating username, check if it's unique
      if (req.body.username && req.body.username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(req.body.username);
        if (userWithSameUsername && userWithSameUsername.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // Create update object with only fields that are provided
      const updateData = {
        id: userId,
        username: req.body.username || existingUser.username,
        fullName: req.body.fullName || existingUser.fullName,
        role: req.body.role || existingUser.role,
        permissions: req.body.permissions || existingUser.permissions || 'view',
        ...(req.body.password ? { password: req.body.password } : {})
      };
      
      const updatedUser = await storage.updateUser(updateData);
      
      // Remove password before sending response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Delete user endpoint
  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting the admin user with ID 1
      if (userId === 1) {
        return res.status(403).json({ message: "Cannot delete admin user" });
      }
      
      await storage.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // FILE RECEIPT ROUTES
  app.get("/api/file-receipts", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      
      let fileReceipts;
      if (status) {
        fileReceipts = await storage.getFileReceiptsByStatus(status);
      } else {
        fileReceipts = await storage.getAllFileReceipts();
      }
      
      res.json(fileReceipts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file receipts" });
    }
  });

  app.get("/api/file-receipts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const fileReceipt = await storage.getFileReceipt(id);
      if (!fileReceipt) {
        return res.status(404).json({ message: "File receipt not found" });
      }
      
      res.json(fileReceipt);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file receipt" });
    }
  });

  app.post("/api/file-receipts", async (req: Request, res: Response) => {
    try {
      console.log("Received file receipt data:", JSON.stringify(req.body, null, 2));
      const fileReceiptData = fileReceiptFormSchema.parse(req.body);
      console.log("Parsed file receipt data:", JSON.stringify(fileReceiptData, null, 2));
      const fileReceipt = await storage.createFileReceipt(fileReceiptData);
      res.status(201).json(fileReceipt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid file receipt data", errors: error.errors });
      }
      console.error("Error creating file receipt:", error);
      res.status(500).json({ message: "Failed to create file receipt" });
    }
  });
  
  // Update file receipt endpoint
  app.put("/api/file-receipts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const fileReceipt = await storage.getFileReceipt(id);
      if (!fileReceipt) {
        return res.status(404).json({ message: "File receipt not found" });
      }
      
      // Only allow updating certain fields
      const updateData = {
        id,
        priority: req.body.priority || fileReceipt.priority,
        partyNames: req.body.partyNames || fileReceipt.partyNames,
        remarks: req.body.remarks || fileReceipt.remarks
      };
      
      const updatedReceipt = await storage.updateFileReceipt(updateData);
      res.json(updatedReceipt);
    } catch (error) {
      console.error("Error updating file receipt:", error);
      res.status(500).json({ message: "Failed to update file receipt" });
    }
  });

  // FILE HANDOVER ROUTES
  app.get("/api/file-handovers", async (req: Request, res: Response) => {
    try {
      const fileReceiptId = req.query.fileReceiptId ? parseInt(req.query.fileReceiptId as string) : undefined;
      
      let fileHandovers;
      if (fileReceiptId && !isNaN(fileReceiptId)) {
        fileHandovers = await storage.getFileHandoversForReceipt(fileReceiptId);
      } else {
        fileHandovers = await storage.getAllFileHandovers();
      }
      
      res.json(fileHandovers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file handovers" });
    }
  });

  app.post("/api/file-handovers", async (req: Request, res: Response) => {
    try {
      const fileHandoverData = fileHandoverFormSchema.parse(req.body);
      
      // Verify that the file receipt exists
      const fileReceipt = await storage.getFileReceipt(fileHandoverData.fileReceiptId);
      if (!fileReceipt) {
        return res.status(404).json({ message: "File receipt not found" });
      }
      
      // Verify that the file is in a state that can be handed over
      if (fileReceipt.status !== "pending_scan") {
        return res.status(400).json({ message: "File is not in a state that can be handed over" });
      }
      
      const fileHandover = await storage.createFileHandover(fileHandoverData);
      res.status(201).json(fileHandover);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file handover data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create file handover" });
    }
  });

  // FILE LIFECYCLE ROUTES
  app.get("/api/file-lifecycles/:fileReceiptId", async (req: Request, res: Response) => {
    try {
      const fileReceiptId = parseInt(req.params.fileReceiptId);
      if (isNaN(fileReceiptId)) {
        return res.status(400).json({ message: "Invalid file receipt ID format" });
      }
      
      const fileLifecycles = await storage.getFileLifecyclesForReceipt(fileReceiptId);
      res.json(fileLifecycles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch file lifecycles" });
    }
  });

  app.post("/api/file-lifecycles", async (req: Request, res: Response) => {
    try {
      const fileLifecycleData = insertFileLifecycleSchema.parse(req.body);
      
      // Verify that the file receipt exists
      const fileReceipt = await storage.getFileReceipt(fileLifecycleData.fileReceiptId);
      if (!fileReceipt) {
        return res.status(404).json({ message: "File receipt not found" });
      }
      
      // Update the file receipt status
      await storage.updateFileReceiptStatus(fileReceipt.id, fileLifecycleData.status);
      
      const fileLifecycle = await storage.createFileLifecycle(fileLifecycleData);
      res.status(201).json(fileLifecycle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file lifecycle data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create file lifecycle" });
    }
  });

  // DASHBOARD STATS ROUTE
  app.get("/api/stats/dashboard", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });
  
  // INVENTORY STATS ROUTE
  app.get("/api/stats/inventory", async (req: Request, res: Response) => {
    try {
      // Get all file receipts
      const fileReceipts = await storage.getAllFileReceipts();
      
      // Calculate counts by status
      const pendingScan = fileReceipts.filter(file => file.status === 'pending_scan').length;
      const inScanning = fileReceipts.filter(file => file.status === 'scanning' || file.status === 'handover').length;
      const inQC = fileReceipts.filter(file => file.status === 'scan_completed' || file.status === 'qc_done').length;
      const uploadInitiated = fileReceipts.filter(file => file.status === 'upload_initiated').length;
      const uploadCompleted = fileReceipts.filter(file => file.status === 'upload_completed').length;
      const returned = fileReceipts.filter(file => file.status === 'returned').length;
      
      res.json({
        totalFiles: fileReceipts.length,
        pendingScan,
        inScanning,
        inQC,
        uploadInitiated,
        uploadCompleted,
        returned
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory statistics" });
    }
  });

  // For simulating external Court API to fetch case details
  app.get("/api/external/case-details", async (req: Request, res: Response) => {
    try {
      const cnrNumber = req.query.cnrNumber as string;
      
      if (!cnrNumber) {
        return res.status(400).json({ message: "CNR number is required" });
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data based on CNR number pattern
      // In a real system, this would call an actual external API
      if (cnrNumber.startsWith("DL")) {
        res.json({
          caseType: "civil",
          caseYear: "2023",
          caseNumber: cnrNumber.slice(-4),
          partyNames: "State vs. John Doe"
        });
      } else if (cnrNumber.startsWith("MH")) {
        res.json({
          caseType: "criminal",
          caseYear: "2023",
          caseNumber: cnrNumber.slice(-4),
          partyNames: "State vs. Jane Smith"
        });
      } else {
        res.json({
          caseType: "writ",
          caseYear: "2023",
          caseNumber: cnrNumber.slice(-4),
          partyNames: "Company Ltd. vs. State"
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch case details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
