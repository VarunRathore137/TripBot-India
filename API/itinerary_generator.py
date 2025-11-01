from typing import Dict, List, Optional
import json
from .openAIAPI import TravelPreferences, generate_itinerary
from .maps_interface import (
    get_place_details,
    calculate_distances,
    find_nearby_hotels,
    get_place_photos
)

class ItineraryGenerator:
    def __init__(self):
        """Initialize the itinerary generator."""
        pass

    def generate_complete_itinerary(
        self,
        destination: Optional[str],
        group_type: str,
        num_days: int,
        budget: str,
        num_people: int
    ) -> Dict:
        """
        Generate a complete itinerary with all required details.
        
        Args:
            destination (Optional[str]): Desired destination (optional)
            group_type (str): Type of group (solo, couple, family, friends)
            num_days (int): Number of days for the trip
            budget (str): Budget level (budget, moderate, luxury)
            num_people (int): Number of people in the group
            
        Returns:
            Dict: Complete itinerary with all details
        """
        try:
            # 1. Generate basic itinerary using OpenAI
            preferences = TravelPreferences(
                destination=destination,
                group_type=group_type,
                num_days=num_days,
                budget=budget,
                num_people=num_people
            )
            
            basic_itinerary = generate_itinerary(preferences)
            
            # 2. Enhance with place details and coordinates
            for day in basic_itinerary['days']:
                for activity in day['activities']:
                    # Get detailed place information
                    place_details = get_place_details(activity['location'])
                    if place_details:
                        activity['coordinates'] = place_details['coordinates']
                        activity['place_id'] = place_details['place_id']
                        
                        # Add place photos
                        activity['photos'] = get_place_photos(place_details['place_id'])

            # 3. Find and add nearby hotels for first day's activities
            if basic_itinerary['days']:
                first_activity = basic_itinerary['days'][0]['activities'][0]
                nearby_hotels = find_nearby_hotels({
                    'coordinates': first_activity['coordinates']
                })
                basic_itinerary['hotels'] = nearby_hotels

            # 4. Calculate distances between consecutive locations
            for day in basic_itinerary['days']:
                activities = day['activities']
                if len(activities) > 1:
                    for i in range(1, len(activities)):
                        distances = calculate_distances(
                            [activities[i-1]],
                            [activities[i]]
                        )
                        if distances:
                            activities[i]['distance_from_prev'] = distances[0]['distance']
                            activities[i]['duration_from_prev'] = distances[0]['duration']

            return basic_itinerary

        except Exception as e:
            print(f"Error generating complete itinerary: {str(e)}")
            raise

    def update_itinerary(self, itinerary: Dict, updates: Dict) -> Dict:
        """
        Update an existing itinerary with new details or modifications.
        
        Args:
            itinerary (Dict): Existing itinerary
            updates (Dict): Updates to apply
            
        Returns:
            Dict: Updated itinerary
        """
        try:
            # Deep copy the original itinerary
            updated_itinerary = json.loads(json.dumps(itinerary))
            
            # Apply updates
            if 'remove_activities' in updates:
                for day_idx, activity_idx in updates['remove_activities']:
                    if 0 <= day_idx < len(updated_itinerary['days']):
                        day = updated_itinerary['days'][day_idx]
                        if 0 <= activity_idx < len(day['activities']):
                            day['activities'].pop(activity_idx)
            
            if 'add_activities' in updates:
                for day_idx, new_activity in updates['add_activities']:
                    if 0 <= day_idx < len(updated_itinerary['days']):
                        # Get place details for new activity
                        place_details = get_place_details(new_activity['location'])
                        if place_details:
                            new_activity['coordinates'] = place_details['coordinates']
                            new_activity['place_id'] = place_details['place_id']
                            new_activity['photos'] = get_place_photos(place_details['place_id'])
                        
                        updated_itinerary['days'][day_idx]['activities'].append(new_activity)
            
            # Recalculate distances if activities were modified
            if 'remove_activities' in updates or 'add_activities' in updates:
                for day in updated_itinerary['days']:
                    activities = day['activities']
                    if len(activities) > 1:
                        for i in range(1, len(activities)):
                            distances = calculate_distances(
                                [activities[i-1]],
                                [activities[i]]
                            )
                            if distances:
                                activities[i]['distance_from_prev'] = distances[0]['distance']
                                activities[i]['duration_from_prev'] = distances[0]['duration']
            
            return updated_itinerary

        except Exception as e:
            print(f"Error updating itinerary: {str(e)}")
            raise