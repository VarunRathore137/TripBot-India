# Travel Itinerary Generation System

This module provides a comprehensive travel itinerary generation system that combines OpenAI's GPT-4 API for intelligent itinerary creation and Google Maps Platform for location services, distances, and real-time data.

## Features

- **Smart Itinerary Generation**
  - Personalized travel plans based on user preferences
  - Group type-specific recommendations
  - Budget-aware suggestions
  - Flexible duration planning

- **Location Intelligence**
  - Accurate place details and coordinates
  - Distance calculations between locations
  - Nearby hotel recommendations
  - Place photos and rich metadata

- **Interactive Customization**
  - Real-time itinerary updates
  - Add/remove activities
  - Distance recalculation
  - Hotel alternatives

## Setup

1. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## Usage Example

```python
from itinerary_generator import ItineraryGenerator

# Initialize the generator
generator = ItineraryGenerator()

# Generate a complete itinerary
itinerary = generator.generate_complete_itinerary(
    destination="Jaipur",
    group_type="family",
    num_days=3,
    budget="moderate",
    num_people=4
)

# Later, update the itinerary if needed
updates = {
    "add_activities": [
        (0, {
            "time": "14:00",
            "location": "Hawa Mahal",
            "description": "Visit the iconic Palace of Winds"
        })
    ]
}
updated_itinerary = generator.update_itinerary(itinerary, updates)
```

## API Response Format

The generated itinerary follows this structure:

```json
{
    "destination": "string",
    "hotels": [
        {
            "name": "string",
            "location": {"lat": float, "lng": float},
            "price": "string",
            "distance": "string",
            "rating": float,
            "photos": ["url1", "url2"]
        }
    ],
    "days": [
        {
            "day": number,
            "activities": [
                {
                    "time": "string",
                    "location": "string",
                    "coordinates": {"lat": float, "lng": float},
                    "description": "string",
                    "cost": "string",
                    "distance_from_prev": "string",
                    "duration_from_prev": "string",
                    "photos": ["url1", "url2"]
                }
            ]
        }
    ]
}
```

## Error Handling

The system includes comprehensive error handling for:
- API failures (OpenAI and Google Maps)
- Invalid location data
- Missing coordinates
- Network issues

## Dependencies

- requests: HTTP client for API calls
- googlemaps: Google Maps Platform Python client
- python-dotenv: Environment variable management