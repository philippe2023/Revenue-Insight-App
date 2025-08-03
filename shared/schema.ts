import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - for email authentication only
export const session = pgTable(
  "session",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table - email/password authentication only
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // required for email auth
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  location: varchar("location"), // city, state/country
  role: varchar("role").default("user"), // user, admin, manager
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotels table
export const hotels = pgTable("hotels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  starRating: integer("star_rating"),
  totalRooms: integer("total_rooms"),
  imageUrl: varchar("image_url"),
  status: varchar("status").default("active"), // active, inactive, maintenance
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotel team assignments
export const hotelAssignments = pgTable("hotel_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: varchar("hotel_id").references(() => hotels.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role"), // manager, analyst, viewer
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category"), // conference, festival, trade-show, sports, concert
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  location: text("location"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 100 }),
  expectedAttendees: integer("expected_attendees"),
  impactRadius: decimal("impact_radius", { precision: 8, scale: 2 }), // kilometers
  sourceUrl: varchar("source_url"),
  scrapedAt: timestamp("scraped_at"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forecasts table
export const forecasts = pgTable("forecasts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: varchar("hotel_id").references(() => hotels.id).notNull(),
  forecastType: varchar("forecast_type"), // event-based, monthly, annual
  forecastDate: date("forecast_date").notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }),
  averageDailyRate: decimal("average_daily_rate", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  roomNights: integer("room_nights"),
  eventId: varchar("event_id").references(() => events.id), // if event-based forecast
  confidence: varchar("confidence"), // high, medium, low
  methodology: varchar("methodology"), // manual, ai-generated, historical
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hotel actuals (real performance data)
export const hotelActuals = pgTable("hotel_actuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hotelId: varchar("hotel_id").references(() => hotels.id).notNull(),
  actualDate: date("actual_date").notNull(),
  occupancyRate: decimal("occupancy_rate", { precision: 5, scale: 2 }),
  averageDailyRate: decimal("average_daily_rate", { precision: 10, scale: 2 }),
  revenue: decimal("revenue", { precision: 15, scale: 2 }),
  roomNights: integer("room_nights"),
  guestCount: integer("guest_count"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status").default("pending"), // pending, in-progress, completed, cancelled
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  hotelId: varchar("hotel_id").references(() => hotels.id),
  eventId: varchar("event_id").references(() => events.id),
  createdBy: varchar("created_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments table for collaborative features
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  entityType: varchar("entity_type"), // hotel, event, forecast, task
  entityId: varchar("entity_id").notNull(),
  parentId: varchar("parent_id"), // for threaded replies, self-reference added in relations
  authorId: varchar("author_id").references(() => users.id).notNull(),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log for audit trail
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action"), // create, update, delete, login, upload
  entityType: varchar("entity_type"), // hotel, event, forecast, task, user
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"), // additional context
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ownedHotels: many(hotels),
  hotelAssignments: many(hotelAssignments),
  createdEvents: many(events),
  forecasts: many(forecasts),
  uploadedActuals: many(hotelActuals),
  assignedTasks: many(tasks, { relationName: "assigned_tasks" }),
  createdTasks: many(tasks, { relationName: "created_tasks" }),
  comments: many(comments),
  activities: many(activityLog),
}));

export const hotelsRelations = relations(hotels, ({ many }) => ({
  assignments: many(hotelAssignments),
  forecasts: many(forecasts),
  actuals: many(hotelActuals),
  tasks: many(tasks),
}));

export const hotelAssignmentsRelations = relations(hotelAssignments, ({ one }) => ({
  hotel: one(hotels, {
    fields: [hotelAssignments.hotelId],
    references: [hotels.id],
  }),
  user: one(users, {
    fields: [hotelAssignments.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  forecasts: many(forecasts),
  tasks: many(tasks),
}));

export const forecastsRelations = relations(forecasts, ({ one }) => ({
  hotel: one(hotels, {
    fields: [forecasts.hotelId],
    references: [hotels.id],
  }),
  event: one(events, {
    fields: [forecasts.eventId],
    references: [events.id],
  }),
  creator: one(users, {
    fields: [forecasts.createdBy],
    references: [users.id],
  }),
}));

export const hotelActualsRelations = relations(hotelActuals, ({ one }) => ({
  hotel: one(hotels, {
    fields: [hotelActuals.hotelId],
    references: [hotels.id],
  }),
  uploader: one(users, {
    fields: [hotelActuals.uploadedBy],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assigned_tasks",
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "created_tasks",
  }),
  hotel: one(hotels, {
    fields: [tasks.hotelId],
    references: [hotels.id],
  }),
  event: one(events, {
    fields: [tasks.eventId],
    references: [events.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parent_comment",
  }),
  replies: many(comments, {
    relationName: "parent_comment",
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// Schema types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;
export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export const insertEventSchema = createInsertSchema(events, {
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Please enter a valid end date",
  }),
  expectedAttendees: z.coerce.number().int().positive().optional().nullable(),
  impactRadius: z.coerce.number().positive().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Forecast = typeof forecasts.$inferSelect;
export type InsertForecast = typeof forecasts.$inferInsert;
export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HotelActual = typeof hotelActuals.$inferSelect;
export type InsertHotelActual = typeof hotelActuals.$inferInsert;
export const insertHotelActualSchema = createInsertSchema(hotelActuals).omit({
  id: true,
  uploadedAt: true,
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HotelAssignment = typeof hotelAssignments.$inferSelect;
export type InsertHotelAssignment = typeof hotelAssignments.$inferInsert;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;
