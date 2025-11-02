import React, { useState } from 'react';
import { generateItinerary } from '../services/ItineraryService';

interface ItineraryDisplayProps {
  destination: string;
  duration: number;
  preferences: string[];
  onError: (error: string) => void;
}

interface Activity {
  time: string;
  description: string;
  emoji: string;
  type: string;
}

interface DayPlan {
  dayNumber: number;
  theme: string;
  themeEmoji: string;
  activities: Activity[];
}

interface GeneratedItinerary {
  destination: string;
  duration: number;
  days: DayPlan[];
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({
  destination,
  duration,
  preferences,
  onError
}) => {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(false);

  const generateNewItinerary = async () => {
    setLoading(true);
    try {
      const generatedItinerary = await generateItinerary(
        destination,
        duration,
        preferences
      );
      setItinerary(generatedItinerary);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  // Activity type to color mapping
  const typeColors: Record<string, string> = {
    culture: 'bg-purple-100',
    adventure: 'bg-orange-100',
    food: 'bg-green-100',
    relaxation: 'bg-blue-100',
    sightseeing: 'bg-yellow-100'
  };

  React.useEffect(() => {
    generateNewItinerary();
  }, [destination, duration]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!itinerary) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">
          AI-Generated Itinerary for {itinerary.destination}
        </h2>
        <p className="text-gray-600">
          {itinerary.duration} Days • {preferences.join(' • ')}
        </p>
      </div>

      <div className="space-y-8">
        {itinerary.days.map((day) => (
          <div
            key={day.dayNumber}
            className="border rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{day.themeEmoji}</span>
                <h3 className="text-xl font-semibold">
                  Day {day.dayNumber}: {day.theme}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {day.activities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-3 rounded-lg ${
                    typeColors[activity.type] || 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-sm font-medium">{activity.time}</div>
                    <div className="text-xl mt-1">{activity.emoji}</div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-800">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={generateNewItinerary}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating...' : 'Regenerate Itinerary'}
        </button>
      </div>
    </div>
  );
};

export default ItineraryDisplay;