from app import db
from datetime import datetime, timedelta
from decimal import Decimal
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Model):
    """User profile model for authentication and tracking user information"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    # Profile information
    full_name = db.Column(db.String(200), nullable=True)
    department = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(100), default='Revenue Manager')
    phone = db.Column(db.String(20), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    
    # Account settings
    is_active = db.Column(db.Boolean, default=True)
    theme_preference = db.Column(db.String(10), default='auto')  # 'light', 'dark', 'auto'
    email_notifications = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        """Hash and set the user's password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if provided password matches the stored hash"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_display_name(self):
        return self.full_name if self.full_name else self.username

class Hotel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hotel_code = db.Column(db.String(10), unique=True, nullable=False)
    hotel_name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    inventory = db.Column(db.Integer, nullable=False)
    hotel_link = db.Column(db.String(255), nullable=True)  # Website link for hotel
    address_link = db.Column(db.String(500), nullable=True)  # Google Maps link
    image_url = db.Column(db.String(500), nullable=True)  # Hotel image URL
    description = db.Column(db.Text, nullable=True)  # Hotel description/notes
    
    def __repr__(self):
        return f'<Hotel {self.hotel_code}: {self.hotel_name}>'

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    website_url = db.Column(db.String(500), nullable=True)  # Event website
    image_url = db.Column(db.String(500), nullable=True)  # Event image URL
    description = db.Column(db.Text, nullable=True)  # Event description/notes
    
    @property
    def duration(self):
        return (self.end_date - self.start_date).days + 1
    
    def __repr__(self):
        return f'<Event {self.event_name} in {self.city}>'

class Comment(db.Model):
    """Comments on hotels and events"""
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    
    # User who made the comment
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='comments')
    
    # What the comment is about (hotel or event)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)
    
    # For reply threading
    parent_id = db.Column(db.Integer, db.ForeignKey('comment.id'), nullable=True)
    parent = db.relationship('Comment', remote_side=[id], backref='replies')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Comment by {self.user.username}>'

class ChatConversation(db.Model):
    """Chat conversations with AI assistant"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=True)  # Auto-generated from first message
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='chat_conversations')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<ChatConversation {self.id}: {self.title}>'

class ChatMessage(db.Model):
    """Individual messages in chat conversations"""
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('chat_conversation.id'), nullable=False)
    conversation = db.relationship('ChatConversation', backref='messages')
    message_text = db.Column(db.Text, nullable=False)
    response_text = db.Column(db.Text, nullable=True)
    is_user_message = db.Column(db.Boolean, default=True)  # True for user, False for AI
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processing_time = db.Column(db.Float, nullable=True)  # Time taken to generate response
    
    def __repr__(self):
        return f'<ChatMessage {self.id} in conversation {self.conversation_id}>'

class EventSearch(db.Model):
    """Event search queries and parameters"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='event_searches')
    
    # Search parameters
    location = db.Column(db.String(200), nullable=False)  # City, postal code, or address
    event_types = db.Column(db.Text, nullable=True)  # JSON array of selected event types
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    
    # Search metadata
    search_name = db.Column(db.String(100), nullable=True)  # User-defined name for search
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_run = db.Column(db.DateTime, nullable=True)
    results_count = db.Column(db.Integer, default=0)
    
    def __repr__(self):
        return f'<EventSearch {self.id}: {self.location} ({self.start_date} to {self.end_date})>'

class ExternalEvent(db.Model):
    """External events found through APIs or scraping"""
    id = db.Column(db.Integer, primary_key=True)
    search_id = db.Column(db.Integer, db.ForeignKey('event_search.id'), nullable=False)
    search = db.relationship('EventSearch', backref='found_events')
    
    # Event details
    event_name = db.Column(db.String(300), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)  # Sports, Concerts, Fairs, etc.
    description = db.Column(db.Text, nullable=True)
    
    # Date and time
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.Time, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    
    # Location details
    venue_name = db.Column(db.String(200), nullable=True)
    venue_address = db.Column(db.String(300), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Source and links
    source = db.Column(db.String(100), nullable=False)  # Eventbrite, Ticketmaster, etc.
    source_url = db.Column(db.String(500), nullable=True)
    external_id = db.Column(db.String(100), nullable=True)  # ID from source API
    
    # Additional metadata
    price_range = db.Column(db.String(100), nullable=True)
    is_free = db.Column(db.Boolean, default=False)
    is_canceled = db.Column(db.Boolean, default=False)
    
    # User interactions
    is_favorited = db.Column(db.Boolean, default=False)
    user_notes = db.Column(db.Text, nullable=True)
    is_imported = db.Column(db.Boolean, default=False)  # Track if imported to main events
    imported_event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)  # Link to imported event
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to imported event
    imported_event = db.relationship('Event', backref='external_sources')
    
    def __repr__(self):
        return f'<ExternalEvent {self.id}: {self.event_name} on {self.event_date}>'
    
    @property
    def full_datetime(self):
        """Combine date and time into a single datetime object"""
        if self.event_time:
            return datetime.combine(self.event_date, self.event_time)
        return datetime.combine(self.event_date, datetime.min.time())
    
    @property
    def location_display(self):
        """Format location for display"""
        parts = []
        if self.venue_name:
            parts.append(self.venue_name)
        if self.venue_address:
            parts.append(self.venue_address)
        if self.city:
            parts.append(self.city)
        return ", ".join(parts)

