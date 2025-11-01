import React, { useState } from 'react';
import axios from 'axios';

export default function ItineraryGenerator() {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');

  const generateItinerary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = {
      destination: e.target.destination.value,
      duration: parseInt(e.target.duration.value),
      budget: parseInt(e.target.budget.value),
      groupSize: parseInt(e.target.groupSize.value),
      interests: e.target.interests.value.split(',').map(i => i.trim()),
    };

    try {
      const response = await axios.post('/api/generate-itinerary', formData);
      setItinerary(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trip Planner</h1>
      
      <form onSubmit={generateItinerary} className="space-y-4">
        <div>
          <label className="block mb-2">Destination</label>
          <input
            type="text"
            name="destination"
            required
            className="w-full p-2 border rounded"
            placeholder="e.g., Jaipur"
          />
        </div>

        <div>
          <label className="block mb-2">Duration (days)</label>
          <input
            type="number"
            name="duration"
            required
            min="1"
            max="14"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Budget (INR)</label>
          <input
            type="number"
            name="budget"
            required
            className="w-full p-2 border rounded"
            placeholder="e.g., 50000"
          />
        </div>

        <div>
          <label className="block mb-2">Group Size</label>
          <input
            type="number"
            name="groupSize"
            required
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Interests (comma-separated)</label>
          <input
            type="text"
            name="interests"
            className="w-full p-2 border rounded"
            placeholder="e.g., history, food, culture"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Itinerary'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {itinerary && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-bold">
            {itinerary.duration}-Day Trip to {itinerary.destination}
          </h2>
          
          <div className="space-y-4">
            {itinerary.days.map((day) => (
              <div key={day.dayNumber} className="border rounded p-4">
                <h3 className="font-bold mb-2">Day {day.dayNumber}</h3>
                <ul className="space-y-2">
                  {day.activities.map((activity, index) => (
                    <li key={index} className="flex">
                      {activity.time && (
                        <span className="font-medium w-20">{activity.time}</span>
                      )}
                      <span>{activity.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}