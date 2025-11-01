import os
from typing import Dict, List, Optional, Union
import json
try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Please install required packages: pip install requests python-dotenv")
    raise

# Load environment variables from .env file if it exists
load_dotenv()

# Set your Together.ai API key from environment variable
API_KEY = os.getenv("TOGETHER_API_KEY")
if not API_KEY:
    print("TOGETHER_API_KEY not found, checking OPENAI_API_KEY...")
    API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    raise ValueError(
        "API key not found. Please set either TOGETHER_API_KEY or OPENAI_API_KEY environment variable. "
        "You can get an API key from https://api.together.xyz/settings/api-keys"
    )
else:
    print(f"Using API key: {API_KEY[:10]}...")

MODEL_NAME = "mistralai/Mixtral-8x7B-Instruct-v0.1"  # A powerful model available on Together.ai

class TravelPreferences:
    def __init__(
        self,
        destination: Optional[str],
        group_type: str,
        num_days: int,
        budget: str,
        num_people: int
    ):
        self.destination = destination
        self.group_type = group_type
        self.num_days = num_days
        self.budget = budget
        self.num_people = num_people

    def to_dict(self) -> Dict[str, Union[str, int, None]]:
        return {
            "destination": self.destination,
            "group_type": self.group_type,
            "num_days": self.num_days,
            "budget": self.budget,
            "num_people": self.num_people
        }

def generate_itinerary(preferences: TravelPreferences) -> Dict:
    """
    Generate a detailed travel itinerary using OpenAI's GPT-4.
    
    Args:
        preferences (TravelPreferences): Travel preferences including destination, group type, etc.
        
    Returns:
        Dict: Generated itinerary in JSON format
        
    Raises:
        requests.RequestException: If the API call fails
        json.JSONDecodeError: If the response is not valid JSON
    """

    prompt_template = """Create a detailed travel itinerary for:
    Destination: {destination}
    Group Type: {group_type} ({num_people} people)
    Duration: {num_days} days
    Budget Level: {budget}

    Include:
    1. Daily schedule with timing
    2. Recommended hotels near first day's destination
    3. Distance between consecutive locations
    4. Real-time considerations
    5. Budget breakdown per activity

    Return as JSON with this structure:
    {{
      "destination": "string",
      "hotels": [
        {{
          "name": "string",
          "location": {{"lat": 0.0, "lng": 0.0}},
          "price": "string",
          "distance": "string"
        }}
      ],
      "days": [
        {{
          "day": 1,
          "activities": [
            {{
              "time": "string",
              "location": "string",
              "coordinates": {{"lat": 0.0, "lng": 0.0}},
              "description": "string",
              "cost": "string",
              "distance_from_prev": "string"
            }}
          ]
        }}
      ]
    }}"""

    # Format the prompt with actual values
    prompt = prompt_template.format(
        destination=preferences.destination if preferences.destination else "a popular destination in India",
        group_type=preferences.group_type,
        num_days=preferences.num_days,
        num_people=preferences.num_people,
        budget=preferences.budget
    )

    # Set up the API request
    headers = {
        "Authorization": f"Bearer {API_KEY}",  # Together.ai requires "Bearer" prefix
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a travel planning assistant that generates detailed itineraries in JSON format. Always ensure your responses are valid JSON objects."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 3000,
        "stop": [],
        "frequency_penalty": 0,
        "presence_penalty": 0
    }

    try:
        # Make the API request to Together.ai API endpoint
        response = requests.post(
            "https://api.together.xyz/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        # Raise an exception for any HTTP error
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        if "choices" in result and len(result["choices"]) > 0:
            # Extract and parse the JSON content from the message
            content = result["choices"][0]["message"]["content"]
            return json.loads(content)
        else:
            raise ValueError("Unexpected API response format")
            
    except requests.RequestException as e:
        print(f"API Request Error: {str(e)}")
        raise
    except json.JSONDecodeError as e:
        print(f"JSON Parsing Error: {str(e)}")
        raise
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage
    preferences = TravelPreferences(
        destination="Jaipur",
        group_type="family",
        num_days=5,
        budget="moderate",
        num_people=4
    )
    
    try:
        itinerary = generate_itinerary(preferences)
        print("Generated Itinerary:")
        print(json.dumps(itinerary, indent=2))
    except Exception as e:
        print(f"Error generating itinerary: {str(e)}")