class EventSearchExport(db.Model):
    """Track Excel exports of event search results"""
    id = db.Column(db.Integer, primary_key=True)
    search_id = db.Column(db.Integer, db.ForeignKey('event_search.id'), nullable=False)
    search = db.relationship('EventSearch', backref='exports')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='event_exports')
    
    filename = db.Column(db.String(200), nullable=False)
    events_count = db.Column(db.Integer, nullable=False)
    file_size = db.Column(db.Integer, nullable=True)  # Size in bytes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<EventSearchExport {self.id}: {self.filename}>'

class EventForecast(db.Model):
    __tablename__ = 'event_forecast'
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    forecast_date = db.Column(db.Date, nullable=False)
    
    # Forecast data
    revenue = db.Column(db.Numeric(10, 2), nullable=True)
    adr = db.Column(db.Numeric(8, 2), nullable=True)
    occupancy = db.Column(db.Numeric(5, 2), nullable=True)
    
    # User tracking
    created_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hotel = db.relationship('Hotel', backref='forecasts')
    event = db.relationship('Event', backref='forecasts')
    
    @property
    def room_nights(self):
        if self.occupancy and self.hotel:
            return int((self.occupancy / 100) * self.hotel.inventory)
        return 0
    
    def __repr__(self):
        return f'<EventForecast {self.hotel.hotel_code} - {self.event.event_name} on {self.forecast_date}>'

class MonthlyForecast(db.Model):
    __tablename__ = 'monthly_forecast'
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    forecast_date = db.Column(db.Date, nullable=False)
    
    # Forecast metrics
    revenue = db.Column(db.Numeric(10, 2), nullable=True)
    adr = db.Column(db.Numeric(8, 2), nullable=True)
    occupancy = db.Column(db.Numeric(5, 2), nullable=True)
    room_nights = db.Column(db.Integer, nullable=True)
    
    # Tracking
    created_by = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hotel = db.relationship('Hotel', backref='monthly_forecasts')
    
    # Unique constraint to prevent duplicate entries
    __table_args__ = (
        db.UniqueConstraint('hotel_id', 'forecast_date', name='_hotel_date_uc'),
    )
    
    def __repr__(self):
        return f'<MonthlyForecast {self.hotel.hotel_code} - {self.forecast_date}>'

class HotelActuals(db.Model):
    """Hotel actual performance data"""
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # This Year (TY) data
    ty_revenue = db.Column(db.Numeric(12, 2), nullable=True)
    ty_room_nights = db.Column(db.Integer, nullable=True)
    ty_adr = db.Column(db.Numeric(8, 2), nullable=True)
    
    # Same Time Last Year (STLY) data
    stly_revenue = db.Column(db.Numeric(12, 2), nullable=True)
    stly_room_nights = db.Column(db.Integer, nullable=True)
    stly_adr = db.Column(db.Numeric(8, 2), nullable=True)
    
    # Results Last Year (RESLY) data
    resly_revenue = db.Column(db.Numeric(12, 2), nullable=True)
    resly_room_nights = db.Column(db.Integer, nullable=True)
    resly_adr = db.Column(db.Numeric(8, 2), nullable=True)
    
    # Calculated fields
    @property
    def ty_occupancy(self):
        if self.ty_room_nights and self.hotel and self.hotel.inventory:
            return round((self.ty_room_nights / self.hotel.inventory) * 100, 2)
        return 0
    
    @property
    def stly_occupancy(self):
        if self.stly_room_nights and self.hotel and self.hotel.inventory:
            return round((self.stly_room_nights / self.hotel.inventory) * 100, 2)
        return 0
    
    @property
    def resly_occupancy(self):
        if self.resly_room_nights and self.hotel and self.hotel.inventory:
            return round((self.resly_room_nights / self.hotel.inventory) * 100, 2)
        return 0
    
    # Variance calculations
    @property
    def revenue_variance_vs_stly(self):
        if self.ty_revenue and self.stly_revenue:
            return float(self.ty_revenue - self.stly_revenue)
        return 0
    
    @property
    def revenue_variance_percent_vs_stly(self):
        if self.ty_revenue and self.stly_revenue and self.stly_revenue != 0:
            return round(((self.ty_revenue - self.stly_revenue) / self.stly_revenue) * 100, 2)
        return 0
    
    # Relationships
    hotel = db.relationship('Hotel', backref='actuals')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<HotelActuals {self.hotel.hotel_code} on {self.date}>'

