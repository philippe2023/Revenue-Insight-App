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
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  }));

  // Auth middleware
  setupAuth(app);

  // Auth routes are handled in setupEmailAuth

  // Dashboard routes
  app.get('/api/dashboard/kpis', async (req: any, res) => {
    try {
      // Mock KPI data since we removed authentication
      const kpis = {
        totalRevenue: 1250000,
        totalBookings: 3247,
        averageRate: 185,
        occupancyRate: 78.5,
        revenueGrowth: 12.3,
        bookingsGrowth: 8.7,
        rateGrowth: 5.2,
        occupancyGrowth: 3.1
      };
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching dashboard KPIs:", error);
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });

  app.get('/api/dashboard/revenue-analytics', async (req: any, res) => {
    try {
      // Mock revenue analytics data
      const analytics = {
        monthly: [
          { month: 'Jan', revenue: 95000, bookings: 245 },
          { month: 'Feb', revenue: 88000, bookings: 225 },
          { month: 'Mar', revenue: 105000, bookings: 275 },
          { month: 'Apr', revenue: 112000, bookings: 295 },
          { month: 'May', revenue: 125000, bookings: 325 },
          { month: 'Jun', revenue: 138000, bookings: 355 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get('/api/dashboard/top-performers', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const topPerformers = await storage.getTopPerformingHotels(limit);
      res.json(topPerformers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  app.get('/api/dashboard/recent-activity', async (req: any, res) => {
    try {
      // Mock recent activity data
      const activities = [
        {
          id: '1',
          type: 'booking',
          description: 'New booking at Grand Plaza Hotel',
          timestamp: new Date().toISOString(),
          user: 'System'
        },
        {
          id: '2',
          type: 'forecast',
          description: 'Revenue forecast updated for Q3',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Demo User'
        },
        {
          id: '3',
          type: 'event',
          description: 'New event detected: Tech Conference 2025',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'System'
        }
      ];
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Hotel routes
  app.get('/api/hotels', async (req: any, res) => {
    try {
      // Mock hotel data
      const hotels = [
        {
          id: '1',
          name: 'Grand Plaza Hotel',
          location: 'New York, NY',
          totalRooms: 250,
          occupancyRate: 85.2,
          averageRate: 225,
          revenue: 485000,
          status: 'active'
        },
        {
          id: '2', 
          name: 'Seaside Resort',
          location: 'Miami, FL',
          totalRooms: 180,
          occupancyRate: 78.9,
          averageRate: 195,
          revenue: 325000,
          status: 'active'
        },
        {
          id: '3',
          name: 'Mountain View Lodge',
          location: 'Denver, CO', 
          totalRooms: 120,
          occupancyRate: 82.1,
          averageRate: 165,
          revenue: 285000,
          status: 'active'
        }
      ];
      res.json(hotels);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      res.status(500).json({ message: "Failed to fetch hotels" });
    }
  });

  app.get('/api/hotels/:id', async (req, res) => {
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

  app.post('/api/hotels', async (req: any, res) => {
    try {
      // Mock hotel creation since we removed authentication
      const newHotel = {
        id: Date.now().toString(),
        name: req.body.name || 'New Hotel',
        location: req.body.location || 'Unknown Location',
        totalRooms: req.body.totalRooms || 100,
        occupancyRate: 0,
        averageRate: req.body.averageRate || 150,
        revenue: 0,
        status: 'active'
      };

      res.status(201).json(newHotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.put('/api/hotels/:id', async (req: any, res) => {
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

  app.delete('/api/hotels/:id', async (req: any, res) => {
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
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/upcoming', async (req, res) => {
    try {
      // Mock upcoming events data
      const events = [
        {
          id: '1',
          name: 'Tech Conference 2025',
          category: 'conference',
          startDate: '2025-08-15',
          endDate: '2025-08-17',
          city: 'San Francisco',
          expectedAttendees: 5000,
          potentialImpact: 'high'
        },
        {
          id: '2', 
          name: 'Music Festival',
          category: 'festival',
          startDate: '2025-08-22',
          endDate: '2025-08-24',
          city: 'Austin',
          expectedAttendees: 15000,
          potentialImpact: 'very-high'
        },
        {
          id: '3',
          name: 'Trade Show',
          category: 'trade-show',
          startDate: '2025-09-05',
          endDate: '2025-09-07',
          city: 'Chicago',
          expectedAttendees: 8000,
          potentialImpact: 'high'
        }
      ];
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.get('/api/events/search', async (req, res) => {
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

  app.post('/api/events', async (req: any, res) => {
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
  app.get('/api/forecasts', async (req, res) => {
    try {
      // Mock forecast data
      const forecasts = [
        {
          id: '1',
          hotelId: '1',
          date: '2025-08-15',
          predictedRevenue: 25000,
          predictedOccupancy: 85,
          confidence: 0.92
        },
        {
          id: '2',
          hotelId: '1', 
          date: '2025-08-16',
          predictedRevenue: 28000,
          predictedOccupancy: 92,
          confidence: 0.89
        }
      ];
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      res.status(500).json({ message: "Failed to fetch forecasts" });
    }
  });

  app.get('/api/forecasts/date-range', async (req, res) => {
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

  app.post('/api/forecasts', async (req: any, res) => {
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
