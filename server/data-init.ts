import { storage } from './storage';
import { getCoordinatesForCity, addRandomOffset } from "./sample-coordinates";

export async function initializeTestData() {
  try {
    console.log('Initializing test data...');

    // Create demo user first
    let demoUser;
    try {
      demoUser = await storage.createUser({
        id: 'demo-user',
        email: 'demo@hotelcast.com',
        password: 'demo-password-hash',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin'
      });
      console.log('Created demo user');
    } catch (error) {
      // User might already exist, that's ok
      console.log('Demo user already exists or error creating:', error);
      demoUser = { id: 'demo-user' };
    }

    // Create test hotels with coordinates
    const nyCoords = getCoordinatesForCity('New York');
    const miamiCoords = getCoordinatesForCity('Miami');
    const denverCoords = getCoordinatesForCity('Denver');
    
    const hotels = await Promise.all([
      storage.createHotel({
        name: 'Grand Plaza Hotel',
        description: 'Luxury downtown hotel with conference facilities',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        latitude: nyCoords ? addRandomOffset(nyCoords.latitude, nyCoords.longitude).latitude.toString() : null,
        longitude: nyCoords ? addRandomOffset(nyCoords.latitude, nyCoords.longitude).longitude.toString() : null,
        phone: '+1-555-0123',
        email: 'info@grandplaza.com',
        website: 'https://grandplaza.com',
        starRating: 5,
        totalRooms: 250,
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        status: 'active'
      }),
      storage.createHotel({
        name: 'Seaside Resort',
        description: 'Beautiful beachfront resort perfect for events',
        address: '456 Ocean Drive',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        postalCode: '33139',
        latitude: miamiCoords ? addRandomOffset(miamiCoords.latitude, miamiCoords.longitude).latitude.toString() : null,
        longitude: miamiCoords ? addRandomOffset(miamiCoords.latitude, miamiCoords.longitude).longitude.toString() : null,
        phone: '+1-555-0456',
        email: 'reservations@seasideresort.com',
        website: 'https://seasideresort.com',
        starRating: 4,
        totalRooms: 180,
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        status: 'active'
      }),
      storage.createHotel({
        name: 'Mountain View Lodge',
        description: 'Cozy mountain retreat with conference rooms',
        address: '789 Alpine Way',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        postalCode: '80202',
        latitude: denverCoords ? addRandomOffset(denverCoords.latitude, denverCoords.longitude).latitude.toString() : null,
        longitude: denverCoords ? addRandomOffset(denverCoords.latitude, denverCoords.longitude).longitude.toString() : null,
        phone: '+1-555-0789',
        email: 'info@mountainview.com',
        website: 'https://mountainview.com',
        starRating: 4,
        totalRooms: 120,
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
        status: 'active'
      })
    ]);

    console.log(`Created ${hotels.length} test hotels`);

    // Create test events with coordinates
    const sfCoords = getCoordinatesForCity('San Francisco');
    const austinCoords = getCoordinatesForCity('Austin');
    const chicagoCoords = getCoordinatesForCity('Chicago');
    
    const events = await Promise.all([
      storage.createEvent({
        name: 'Tech Conference 2025',
        description: 'Annual technology conference featuring leading industry experts',
        category: 'conference',
        startDate: '2025-08-15',
        endDate: '2025-08-17',
        location: 'San Francisco Convention Center',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        latitude: sfCoords ? addRandomOffset(sfCoords.latitude, sfCoords.longitude).latitude.toString() : null,
        longitude: sfCoords ? addRandomOffset(sfCoords.latitude, sfCoords.longitude).longitude.toString() : null,
        expectedAttendees: 5000,
        impactRadius: '10.0',
        sourceUrl: 'https://techconf2025.com',
        isActive: true,
        createdBy: null
      }),
      storage.createEvent({
        name: 'Music Festival Summer',
        description: 'Three-day outdoor music festival with major artists',
        category: 'festival',
        startDate: '2025-08-22',
        endDate: '2025-08-24',
        location: 'Central Park',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        latitude: austinCoords ? addRandomOffset(austinCoords.latitude, austinCoords.longitude).latitude.toString() : null,
        longitude: austinCoords ? addRandomOffset(austinCoords.latitude, austinCoords.longitude).longitude.toString() : null,
        expectedAttendees: 15000,
        impactRadius: '15.0',
        sourceUrl: 'https://musicfest.com',
        isActive: true,
        createdBy: null
      }),
      storage.createEvent({
        name: 'International Trade Show',
        description: 'Global trade expo with vendors from around the world',
        category: 'trade-show',
        startDate: '2025-09-05',
        endDate: '2025-09-07',
        location: 'McCormick Place',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        latitude: chicagoCoords ? addRandomOffset(chicagoCoords.latitude, chicagoCoords.longitude).latitude.toString() : null,
        longitude: chicagoCoords ? addRandomOffset(chicagoCoords.latitude, chicagoCoords.longitude).longitude.toString() : null,
        expectedAttendees: 8000,
        impactRadius: '12.0',
        sourceUrl: 'https://tradeshow.com',
        isActive: true,
        createdBy: null
      })
    ]);

    console.log(`Created ${events.length} test events`);

    // Create test forecasts
    const forecasts = await Promise.all([
      storage.createForecast({
        hotelId: hotels[0].id,
        forecastType: 'event-based',
        forecastDate: '2025-08-15',
        occupancyRate: '95.0',
        averageDailyRate: '350.00',
        revenue: '83125.00',
        roomNights: 238,
        eventId: events[0].id,
        confidence: 'high',
        methodology: 'ai-generated',
        notes: 'High demand expected due to tech conference',
        createdBy: null
      }),
      storage.createForecast({
        hotelId: hotels[1].id,
        forecastType: 'event-based',
        forecastDate: '2025-08-22',
        occupancyRate: '88.0',
        averageDailyRate: '275.00',
        revenue: '43560.00',
        roomNights: 158,
        eventId: events[1].id,
        confidence: 'high',
        methodology: 'ai-generated',
        notes: 'Music festival impact - high weekend rates',
        createdBy: null
      })
    ]);

    console.log(`Created ${forecasts.length} test forecasts`);

    // Create test tasks
    const tasks = await Promise.all([
      storage.createTask({
        title: 'Review Q3 Revenue Forecast',
        description: 'Analyze and validate third quarter revenue projections',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2025-08-10'),
        assignedTo: null,
        hotelId: hotels[0].id,
        createdBy: null
      }),
      storage.createTask({
        title: 'Plan Marketing Campaign for Music Festival',
        description: 'Develop targeted marketing strategy for festival weekend',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date('2025-08-15'),
        assignedTo: null,
        hotelId: hotels[1].id,
        eventId: events[1].id,
        createdBy: null
      }),
      storage.createTask({
        title: 'Upload July Performance Data',
        description: 'Enter actual performance metrics for July',
        status: 'completed',
        priority: 'low',
        dueDate: new Date('2025-08-01'),
        assignedTo: null,
        hotelId: hotels[2].id,
        completedAt: new Date(),
        createdBy: null
      })
    ]);

    console.log(`Created ${tasks.length} test tasks`);

    // Create test hotel actuals
    const actuals = await storage.createHotelActuals([
      {
        hotelId: hotels[0].id,
        actualDate: '2025-07-15',
        occupancyRate: '92.0',
        averageDailyRate: '285.00',
        revenue: '65550.00',
        roomNights: 230,
        guestCount: 345,
        uploadedBy: null
      },
      {
        hotelId: hotels[1].id,
        actualDate: '2025-07-15',
        occupancyRate: '85.0',
        averageDailyRate: '225.00',
        revenue: '34425.00',
        roomNights: 153,
        guestCount: 280,
        uploadedBy: null
      },
      {
        hotelId: hotels[2].id,
        actualDate: '2025-07-15',
        occupancyRate: '78.0',
        averageDailyRate: '185.00',
        revenue: '17316.00',
        roomNights: 94,
        guestCount: 155,
        uploadedBy: null
      }
    ]);

    console.log(`Created ${actuals.length} hotel actuals records`);

    console.log('✅ Test data initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing test data:', error);
    return false;
  }
}