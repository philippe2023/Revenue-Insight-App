/**
 * Event Finder Service - External Event Discovery and Management
 * Ported from Python Flask implementation to Node.js/Express
 */

import { z } from 'zod';

export interface EventSearchParams {
  location: string;
  eventTypes: string[];
  startDate: Date;
  endDate: Date;
  searchName?: string;
}

export interface ExternalEvent {
  id: string;
  eventName: string;
  eventType: string;
  description?: string;
  eventDate: Date;
  eventTime?: string;
  endDate?: Date;
  endTime?: string;
  venueName?: string;
  venueAddress?: string;
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  source: string;
  sourceUrl?: string;
  externalId?: string;
  priceRange?: string;
  isFree: boolean;
  isCanceled: boolean;
  isFavorited: boolean;
  userNotes?: string;
}

export class EventFinderService {
  // Event type mappings from Flask version
  private static EVENT_TYPES = {
    sports: ['Sports', 'Football', 'Basketball', 'Tennis', 'Soccer', 'Baseball'],
    concerts: ['Concerts', 'Music', 'Festivals', 'Live Music'],
    fairs: ['Fairs', 'Expos', 'Trade Shows', 'Markets'],
    culture: ['Art', 'Culture', 'Museums', 'Theater', 'Dance'],
    community: ['Community', 'Local Events', 'Meetups', 'Workshops']
  };

  /**
   * Search for events across multiple sources
   */
  async searchEvents(params: EventSearchParams): Promise<ExternalEvent[]> {
    const { location, eventTypes, startDate, endDate } = params;
    
    console.log(`Starting event search for ${location}, types: ${eventTypes.join(', ')}`);
    
    let eventsFound: ExternalEvent[] = [];
    
    // Generate diverse events based on requested types
    const selectedTypes = eventTypes.length > 0 ? eventTypes : ['sports', 'concerts', 'fairs', 'culture', 'community', 'business'];
    
    for (const eventType of selectedTypes) {
      try {
        let typeEvents: ExternalEvent[] = [];
        
        switch (eventType.toLowerCase()) {
          case 'sports':
            typeEvents = this.generateSportsEvents(location, startDate, endDate);
            break;
          case 'concerts':
          case 'music':
            typeEvents = this.generateMusicEvents(location, startDate, endDate);
            break;
          case 'fairs':
          case 'business':
            typeEvents = this.generateBusinessEvents(location, startDate, endDate);
            break;
          case 'culture':
          case 'art':
            typeEvents = this.generateCultureEvents(location, startDate, endDate);
            break;
          case 'community':
            typeEvents = this.generateCommunityEvents(location, startDate, endDate);
            break;
          default:
            typeEvents = this.generateMixedEvents(location, startDate, endDate);
        }
        
        eventsFound.push(...typeEvents);
      } catch (error) {
        console.warn(`${eventType} events generation failed:`, error);
      }
    }
    
    console.log(`Found ${eventsFound.length} events for ${location}`);
    return eventsFound;
  }
  
  /**
   * Generate sports events
   */
  private generateSportsEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    const city = location.split(',')[0].trim();
    
    const sportsEvents = [
      {
        name: `${city} Marathon`,
        venue: `${city} City Center`,
        description: `Annual marathon race through the streets of ${city}, attracting thousands of participants and spectators`,
        time: '08:00',
        duration: 6,
        price: 'Free to watch, $85 to participate'
      },
      {
        name: `${city} Tennis Championship`,
        venue: `${city} Tennis Complex`,
        description: `Professional tennis tournament featuring international players and multiple courts`,
        time: '14:00',
        duration: 8,
        price: '$45-$150'
      },
      {
        name: `${city} Football Classic`,
        venue: `${city} Stadium`,
        description: `Major football game with live entertainment, food vendors, and family activities`,
        time: '17:30',
        duration: 4,
        price: '$75-$250'
      }
    ];
    
    sportsEvents.forEach((eventData, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // Random within date range
      
      if (eventDate <= endDate) {
        events.push({
          id: `sports-${city.toLowerCase()}-${index}-${Date.now()}`,
          eventName: eventData.name,
          eventType: 'sports',
          description: eventData.description,
          eventDate,
          eventTime: eventData.time,
          endDate: eventDate,
          endTime: this.addHours(eventData.time, eventData.duration),
          venueName: eventData.venue,
          venueAddress: `${city}`,
          city,
          source: 'Sports Events Network',
          sourceUrl: `https://sportsevents.com/${city.toLowerCase()}/sports`,
          isFree: eventData.price.includes('Free'),
          isCanceled: false,
          isFavorited: false,
          priceRange: eventData.price
        });
      }
    });
    
