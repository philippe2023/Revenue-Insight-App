"""
AI Chat Assistant for Hotel Database Queries
Uses Ollama with Llama 3.2 for natural language processing with RAG functionality
"""

import json
import re
import subprocess
from datetime import datetime, timedelta, date
from models import (Hotel, Event, EventForecast, MonthlyForecast, HotelActuals, 
                   User, Comment, Task, TaskComment, UserTaskFollow, 
                   HotelAssignment, ExternalEvent, EventSearch, EventSearchExport)
from app import db
from sqlalchemy import func, desc, text, and_, or_
import logging

class HotelChatAssistant:
    def __init__(self):
        self.model_name = "llama3.2"
        self.setup_ollama()
    
    def setup_ollama(self):
        """Setup Ollama and pull the model if needed"""
        try:
            # Start Ollama service first
            subprocess.run(['ollama', 'serve'], timeout=2, capture_output=True)
        except:
            pass  # Service might already be running
            
        try:
            # Check if model is available
            result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=10)
            if self.model_name not in result.stdout:
                logging.info(f"Pulling {self.model_name} model...")
                subprocess.run(['ollama', 'pull', self.model_name], timeout=300)
            self.ollama_available = True
            logging.info(f"Ollama {self.model_name} model ready")
        except Exception as e:
            logging.warning(f"Ollama setup issue: {e}")
            self.ollama_available = False
    
    def get_database_context(self, query_text):
        """Extract relevant database information based on the query"""
        context_data = {}
        query_lower = query_text.lower()
        
        # Analyze query to determine what data to fetch
        needs_hotels = any(word in query_lower for word in ['hotel', 'property', 'location', 'inventory', 'room'])
        needs_events = any(word in query_lower for word in ['event', 'conference', 'trade', 'sport', 'fair'])
        needs_forecasts = any(word in query_lower for word in ['forecast', 'prediction', 'future', 'plan', 'budget'])
        needs_actuals = any(word in query_lower for word in ['actual', 'performance', 'revenue', 'adr', 'occupancy', 'result'])
        needs_rankings = any(word in query_lower for word in ['rank', 'compare', 'best', 'worst', 'top', 'bottom'])
        needs_tasks = any(word in query_lower for word in ['task', 'assignment', 'work', 'todo'])
        
        try:
            # Get hotels data
            if needs_hotels or not any([needs_events, needs_forecasts, needs_actuals, needs_rankings, needs_tasks]):
                hotels = Hotel.query.limit(50).all()
                context_data['hotels'] = [{
                    'code': h.hotel_code, 'name': h.hotel_name, 'city': h.city,
                    'inventory': h.inventory, 'description': h.description
                } for h in hotels]
            
            # Get events data
            if needs_events:
                events = Event.query.order_by(desc(Event.start_date)).limit(30).all()
                context_data['events'] = [{
                    'name': e.event_name, 'city': e.city, 'start_date': str(e.start_date),
                    'end_date': str(e.end_date), 'duration': e.duration
                } for e in events]
            
            # Get forecast data
            if needs_forecasts:
                forecasts = db.session.query(
                    EventForecast, Hotel, Event
                ).join(Hotel, EventForecast.hotel_id == Hotel.id).join(Event, EventForecast.event_id == Event.id).order_by(desc(EventForecast.created_at)).limit(50).all()
                context_data['event_forecasts'] = [{
                    'hotel': f[1].hotel_name, 'event': f[2].event_name,
                    'date': str(f[0].forecast_date), 'revenue': float(f[0].revenue or 0),
                    'adr': float(f[0].adr or 0), 'occupancy': float(f[0].occupancy or 0)
                } for f in forecasts]
                
                # Monthly forecasts
                monthly_forecasts = db.session.query(
                    MonthlyForecast, Hotel
                ).join(Hotel, MonthlyForecast.hotel_id == Hotel.id).order_by(desc(MonthlyForecast.forecast_date)).limit(100).all()
                context_data['monthly_forecasts'] = [{
                    'hotel': f[1].hotel_name, 'date': str(f[0].forecast_date),
                    'revenue': float(f[0].revenue or 0),
                    'adr': float(f[0].adr or 0), 'occupancy': float(f[0].occupancy or 0)
                } for f in monthly_forecasts]
            
            # Get actuals data
            if needs_actuals or needs_rankings:
                actuals = db.session.query(
                    HotelActuals, Hotel
                ).join(Hotel, HotelActuals.hotel_id == Hotel.id).order_by(desc(HotelActuals.date)).limit(100).all()
                context_data['actuals'] = [{
                    'hotel': a[1].hotel_name, 'date': str(a[0].date),
                    'ty_revenue': float(a[0].ty_revenue or 0), 'ty_rooms': int(a[0].ty_rooms or 0),
                    'ty_adr': float(a[0].ty_adr or 0), 'ty_occupancy': float(a[0].ty_occupancy_percent or 0),
                    'stly_revenue': float(a[0].stly_revenue or 0), 'stly_rooms': int(a[0].stly_rooms or 0)
                } for a in actuals]
            
            # Get tasks if relevant
            if needs_tasks:
                tasks = Task.query.order_by(desc(Task.created_at)).limit(20).all()
                context_data['tasks'] = [{
                    'title': t.title, 'status': t.status, 'priority': t.priority,
                    'due_date': str(t.due_date) if t.due_date else None,
                    'assigned_to': t.assigned_user.username if t.assigned_user else None
                } for t in tasks]
                
        except Exception as e:
            logging.error(f"Error fetching database context: {e}")
            context_data['error'] = str(e)
        
        return context_data
    
    def query_ollama(self, prompt, context_data=None):
        """Query Ollama with RAG context from database"""
        if not hasattr(self, 'ollama_available') or not self.ollama_available:
            return self.process_query_directly(prompt, context_data)
            
        try:
            # Format context for LLM
            context_str = ""
            if context_data:
                context_str = f"Database Information:\n{json.dumps(context_data, indent=2)}\n\n"
            
            full_prompt = f"""You are an AI assistant for Revenue Insight, a hotel revenue management system. 
You have access to comprehensive hotel data including forecasts, actuals, events, and performance metrics.

{context_str}User Question: {prompt}

Instructions:
- Analyze the database information provided above
- Give specific, data-driven answers based on the actual data
- Include relevant numbers, percentages, and comparisons
- Be concise but comprehensive
- If the data shows trends or patterns, highlight them
- Format your response clearly with bullet points or sections when appropriate

Response:"""

            result = subprocess.run([
                'ollama', 'run', self.model_name, full_prompt
            ], capture_output=True, text=True, timeout=45)
            
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
            else:
                return self.process_query_directly(prompt, context_data)
                
        except subprocess.TimeoutExpired:
            return "The AI is taking longer than expected. Here's what I found in the database instead:\n\n" + self.process_query_directly(prompt, context_data)
        except Exception as e:
            logging.error(f"Ollama query error: {e}")
            return self.process_query_directly(prompt, context_data)
    
    def process_query_directly(self, prompt, context_data):
        """Process queries directly using database data when Ollama is unavailable"""
        if not context_data:
            return "I couldn't retrieve the database information needed to answer your question."
        
        prompt_lower = prompt.lower()
        response_parts = []
        
        # Handle hotel queries
        if 'hotels' in context_data and any(word in prompt_lower for word in ['hotel', 'property', 'location']):
            hotels_info = context_data['hotels'][:10]  # Limit for readability
            response_parts.append(f"**Hotels Information:**")
            for hotel in hotels_info:
                response_parts.append(f"• {hotel['name']} ({hotel['code']}) - {hotel['city']} - {hotel['inventory']} rooms")
        
        # Handle actuals/performance queries
        if 'actuals' in context_data and any(word in prompt_lower for word in ['revenue', 'performance', 'actual', 'adr', 'occupancy']):
            actuals = context_data['actuals'][:10]
            response_parts.append(f"\n**Recent Performance Data:**")
            for actual in actuals:
                response_parts.append(f"• {actual['hotel']} ({actual['date']}): Revenue ${actual['ty_revenue']:,.0f}, ADR ${actual['ty_adr']:.2f}, Occupancy {actual['ty_occupancy']:.1f}%")
        
        # Handle forecast queries
        if 'event_forecasts' in context_data and any(word in prompt_lower for word in ['forecast', 'prediction', 'future']):
            forecasts = context_data['event_forecasts'][:10]
            response_parts.append(f"\n**Event Forecasts:**")
            for forecast in forecasts:
                response_parts.append(f"• {forecast['hotel']} - {forecast['event']} ({forecast['date']}): Revenue ${forecast['revenue']:,.0f}, ADR ${forecast['adr']:.2f}")
        
        # Handle events queries
        if 'events' in context_data and any(word in prompt_lower for word in ['event', 'conference', 'trade']):
            events = context_data['events'][:10]
            response_parts.append(f"\n**Upcoming Events:**")
            for event in events:
                response_parts.append(f"• {event['name']} in {event['city']} ({event['start_date']} to {event['end_date']}) - {event['duration']} days")
        
        # Handle ranking queries
        if any(word in prompt_lower for word in ['rank', 'best', 'top', 'compare']) and 'actuals' in context_data:
            # Simple ranking by revenue
            actuals = sorted(context_data['actuals'], key=lambda x: x['ty_revenue'], reverse=True)[:5]
            response_parts.append(f"\n**Top Hotels by Revenue:**")
            for i, actual in enumerate(actuals, 1):
                response_parts.append(f"{i}. {actual['hotel']}: ${actual['ty_revenue']:,.0f}")
        
        if not response_parts:
            return "I found database information but couldn't match it specifically to your question. Could you be more specific about what hotel data you're looking for?"
        
        return "\n".join(response_parts)
    
    def process_message(self, message_text):
        """Main method to process user messages with RAG"""
        try:
            # Get relevant database context
            context_data = self.get_database_context(message_text)
            
            # Query Ollama with context or use direct processing
            response = self.query_ollama(message_text, context_data)
            
            return response
            
        except Exception as e:
            logging.error(f"Error processing message: {e}")
            return f"I encountered an error while processing your question: {str(e)}. Please try rephrasing your question."

# Create global instance
chat_assistant = HotelChatAssistant()