import {
  users,
  hotels,  
  events,
  forecasts,
  hotelActuals,
  tasks,
  comments,
  hotelAssignments,
  activityLog,
  type User,
  type UpsertUser,
  type InsertUser,
  type Hotel,
  type InsertHotel,
  type Event,
  type InsertEvent,
  type Forecast,
  type InsertForecast,
  type HotelActual,
  type InsertHotelActual,
  type Task,
  type InsertTask,
  type Comment,
  type InsertComment,
  type HotelAssignment,
  type InsertHotelAssignment,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth and email/password auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Hotel operations
  getHotels(userId: string): Promise<Hotel[]>;
  getHotel(id: string): Promise<Hotel | undefined>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: string, hotel: Partial<InsertHotel>): Promise<Hotel>;
  deleteHotel(id: string): Promise<void>;
  getHotelsByCity(city: string): Promise<Hotel[]>;
  getTopPerformingHotels(limit: number): Promise<Array<Hotel & { revenue: number; occupancyRate: number }>>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEventsByLocation(city: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  getUpcomingEvents(limit: number): Promise<Event[]>;

  // Forecast operations
  getForecasts(hotelId?: string): Promise<Forecast[]>;
  getForecast(id: string): Promise<Forecast | undefined>;
  createForecast(forecast: InsertForecast): Promise<Forecast>;
  updateForecast(id: string, forecast: Partial<InsertForecast>): Promise<Forecast>;
  deleteForecast(id: string): Promise<void>;
  getForecastsByDateRange(hotelId: string, startDate: Date, endDate: Date): Promise<Forecast[]>;

  // Hotel actuals operations
  getHotelActuals(hotelId: string, startDate?: Date, endDate?: Date): Promise<HotelActual[]>;
  createHotelActual(actual: InsertHotelActual): Promise<HotelActual>;
  createHotelActuals(actuals: InsertHotelActual[]): Promise<HotelActual[]>;
  getHotelPerformanceKPIs(hotelId?: string): Promise<{
    totalRevenue: number;
    avgOccupancyRate: number;
    avgDailyRate: number;
    totalRoomNights: number;
  }>;

  // Task operations
  getTasks(userId?: string, hotelId?: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  getTasksByStatus(status: string, userId?: string): Promise<Task[]>;
  getUpcomingTasks(userId: string, limit: number): Promise<Task[]>;

  // Comment operations
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  // Hotel assignment operations
  getHotelAssignments(hotelId?: string, userId?: string): Promise<HotelAssignment[]>;
  createHotelAssignment(assignment: InsertHotelAssignment): Promise<HotelAssignment>;
  deleteHotelAssignment(hotelId: string, userId: string): Promise<void>;

  // Activity log operations
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(userId: string, limit: number): Promise<ActivityLog[]>;

  // Analytics operations
  getDashboardKPIs(userId: string): Promise<{
    totalRevenue: number;
    avgOccupancyRate: number;
    activeHotels: number;
    upcomingEvents: number;
  }>;
  getRevenueAnalytics(hotelId?: string): Promise<Array<{ month: string; revenue: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Hotel operations
  async getHotels(userId: string): Promise<Hotel[]> {
    const userHotels = await db
      .select({ hotel: hotels })
      .from(hotels)
      .leftJoin(hotelAssignments, eq(hotels.id, hotelAssignments.hotelId))
      .where(
        or(
          eq(hotels.ownerId, userId),
          eq(hotelAssignments.userId, userId)
        )
      );
    
    return userHotels.map(row => row.hotel);
  }

  async getHotel(id: string): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel;
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const [newHotel] = await db.insert(hotels).values(hotel).returning();
    return newHotel;
  }

  async updateHotel(id: string, hotel: Partial<InsertHotel>): Promise<Hotel> {
    const [updatedHotel] = await db
      .update(hotels)
      .set({ ...hotel, updatedAt: new Date() })
      .where(eq(hotels.id, id))
      .returning();
    return updatedHotel;
  }

  async deleteHotel(id: string): Promise<void> {
    await db.delete(hotels).where(eq(hotels.id, id));
  }

  async getHotelsByCity(city: string): Promise<Hotel[]> {
    return await db.select().from(hotels).where(eq(hotels.city, city));
  }

  async getTopPerformingHotels(limit: number): Promise<Array<Hotel & { revenue: number; occupancyRate: number }>> {
    const results = await db
      .select({
        id: hotels.id,
        name: hotels.name,
        description: hotels.description,
        address: hotels.address,
        city: hotels.city,
        state: hotels.state,
        country: hotels.country,
        postalCode: hotels.postalCode,
        phone: hotels.phone,
        email: hotels.email,
        website: hotels.website,
        starRating: hotels.starRating,
        totalRooms: hotels.totalRooms,
        imageUrl: hotels.imageUrl,
        status: hotels.status,
        ownerId: hotels.ownerId,
        createdAt: hotels.createdAt,
        updatedAt: hotels.updatedAt,
        revenue: sql<number>`COALESCE(SUM(${hotelActuals.revenue}), 0)`,
        occupancyRate: sql<number>`COALESCE(AVG(${hotelActuals.occupancyRate}), 0)`,
      })
      .from(hotels)
      .leftJoin(hotelActuals, eq(hotels.id, hotelActuals.hotelId))
      .groupBy(hotels.id)
      .orderBy(desc(sql`COALESCE(SUM(${hotelActuals.revenue}), 0)`))
      .limit(limit);

    return results;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.isActive, true)).orderBy(desc(events.startDate));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.update(events).set({ isActive: false }).where(eq(events.id, id));
  }

  async getEventsByLocation(city: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = db.select().from(events).where(
      and(
        eq(events.city, city),
        eq(events.isActive, true)
      )
    );

    if (startDate) {
      query = query.where(gte(events.startDate, startDate.toISOString().split('T')[0]));
    }

    if (endDate) {
      query = query.where(lte(events.endDate, endDate.toISOString().split('T')[0]));
    }

    return await query.orderBy(events.startDate);
  }

  async getUpcomingEvents(limit: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          gte(events.startDate, new Date().toISOString().split('T')[0])
        )
      )
      .orderBy(events.startDate)
      .limit(limit);
  }

  // Forecast operations
  async getForecasts(hotelId?: string): Promise<Forecast[]> {
    let query = db.select().from(forecasts);
    
    if (hotelId) {
      query = query.where(eq(forecasts.hotelId, hotelId));
    }

    return await query.orderBy(desc(forecasts.forecastDate));
  }

  async getForecast(id: string): Promise<Forecast | undefined> {
    const [forecast] = await db.select().from(forecasts).where(eq(forecasts.id, id));
    return forecast;
  }

  async createForecast(forecast: InsertForecast): Promise<Forecast> {
    const [newForecast] = await db.insert(forecasts).values(forecast).returning();
    return newForecast;
  }

  async updateForecast(id: string, forecast: Partial<InsertForecast>): Promise<Forecast> {
    const [updatedForecast] = await db
      .update(forecasts)
      .set({ ...forecast, updatedAt: new Date() })
      .where(eq(forecasts.id, id))
      .returning();
    return updatedForecast;
  }

  async deleteForecast(id: string): Promise<void> {
    await db.delete(forecasts).where(eq(forecasts.id, id));
  }

  async getForecastsByDateRange(hotelId: string, startDate: Date, endDate: Date): Promise<Forecast[]> {
    return await db
      .select()
      .from(forecasts)
      .where(
        and(
          eq(forecasts.hotelId, hotelId),
          gte(forecasts.forecastDate, startDate.toISOString().split('T')[0]),
          lte(forecasts.forecastDate, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(forecasts.forecastDate);
  }

  // Hotel actuals operations
  async getHotelActuals(hotelId: string, startDate?: Date, endDate?: Date): Promise<HotelActual[]> {
    let query = db.select().from(hotelActuals).where(eq(hotelActuals.hotelId, hotelId));

    if (startDate) {
      query = query.where(gte(hotelActuals.actualDate, startDate.toISOString().split('T')[0]));
    }

    if (endDate) {
      query = query.where(lte(hotelActuals.actualDate, endDate.toISOString().split('T')[0]));
    }

    return await query.orderBy(desc(hotelActuals.actualDate));
  }

  async createHotelActual(actual: InsertHotelActual): Promise<HotelActual> {
    const [newActual] = await db.insert(hotelActuals).values(actual).returning();
    return newActual;
  }

  async createHotelActuals(actuals: InsertHotelActual[]): Promise<HotelActual[]> {
    return await db.insert(hotelActuals).values(actuals).returning();
  }

  async getHotelPerformanceKPIs(hotelId?: string): Promise<{
    totalRevenue: number;
    avgOccupancyRate: number;
    avgDailyRate: number;
    totalRoomNights: number;
  }> {
    let query = db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${hotelActuals.revenue}), 0)`,
        avgOccupancyRate: sql<number>`COALESCE(AVG(${hotelActuals.occupancyRate}), 0)`,
        avgDailyRate: sql<number>`COALESCE(AVG(${hotelActuals.averageDailyRate}), 0)`,
        totalRoomNights: sql<number>`COALESCE(SUM(${hotelActuals.roomNights}), 0)`,
      })
      .from(hotelActuals);

    if (hotelId) {
      query = query.where(eq(hotelActuals.hotelId, hotelId));
    }

    const [result] = await query;
    return result || { totalRevenue: 0, avgOccupancyRate: 0, avgDailyRate: 0, totalRoomNights: 0 };
  }

  // Task operations
  async getTasks(userId?: string, hotelId?: string): Promise<Task[]> {
    let query = db.select().from(tasks);

    if (userId && hotelId) {
      query = query.where(
        and(
          or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId)),
          eq(tasks.hotelId, hotelId)
        )
      );
    } else if (userId) {
      query = query.where(or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId)));
    } else if (hotelId) {
      query = query.where(eq(tasks.hotelId, hotelId));
    }

    return await query.orderBy(desc(tasks.createdAt));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: string, task: Partial<InsertTask>): Promise<Task> {
    const updateData: any = { ...task, updatedAt: new Date() };
    
    if (task.status === 'completed' && !task.completedAt) {
      updateData.completedAt = new Date();
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getTasksByStatus(status: string, userId?: string): Promise<Task[]> {
    let query = db.select().from(tasks).where(eq(tasks.status, status));

    if (userId) {
      query = query.where(or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId)));
    }

    return await query.orderBy(desc(tasks.createdAt));
  }

  async getUpcomingTasks(userId: string, limit: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(
        and(
          or(eq(tasks.assignedTo, userId), eq(tasks.createdBy, userId)),
          eq(tasks.status, 'pending'),
          gte(tasks.dueDate, new Date())
        )
      )
      .orderBy(tasks.dueDate)
      .limit(limit);
  }

  // Comment operations
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.entityType, entityType),
          eq(comments.entityId, entityId)
        )
      )
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async updateComment(id: string, comment: Partial<InsertComment>): Promise<Comment> {
    const [updatedComment] = await db
      .update(comments)
      .set({ ...comment, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return updatedComment;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Hotel assignment operations
  async getHotelAssignments(hotelId?: string, userId?: string): Promise<HotelAssignment[]> {
    let query = db.select().from(hotelAssignments);

    if (hotelId && userId) {
      query = query.where(
        and(
          eq(hotelAssignments.hotelId, hotelId),
          eq(hotelAssignments.userId, userId)
        )
      );
    } else if (hotelId) {
      query = query.where(eq(hotelAssignments.hotelId, hotelId));
    } else if (userId) {
      query = query.where(eq(hotelAssignments.userId, userId));
    }

    return await query.orderBy(desc(hotelAssignments.assignedAt));
  }

  async createHotelAssignment(assignment: InsertHotelAssignment): Promise<HotelAssignment> {
    const [newAssignment] = await db.insert(hotelAssignments).values(assignment).returning();
    return newAssignment;
  }

  async deleteHotelAssignment(hotelId: string, userId: string): Promise<void> {
    await db.delete(hotelAssignments).where(
      and(
        eq(hotelAssignments.hotelId, hotelId),
        eq(hotelAssignments.userId, userId)
      )
    );
  }

  // Activity log operations
  async logActivity(activity: InsertActivityLog): Promise<ActivityLog> {
    const [newActivity] = await db.insert(activityLog).values(activity).returning();
    return newActivity;
  }

  async getRecentActivity(userId: string, limit: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  // Analytics operations
  async getDashboardKPIs(userId: string): Promise<{
    totalRevenue: number;
    avgOccupancyRate: number;
    activeHotels: number;
    upcomingEvents: number;
  }> {
    // Get user's hotels
    const userHotels = await this.getHotels(userId);
    const hotelIds = userHotels.map(h => h.id);

    // Calculate KPIs
    const [revenueResult] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${hotelActuals.revenue}), 0)`,
        avgOccupancyRate: sql<number>`COALESCE(AVG(${hotelActuals.occupancyRate}), 0)`,
      })
      .from(hotelActuals)
      .where(sql`${hotelActuals.hotelId} = ANY(${hotelIds})`);

    const activeHotels = userHotels.filter(h => h.status === 'active').length;

    const [eventResult] = await db
      .select({
        upcomingEvents: sql<number>`COUNT(*)`,
      })
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          gte(events.startDate, new Date().toISOString().split('T')[0])
        )
      );

    return {
      totalRevenue: revenueResult?.totalRevenue || 0,
      avgOccupancyRate: revenueResult?.avgOccupancyRate || 0,
      activeHotels,
      upcomingEvents: eventResult?.upcomingEvents || 0,
    };
  }

  async getRevenueAnalytics(hotelId?: string): Promise<Array<{ month: string; revenue: number }>> {
    let query = db
      .select({
        month: sql<string>`TO_CHAR(${hotelActuals.actualDate}, 'YYYY-MM')`,
        revenue: sql<number>`SUM(${hotelActuals.revenue})`,
      })
      .from(hotelActuals);

    if (hotelId) {
      query = query.where(eq(hotelActuals.hotelId, hotelId));
    }

    const results = await query
      .groupBy(sql`TO_CHAR(${hotelActuals.actualDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${hotelActuals.actualDate}, 'YYYY-MM')`);

    return results;
  }
}

export const storage = new DatabaseStorage();
