from app import db
from models import Hotel, Event
from datetime import datetime, date, timedelta

def initialize_data():
    """Initialize the database with sample hotel and event data if empty."""
    
    # Check if data already exists
    if Hotel.query.first() or Event.query.first():
        return
    
    # Sample Hotels
    hotels = [
        {'hotel_code': 'NYC001', 'hotel_name': 'Manhattan Grand Hotel', 'city': 'New York', 'inventory': 350},
        {'hotel_code': 'NYC002', 'hotel_name': 'Central Park Plaza', 'city': 'New York', 'inventory': 280},
        {'hotel_code': 'LA001', 'hotel_name': 'Hollywood Luxury Resort', 'city': 'Los Angeles', 'inventory': 420},
        {'hotel_code': 'LA002', 'hotel_name': 'Beverly Hills Suites', 'city': 'Los Angeles', 'inventory': 200},
        {'hotel_code': 'CHI001', 'hotel_name': 'Chicago Business Center', 'city': 'Chicago', 'inventory': 300},
        {'hotel_code': 'CHI002', 'hotel_name': 'Lakefront Hotel', 'city': 'Chicago', 'inventory': 180},
        {'hotel_code': 'MIA001', 'hotel_name': 'Miami Beach Resort', 'city': 'Miami', 'inventory': 500},
        {'hotel_code': 'MIA002', 'hotel_name': 'Downtown Miami Hotel', 'city': 'Miami', 'inventory': 250},
    ]
    
    # Add hotels to database
    for hotel_data in hotels:
        hotel = Hotel(**hotel_data)
        db.session.add(hotel)
    
    # Sample Events
    today = date.today()
    events = [
        # New York Events
        {'event_name': 'Tech Innovation Summit', 'start_date': today + timedelta(days=10), 'end_date': today + timedelta(days=12), 'city': 'New York'},
        {'event_name': 'Fashion Week NYC', 'start_date': today + timedelta(days=20), 'end_date': today + timedelta(days=27), 'city': 'New York'},
        {'event_name': 'Financial Services Conference', 'start_date': today + timedelta(days=35), 'end_date': today + timedelta(days=37), 'city': 'New York'},
        {'event_name': 'Broadway Awards Ceremony', 'start_date': today + timedelta(days=45), 'end_date': today + timedelta(days=45), 'city': 'New York'},
        
        # Los Angeles Events
        {'event_name': 'Hollywood Film Festival', 'start_date': today + timedelta(days=15), 'end_date': today + timedelta(days=19), 'city': 'Los Angeles'},
        {'event_name': 'Entertainment Industry Gala', 'start_date': today + timedelta(days=30), 'end_date': today + timedelta(days=31), 'city': 'Los Angeles'},
        {'event_name': 'Music Awards Show', 'start_date': today + timedelta(days=50), 'end_date': today + timedelta(days=50), 'city': 'Los Angeles'},
        
        # Chicago Events
        {'event_name': 'Manufacturing Expo', 'start_date': today + timedelta(days=12), 'end_date': today + timedelta(days=16), 'city': 'Chicago'},
        {'event_name': 'Healthcare Innovation Forum', 'start_date': today + timedelta(days=25), 'end_date': today + timedelta(days=27), 'city': 'Chicago'},
        {'event_name': 'Food & Beverage Convention', 'start_date': today + timedelta(days=40), 'end_date': today + timedelta(days=43), 'city': 'Chicago'},
        
        # Miami Events
        {'event_name': 'Art Basel Miami Beach', 'start_date': today + timedelta(days=18), 'end_date': today + timedelta(days=22), 'city': 'Miami'},
        {'event_name': 'International Boat Show', 'start_date': today + timedelta(days=32), 'end_date': today + timedelta(days=36), 'city': 'Miami'},
        {'event_name': 'Latin Music Awards', 'start_date': today + timedelta(days=55), 'end_date': today + timedelta(days=56), 'city': 'Miami'},
    ]
    
    # Add events to database
    for event_data in events:
        event = Event(**event_data)
        db.session.add(event)
    
    # Commit all changes
    try:
        db.session.commit()
        print("Database initialized with sample data.")
    except Exception as e:
        db.session.rollback()
        print(f"Error initializing database: {e}")