# Task Management Models
class Task(db.Model):
    """Task assignment and tracking model"""
    id = db.Column(db.Integer, primary_key=True)
    
    # Basic task information
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    
    # Assignment details
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Optional property associations
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)
    
    # Timing
    due_date = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Task category
    category = db.Column(db.String(50), default='general')  # general, forecasting, review, analysis, etc.
    
    # Relationships
    assigned_by = db.relationship('User', foreign_keys=[assigned_by_id], backref='tasks_assigned')
    assigned_to = db.relationship('User', foreign_keys=[assigned_to_id], backref='tasks_received')
    hotel = db.relationship('Hotel', backref='tasks')
    event = db.relationship('Event', backref='tasks')
    
    @property
    def is_overdue(self):
        if self.due_date and self.status not in ['completed', 'cancelled']:
            return datetime.utcnow() > self.due_date
        return False
    
    @property
    def priority_badge_class(self):
        priority_classes = {
            'low': 'bg-secondary',
            'medium': 'bg-info', 
            'high': 'bg-warning',
            'urgent': 'bg-danger'
        }
        return priority_classes.get(self.priority, 'bg-secondary')
    
    @property
    def status_badge_class(self):
        status_classes = {
            'pending': 'bg-light text-dark',
            'in_progress': 'bg-primary',
            'completed': 'bg-success',
            'cancelled': 'bg-secondary'
        }
        return status_classes.get(self.status, 'bg-light text-dark')
    
    def __repr__(self):
        return f'<Task {self.title}>'

class TaskComment(db.Model):
    """Comments and updates on tasks"""
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    
    # Status update tracking
    old_status = db.Column(db.String(20), nullable=True)
    new_status = db.Column(db.String(20), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    task = db.relationship('Task', backref='comments')
    user = db.relationship('User', backref='task_comments')
    
    def __repr__(self):
        return f'<TaskComment on Task {self.task_id}>'

class UserTaskFollow(db.Model):
    """Users following other users' tasks"""
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    followed_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # What types of tasks to follow
    follow_assigned_tasks = db.Column(db.Boolean, default=True)  # Tasks assigned to the followed user
    follow_created_tasks = db.Column(db.Boolean, default=True)   # Tasks created by the followed user
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    follower = db.relationship('User', foreign_keys=[follower_id], backref='following_users')
    followed_user = db.relationship('User', foreign_keys=[followed_user_id], backref='followers')
    
    # Unique constraint to prevent duplicate follows
    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_user_id', name='unique_user_follow'),)

class HotelAssignment(db.Model):
    """Hotel assignments to users for management responsibilities"""
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotel.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Assignment details
    assigned_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(50), default='manager')  # manager, analyst, coordinator, etc.
    is_primary = db.Column(db.Boolean, default=False)  # Primary manager for the hotel
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hotel = db.relationship('Hotel', backref='assignments')
    user = db.relationship('User', foreign_keys=[user_id], backref='hotel_assignments')
    assigned_by = db.relationship('User', foreign_keys=[assigned_by_id], backref='assignments_made')
    
    # Unique constraint to prevent duplicate assignments
    __table_args__ = (db.UniqueConstraint('hotel_id', 'user_id', name='unique_hotel_user_assignment'),)
    
    def __repr__(self):
        return f'<HotelAssignment {self.hotel.hotel_name} -> {self.user.get_display_name()}>'