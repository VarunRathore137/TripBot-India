const OpenAI = require('openai');
const axios = require('axios');
const { OPENAI_API_KEY, GOOGLE_MAPS_API_KEY } = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

class ItineraryService {
  static async generateItinerary({ destination, startDate, endDate, budget, interests }) {
    try {
      // Input validation
      if (!destination || !startDate || !endDate || !budget) {
        throw new Error('Missing required parameters for itinerary generation');
      }

      // Step 1: Get destination details from Google Maps
      const placeDetails = await this.getPlaceDetails(destination);
      if (!placeDetails) {
        throw new Error(`Could not find details for destination: ${destination}`);
      }
      
      // Step 2: Generate AI itinerary
      const itinerary = await this.generateAIItinerary({
        destination,
        placeDetails,
        startDate,
        endDate,
        budget,
        interests
      });
      
      if (!itinerary || !itinerary.days) {
        throw new Error('Failed to generate valid itinerary structure');
      }

      // Step 3: Enrich with location data
      const enrichedItinerary = await this.enrichWithLocationData(itinerary);
      
      // Validate final itinerary structure
      if (!this.validateItinerary(enrichedItinerary)) {
        throw new Error('Generated itinerary failed validation');
      }

      return enrichedItinerary;
    } catch (error) {
      console.error('Itinerary generation error:', {
        error: error.message,
        stack: error.stack,
        params: { destination, startDate, endDate, budget }
      });
      
      // Throw specific error types for better error handling
      if (error.message.includes('API key')) {
        throw new Error('External API configuration error');
      } else if (error.message.includes('destination')) {
        throw new Error('Invalid destination specified');
      } else if (error.message.includes('validation')) {
        throw new Error('Itinerary validation failed');
      }
      throw error;
    }
  }

  static async getPlaceDetails(destination) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          destination
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (!response.data.results.length) {
        throw new Error('Location not found');
      }

      const placeId = response.data.results[0].place_id;
      const detailsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,photo,rating,type&key=${GOOGLE_MAPS_API_KEY}`
      );

      return detailsResponse.data.result;
    } catch (error) {
      console.error('Place details error:', error);
      throw new Error('Failed to fetch location details');
    }
  }

  static async generateAIItinerary({ destination, placeDetails, startDate, endDate, budget, interests }) {
    try {
      const prompt = `Create a detailed travel itinerary for ${destination} with the following criteria:
        - Duration: From ${startDate} to ${endDate}
        - Budget: ${budget}
        - Interests: ${interests.join(', ')}
        - Include local attractions, food recommendations, and cultural experiences
        - Consider local weather and peak times
        Please format the response with clear day-by-day activities, estimated costs, and timing.`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });

      return this.parseAIResponse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate AI itinerary');
    }
  }

  static parseAIResponse(content) {
    // Implement parsing logic to convert AI response to structured format
    // This is a simplified example - enhance based on actual response format
    const days = content.split(/Day \d+:/).filter(Boolean);
    
    return {
      overview: days[0].trim(),
      dailyItinerary: days.map((day, index) => ({
        day: index + 1,
        activities: this.extractActivities(day),
      })),
    };
  }

  static extractActivities(dayContent) {
    // Implement activity extraction logic
    // This is a simplified example - enhance based on actual content structure
    const activities = dayContent.split('\n').filter(line => line.trim());
    
    return activities.map(activity => ({
      time: this.extractTime(activity) || '',
      description: activity.trim(),
      type: this.categorizeActivity(activity),
    }));
  }

  static async enrichWithLocationData(itinerary) {
    // Enrich each activity with location data from Google Maps
    for (const day of itinerary.dailyItinerary) {
      for (const activity of day.activities) {
        try {
          const locationData = await this.getLocationData(activity.description);
          if (locationData) {
            activity.location = locationData;
          }
        } catch (error) {
          console.warn(`Could not enrich activity with location data: ${error.message}`);
        }
      }
    }
    return itinerary;
  }

  static categorizeActivity(activity) {
    const lowercase = activity.toLowerCase();
    if (lowercase.includes('breakfast') || lowercase.includes('lunch') || lowercase.includes('dinner')) {
      return 'meal';
    } else if (lowercase.includes('hotel') || lowercase.includes('check-in') || lowercase.includes('accommodation')) {
      return 'accommodation';
    } else if (lowercase.includes('travel') || lowercase.includes('transfer') || lowercase.includes('transport')) {
      return 'transport';
    }
    return 'attraction';
  }

  static extractTime(activity) {
    const timeRegex = /(\d{1,2}:\d{2}(?:\s*[AaPp][Mm])?)/;
    const match = activity.match(timeRegex);
    return match ? match[1] : null;
  }

  static async getLocationData(description) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          description
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.results.length > 0) {
        const place = response.data.results[0];
        return {
          name: place.name,
          address: place.formatted_address,
          coordinates: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
          placeId: place.place_id,
          rating: place.rating,
        };
      }
      return null;
    } catch (error) {
      console.warn('Location data fetch error:', error);
      return null;
    }
  }
}

module.exports = ItineraryService;