/**
 * AI Chat Assistant for Hotel Database Queries
 * Ported from Python Flask implementation to Node.js/Express
 * Uses database context for RAG functionality
 */

import { storage } from './storage';

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  processingTime?: number;
}

export interface DatabaseContext {
  hotels?: any[];
  events?: any[];
  forecasts?: any[];
  actuals?: any[];
  tasks?: any[];
  error?: string;
}

export class HotelChatAssistant {
  /**
   * Get relevant database context based on the query
   */
  private async getDatabaseContext(queryText: string): Promise<DatabaseContext> {
    const contextData: DatabaseContext = {};
    const queryLower = queryText.toLowerCase();
    
    // Analyze query to determine what data to fetch
    const needsHotels = this.containsWords(queryLower, ['hotel', 'property', 'location', 'inventory', 'room']);
    const needsEvents = this.containsWords(queryLower, ['event', 'conference', 'trade', 'sport', 'fair']);
    const needsForecasts = this.containsWords(queryLower, ['forecast', 'prediction', 'future', 'plan', 'budget']);
    const needsActuals = this.containsWords(queryLower, ['actual', 'performance', 'revenue', 'adr', 'occupancy', 'result']);
    const needsRankings = this.containsWords(queryLower, ['rank', 'compare', 'best', 'worst', 'top', 'bottom']);
    const needsTasks = this.containsWords(queryLower, ['task', 'assignment', 'work', 'todo']);
    
    try {
      // Get hotels data
      if (needsHotels || !this.hasAnyNeeds([needsEvents, needsForecasts, needsActuals, needsRankings, needsTasks])) {
        const hotels = await storage.getAllHotels();
        contextData.hotels = hotels.slice(0, 50).map(h => ({
          id: h.id,
          name: h.name,
          city: h.city,
          totalRooms: h.totalRooms,
          description: h.description
        }));
      }
      
      // Get events data
      if (needsEvents) {
        const events = await storage.getAllEvents();
        contextData.events = events.slice(0, 30).map(e => ({
          name: e.name,
          city: e.city,
          startDate: e.startDate,
          endDate: e.endDate,
          category: e.category
        }));
      }
      
      // Get forecast data
      if (needsForecasts) {
        const forecasts = await storage.getAllForecasts();
        contextData.forecasts = forecasts.slice(0, 50).map(f => ({
          hotelId: f.hotelId,
          forecastDate: f.forecastDate,
          revenue: f.revenue ? parseFloat(f.revenue.toString()) : 0,
          averageDailyRate: f.averageDailyRate ? parseFloat(f.averageDailyRate.toString()) : 0,
          occupancyRate: f.occupancyRate ? parseFloat(f.occupancyRate.toString()) : 0,
          confidence: f.confidence
        }));
      }
      
      // Get actuals data
      if (needsActuals || needsRankings) {
        const actuals = await storage.getAllHotelActuals();
        contextData.actuals = actuals.slice(0, 100).map(a => ({
          hotelId: a.hotelId,
          actualDate: a.actualDate,
          revenue: a.revenue ? parseFloat(a.revenue.toString()) : 0,
          averageDailyRate: a.averageDailyRate ? parseFloat(a.averageDailyRate.toString()) : 0,
          occupancyRate: a.occupancyRate ? parseFloat(a.occupancyRate.toString()) : 0,
          roomNights: a.roomNights || 0
        }));
      }
      
      // Get tasks if relevant
      if (needsTasks) {
        const tasks = await storage.getAllTasks();
        contextData.tasks = tasks.slice(0, 20).map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          description: t.description
        }));
      }
      
    } catch (error) {
      console.error('Error fetching database context:', error);
      contextData.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return contextData;
  }
  
  /**
   * Process user message with RAG context from database
   */
  async processMessage(messageText: string): Promise<string> {
    try {
      // Get relevant database context
      const contextData = await this.getDatabaseContext(messageText);
      
      // Since we don't have Ollama in this environment, use direct processing
      const response = this.processQueryDirectly(messageText, contextData);
      
      return response;
      
    } catch (error) {
      console.error('Error processing message:', error);
      return `I encountered an error while processing your question: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your question.`;
    }
  }
  
  /**
   * Process queries directly using database data
   */
  private processQueryDirectly(prompt: string, contextData: DatabaseContext): string {
    if (!contextData || Object.keys(contextData).length === 0) {
      return "I couldn't retrieve the database information needed to answer your question.";
    }
    
    const promptLower = prompt.toLowerCase();
    const responseParts: string[] = [];
    
    // Handle hotel queries
    if (contextData.hotels && this.containsWords(promptLower, ['hotel', 'property', 'location'])) {
      const hotelsInfo = contextData.hotels.slice(0, 10);
      responseParts.push('**Hotels Information:**');
      hotelsInfo.forEach(hotel => {
        responseParts.push(`• ${hotel.name} - ${hotel.city} - ${hotel.totalRooms} rooms`);
      });
    }
    
    // Handle actuals/performance queries
    if (contextData.actuals && this.containsWords(promptLower, ['revenue', 'performance', 'actual', 'adr', 'occupancy'])) {
      const actuals = contextData.actuals.slice(0, 10);
      responseParts.push('\n**Recent Performance Data:**');
      actuals.forEach(actual => {
        responseParts.push(`• Hotel ${actual.hotelId} (${actual.actualDate}): Revenue $${actual.revenue.toLocaleString()}, ADR $${actual.averageDailyRate.toFixed(2)}, Occupancy ${actual.occupancyRate.toFixed(1)}%`);
      });
    }
    
    // Handle forecast queries
    if (contextData.forecasts && this.containsWords(promptLower, ['forecast', 'prediction', 'future'])) {
      const forecasts = contextData.forecasts.slice(0, 10);
      responseParts.push('\n**Forecasts:**');
      forecasts.forEach(forecast => {
        responseParts.push(`• Hotel ${forecast.hotelId} (${forecast.forecastDate}): Revenue $${forecast.revenue.toLocaleString()}, ADR $${forecast.averageDailyRate.toFixed(2)}, Confidence: ${forecast.confidence}`);
      });
    }
    
    // Handle events queries
    if (contextData.events && this.containsWords(promptLower, ['event', 'conference', 'trade'])) {
      const events = contextData.events.slice(0, 10);
      responseParts.push('\n**Upcoming Events:**');
      events.forEach(event => {
        responseParts.push(`• ${event.name} in ${event.city} (${event.startDate} to ${event.endDate}) - ${event.category}`);
      });
    }
    
    // Handle ranking queries
    if (this.containsWords(promptLower, ['rank', 'best', 'top', 'compare']) && contextData.actuals) {
      // Simple ranking by revenue
      const actuals = [...contextData.actuals]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      responseParts.push('\n**Top Hotels by Revenue:**');
      actuals.forEach((actual, i) => {
        responseParts.push(`${i + 1}. Hotel ${actual.hotelId}: $${actual.revenue.toLocaleString()}`);
      });
    }
    
    // Handle task queries
    if (contextData.tasks && this.containsWords(promptLower, ['task', 'assignment', 'work'])) {
      const tasks = contextData.tasks.slice(0, 10);
      responseParts.push('\n**Recent Tasks:**');
      tasks.forEach(task => {
        responseParts.push(`• ${task.title} - Status: ${task.status}, Priority: ${task.priority}`);
      });
    }
    
    if (responseParts.length === 0) {
      return "I found database information but couldn't match it specifically to your question. Could you be more specific about what hotel data you're looking for?";
    }
    
    return responseParts.join('\n');
  }
  
  /**
   * Helper method to check if query contains specific words
   */
  private containsWords(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word));
  }
  
  /**
   * Helper method to check if any condition is true
   */
  private hasAnyNeeds(needs: boolean[]): boolean {
    return needs.some(need => need);
  }
}

// Export singleton instance
export const hotelChatAssistant = new HotelChatAssistant();