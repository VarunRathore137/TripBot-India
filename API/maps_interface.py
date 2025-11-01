import os
from typing import Dict, List, Tuple
try:
    import googlemaps
except ImportError:
    print("Please install googlemaps: pip install googlemaps")
    raise

# Initialize the Google Maps client
MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "YOUR_API_KEY_HERE")
gmaps = googlemaps.Client(key=MAPS_API_KEY)

def get_place_details(location: str) -> Dict:
    """
    Get detailed information about a place using Google Places API.
    
    Args:
        location (str): Name of the location to search for
        
    Returns:
        Dict: Place details including coordinates and address
    """
    try:
        # Search for the place
        places_result = gmaps.places(location)
        
        if places_result['status'] == 'OK' and len(places_result['results']) > 0:
            place = places_result['results'][0]
            return {
                'name': place['name'],
                'address': place['formatted_address'],
                'coordinates': {
                    'lat': place['geometry']['location']['lat'],
                    'lng': place['geometry']['location']['lng']
                },
                'place_id': place['place_id']
            }
        return None
    except Exception as e:
        print(f"Error fetching place details: {str(e)}")
        raise

def calculate_distances(origins: List[Dict], destinations: List[Dict]) -> List[Dict]:
    """
    Calculate distances between consecutive locations using Google Distance Matrix API.
    
    Args:
        origins (List[Dict]): List of origin locations with coordinates
        destinations (List[Dict]): List of destination locations with coordinates
        
    Returns:
        List[Dict]: Distance and duration information for each pair
    """
    try:
        # Extract coordinates
        origin_coords = [(loc['coordinates']['lat'], loc['coordinates']['lng']) for loc in origins]
        dest_coords = [(loc['coordinates']['lat'], loc['coordinates']['lng']) for loc in destinations]
        
        # Get distance matrix
        matrix = gmaps.distance_matrix(
            origin_coords,
            dest_coords,
            mode="driving",
            units="metric"
        )
        
        results = []
        if matrix['status'] == 'OK':
            for i, row in enumerate(matrix['rows']):
                for j, element in enumerate(row['elements']):
                    if element['status'] == 'OK':
                        results.append({
                            'origin': origins[i]['name'],
                            'destination': destinations[j]['name'],
                            'distance': element['distance']['text'],
                            'duration': element['duration']['text']
                        })
        return results
    except Exception as e:
        print(f"Error calculating distances: {str(e)}")
        raise

def find_nearby_hotels(location: Dict, radius_meters: int = 5000) -> List[Dict]:
    """
    Find hotels near a specific location using Google Places API.
    
    Args:
        location (Dict): Location dictionary with coordinates
        radius_meters (int): Search radius in meters
        
    Returns:
        List[Dict]: List of nearby hotels with details
    """
    try:
        # Search for nearby hotels
        places_result = gmaps.places_nearby(
            location=location['coordinates'],
            radius=radius_meters,
            type='lodging'
        )
        
        hotels = []
        if places_result['status'] == 'OK':
            for place in places_result['results']:
                # Get detailed information for each hotel
                details = gmaps.place(place['place_id'])['result']
                
                hotel = {
                    'name': details.get('name'),
                    'address': details.get('formatted_address'),
                    'coordinates': {
                        'lat': details['geometry']['location']['lat'],
                        'lng': details['geometry']['location']['lng']
                    },
                    'rating': details.get('rating'),
                    'price_level': details.get('price_level', 'N/A'),
                    'place_id': details['place_id']
                }
                
                # Add website and phone if available
                if 'website' in details:
                    hotel['website'] = details['website']
                if 'formatted_phone_number' in details:
                    hotel['phone'] = details['formatted_phone_number']
                    
                hotels.append(hotel)
                
        return hotels
    except Exception as e:
        print(f"Error finding nearby hotels: {str(e)}")
        raise

def get_place_photos(place_id: str, max_photos: int = 3) -> List[str]:
    """
    Get photo references for a place using Google Places API.
    
    Args:
        place_id (str): Google Places place ID
        max_photos (int): Maximum number of photos to retrieve
        
    Returns:
        List[str]: List of photo reference URLs
    """
    try:
        # Get place details including photos
        place_details = gmaps.place(
            place_id,
            fields=['photo']
        )
        
        photo_refs = []
        if 'result' in place_details and 'photos' in place_details['result']:
            photos = place_details['result']['photos'][:max_photos]
            
            for photo in photos:
                if 'photo_reference' in photo:
                    # Construct the URL for the photo
                    photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference={photo['photo_reference']}&key={MAPS_API_KEY}"
                    photo_refs.append(photo_url)
                    
        return photo_refs
    except Exception as e:
        print(f"Error fetching place photos: {str(e)}")
        raise