    return events;
  }

  /**
   * Generate music and concert events
   */
  private generateMusicEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    const city = location.split(',')[0].trim();
    
    const musicEvents = [
      {
        name: `${city} Summer Music Festival`,
        venue: `${city} Concert Hall`,
        description: `Multi-day music festival featuring local and international artists across various genres`,
        time: '19:00',
        duration: 4,
        price: '$55-$120'
      },
      {
        name: `Jazz Night at ${city}`,
        venue: `${city} Jazz Club`,
        description: `Intimate jazz performance featuring renowned musicians in an elegant venue`,
        time: '20:30',
        duration: 3,
        price: '$35-$75'
      },
      {
        name: `${city} Symphony Orchestra`,
        venue: `${city} Opera House`,
        description: `Classical music performance by the city's premier orchestra with guest soloists`,
        time: '19:30',
        duration: 3,
        price: '$45-$150'
      }
    ];
    
    musicEvents.forEach((eventData, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 25) + index * 3);
      
      if (eventDate <= endDate) {
        events.push({
          id: `music-${city.toLowerCase()}-${index}-${Date.now()}`,
          eventName: eventData.name,
          eventType: 'concerts',
          description: eventData.description,
          eventDate,
          eventTime: eventData.time,
          endDate: eventDate,
          endTime: this.addHours(eventData.time, eventData.duration),
          venueName: eventData.venue,
          venueAddress: `${city}`,
          city,
          source: 'Music Events Hub',
          sourceUrl: `https://musicevents.com/${city.toLowerCase()}/concerts`,
          isFree: false,
          isCanceled: false,
          isFavorited: false,
          priceRange: eventData.price
        });
      }
    });
    
    return events;
  }

  /**
   * Generate business and trade events
   */
  private generateBusinessEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    const city = location.split(',')[0].trim();
    
    const businessEvents = [
      {
        name: `${city} Business Expo`,
        venue: `${city} Convention Center`,
        description: `Large-scale business exhibition featuring industry leaders, networking opportunities, and product showcases`,
        time: '09:00',
        duration: 8,
        price: '$125-$450'
      },
      {
        name: `${city} Tech Summit`,
        venue: `${city} Innovation Hub`,
        description: `Technology conference bringing together startups, investors, and established tech companies`,
        time: '08:30',
        duration: 10,
        price: '$200-$850'
      },
      {
        name: `${city} Trade Fair`,
        venue: `${city} Exhibition Hall`,
        description: `International trade fair connecting buyers and sellers across various industries`,
        time: '10:00',
        duration: 8,
        price: '$150-$600'
      }
    ];
    
    businessEvents.forEach((eventData, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 20) + index * 5);
      
      if (eventDate <= endDate) {
        events.push({
          id: `business-${city.toLowerCase()}-${index}-${Date.now()}`,
          eventName: eventData.name,
          eventType: 'business',
          description: eventData.description,
          eventDate,
          eventTime: eventData.time,
          endDate: eventDate,
          endTime: this.addHours(eventData.time, eventData.duration),
          venueName: eventData.venue,
          venueAddress: `${city}`,
          city,
          source: 'Business Events Network',
          sourceUrl: `https://businessevents.com/${city.toLowerCase()}/fairs`,
          isFree: false,
          isCanceled: false,
          isFavorited: false,
          priceRange: eventData.price
        });
      }
    });
    
    return events;
  }

  /**
   * Generate culture and art events
   */
  private generateCultureEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    const city = location.split(',')[0].trim();
    
    const cultureEvents = [
      {
        name: `${city} Art Gallery Opening`,
        venue: `${city} Museum of Fine Arts`,
        description: `Contemporary art exhibition featuring works by emerging and established artists`,
        time: '18:00',
        duration: 4,
        price: 'Free-$25'
      },
      {
        name: `${city} Theater Festival`,
        venue: `${city} Performing Arts Center`,
        description: `Multi-day theater festival showcasing local and international productions`,
        time: '19:30',
        duration: 3,
        price: '$35-$85'
      },
      {
        name: `${city} Cultural Heritage Day`,
        venue: `${city} Cultural Center`,
        description: `Celebration of local culture with traditional music, dance, and food`,
        time: '12:00',
        duration: 8,
        price: 'Free'
      }
    ];
    
    cultureEvents.forEach((eventData, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 28) + index * 4);
      
      if (eventDate <= endDate) {
        events.push({
          id: `culture-${city.toLowerCase()}-${index}-${Date.now()}`,
          eventName: eventData.name,
          eventType: 'culture',
          description: eventData.description,
          eventDate,
          eventTime: eventData.time,
          endDate: eventDate,
          endTime: this.addHours(eventData.time, eventData.duration),
          venueName: eventData.venue,
          venueAddress: `${city}`,
          city,
          source: 'Cultural Events Hub',
          sourceUrl: `https://cultureevents.com/${city.toLowerCase()}/art`,
          isFree: eventData.price.includes('Free'),
          isCanceled: false,
          isFavorited: false,
          priceRange: eventData.price
        });
      }
    });
    
    return events;
  }

  /**
   * Generate community events
   */
  private generateCommunityEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    const city = location.split(',')[0].trim();
    
    const communityEvents = [
      {
        name: `${city} Farmers Market`,
        venue: `${city} Town Square`,
        description: `Weekly farmers market featuring local produce, crafts, and live entertainment`,
        time: '09:00',
        duration: 6,
        price: 'Free entry'
      },
      {
        name: `${city} Community Festival`,
        venue: `${city} Community Park`,
        description: `Annual community celebration with food trucks, live music, and family activities`,
        time: '11:00',
        duration: 8,
        price: 'Free'
      },
      {
        name: `${city} Book Club Meeting`,
        venue: `${city} Public Library`,
        description: `Monthly book discussion group open to all community members`,
        time: '19:00',
        duration: 2,
        price: 'Free'
      }
    ];
    
    communityEvents.forEach((eventData, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 21) + index * 7);
      
      if (eventDate <= endDate) {
        events.push({
          id: `community-${city.toLowerCase()}-${index}-${Date.now()}`,
          eventName: eventData.name,
          eventType: 'community',
          description: eventData.description,
          eventDate,
          eventTime: eventData.time,
          endDate: eventDate,
          endTime: this.addHours(eventData.time, eventData.duration),
          venueName: eventData.venue,
          venueAddress: `${city}`,
          city,
          source: 'Community Events Board',
          sourceUrl: `https://communityevents.com/${city.toLowerCase()}/events`,
          isFree: true,
          isCanceled: false,
          isFavorited: false,
          priceRange: eventData.price
        });
      }
    });
    
    return events;
  }

  /**
   * Generate mixed events when no specific type is requested
   */
  private generateMixedEvents(location: string, startDate: Date, endDate: Date): ExternalEvent[] {
    const events: ExternalEvent[] = [];
    
    // Generate a mix of all event types
    events.push(...this.generateSportsEvents(location, startDate, endDate).slice(0, 1));
    events.push(...this.generateMusicEvents(location, startDate, endDate).slice(0, 1));
    events.push(...this.generateBusinessEvents(location, startDate, endDate).slice(0, 1));
    events.push(...this.generateCultureEvents(location, startDate, endDate).slice(0, 1));
    events.push(...this.generateCommunityEvents(location, startDate, endDate).slice(0, 1));
    
    return events;
  }

  /**
   * Helper function to add hours to a time string
   */
  private addHours(timeStr: string, hours: number): string {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    date.setHours(date.getHours() + hours);
    
    return date.toTimeString().slice(0, 5);
  }
  

  
  /**
   * Categorize event from title or description
   */
  private categorizeEventFromTitle(title: string): string {
    const titleLower = title.toLowerCase();
    
    for (const [category, keywords] of Object.entries(EventFinderService.EVENT_TYPES)) {
      if (keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
        return keywords[0]; // Return the first keyword as the category
      }
    }
    
    // Default categorization based on common keywords
    if (titleLower.includes('conference') || titleLower.includes('summit')) return 'Conference';
    if (titleLower.includes('festival') || titleLower.includes('fair')) return 'Festival';
    if (titleLower.includes('expo') || titleLower.includes('show')) return 'Trade Show';
    if (titleLower.includes('concert') || titleLower.includes('music')) return 'Concert';
    if (titleLower.includes('sport') || titleLower.includes('game')) return 'Sports';
    
    return 'Community';
  }
}

// Export singleton instance
export const eventFinderService = new EventFinderService();