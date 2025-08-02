import { db } from "./db";
import { users, hotels, events, forecasts, tasks } from "@shared/schema";
import { hashPassword } from "./emailAuth";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create test users with email/password auth
    const testUsers = [
      {
        email: "admin@hotelcast.com",
        password: await hashPassword("password123"),
        firstName: "Admin",
        lastName: "User",
        location: "New York, NY",
        role: "admin",
        authProvider: "email",
      },
      {
        email: "manager@hotelcast.com", 
        password: await hashPassword("password123"),
        firstName: "Sarah",
        lastName: "Johnson",
        location: "Los Angeles, CA",
        role: "manager", 
        authProvider: "email",
      },
      {
        email: "analyst@hotelcast.com",
        password: await hashPassword("password123"),
        firstName: "Mike",
        lastName: "Chen",
        location: "Chicago, IL",
        role: "user",
        authProvider: "email",
      },
    ];

    console.log("Creating test users...");
    const createdUsers = await db.insert(users).values(testUsers).returning();
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Create sample hotels
    const sampleHotels = [
      {
        name: "Grand Plaza Hotel",
        description: "Luxury downtown hotel with premium amenities",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        country: "USA",
        postalCode: "10001",
        phone: "+1-555-0123",
        email: "info@grandplaza.com",
        website: "https://grandplaza.com",
        starRating: 5,
        totalRooms: 250,
        status: "active",
        ownerId: createdUsers[0].id,
      },
      {
        name: "Seaside Resort & Spa",
        description: "Beachfront resort with ocean views and spa services",
        address: "456 Ocean Drive",
        city: "Los Angeles",
        state: "CA", 
        country: "USA",
        postalCode: "90210",
        phone: "+1-555-0456",
        email: "reservations@seasideresort.com",
        website: "https://seasideresort.com",
        starRating: 4,
        totalRooms: 180,
        status: "active", 
        ownerId: createdUsers[1].id,
      },
      {
        name: "Urban Business Center",
        description: "Modern business hotel in the financial district",
        address: "789 Business Ave",
        city: "Chicago",
        state: "IL",
        country: "USA", 
        postalCode: "60601",
        phone: "+1-555-0789",
        email: "info@urbanbusiness.com",
        website: "https://urbanbusiness.com",
        starRating: 4,
        totalRooms: 120,
        status: "active",
        ownerId: createdUsers[2].id,
      },
    ];

    console.log("Creating sample hotels...");
    const createdHotels = await db.insert(hotels).values(sampleHotels).returning();
    console.log(`✅ Created ${createdHotels.length} sample hotels`);

    // Create sample events
    const sampleEvents = [
      {
        name: "Tech Conference 2025",
        description: "Annual technology conference with industry leaders",
        category: "conference",
        startDate: "2025-03-15",
        endDate: "2025-03-17",
        location: "Convention Center",
        city: "New York",
        state: "NY",
        country: "USA",
        expectedAttendees: 5000,
        impactRadius: "5.0",
        isActive: true,
        createdBy: createdUsers[0].id,
      },
      {
        name: "Summer Music Festival",
        description: "Three-day outdoor music festival",
        category: "festival",
        startDate: "2025-06-20",
        endDate: "2025-06-22",
        location: "Central Park",
        city: "Los Angeles",
        state: "CA",
        country: "USA",
        expectedAttendees: 25000,
        impactRadius: "10.0",
        isActive: true,
        createdBy: createdUsers[1].id,
      },
      {
        name: "Business Expo",
        description: "Trade show for business professionals",
        category: "trade-show",
        startDate: "2025-04-10",
        endDate: "2025-04-12",
        location: "McCormick Place",
        city: "Chicago",
        state: "IL",
        country: "USA",
        expectedAttendees: 8000,
        impactRadius: "7.5",
        isActive: true,
        createdBy: createdUsers[2].id,
      },
    ];

    console.log("Creating sample events...");
    const createdEvents = await db.insert(events).values(sampleEvents).returning();
    console.log(`✅ Created ${createdEvents.length} sample events`);

    // Create sample forecasts
    const sampleForecasts = [
      {
        hotelId: createdHotels[0].id,
        forecastType: "event-based",
        forecastDate: "2025-03-15",
        occupancyRate: "95.0",
        averageDailyRate: "450.00",
        revenue: "106875.00",
        roomNights: 237,
        eventId: createdEvents[0].id,
        confidence: "high",
        methodology: "ai-generated",
        notes: "High demand expected due to tech conference",
        createdBy: createdUsers[0].id,
      },
      {
        hotelId: createdHotels[1].id,
        forecastType: "event-based", 
        forecastDate: "2025-06-20",
        occupancyRate: "88.0",
        averageDailyRate: "380.00",
        revenue: "60192.00",
        roomNights: 158,
        eventId: createdEvents[1].id,
        confidence: "high",
        methodology: "ai-generated",
        notes: "Music festival driving bookings",
        createdBy: createdUsers[1].id,
      },
    ];

    console.log("Creating sample forecasts...");
    const createdForecasts = await db.insert(forecasts).values(sampleForecasts).returning();
    console.log(`✅ Created ${createdForecasts.length} sample forecasts`);

    // Create sample tasks
    const sampleTasks = [
      {
        title: "Review Q1 Revenue Forecasts",
        description: "Analyze and validate Q1 forecasting models",
        status: "pending",
        priority: "high",
        dueDate: new Date("2025-02-15"),
        assignedTo: createdUsers[1].id,
        hotelId: createdHotels[0].id,
        createdBy: createdUsers[0].id,
      },
      {
        title: "Prepare Event Impact Analysis",
        description: "Create detailed analysis of music festival impact on bookings",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date("2025-02-20"),
        assignedTo: createdUsers[2].id,
        hotelId: createdHotels[1].id,
        eventId: createdEvents[1].id,
        createdBy: createdUsers[1].id,
      },
      {
        title: "Update Hotel Information",
        description: "Refresh hotel amenities and pricing information",
        status: "completed",
        priority: "low",
        dueDate: new Date("2025-01-30"),
        assignedTo: createdUsers[2].id,
        hotelId: createdHotels[2].id,
        createdBy: createdUsers[2].id,
        completedAt: new Date(),
      },
    ];

    console.log("Creating sample tasks...");
    const createdTasks = await db.insert(tasks).values(sampleTasks).returning();
    console.log(`✅ Created ${createdTasks.length} sample tasks`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📝 Test User Credentials:");
    console.log("Admin: admin@hotelcast.com / password123");
    console.log("Manager: manager@hotelcast.com / password123");
    console.log("Analyst: analyst@hotelcast.com / password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}