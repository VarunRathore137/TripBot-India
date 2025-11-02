import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../Context/Itinerary/ItineraryContext';

interface Activity {
  time: string;
  description: string;
  location: string;
}

interface Day {
  dayNumber: number;
  activities: Activity[];
}

interface ItineraryData {
  destination: string;
  duration: number;
  days: Day[];
}

export default function ItineraryPlan() {
  const navigate = useNavigate();
  const { itineraryData, isGenerating, error } = useItinerary();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Go back and try again
          </button>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Generating your perfect itinerary...</p>
      </div>
    );
  }

  if (!itineraryData) {
    navigate('/');
    return null;
  }

  const { destination, duration, days } = itineraryData as ItineraryData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {duration}-Day Trip to {destination}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Plan another trip
          </button>
        </div>

        <div className="space-y-8">
          {days.map((day) => (
            <div
              key={day.dayNumber}
              className="bg-white shadow rounded-lg p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold">Day {day.dayNumber}</h2>
              <div className="space-y-3">
                {day.activities.map((activity, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-24 flex-shrink-0">
                      <span className="text-gray-600">{activity.time}</span>
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      {activity.location && (
                        <p className="text-gray-600 text-sm mt-1">
                          📍 {activity.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}