import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFileSchema, 
  insertFileHandoverSchema, 
  insertLifecycleEventSchema,
  loginSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Utility function to handle errors
const handleError = (res: Response, error: unknown) => {
  console.error(error);
  if (error instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error",
      errors: fromZodError(error).message
    });
  }
  return res.status(500).json({ message: "Internal server error" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";

  // User authentication
  app.post(`${apiPrefix}/login`, async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);
      
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // In a real application, we would generate a JWT token here
      // For simplicity, we'll just return the user info without the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get all users
  app.get(`${apiPrefix}/users`, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...userData }) => userData);
      res.json(usersWithoutPasswords);
    } catch (error) {
      handleError(res, error);
    }
  });

  // File Receipt (Inventory In)
  app.post(`${apiPrefix}/files`, async (req: Request, res: Response) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      const newFile = await storage.createFile(fileData);
      res.status(201).json(newFile);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get all files with optional filtering
  app.get(`${apiPrefix}/files`, async (req: Request, res: Response) => {
    try {
      const { status, caseType, limit, offset } = req.query;
      const options = {
        status: status as string | undefined,
        caseType: caseType as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      };
      
      const files = await storage.getFiles(options);
      res.json(files);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get a file by ID
  app.get(`${apiPrefix}/files/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get a file by CNR number
  app.get(`${apiPrefix}/files/cnr/:cnrNumber`, async (req: Request, res: Response) => {
    try {
      const file = await storage.getFileByCNR(req.params.cnrNumber);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      handleError(res, error);
    }
  });

  // File Handover (Inventory Out)
  app.post(`${apiPrefix}/handovers`, async (req: Request, res: Response) => {
    try {
      const handoverData = insertFileHandoverSchema.parse(req.body);
      
      // Check if file exists
      const file = await storage.getFile(handoverData.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const newHandover = await storage.createFileHandover(handoverData);
      res.status(201).json(newHandover);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get handovers for a file
  app.get(`${apiPrefix}/files/:id/handovers`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const handovers = await storage.getFileHandovers(id);
      res.json(handovers);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Lifecycle Events
  app.post(`${apiPrefix}/lifecycle-events`, async (req: Request, res: Response) => {
    try {
      const eventData = insertLifecycleEventSchema.parse(req.body);
      
      // Check if file exists
      const file = await storage.getFile(eventData.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Update the file status
      await storage.updateFileStatus(eventData.fileId, eventData.status);
      
      // Create the lifecycle event
      const newEvent = await storage.createLifecycleEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get lifecycle events for a file
  app.get(`${apiPrefix}/files/:id/lifecycle-events`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const events = await storage.getLifecycleEvents(id);
      res.json(events);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Dashboard statistics
  app.get(`${apiPrefix}/dashboard/stats`, async (req: Request, res: Response) => {
    try {
      const todayFiles = await storage.getFilesCountToday();
      const statusCounts = await storage.getFilesCountByStatus();
      
      // Calculate files digitized in last 7 days (files with upload_completed status in last week)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const today = new Date();
      const activityData = await storage.getFilesCountByDateRange(lastWeek, today);
      
      // Get total files by status
      const filesByStatus = statusCounts.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {} as Record<string, number>);
      
      // Get recent activity
      const recentEvents = await storage.getRecentLifecycleEvents(5);
      
      res.json({
        todayFiles,
        filesByStatus,
        activityData,
        recentEvents,
        digitizedFiles: filesByStatus.upload_completed || 0,
        pendingFiles: filesByStatus.received || 0
      });
    } catch (error) {
      handleError(res, error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
