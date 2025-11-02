export interface Activity {
  time: string;
  description: string;
  emoji: string;
  type: 'culture' | 'adventure' | 'food' | 'relaxation' | 'sightseeing';
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  themeEmoji: string;
  activities: Activity[];
}

export interface GeneratedItinerary {
  destination: string;
  duration: number;
  days: DayPlan[];
}

export interface ItineraryPreferences {
  destination: string;
  duration: number;
  interests: string[];
  budget?: string;
  travelStyle?: 'relaxed' | 'moderate' | 'intensive';
}