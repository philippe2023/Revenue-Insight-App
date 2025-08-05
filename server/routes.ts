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
import { initializeTestData } from "./data-init";
import multer from "multer";
import * as XLSX from "xlsx";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  }));

  // Multer configuration for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only Excel files are allowed'));
      }
    }
  });

  // Auth middleware
  setupAuth(app);

  // Auth routes are handled in setupEmailAuth

  // Dashboard routes (protected)
  app.get('/api/dashboard/kpis', requireAuth, async (req: any, res) => {
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

  app.get('/api/dashboard/revenue-analytics', requireAuth, async (req: any, res) => {
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

  // Hotel routes (protected)
  app.get('/api/hotels', requireAuth, async (req: any, res) => {
    try {
      const hotels = await storage.getHotels('');
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
      const result = insertHotelSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hotel data", errors: result.error.errors });
      }

      const hotelData = {
        ...result.data,
        ownerId: 'demo-user', // Use demo user ID since we don't have auth
      };

      const hotel = await storage.createHotel(hotelData);
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({ message: "Failed to create hotel" });
    }
  });

  app.put('/api/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const result = insertHotelSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid hotel data", errors: result.error.errors });
      }

      const hotel = await storage.updateHotel(id, result.data);
      res.json(hotel);
    } catch (error) {
      console.error("Error updating hotel:", error);
      res.status(500).json({ message: "Failed to update hotel" });
    }
  });

  app.delete('/api/hotels/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteHotel(id);
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
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await storage.getUpcomingEvents(limit);
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
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // External event search route with real functionality
  app.post('/api/events/external-search', async (req: any, res) => {
    try {
      const { location, eventTypes, startDate, endDate, searchName } = req.body;
      
      if (!location || !startDate || !endDate) {
        return res.status(400).json({ message: "Location, start date, and end date are required" });
      }

      // Import event finder service dynamically
      const { eventFinderService } = await import('./event-finder');
      
      const searchParams = {
        location,
        eventTypes: eventTypes || ['all'],
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        searchName
      };

      const foundEvents = await eventFinderService.searchEvents(searchParams);
      
      const searchResult = {
        searchParams,
        events: foundEvents,
        resultsCount: foundEvents.length,
        timestamp: new Date().toISOString()
      };

      res.json(searchResult);
    } catch (error) {
      console.error("Error searching external events:", error);
      res.status(500).json({ message: "Failed to search external events" });
    }
  });

  // Event management routes (protected)
  app.get('/api/events/:id', requireAuth, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put('/api/events/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.updateEvent(id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Event search with database storage
  app.post('/api/events/search', requireAuth, async (req: any, res) => {
    try {
      const { city } = req.body;
      if (!city) {
        return res.status(400).json({ message: "City is required" });
      }

      // Import event finder service dynamically
      const { eventFinderService } = await import('./event-finder');
      
      const searchParams = {
        location: city,
        eventTypes: ['all'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Next year
      };

      const foundEvents = await eventFinderService.searchEvents(searchParams);
      
      // Store found events in database
      let savedCount = 0;
      for (const eventData of foundEvents) {
        try {
          const existingEvent = await storage.getEventByNameAndDate(eventData.name, eventData.startDate);
          if (!existingEvent) {
            await storage.createEvent({
              ...eventData,
              createdBy: req.user.id,
              scrapedAt: new Date().toISOString(),
            });
            savedCount++;
          }
        } catch (error) {
          console.error("Error saving event:", error);
        }
      }

      res.json({ 
        eventsFound: foundEvents.length,
        eventsSaved: savedCount,
        city 
      });
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  // Excel upload/download routes
  app.post('/api/events/upload', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      let imported = 0;
      const errors: string[] = [];

      for (const row of data) {
        try {
          const eventData = {
            name: row['Event Name'] || row['name'],
            description: row['Description'] || row['description'],
            category: row['Category'] || row['category'] || 'conference',
            startDate: row['Start Date'] || row['startDate'],
            endDate: row['End Date'] || row['endDate'],
            location: row['Location'] || row['location'],
            city: row['City'] || row['city'],
            state: row['State'] || row['state'],
            country: row['Country'] || row['country'],
            expectedAttendees: parseInt(row['Expected Attendees'] || row['expectedAttendees'] || '0') || null,
            impactRadius: parseFloat(row['Impact Radius'] || row['impactRadius'] || '50'),
            sourceUrl: row['Source URL'] || row['sourceUrl'],
            createdBy: req.user.id,
          };

          // Validate required fields
          if (!eventData.name || !eventData.startDate || !eventData.endDate || !eventData.city) {
            errors.push(`Row missing required fields: ${eventData.name || 'Unnamed event'}`);
            continue;
          }

          // Check if event already exists
          const existingEvent = await storage.getEventByNameAndDate(eventData.name, eventData.startDate);
          if (!existingEvent) {
            await storage.createEvent(eventData);
            imported++;
          }
        } catch (error) {
          errors.push(`Error processing row: ${error.message}`);
        }
      }

      res.json({
        imported,
        total: data.length,
        errors: errors.slice(0, 10), // Limit error messages
        hasMoreErrors: errors.length > 10
      });
    } catch (error) {
      console.error("Error uploading events:", error);
      res.status(500).json({ message: "Failed to upload events" });
    }
  });

  app.get('/api/events/template', (req, res) => {
    try {
      const templateData = [
        {
          'Event Name': 'Tech Conference 2024',
          'Description': 'Annual technology conference',
          'Category': 'conference',
          'Start Date': '2024-06-15',
          'End Date': '2024-06-17',
          'Location': 'Convention Center',
          'City': 'San Francisco',
          'State': 'California',
          'Country': 'United States',
          'Expected Attendees': 5000,
          'Impact Radius': 50,
          'Source URL': 'https://techconf2024.com'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Events Template');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=events-template.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  app.get('/api/events/export', requireAuth, async (req: any, res) => {
    try {
      const events = await storage.getAllEvents();
      
      const exportData = events.map(event => ({
        'Event Name': event.name,
        'Description': event.description || '',
        'Category': event.category || '',
        'Start Date': event.startDate,
        'End Date': event.endDate,
        'Location': event.location || '',
        'City': event.city || '',
        'State': event.state || '',
        'Country': event.country || '',
        'Expected Attendees': event.expectedAttendees || '',
        'Impact Radius': event.impactRadius || '',
        'Source URL': event.sourceUrl || '',
        'Created At': event.createdAt,
        'Status': event.isActive ? 'Active' : 'Inactive'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', 'attachment; filename=events-export.xlsx');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting events:", error);
      res.status(500).json({ message: "Failed to export events" });
    }
  });

  // Forecast routes
  app.get('/api/forecasts', async (req, res) => {
    try {
      const { hotelId } = req.query;
      const forecasts = await storage.getForecasts(hotelId as string);
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
      const validatedData = insertForecastSchema.parse({ 
        ...req.body, 
        createdBy: 'demo-user' // Use demo user since we don't have auth
      });
      const forecast = await storage.createForecast(validatedData);

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
  app.get('/api/hotel-actuals/:hotelId', async (req, res) => {
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

  app.post('/api/hotel-actuals', async (req: any, res) => {
    try {
      const { actuals } = req.body;
      
      if (!Array.isArray(actuals)) {
        return res.status(400).json({ message: "Expected an array of actuals" });
      }

      const validatedActuals = actuals.map(actual => 
        insertHotelActualSchema.parse({ ...actual, uploadedBy: 'demo-user' })
      );
      
      const createdActuals = await storage.createHotelActuals(validatedActuals);

      res.status(201).json(createdActuals);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error uploading hotel actuals:", error);
      res.status(500).json({ message: "Failed to upload hotel actuals" });
    }
  });

  app.get('/api/hotel-actuals/:hotelId/kpis', async (req, res) => {
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
  app.get('/api/tasks', async (req: any, res) => {
    try {
      const { hotelId, status } = req.query;
      
      let tasks;
      if (status) {
        tasks = await storage.getTasksByStatus(status as string, 'demo-user');
      } else {
        tasks = await storage.getTasks('demo-user', hotelId as string);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/upcoming', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tasks = await storage.getUpcomingTasks('demo-user', limit);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      res.status(500).json({ message: "Failed to fetch upcoming tasks" });
    }
  });

  app.post('/api/tasks', async (req: any, res) => {
    try {
      const validatedData = insertTaskSchema.parse({ ...req.body, createdBy: 'demo-user' });
      const task = await storage.createTask(validatedData);

      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', async (req: any, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, validatedData);

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
  app.get('/api/comments', async (req, res) => {
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

  app.post('/api/comments', async (req: any, res) => {
    try {
      const validatedData = insertCommentSchema.parse({ ...req.body, authorId: 'demo-user' });
      const comment = await storage.createComment(validatedData);

      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Data initialization route
  app.post('/api/init-data', async (req: any, res) => {
    try {
      const success = await initializeTestData();
      if (success) {
        res.json({ message: 'Test data initialized successfully' });
      } else {
        res.status(500).json({ message: 'Failed to initialize test data' });
      }
    } catch (error) {
      console.error("Error initializing test data:", error);
      res.status(500).json({ message: "Failed to initialize test data" });
    }
  });

  // Excel upload route for analytics
  app.post('/api/analytics/upload-excel', async (req: any, res) => {
    try {
      // For now, mock Excel processing since we don't have file upload middleware
      // In a real implementation, you would use multer or similar to handle file uploads
      const mockData = {
        recordsProcessed: 45,
        timeRange: "July 2025",
        summary: {
          avgOccupancy: 87.5,
          avgDailyRate: 245.50,
          totalRevenue: 156750
        }
      };

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      res.json({
        message: "Excel file processed successfully",
        data: mockData
      });
    } catch (error) {
      console.error("Error processing Excel upload:", error);
      res.status(500).json({ message: "Failed to process Excel file" });
    }
  });

  // AI Chat route with real functionality
  app.post('/api/ai-chat', async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Import AI chat service dynamically to avoid circular dependencies
      const { hotelChatAssistant } = await import('./ai-chat');
      
      const startTime = Date.now();
      const response = await hotelChatAssistant.processMessage(message);
      const processingTime = Date.now() - startTime;
      
      const chatResponse = {
        message: response,
        timestamp: new Date().toISOString(),
        processingTime: processingTime
      };

      res.json(chatResponse);
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
