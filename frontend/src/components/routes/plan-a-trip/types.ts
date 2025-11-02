export interface Activity {
  id: string;
  name: string;
  description?: string;
  time?: string;
  cost?: number;
  location?: string;
  type?: 'sightseeing' | 'activity' | 'meal' | 'transport' | 'accommodation';
}

export interface DayItinerary {
  dayNumber: number;
  date?: string;
  activities: Activity[];
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
  estimatedCosts: {
    activities?: number;
    meals?: number;
    accommodation?: number;
    transport?: number;
    total: number;
  };
}

export interface TripItinerary {
  destination: string;
  duration: number;
  details: string;  // AI-generated itinerary text
  destination: string;
  duration: number;
  budget: string;
  travelers: string;
  overview: string;
  dailyItinerary: DayItinerary[];
  travelTips: string[];
  culturalNotes: string[];
  totalEstimatedCost: number;
}