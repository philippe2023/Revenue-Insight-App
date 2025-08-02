import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from "cors";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import {
  insertHotelSchema,
  insertEventSchema,
  insertForecastSchema,
  insertHotelActualSchema,
  insertTaskSchema,
  insertCommentSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5000"], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Auth middleware
  setupAuth(app);

  // Auth routes are handled in setupEmailAuth

  // Dashboard routes
  app.get('/api/dashboard/kpis', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const kpis = await storage.getDashboardKPIs(userId);
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching dashboard KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });

  app.get('/api/dashboard/revenue-analytics', requireAuth, async (req: any, res) => {
    try {
      const { hotelId } = req.query;
      const analytics = await storage.getRevenueAnalytics(hotelId as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/dashboard/top-performers', requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const topPerformers = await storage.getTopPerformingHotels(limit);
      res.json(topPerformers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  app.get('/api/dashboard/recent-activity', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getRecentActivity(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Hotel routes
  app.get('/api/hotels', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const hotels = await storage.getHotels(userId);
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get('/api/hotels/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const hotel = await storage.getHotel(id);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel:", error);
      res.status(500).json({ message: "Failed to fetch hotel" });
    }
  });

  app.post('/api/hotels', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertHotelSchema.parse({ ...req.body, ownerId: userId });
      const hotel = await storage.createHotel(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'create',
        entityType: 'hotel',
        entityId: hotel.id,
        metadata: { hotelName: hotel.name },
      });

      res.status(201).json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.put('/api/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const validatedData = insertHotelSchema.partial().parse(req.body);
      const hotel = await storage.updateHotel(id, validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'update',
        entityType: 'hotel',
        entityId: id,
        metadata: { hotelName: hotel.name },
      });

      res.json(hotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  app.delete('/api/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await storage.deleteHotel(id);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'delete',
        entityType: 'hotel',
        entityId: id,
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res.status(500).json({ message: "Failed to delete hotel" });
    }
  });

  // Event routes
  app.get('/api/events', requireAuth, async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/upcoming', requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.get('/api/events/search', requireAuth, async (req, res) => {
    try {
      const { city, startDate, endDate } = req.query;
      
      if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const events = await storage.getEventsByLocation(city as string, start, end);
      res.json(events);
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  app.post('/api/events', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertEventSchema.parse({ ...req.body, createdBy: userId });
      const event = await storage.createEvent(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'create',
        entityType: 'event',
        entityId: event.id,
        metadata: { eventName: event.name },
      });

      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Forecast routes
  app.get('/api/forecasts', requireAuth, async (req, res) => {
    try {
      const { hotelId } = req.query;
      const forecasts = await storage.getForecasts(hotelId as string);
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      res.status(500).json({ message: "Failed to fetch forecasts" });
    }
  });

  app.get('/api/forecasts/date-range', requireAuth, async (req, res) => {
    try {
      const { hotelId, startDate, endDate } = req.query;
      
      if (!hotelId || !startDate || !endDate) {
        return res.status(400).json({ message: "hotelId, startDate, and endDate are required" });
      }

      const forecasts = await storage.getForecastsByDateRange(
        hotelId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts by date range:", error);
      res.status(500).json({ message: "Failed to fetch forecasts" });
    }
  });

  app.post('/api/forecasts', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertForecastSchema.parse({ ...req.body, createdBy: userId });
      const forecast = await storage.createForecast(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'create',
        entityType: 'forecast',
        entityId: forecast.id,
        metadata: { hotelId: forecast.hotelId, forecastType: forecast.forecastType },
      });

      res.status(201).json(forecast);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating forecast:", error);
      res.status(500).json({ message: "Failed to create forecast" });
    }
  });

  // Hotel actuals routes
  app.get('/api/hotel-actuals/:hotelId', requireAuth, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const actuals = await storage.getHotelActuals(hotelId, start, end);
      res.json(actuals);
    } catch (error) {
      console.error("Error fetching hotel actuals:", error);
      res.status(500).json({ message: "Failed to fetch hotel actuals" });
    }
  });

  app.post('/api/hotel-actuals', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { actuals } = req.body;
      
      if (!Array.isArray(actuals)) {
        return res.status(400).json({ message: "Expected an array of actuals" });
      }

      const validatedActuals = actuals.map(actual => 
        insertHotelActualSchema.parse({ ...actual, uploadedBy: userId })
      );
      
      const createdActuals = await storage.createHotelActuals(validatedActuals);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'upload',
        entityType: 'hotel_actuals',
        entityId: createdActuals[0]?.hotelId || '',
        metadata: { count: createdActuals.length },
      });

      res.status(201).json(createdActuals);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error uploading hotel actuals:", error);
      res.status(500).json({ message: "Failed to upload hotel actuals" });
    }
  });

  app.get('/api/hotel-actuals/:hotelId/kpis', requireAuth, async (req, res) => {
    try {
      const { hotelId } = req.params;
      const kpis = await storage.getHotelPerformanceKPIs(hotelId);
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching hotel KPIs:", error);
      res.status(500).json({ message: "Failed to fetch hotel KPIs" });
    }
  });

  // Task routes
  app.get('/api/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { hotelId, status } = req.query;
      
      let tasks;
      if (status) {
        tasks = await storage.getTasksByStatus(status as string, userId);
      } else {
        tasks = await storage.getTasks(userId, hotelId as string);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/upcoming', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      const tasks = await storage.getUpcomingTasks(userId, limit);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      res.status(500).json({ message: "Failed to fetch upcoming tasks" });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertTaskSchema.parse({ ...req.body, createdBy: userId });
      const task = await storage.createTask(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'create',
        entityType: 'task',
        entityId: task.id,
        metadata: { taskTitle: task.title },
      });

      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'update',
        entityType: 'task',
        entityId: id,
        metadata: { taskTitle: task.title, status: task.status },
      });

      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Comment routes
  app.get('/api/comments', requireAuth, async (req, res) => {
    try {
      const { entityType, entityId } = req.query;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required" });
      }

      const comments = await storage.getComments(entityType as string, entityId as string);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCommentSchema.parse({ ...req.body, authorId: userId });
      const comment = await storage.createComment(validatedData);
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'create',
        entityType: 'comment',
        entityId: comment.id,
        metadata: { entityType: comment.entityType, entityId: comment.entityId },
      });

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // AI Chat route (placeholder for integration)
  app.post('/api/ai-chat', requireAuth, async (req: any, res) => {
    try {
      const { message } = req.body;
      const userId = req.user.id;
      
      // This is a placeholder for AI integration
      // In a real implementation, you would integrate with OpenAI or similar service
      const response = {
        message: `I received your query: "${message}". This is a placeholder response. In a real implementation, I would analyze your hotel data and provide insights.`,
        timestamp: new Date().toISOString(),
      };
      
      // Log activity
      await storage.logActivity({
        userId,
        action: 'ai_query',
        entityType: 'ai_chat',
        entityId: 'chat_session',
        metadata: { query: message },
      });

      res.json(response);
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
